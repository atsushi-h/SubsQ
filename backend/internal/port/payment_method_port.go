//go:generate go tool mockgen -source=payment_method_port.go -destination=../usecase/mock/mock_payment_method_usecase.go -package=mockusecase

package port

import (
	"context"

	domain "github.com/atsushi-h/subsq/backend/internal/domain/payment_method"
)

// PaymentMethodWithCount bundles a payment method with its subscription usage count.
type PaymentMethodWithCount struct {
	PaymentMethod *domain.PaymentMethod
	UsageCount    int64
}

// PaymentMethodInputPort defines payment method use case input methods.
type PaymentMethodInputPort interface {
	List(ctx context.Context, userID string) error
	GetByID(ctx context.Context, id, userID string) error
	Create(ctx context.Context, userID, name string) error
	Update(ctx context.Context, id, userID, name string) error
	Delete(ctx context.Context, id, userID string) error
	DeleteMany(ctx context.Context, ids []string, userID string) error
}

// PaymentMethodOutputPort defines presenter for payment methods.
type PaymentMethodOutputPort interface {
	PresentPaymentMethod(ctx context.Context, pm *domain.PaymentMethod, usageCount int64) error
	PresentPaymentMethods(ctx context.Context, pms []*PaymentMethodWithCount) error
}

// PaymentMethodRepository abstracts payment method persistence.
type PaymentMethodRepository interface {
	FindByID(ctx context.Context, id, userID string) (*domain.PaymentMethod, error)
	FindByUserID(ctx context.Context, userID string) ([]*domain.PaymentMethod, error)
	FindByUserIDWithCount(ctx context.Context, userID string) ([]*PaymentMethodWithCount, error)
	Create(ctx context.Context, pm *domain.PaymentMethod) (*domain.PaymentMethod, error)
	Update(ctx context.Context, pm *domain.PaymentMethod) (*domain.PaymentMethod, error)
	Delete(ctx context.Context, id, userID string) error
	DeleteMany(ctx context.Context, ids []string, userID string) error
	FindByIDs(ctx context.Context, ids []string, userID string) ([]*domain.PaymentMethod, error)
}
