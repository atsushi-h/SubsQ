package port

import (
	"context"

	"github.com/atsushi-h/subsq/backend/internal/domain/user"
)

type UserRepository interface {
	UpsertUser(ctx context.Context, u *user.User) (*user.User, error)
	FindByID(ctx context.Context, id string) (*user.User, error)
}
