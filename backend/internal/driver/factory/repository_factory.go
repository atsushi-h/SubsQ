package factory

import (
	"github.com/jackc/pgx/v5/pgxpool"

	gatewaydb "github.com/atsushi-h/subsq/backend/internal/adapter/gateway/db/sqlc"
	"github.com/atsushi-h/subsq/backend/internal/port"
)

// NewUserRepoFactory returns a factory that creates UserRepository.
func NewUserRepoFactory(pool *pgxpool.Pool) func() port.UserRepository {
	return func() port.UserRepository {
		return gatewaydb.NewUserRepository(pool)
	}
}

// NewPaymentMethodRepoFactory returns a factory that creates PaymentMethodRepository.
func NewPaymentMethodRepoFactory(pool *pgxpool.Pool) func() port.PaymentMethodRepository {
	return func() port.PaymentMethodRepository {
		return gatewaydb.NewPaymentMethodRepository(pool)
	}
}

// NewSubscriptionRepoFactory returns a factory that creates SubscriptionRepository.
func NewSubscriptionRepoFactory(pool *pgxpool.Pool) func() port.SubscriptionRepository {
	return func() port.SubscriptionRepository {
		return gatewaydb.NewSubscriptionRepository(pool)
	}
}
