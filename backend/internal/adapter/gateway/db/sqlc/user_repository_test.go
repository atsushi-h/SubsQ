package sqlc

import (
	"context"
	"errors"
	"testing"

	"github.com/atsushi-h/subsq/backend/internal/adapter/gateway/db/sqlc/generated"
	"github.com/atsushi-h/subsq/backend/internal/adapter/gateway/db/sqlc/mock"
	"github.com/atsushi-h/subsq/backend/internal/domain/user"
)

const testUserEmailStr = "test@example.com"

func newTestUserRow(t *testing.T) *generated.User {
	t.Helper()
	return &generated.User{
		ID:                mustUUID(t, testUserIDStr),
		Email:             testUserEmailStr,
		Name:              "Test User",
		Provider:          "google",
		ProviderAccountID: "google-12345",
		Thumbnail:         nil,
		CreatedAt:         1_000_000,
		UpdatedAt:         1_000_001,
	}
}

// --- UpsertUser ---

func TestUserRepository_UpsertUser(t *testing.T) {
	t.Parallel()
	ctx := context.Background()

	t.Run("成功", func(t *testing.T) {
		t.Parallel()
		row := newTestUserRow(t)
		mockDB := mock.NewUserDBTX(row, nil, nil)
		repo := &userRepository{queries: generated.New(mockDB)}

		input := &user.User{
			Email:             user.Email(testUserEmailStr),
			Name:              "Test User",
			Provider:          "google",
			ProviderAccountID: "google-12345",
			Thumbnail:         nil,
		}
		result, err := repo.UpsertUser(ctx, input)
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}
		if result.ID != testUserIDStr {
			t.Errorf("ID = %q, want %q", result.ID, testUserIDStr)
		}
		if string(result.Email) != testUserEmailStr {
			t.Errorf("Email = %q, want %q", result.Email, testUserEmailStr)
		}
		if result.Name != input.Name {
			t.Errorf("Name = %q, want %q", result.Name, input.Name)
		}
		if result.Provider != input.Provider {
			t.Errorf("Provider = %q, want %q", result.Provider, input.Provider)
		}
	})

	t.Run("サムネイル付き", func(t *testing.T) {
		t.Parallel()
		row := newTestUserRow(t)
		thumb := "https://example.com/thumb.jpg"
		row.Thumbnail = &thumb
		mockDB := mock.NewUserDBTX(row, nil, nil)
		repo := &userRepository{queries: generated.New(mockDB)}

		input := &user.User{
			Email:             user.Email(testUserEmailStr),
			Name:              "Test User",
			Provider:          "google",
			ProviderAccountID: "google-12345",
			Thumbnail:         &thumb,
		}
		result, err := repo.UpsertUser(ctx, input)
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}
		if result.Thumbnail == nil || *result.Thumbnail != thumb {
			t.Errorf("Thumbnail = %v, want %q", result.Thumbnail, thumb)
		}
	})

	t.Run("DBエラー", func(t *testing.T) {
		t.Parallel()
		mockDB := mock.NewUserDBTX(nil, errors.New("db error"), nil)
		repo := &userRepository{queries: generated.New(mockDB)}
		input := &user.User{
			Email:             user.Email(testUserEmailStr),
			Name:              "Test User",
			Provider:          "google",
			ProviderAccountID: "google-12345",
		}
		_, err := repo.UpsertUser(ctx, input)
		if err == nil {
			t.Fatal("expected DB error")
		}
	})
}

// --- FindByID ---

func TestUserRepository_FindByID(t *testing.T) {
	t.Parallel()
	ctx := context.Background()

	t.Run("成功", func(t *testing.T) {
		t.Parallel()
		row := newTestUserRow(t)
		mockDB := mock.NewUserDBTX(row, nil, nil)
		repo := &userRepository{queries: generated.New(mockDB)}

		result, err := repo.FindByID(ctx, testUserIDStr)
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}
		if result.ID != testUserIDStr {
			t.Errorf("ID = %q, want %q", result.ID, testUserIDStr)
		}
		if string(result.Email) != testUserEmailStr {
			t.Errorf("Email = %q, want %q", result.Email, testUserEmailStr)
		}
	})

	t.Run("無効なUUID", func(t *testing.T) {
		t.Parallel()
		repo := &userRepository{queries: generated.New(mock.NewUserDBTX(nil, nil, nil))}
		_, err := repo.FindByID(ctx, invalidUUID)
		if err == nil {
			t.Fatal("expected error for invalid UUID")
		}
	})

	t.Run("DBエラー", func(t *testing.T) {
		t.Parallel()
		mockDB := mock.NewUserDBTX(nil, errors.New("db error"), nil)
		repo := &userRepository{queries: generated.New(mockDB)}
		_, err := repo.FindByID(ctx, testUserIDStr)
		if err == nil {
			t.Fatal("expected DB error")
		}
	})
}

// --- DeleteUser ---

func TestUserRepository_DeleteUser(t *testing.T) {
	t.Parallel()
	ctx := context.Background()

	t.Run("成功", func(t *testing.T) {
		t.Parallel()
		mockDB := mock.NewUserDBTX(nil, nil, nil)
		repo := &userRepository{queries: generated.New(mockDB)}
		if err := repo.DeleteUser(ctx, testUserIDStr); err != nil {
			t.Fatalf("unexpected error: %v", err)
		}
	})

	t.Run("無効なUUID", func(t *testing.T) {
		t.Parallel()
		repo := &userRepository{queries: generated.New(mock.NewUserDBTX(nil, nil, nil))}
		if err := repo.DeleteUser(ctx, invalidUUID); err == nil {
			t.Fatal("expected error for invalid UUID")
		}
	})

	t.Run("execエラー", func(t *testing.T) {
		t.Parallel()
		mockDB := mock.NewUserDBTX(nil, nil, errors.New("exec error"))
		repo := &userRepository{queries: generated.New(mockDB)}
		if err := repo.DeleteUser(ctx, testUserIDStr); err == nil {
			t.Fatal("expected exec error")
		}
	})
}
