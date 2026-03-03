package usecase

import (
	"context"
	"errors"
	"fmt"

	"github.com/jackc/pgx/v5"

	"github.com/atsushi-h/subsq/backend/internal/domain/user"
	"github.com/atsushi-h/subsq/backend/internal/port"
)

var ErrUserNotFound = errors.New("user not found")

type UserInteractor struct {
	userRepo port.UserRepository
}

func NewUserInteractor(userRepo port.UserRepository) *UserInteractor {
	return &UserInteractor{userRepo: userRepo}
}

func (i *UserInteractor) GetCurrentUser(ctx context.Context, userID string) (*user.User, error) {
	u, err := i.userRepo.FindByID(ctx, userID)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, ErrUserNotFound
		}
		return nil, fmt.Errorf("failed to find user: %w", err)
	}
	return u, nil
}

func (i *UserInteractor) DeleteCurrentUser(ctx context.Context, userID string) error {
	if _, err := i.userRepo.FindByID(ctx, userID); err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return ErrUserNotFound
		}
		return fmt.Errorf("failed to find user: %w", err)
	}
	if err := i.userRepo.DeleteUser(ctx, userID); err != nil {
		return fmt.Errorf("failed to delete user: %w", err)
	}
	return nil
}
