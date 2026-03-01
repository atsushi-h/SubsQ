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

type SubscriptionInteractor struct {
	subRepo port.SubscriptionRepository
	pmRepo  port.PaymentMethodRepository
}

func NewSubscriptionInteractor(subRepo port.SubscriptionRepository, pmRepo port.PaymentMethodRepository) *SubscriptionInteractor {
	return &SubscriptionInteractor{subRepo: subRepo, pmRepo: pmRepo}
}

func (i *SubscriptionInteractor) List(ctx context.Context, userID string) ([]*domain.Subscription, error) {
	subs, err := i.subRepo.FindByUserID(ctx, userID)
	if err != nil {
		return nil, fmt.Errorf("failed to list subscriptions: %w", err)
	}
	return subs, nil
}

func (i *SubscriptionInteractor) Get(ctx context.Context, id, userID string) (*domain.Subscription, error) {
	sub, err := i.subRepo.FindByID(ctx, id, userID)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, ErrSubscriptionNotFound
		}
		return nil, fmt.Errorf("failed to get subscription: %w", err)
	}
	return sub, nil
}

type CreateSubscriptionInput struct {
	ServiceName     string
	Amount          int
	BillingCycle    domain.BillingCycle
	BaseDate        int
	PaymentMethodID *string
	Memo            *string
}

func (i *SubscriptionInteractor) Create(ctx context.Context, userID string, input CreateSubscriptionInput) (*domain.Subscription, error) {
	if err := validateSubscriptionInput(input.ServiceName, input.Amount, input.BillingCycle, input.BaseDate); err != nil {
		return nil, err
	}

	if input.PaymentMethodID != nil {
		if _, err := i.pmRepo.FindByID(ctx, *input.PaymentMethodID, userID); err != nil {
			if errors.Is(err, pgx.ErrNoRows) {
				return nil, fmt.Errorf("%w: payment method not found", ErrInvalidInput)
			}
			return nil, fmt.Errorf("failed to verify payment method: %w", err)
		}
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
		return nil, fmt.Errorf("failed to create subscription: %w", err)
	}
	return sub, nil
}

type UpdateSubscriptionInput struct {
	ServiceName     string
	Amount          int
	BillingCycle    domain.BillingCycle
	BaseDate        int
	PaymentMethodID *string
	Memo            *string
}

func (i *SubscriptionInteractor) Update(ctx context.Context, id, userID string, input UpdateSubscriptionInput) (*domain.Subscription, error) {
	if err := validateSubscriptionInput(input.ServiceName, input.Amount, input.BillingCycle, input.BaseDate); err != nil {
		return nil, err
	}

	if _, err := i.subRepo.FindByID(ctx, id, userID); err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, ErrSubscriptionNotFound
		}
		return nil, fmt.Errorf("failed to find subscription: %w", err)
	}

	if input.PaymentMethodID != nil {
		if _, err := i.pmRepo.FindByID(ctx, *input.PaymentMethodID, userID); err != nil {
			if errors.Is(err, pgx.ErrNoRows) {
				return nil, fmt.Errorf("%w: payment method not found", ErrInvalidInput)
			}
			return nil, fmt.Errorf("failed to verify payment method: %w", err)
		}
	}

	sub, err := i.subRepo.Update(ctx, &domain.Subscription{
		ID:              id,
		UserID:          userID,
		ServiceName:     input.ServiceName,
		Amount:          input.Amount,
		BillingCycle:    input.BillingCycle,
		BaseDate:        input.BaseDate,
		PaymentMethodID: input.PaymentMethodID,
		Memo:            input.Memo,
	})
	if err != nil {
		return nil, fmt.Errorf("failed to update subscription: %w", err)
	}
	return sub, nil
}

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

func (i *SubscriptionInteractor) DeleteMany(ctx context.Context, ids []string, userID string) error {
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
