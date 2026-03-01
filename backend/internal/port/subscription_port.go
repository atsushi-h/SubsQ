package port

import (
	"context"

	domain "github.com/atsushi-h/subsq/backend/internal/domain/subscription"
)

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
