package usecase

import (
	"context"
	"errors"
	"fmt"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgconn"

	domain "github.com/atsushi-h/subsq/backend/internal/domain/payment_method"
	"github.com/atsushi-h/subsq/backend/internal/port"
)

var (
	ErrPaymentMethodNotFound = errors.New("payment method not found")
	ErrPaymentMethodInUse    = errors.New("payment method is in use by subscriptions")
	ErrInvalidInput          = errors.New("invalid input")
)

type PaymentMethodInteractor struct {
	pmRepo port.PaymentMethodRepository
}

func NewPaymentMethodInteractor(pmRepo port.PaymentMethodRepository) *PaymentMethodInteractor {
	return &PaymentMethodInteractor{pmRepo: pmRepo}
}

func (i *PaymentMethodInteractor) List(ctx context.Context, userID string) ([]*domain.PaymentMethod, error) {
	pms, err := i.pmRepo.FindByUserID(ctx, userID)
	if err != nil {
		return nil, fmt.Errorf("failed to list payment methods: %w", err)
	}
	return pms, nil
}

func (i *PaymentMethodInteractor) Create(ctx context.Context, userID, name string) (*domain.PaymentMethod, error) {
	if len(name) == 0 || len(name) > 100 {
		return nil, fmt.Errorf("%w: name must be between 1 and 100 characters", ErrInvalidInput)
	}

	pm, err := i.pmRepo.Create(ctx, &domain.PaymentMethod{
		UserID: userID,
		Name:   name,
	})
	if err != nil {
		return nil, fmt.Errorf("failed to create payment method: %w", err)
	}
	return pm, nil
}

func (i *PaymentMethodInteractor) Update(ctx context.Context, id, userID, name string) (*domain.PaymentMethod, error) {
	if len(name) == 0 || len(name) > 100 {
		return nil, fmt.Errorf("%w: name must be between 1 and 100 characters", ErrInvalidInput)
	}

	_, err := i.pmRepo.FindByID(ctx, id, userID)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, ErrPaymentMethodNotFound
		}
		return nil, fmt.Errorf("failed to find payment method: %w", err)
	}

	pm, err := i.pmRepo.Update(ctx, &domain.PaymentMethod{
		ID:     id,
		UserID: userID,
		Name:   name,
	})
	if err != nil {
		return nil, fmt.Errorf("failed to update payment method: %w", err)
	}
	return pm, nil
}

func (i *PaymentMethodInteractor) Delete(ctx context.Context, id, userID string) error {
	_, err := i.pmRepo.FindByID(ctx, id, userID)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return ErrPaymentMethodNotFound
		}
		return fmt.Errorf("failed to find payment method: %w", err)
	}

	count, err := i.pmRepo.CountSubscriptionsByPaymentMethodID(ctx, id)
	if err != nil {
		return fmt.Errorf("failed to count subscriptions: %w", err)
	}
	if count > 0 {
		return ErrPaymentMethodInUse
	}

	if err := i.pmRepo.Delete(ctx, id, userID); err != nil {
		if isForeignKeyViolation(err) {
			return ErrPaymentMethodInUse
		}
		return fmt.Errorf("failed to delete payment method: %w", err)
	}
	return nil
}

func (i *PaymentMethodInteractor) DeleteMany(ctx context.Context, ids []string, userID string) error {
	// 所有権確認: 取得できた件数がids件数と一致しない場合、未所有のIDが含まれている
	pms, err := i.pmRepo.FindByIDs(ctx, ids, userID)
	if err != nil {
		return fmt.Errorf("failed to find payment methods: %w", err)
	}
	if len(pms) != len(ids) {
		return ErrPaymentMethodNotFound
	}

	// 使用中確認: 1件でもサブスクに紐づいていれば全体を失敗
	count, err := i.pmRepo.CountSubscriptionsByPaymentMethodIDs(ctx, ids)
	if err != nil {
		return fmt.Errorf("failed to count subscriptions: %w", err)
	}
	if count > 0 {
		return ErrPaymentMethodInUse
	}

	if err := i.pmRepo.DeleteMany(ctx, ids, userID); err != nil {
		if isForeignKeyViolation(err) {
			return ErrPaymentMethodInUse
		}
		return fmt.Errorf("failed to delete payment methods: %w", err)
	}
	return nil
}

func isForeignKeyViolation(err error) bool {
	var pgErr *pgconn.PgError
	return errors.As(err, &pgErr) && pgErr.Code == "23503"
}
