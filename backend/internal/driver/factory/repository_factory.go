package factory

import (
	"github.com/jackc/pgx/v5/pgxpool"

	gatewaydb "github.com/atsushi-h/subsq/backend/internal/adapter/gateway/db/sqlc"
	"github.com/atsushi-h/subsq/backend/internal/adapter/gateway/db/sqlc/generated"
	"github.com/atsushi-h/subsq/backend/internal/port"
)

// NewUserRepoFactory returns a factory that creates UserRepository.
func NewUserRepoFactory(pool *pgxpool.Pool) func() port.UserRepository {
	q := generated.New(pool)
	return func() port.UserRepository {
		return gatewaydb.NewUserRepository(q)
	}
}

// NewPaymentMethodRepoFactory returns a factory that creates PaymentMethodRepository.
func NewPaymentMethodRepoFactory(pool *pgxpool.Pool) func() port.PaymentMethodRepository {
	q := generated.New(pool)
	return func() port.PaymentMethodRepository {
		return gatewaydb.NewPaymentMethodRepository(q)
	}
}

// NewSubscriptionRepoFactory returns a factory that creates SubscriptionRepository.
func NewSubscriptionRepoFactory(pool *pgxpool.Pool) func() port.SubscriptionRepository {
	q := generated.New(pool)
	return func() port.SubscriptionRepository {
		return gatewaydb.NewSubscriptionRepository(q)
	}
}
