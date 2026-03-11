//go:generate go tool mockgen -source=subscription_port.go -destination=../usecase/mock/mock_subscription_usecase.go -package=mockusecase

package port

import (
	"context"

	domain "github.com/atsushi-h/subsq/backend/internal/domain/subscription"
)

// CreateSubscriptionInput holds fields for creating a subscription.
type CreateSubscriptionInput struct {
	ServiceName     string
	Amount          int
	BillingCycle    domain.BillingCycle
	BaseDate        int
	PaymentMethodID *string
	Memo            *string
}

// UpdateSubscriptionInput holds optional fields for updating a subscription.
// nil means "not provided – keep existing value".
type UpdateSubscriptionInput struct {
	ServiceName     *string
	Amount          *int
	BillingCycle    *domain.BillingCycle
	BaseDate        *int
	PaymentMethodID *string
	Memo            *string
}

// SubscriptionInputPort defines subscription use case input methods.
type SubscriptionInputPort interface {
	List(ctx context.Context, userID string) error
	Get(ctx context.Context, id, userID string) error
	Create(ctx context.Context, userID string, input CreateSubscriptionInput) error
	Update(ctx context.Context, id, userID string, input UpdateSubscriptionInput) error
	Delete(ctx context.Context, id, userID string) error
	DeleteMany(ctx context.Context, ids []string, userID string) error
}

// SubscriptionOutputPort defines presenter for subscriptions.
type SubscriptionOutputPort interface {
	PresentSubscription(ctx context.Context, sub *domain.Subscription) error
	PresentSubscriptions(ctx context.Context, subs []*domain.Subscription) error
}

// SubscriptionRepository abstracts subscription persistence.
type SubscriptionRepository interface {
	FindByID(ctx context.Context, id, userID string) (*domain.Subscription, error)
	FindByUserID(ctx context.Context, userID string) ([]*domain.Subscription, error)
	Create(ctx context.Context, s *domain.Subscription) (*domain.Subscription, error)
	Update(ctx context.Context, s *domain.Subscription) (*domain.Subscription, error)
	Delete(ctx context.Context, id, userID string) error
	DeleteMany(ctx context.Context, ids []string, userID string) error
	FindByIDs(ctx context.Context, ids []string, userID string) ([]*domain.Subscription, error)
	CountByPaymentMethodID(ctx context.Context, pmID string) (int64, error)
	CountByPaymentMethodIDs(ctx context.Context, ids []string) (int64, error)
}
