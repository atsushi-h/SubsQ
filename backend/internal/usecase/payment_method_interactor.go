package usecase

import (
	"context"
	"errors"
	"fmt"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgconn"

	domainerrors "github.com/atsushi-h/subsq/backend/internal/domain/errors"
	domain "github.com/atsushi-h/subsq/backend/internal/domain/payment_method"
	"github.com/atsushi-h/subsq/backend/internal/port"
)

var ErrPaymentMethodNotFound = errors.New("payment method not found")

// PaymentMethodInteractor handles payment method use cases.
type PaymentMethodInteractor struct {
	pmRepo  port.PaymentMethodRepository
	subRepo port.SubscriptionRepository
	output  port.PaymentMethodOutputPort
	tx      port.TxManager
}

var _ port.PaymentMethodInputPort = (*PaymentMethodInteractor)(nil)

// NewPaymentMethodInteractor creates PaymentMethodInteractor.
func NewPaymentMethodInteractor(pmRepo port.PaymentMethodRepository, subRepo port.SubscriptionRepository, output port.PaymentMethodOutputPort, tx port.TxManager) *PaymentMethodInteractor {
	return &PaymentMethodInteractor{pmRepo: pmRepo, subRepo: subRepo, output: output, tx: tx}
}

// List retrieves all payment methods with subscription usage counts.
func (i *PaymentMethodInteractor) List(ctx context.Context, userID string) error {
	pms, err := i.pmRepo.FindByUserIDWithCount(ctx, userID)
	if err != nil {
		return fmt.Errorf("failed to list payment methods: %w", err)
	}
	return i.output.PresentPaymentMethods(ctx, pms)
}

// GetByID retrieves a payment method by id including its usage count.
func (i *PaymentMethodInteractor) GetByID(ctx context.Context, id, userID string) error {
	pm, err := i.pmRepo.FindByID(ctx, id, userID)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return ErrPaymentMethodNotFound
		}
		return fmt.Errorf("failed to get payment method: %w", err)
	}
	count, err := i.subRepo.CountByPaymentMethodID(ctx, id)
	if err != nil {
		return fmt.Errorf("failed to count usage: %w", err)
	}
	return i.output.PresentPaymentMethod(ctx, pm, count)
}

// Create creates a new payment method.
func (i *PaymentMethodInteractor) Create(ctx context.Context, userID, name string) error {
	if len(name) == 0 || len(name) > 100 {
		return fmt.Errorf("%w: name must be between 1 and 100 characters", domainerrors.ErrInvalidInput)
	}
	pm, err := i.pmRepo.Create(ctx, &domain.PaymentMethod{
		UserID: userID,
		Name:   name,
	})
	if err != nil {
		return fmt.Errorf("failed to create payment method: %w", err)
	}
	return i.output.PresentPaymentMethod(ctx, pm, 0)
}

// Update updates an existing payment method and returns it with usage count.
func (i *PaymentMethodInteractor) Update(ctx context.Context, id, userID, name string) error {
	if len(name) == 0 || len(name) > 100 {
		return fmt.Errorf("%w: name must be between 1 and 100 characters", domainerrors.ErrInvalidInput)
	}
	if _, err := i.pmRepo.FindByID(ctx, id, userID); err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return ErrPaymentMethodNotFound
		}
		return fmt.Errorf("failed to find payment method: %w", err)
	}
	pm, err := i.pmRepo.Update(ctx, &domain.PaymentMethod{
		ID:     id,
		UserID: userID,
		Name:   name,
	})
	if err != nil {
		return fmt.Errorf("failed to update payment method: %w", err)
	}
	count, err := i.subRepo.CountByPaymentMethodID(ctx, id)
	if err != nil {
		return fmt.Errorf("failed to count usage: %w", err)
	}
	return i.output.PresentPaymentMethod(ctx, pm, count)
}

// Delete deletes a payment method if not in use.
func (i *PaymentMethodInteractor) Delete(ctx context.Context, id, userID string) error {
	err := i.tx.WithinTransaction(ctx, func(ctx context.Context) error {
		if _, err := i.pmRepo.FindByID(ctx, id, userID); err != nil {
			if errors.Is(err, pgx.ErrNoRows) {
				return ErrPaymentMethodNotFound
			}
			return fmt.Errorf("failed to find payment method: %w", err)
		}
		count, err := i.subRepo.CountByPaymentMethodID(ctx, id)
		if err != nil {
			return fmt.Errorf("failed to count subscriptions: %w", err)
		}
		if err := domain.CanDelete(count); err != nil {
			return err
		}
		if err := i.pmRepo.Delete(ctx, id, userID); err != nil {
			if isForeignKeyViolation(err) {
				return domainerrors.ErrPaymentMethodInUse
			}
			return fmt.Errorf("failed to delete payment method: %w", err)
		}
		return nil
	})
	if err != nil {
		return err
	}
	return nil
}

// DeleteMany deletes multiple payment methods if none are in use.
func (i *PaymentMethodInteractor) DeleteMany(ctx context.Context, ids []string, userID string) error {
	err := i.tx.WithinTransaction(ctx, func(ctx context.Context) error {
		pms, err := i.pmRepo.FindByIDs(ctx, ids, userID)
		if err != nil {
			return fmt.Errorf("failed to find payment methods: %w", err)
		}
		if len(pms) != len(ids) {
			return ErrPaymentMethodNotFound
		}
		count, err := i.subRepo.CountByPaymentMethodIDs(ctx, ids)
		if err != nil {
			return fmt.Errorf("failed to count subscriptions: %w", err)
		}
		if err := domain.CanDelete(count); err != nil {
			return err
		}
		if err := i.pmRepo.DeleteMany(ctx, ids, userID); err != nil {
			if isForeignKeyViolation(err) {
				return domainerrors.ErrPaymentMethodInUse
			}
			return fmt.Errorf("failed to delete payment methods: %w", err)
		}
		return nil
	})
	if err != nil {
		return err
	}
	return nil
}

func isForeignKeyViolation(err error) bool {
	var pgErr *pgconn.PgError
	return errors.As(err, &pgErr) && pgErr.Code == "23503"
}
