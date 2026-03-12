package usecase

import (
	"context"
	"errors"
	"fmt"

	"github.com/jackc/pgx/v5"

	"github.com/atsushi-h/subsq/backend/internal/port"
)

var ErrUserNotFound = errors.New("user not found")

// UserInteractor handles user use cases.
type UserInteractor struct {
	userRepo port.UserRepository
	output   port.UserOutputPort
}

var _ port.UserInputPort = (*UserInteractor)(nil)

// NewUserInteractor creates UserInteractor.
func NewUserInteractor(userRepo port.UserRepository, output port.UserOutputPort) *UserInteractor {
	return &UserInteractor{userRepo: userRepo, output: output}
}

// GetCurrentUser retrieves the current user by id.
func (i *UserInteractor) GetCurrentUser(ctx context.Context, userID string) error {
	u, err := i.userRepo.FindByID(ctx, userID)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return ErrUserNotFound
		}
		return fmt.Errorf("failed to find user: %w", err)
	}
	return i.output.PresentUser(ctx, u)
}

// UpdateCurrentUser updates the current user profile.
func (i *UserInteractor) UpdateCurrentUser(ctx context.Context, userID string, name *string, thumbnail *string) error {
	if _, err := i.userRepo.FindByID(ctx, userID); err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return ErrUserNotFound
		}
		return fmt.Errorf("failed to find user: %w", err)
	}
	updated, err := i.userRepo.UpdateUser(ctx, userID, name, thumbnail)
	if err != nil {
		return fmt.Errorf("failed to update user: %w", err)
	}
	return i.output.PresentUser(ctx, updated)
}

// DeleteCurrentUser deletes the current user by id.
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
