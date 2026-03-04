package usecase

import (
	"context"
	"errors"
	"fmt"

	"github.com/jackc/pgx/v5"

	domain "github.com/atsushi-h/subsq/backend/internal/domain/subscription"
	"github.com/atsushi-h/subsq/backend/internal/port"
)

var ErrSubscriptionNotFound = errors.New("subscription not found")

// SubscriptionInteractor handles subscription use cases.
type SubscriptionInteractor struct {
	subRepo port.SubscriptionRepository
	pmRepo  port.PaymentMethodRepository
	output  port.SubscriptionOutputPort
	tx      port.TxManager
}

var _ port.SubscriptionInputPort = (*SubscriptionInteractor)(nil)

// NewSubscriptionInteractor creates SubscriptionInteractor.
func NewSubscriptionInteractor(subRepo port.SubscriptionRepository, pmRepo port.PaymentMethodRepository, output port.SubscriptionOutputPort, tx port.TxManager) *SubscriptionInteractor {
	return &SubscriptionInteractor{subRepo: subRepo, pmRepo: pmRepo, output: output, tx: tx}
}

// List retrieves all subscriptions for a user.
func (i *SubscriptionInteractor) List(ctx context.Context, userID string) error {
	subs, err := i.subRepo.FindByUserID(ctx, userID)
	if err != nil {
		return fmt.Errorf("failed to list subscriptions: %w", err)
	}
	return i.output.PresentSubscriptions(ctx, subs)
}

// Get retrieves a single subscription by id.
func (i *SubscriptionInteractor) Get(ctx context.Context, id, userID string) error {
	sub, err := i.subRepo.FindByID(ctx, id, userID)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return ErrSubscriptionNotFound
		}
		return fmt.Errorf("failed to get subscription: %w", err)
	}
	return i.output.PresentSubscription(ctx, sub)
}

// Create creates a new subscription.
func (i *SubscriptionInteractor) Create(ctx context.Context, userID string, input port.CreateSubscriptionInput) error {
	if err := validateSubscriptionInput(input.ServiceName, input.Amount, input.BillingCycle, input.BaseDate); err != nil {
		return err
	}

	var pmName *string
	if input.PaymentMethodID != nil {
		pm, err := i.pmRepo.FindByID(ctx, *input.PaymentMethodID, userID)
		if err != nil {
			if errors.Is(err, pgx.ErrNoRows) {
				return fmt.Errorf("%w: payment method not found", ErrInvalidInput)
			}
			return fmt.Errorf("failed to verify payment method: %w", err)
		}
		pmName = &pm.Name
	}

	sub, err := i.subRepo.Create(ctx, &domain.Subscription{
		UserID:          userID,
		ServiceName:     input.ServiceName,
		Amount:          input.Amount,
		BillingCycle:    input.BillingCycle,
		BaseDate:        input.BaseDate,
		PaymentMethodID: input.PaymentMethodID,
		Memo:            input.Memo,
	})
	if err != nil {
		return fmt.Errorf("failed to create subscription: %w", err)
	}

	sub.PaymentMethodName = pmName
	return i.output.PresentSubscription(ctx, sub)
}

// Update updates an existing subscription, merging nil fields with existing values.
func (i *SubscriptionInteractor) Update(ctx context.Context, id, userID string, input port.UpdateSubscriptionInput) error {
	existing, err := i.subRepo.FindByID(ctx, id, userID)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return ErrSubscriptionNotFound
		}
		return fmt.Errorf("failed to find subscription: %w", err)
	}

	serviceName := existing.ServiceName
	if input.ServiceName != nil {
		serviceName = *input.ServiceName
	}
	amount := existing.Amount
	if input.Amount != nil {
		amount = *input.Amount
	}
	billingCycle := existing.BillingCycle
	if input.BillingCycle != nil {
		billingCycle = *input.BillingCycle
	}
	baseDate := existing.BaseDate
	if input.BaseDate != nil {
		baseDate = *input.BaseDate
	}
	pmID := existing.PaymentMethodID
	if input.PaymentMethodID != nil {
		pmID = input.PaymentMethodID
	}
	memo := existing.Memo
	if input.Memo != nil {
		memo = input.Memo
	}

	if err := validateSubscriptionInput(serviceName, amount, billingCycle, baseDate); err != nil {
		return err
	}

	var pmName *string
	if pmID != nil {
		pm, err := i.pmRepo.FindByID(ctx, *pmID, userID)
		if err != nil {
			if errors.Is(err, pgx.ErrNoRows) {
				return fmt.Errorf("%w: payment method not found", ErrInvalidInput)
			}
			return fmt.Errorf("failed to verify payment method: %w", err)
		}
		pmName = &pm.Name
	}

	sub, err := i.subRepo.Update(ctx, &domain.Subscription{
		ID:              id,
		UserID:          userID,
		ServiceName:     serviceName,
		Amount:          amount,
		BillingCycle:    billingCycle,
		BaseDate:        baseDate,
		PaymentMethodID: pmID,
		Memo:            memo,
	})
	if err != nil {
		return fmt.Errorf("failed to update subscription: %w", err)
	}

	sub.PaymentMethodName = pmName
	return i.output.PresentSubscription(ctx, sub)
}

// Delete deletes a subscription by id.
func (i *SubscriptionInteractor) Delete(ctx context.Context, id, userID string) error {
	if _, err := i.subRepo.FindByID(ctx, id, userID); err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return ErrSubscriptionNotFound
		}
		return fmt.Errorf("failed to find subscription: %w", err)
	}
	if err := i.subRepo.Delete(ctx, id, userID); err != nil {
		return fmt.Errorf("failed to delete subscription: %w", err)
	}
	return nil
}

// DeleteMany deletes multiple subscriptions by ids.
func (i *SubscriptionInteractor) DeleteMany(ctx context.Context, ids []string, userID string) error {
	err := i.tx.WithinTransaction(ctx, func(ctx context.Context) error {
		subs, err := i.subRepo.FindByIDs(ctx, ids, userID)
		if err != nil {
			return fmt.Errorf("failed to find subscriptions: %w", err)
		}
		if len(subs) != len(ids) {
			return ErrSubscriptionNotFound
		}
		if err := i.subRepo.DeleteMany(ctx, ids, userID); err != nil {
			return fmt.Errorf("failed to delete subscriptions: %w", err)
		}
		return nil
	})
	if err != nil {
		return err
	}
	return nil
}

func validateSubscriptionInput(serviceName string, amount int, billingCycle domain.BillingCycle, baseDate int) error {
	if len(serviceName) == 0 || len(serviceName) > 100 {
		return fmt.Errorf("%w: service_name must be between 1 and 100 characters", ErrInvalidInput)
	}
	if amount < 0 || amount > 1000000 {
		return fmt.Errorf("%w: amount must be between 0 and 1000000", ErrInvalidInput)
	}
	if billingCycle != domain.BillingCycleMonthly && billingCycle != domain.BillingCycleYearly {
		return fmt.Errorf("%w: billing_cycle must be 'monthly' or 'yearly'", ErrInvalidInput)
	}
	if baseDate < 1 || baseDate > 31 {
		return fmt.Errorf("%w: base_date must be between 1 and 31", ErrInvalidInput)
	}
	return nil
}
