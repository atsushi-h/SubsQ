//go:generate go tool mockgen -source=user_port.go -destination=../usecase/mock/mock_user_usecase.go -package=mockusecase

package port

import (
	"context"

	"github.com/atsushi-h/subsq/backend/internal/domain/user"
)

// UserInputPort defines user use case input methods.
type UserInputPort interface {
	GetCurrentUser(ctx context.Context, userID string) error
	UpdateCurrentUser(ctx context.Context, userID string, name *string, thumbnail *string) error
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
	UpdateUser(ctx context.Context, id string, name *string, thumbnail *string) (*user.User, error)
	DeleteUser(ctx context.Context, id string) error
}
