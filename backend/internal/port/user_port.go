package port

import (
	"context"

	"github.com/atsushi-h/subsq/backend/internal/domain/user"
)

// UserInputPort defines user use case input methods.
type UserInputPort interface {
	GetCurrentUser(ctx context.Context, userID string) error
	DeleteCurrentUser(ctx context.Context, userID string) error
}

// UserOutputPort defines presenter for users.
type UserOutputPort interface {
	PresentUser(ctx context.Context, u *user.User) error
}

// UserRepository abstracts user persistence.
type UserRepository interface {
	UpsertUser(ctx context.Context, u *user.User) (*user.User, error)
	FindByID(ctx context.Context, id string) (*user.User, error)
	DeleteUser(ctx context.Context, id string) error
}
