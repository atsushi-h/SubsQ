package port

import (
	"context"

	domain "github.com/atsushi-h/subsq/backend/internal/domain/payment_method"
)

type PaymentMethodRepository interface {
	FindByID(ctx context.Context, id, userID string) (*domain.PaymentMethod, error)
	FindByUserID(ctx context.Context, userID string) ([]*domain.PaymentMethod, error)
	Create(ctx context.Context, pm *domain.PaymentMethod) (*domain.PaymentMethod, error)
	Update(ctx context.Context, pm *domain.PaymentMethod) (*domain.PaymentMethod, error)
	Delete(ctx context.Context, id, userID string) error
	DeleteMany(ctx context.Context, ids []string, userID string) error
	FindByIDs(ctx context.Context, ids []string, userID string) ([]*domain.PaymentMethod, error)
}
