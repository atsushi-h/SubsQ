package sqlc

import (
	"context"
	"errors"
	"testing"

	"github.com/jackc/pgx/v5/pgtype"
	"go.uber.org/mock/gomock"

	"github.com/atsushi-h/subsq/backend/internal/adapter/gateway/db/sqlc/generated"
	"github.com/atsushi-h/subsq/backend/internal/adapter/gateway/db/sqlc/mock"
	domain "github.com/atsushi-h/subsq/backend/internal/domain/payment_method"
)

const (
	testPMIDStr   = "550e8400-e29b-41d4-a716-446655440000"
	testUserIDStr = "6ba7b810-9dad-11d1-80b4-00c04fd430c8"
	testPM2IDStr  = "6ba7b811-9dad-11d1-80b4-00c04fd430c8"
	invalidUUID   = "not-a-uuid"
)

func mustUUID(t *testing.T, s string) pgtype.UUID {
	t.Helper()
	id, err := parseUUID(s)
	if err != nil {
		t.Fatalf("mustUUID(%q): %v", s, err)
	}
	return id
}

func newTestPaymentMethod(t *testing.T) *generated.PaymentMethod {
	t.Helper()
	return &generated.PaymentMethod{
		ID:        mustUUID(t, testPMIDStr),
		UserID:    mustUUID(t, testUserIDStr),
		Name:      "Test Card",
		CreatedAt: 1_000_000,
		UpdatedAt: 1_000_001,
	}
}

func newTestPaymentMethodDomain(t *testing.T) *domain.PaymentMethod {
	t.Helper()
	return &domain.PaymentMethod{
		ID:     testPMIDStr,
		UserID: testUserIDStr,
		Name:   "Test Card",
	}
}

// --- FindByID ---

func TestPaymentMethodRepository_FindByID(t *testing.T) {
	t.Parallel()
	ctx := context.Background()

	t.Run("成功", func(t *testing.T) {
		t.Parallel()
		row := newTestPaymentMethod(t)
		ctrl := gomock.NewController(t)
		mockQ := mock.NewMockQuerier(ctrl)
		mockQ.EXPECT().
			GetPaymentMethodByID(gomock.Any(), gomock.Any()).
			Return(row, nil)
		repo := &paymentMethodRepository{queries: mockQ}

		result, err := repo.FindByID(ctx, testPMIDStr, testUserIDStr)
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}
		if result.ID != testPMIDStr {
			t.Errorf("ID = %q, want %q", result.ID, testPMIDStr)
		}
		if result.UserID != testUserIDStr {
			t.Errorf("UserID = %q, want %q", result.UserID, testUserIDStr)
		}
		if result.Name != row.Name {
			t.Errorf("Name = %q, want %q", result.Name, row.Name)
		}
	})

	t.Run("無効なID UUID", func(t *testing.T) {
		t.Parallel()
		ctrl := gomock.NewController(t)
		mockQ := mock.NewMockQuerier(ctrl)
		repo := &paymentMethodRepository{queries: mockQ}
		_, err := repo.FindByID(ctx, invalidUUID, testUserIDStr)
		if err == nil {
			t.Fatal("expected error for invalid id UUID")
		}
	})

	t.Run("無効なuserID UUID", func(t *testing.T) {
		t.Parallel()
		ctrl := gomock.NewController(t)
		mockQ := mock.NewMockQuerier(ctrl)
		repo := &paymentMethodRepository{queries: mockQ}
		_, err := repo.FindByID(ctx, testPMIDStr, invalidUUID)
		if err == nil {
			t.Fatal("expected error for invalid userID UUID")
		}
	})

	t.Run("DBエラー", func(t *testing.T) {
		t.Parallel()
		ctrl := gomock.NewController(t)
		mockQ := mock.NewMockQuerier(ctrl)
		mockQ.EXPECT().
			GetPaymentMethodByID(gomock.Any(), gomock.Any()).
			Return(nil, errors.New("db error"))
		repo := &paymentMethodRepository{queries: mockQ}
		_, err := repo.FindByID(ctx, testPMIDStr, testUserIDStr)
		if err == nil {
			t.Fatal("expected DB error")
		}
	})
}

// --- FindByUserID ---

func TestPaymentMethodRepository_FindByUserID(t *testing.T) {
	t.Parallel()
	ctx := context.Background()

	t.Run("複数行返却", func(t *testing.T) {
		t.Parallel()
		rows := []*generated.PaymentMethod{
			newTestPaymentMethod(t),
			{
				ID:        mustUUID(t, testPM2IDStr),
				UserID:    mustUUID(t, testUserIDStr),
				Name:      "Second Card",
				CreatedAt: 2_000_000,
				UpdatedAt: 2_000_001,
			},
		}
		ctrl := gomock.NewController(t)
		mockQ := mock.NewMockQuerier(ctrl)
		mockQ.EXPECT().
			ListPaymentMethodsByUserID(gomock.Any(), gomock.Any()).
			Return(rows, nil)
		repo := &paymentMethodRepository{queries: mockQ}

		result, err := repo.FindByUserID(ctx, testUserIDStr)
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}
		if len(result) != 2 {
			t.Errorf("len(result) = %d, want 2", len(result))
		}
	})

	t.Run("空リスト", func(t *testing.T) {
		t.Parallel()
		ctrl := gomock.NewController(t)
		mockQ := mock.NewMockQuerier(ctrl)
		mockQ.EXPECT().
			ListPaymentMethodsByUserID(gomock.Any(), gomock.Any()).
			Return(nil, nil)
		repo := &paymentMethodRepository{queries: mockQ}

		result, err := repo.FindByUserID(ctx, testUserIDStr)
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}
		if len(result) != 0 {
			t.Errorf("len(result) = %d, want 0", len(result))
		}
	})

	t.Run("無効なuserID UUID", func(t *testing.T) {
		t.Parallel()
		ctrl := gomock.NewController(t)
		mockQ := mock.NewMockQuerier(ctrl)
		repo := &paymentMethodRepository{queries: mockQ}
		_, err := repo.FindByUserID(ctx, invalidUUID)
		if err == nil {
			t.Fatal("expected error for invalid userID UUID")
		}
	})

	t.Run("DBエラー", func(t *testing.T) {
		t.Parallel()
		ctrl := gomock.NewController(t)
		mockQ := mock.NewMockQuerier(ctrl)
		mockQ.EXPECT().
			ListPaymentMethodsByUserID(gomock.Any(), gomock.Any()).
			Return(nil, errors.New("db error"))
		repo := &paymentMethodRepository{queries: mockQ}
		_, err := repo.FindByUserID(ctx, testUserIDStr)
		if err == nil {
			t.Fatal("expected DB error")
		}
	})
}

// --- FindByUserIDWithCount ---

func TestPaymentMethodRepository_FindByUserIDWithCount(t *testing.T) {
	t.Parallel()
	ctx := context.Background()

	t.Run("成功", func(t *testing.T) {
		t.Parallel()
		countRows := []*generated.ListPaymentMethodsWithCountByUserIDRow{
			{
				ID:         mustUUID(t, testPMIDStr),
				UserID:     mustUUID(t, testUserIDStr),
				Name:       "Test Card",
				CreatedAt:  1_000_000,
				UpdatedAt:  1_000_001,
				UsageCount: 3,
			},
		}
		ctrl := gomock.NewController(t)
		mockQ := mock.NewMockQuerier(ctrl)
		mockQ.EXPECT().
			ListPaymentMethodsWithCountByUserID(gomock.Any(), gomock.Any()).
			Return(countRows, nil)
		repo := &paymentMethodRepository{queries: mockQ}

		result, err := repo.FindByUserIDWithCount(ctx, testUserIDStr)
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}
		if len(result) != 1 {
			t.Fatalf("len(result) = %d, want 1", len(result))
		}
		if result[0].UsageCount != 3 {
			t.Errorf("UsageCount = %d, want 3", result[0].UsageCount)
		}
	})

	t.Run("空リスト", func(t *testing.T) {
		t.Parallel()
		ctrl := gomock.NewController(t)
		mockQ := mock.NewMockQuerier(ctrl)
		mockQ.EXPECT().
			ListPaymentMethodsWithCountByUserID(gomock.Any(), gomock.Any()).
			Return(nil, nil)
		repo := &paymentMethodRepository{queries: mockQ}

		result, err := repo.FindByUserIDWithCount(ctx, testUserIDStr)
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}
		if len(result) != 0 {
			t.Errorf("len(result) = %d, want 0", len(result))
		}
	})

	t.Run("無効なuserID UUID", func(t *testing.T) {
		t.Parallel()
		ctrl := gomock.NewController(t)
		mockQ := mock.NewMockQuerier(ctrl)
		repo := &paymentMethodRepository{queries: mockQ}
		_, err := repo.FindByUserIDWithCount(ctx, invalidUUID)
		if err == nil {
			t.Fatal("expected error for invalid userID UUID")
		}
	})

	t.Run("DBエラー", func(t *testing.T) {
		t.Parallel()
		ctrl := gomock.NewController(t)
		mockQ := mock.NewMockQuerier(ctrl)
		mockQ.EXPECT().
			ListPaymentMethodsWithCountByUserID(gomock.Any(), gomock.Any()).
			Return(nil, errors.New("db error"))
		repo := &paymentMethodRepository{queries: mockQ}
		_, err := repo.FindByUserIDWithCount(ctx, testUserIDStr)
		if err == nil {
			t.Fatal("expected DB error")
		}
	})
}

// --- Create ---

func TestPaymentMethodRepository_Create(t *testing.T) {
	t.Parallel()
	ctx := context.Background()

	t.Run("成功", func(t *testing.T) {
		t.Parallel()
		row := newTestPaymentMethod(t)
		ctrl := gomock.NewController(t)
		mockQ := mock.NewMockQuerier(ctrl)
		mockQ.EXPECT().
			CreatePaymentMethod(gomock.Any(), gomock.Any()).
			Return(row, nil)
		repo := &paymentMethodRepository{queries: mockQ}

		input := newTestPaymentMethodDomain(t)
		result, err := repo.Create(ctx, input)
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}
		if result.Name != input.Name {
			t.Errorf("Name = %q, want %q", result.Name, input.Name)
		}
	})

	t.Run("無効なuserID UUID", func(t *testing.T) {
		t.Parallel()
		ctrl := gomock.NewController(t)
		mockQ := mock.NewMockQuerier(ctrl)
		repo := &paymentMethodRepository{queries: mockQ}
		input := &domain.PaymentMethod{UserID: invalidUUID, Name: "Test"}
		_, err := repo.Create(ctx, input)
		if err == nil {
			t.Fatal("expected error for invalid userID UUID")
		}
	})

	t.Run("DBエラー", func(t *testing.T) {
		t.Parallel()
		ctrl := gomock.NewController(t)
		mockQ := mock.NewMockQuerier(ctrl)
		mockQ.EXPECT().
			CreatePaymentMethod(gomock.Any(), gomock.Any()).
			Return(nil, errors.New("db error"))
		repo := &paymentMethodRepository{queries: mockQ}
		input := newTestPaymentMethodDomain(t)
		_, err := repo.Create(ctx, input)
		if err == nil {
			t.Fatal("expected DB error")
		}
	})
}

// --- Update ---

func TestPaymentMethodRepository_Update(t *testing.T) {
	t.Parallel()
	ctx := context.Background()

	t.Run("成功", func(t *testing.T) {
		t.Parallel()
		row := newTestPaymentMethod(t)
		row.Name = "Updated Card"
		ctrl := gomock.NewController(t)
		mockQ := mock.NewMockQuerier(ctrl)
		mockQ.EXPECT().
			UpdatePaymentMethod(gomock.Any(), gomock.Any()).
			Return(row, nil)
		repo := &paymentMethodRepository{queries: mockQ}

		input := &domain.PaymentMethod{
			ID:     testPMIDStr,
			UserID: testUserIDStr,
			Name:   "Updated Card",
		}
		result, err := repo.Update(ctx, input)
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}
		if result.Name != "Updated Card" {
			t.Errorf("Name = %q, want %q", result.Name, "Updated Card")
		}
	})

	t.Run("無効なID UUID", func(t *testing.T) {
		t.Parallel()
		ctrl := gomock.NewController(t)
		mockQ := mock.NewMockQuerier(ctrl)
		repo := &paymentMethodRepository{queries: mockQ}
		input := &domain.PaymentMethod{ID: invalidUUID, UserID: testUserIDStr, Name: "Test"}
		_, err := repo.Update(ctx, input)
		if err == nil {
			t.Fatal("expected error for invalid id UUID")
		}
	})

	t.Run("無効なuserID UUID", func(t *testing.T) {
		t.Parallel()
		ctrl := gomock.NewController(t)
		mockQ := mock.NewMockQuerier(ctrl)
		repo := &paymentMethodRepository{queries: mockQ}
		input := &domain.PaymentMethod{ID: testPMIDStr, UserID: invalidUUID, Name: "Test"}
		_, err := repo.Update(ctx, input)
		if err == nil {
			t.Fatal("expected error for invalid userID UUID")
		}
	})

	t.Run("DBエラー", func(t *testing.T) {
		t.Parallel()
		ctrl := gomock.NewController(t)
		mockQ := mock.NewMockQuerier(ctrl)
		mockQ.EXPECT().
			UpdatePaymentMethod(gomock.Any(), gomock.Any()).
			Return(nil, errors.New("db error"))
		repo := &paymentMethodRepository{queries: mockQ}
		input := &domain.PaymentMethod{ID: testPMIDStr, UserID: testUserIDStr, Name: "Test"}
		_, err := repo.Update(ctx, input)
		if err == nil {
			t.Fatal("expected DB error")
		}
	})
}

// --- Delete ---

func TestPaymentMethodRepository_Delete(t *testing.T) {
	t.Parallel()
	ctx := context.Background()

	t.Run("成功", func(t *testing.T) {
		t.Parallel()
		ctrl := gomock.NewController(t)
		mockQ := mock.NewMockQuerier(ctrl)
		mockQ.EXPECT().
			DeletePaymentMethod(gomock.Any(), gomock.Any()).
			Return(nil)
		repo := &paymentMethodRepository{queries: mockQ}
		if err := repo.Delete(ctx, testPMIDStr, testUserIDStr); err != nil {
			t.Fatalf("unexpected error: %v", err)
		}
	})

	t.Run("無効なID UUID", func(t *testing.T) {
		t.Parallel()
		ctrl := gomock.NewController(t)
		mockQ := mock.NewMockQuerier(ctrl)
		repo := &paymentMethodRepository{queries: mockQ}
		if err := repo.Delete(ctx, invalidUUID, testUserIDStr); err == nil {
			t.Fatal("expected error for invalid id UUID")
		}
	})

	t.Run("無効なuserID UUID", func(t *testing.T) {
		t.Parallel()
		ctrl := gomock.NewController(t)
		mockQ := mock.NewMockQuerier(ctrl)
		repo := &paymentMethodRepository{queries: mockQ}
		if err := repo.Delete(ctx, testPMIDStr, invalidUUID); err == nil {
			t.Fatal("expected error for invalid userID UUID")
		}
	})

	t.Run("execエラー", func(t *testing.T) {
		t.Parallel()
		ctrl := gomock.NewController(t)
		mockQ := mock.NewMockQuerier(ctrl)
		mockQ.EXPECT().
			DeletePaymentMethod(gomock.Any(), gomock.Any()).
			Return(errors.New("exec error"))
		repo := &paymentMethodRepository{queries: mockQ}
		if err := repo.Delete(ctx, testPMIDStr, testUserIDStr); err == nil {
			t.Fatal("expected exec error")
		}
	})
}

// --- DeleteMany ---

func TestPaymentMethodRepository_DeleteMany(t *testing.T) {
	t.Parallel()
	ctx := context.Background()

	t.Run("成功", func(t *testing.T) {
		t.Parallel()
		ctrl := gomock.NewController(t)
		mockQ := mock.NewMockQuerier(ctrl)
		mockQ.EXPECT().
			DeletePaymentMethods(gomock.Any(), gomock.Any()).
			Return(nil)
		repo := &paymentMethodRepository{queries: mockQ}
		if err := repo.DeleteMany(ctx, []string{testPMIDStr, testPM2IDStr}, testUserIDStr); err != nil {
			t.Fatalf("unexpected error: %v", err)
		}
	})

	t.Run("無効なuserID UUID", func(t *testing.T) {
		t.Parallel()
		ctrl := gomock.NewController(t)
		mockQ := mock.NewMockQuerier(ctrl)
		repo := &paymentMethodRepository{queries: mockQ}
		if err := repo.DeleteMany(ctx, []string{testPMIDStr}, invalidUUID); err == nil {
			t.Fatal("expected error for invalid userID UUID")
		}
	})

	t.Run("無効なID UUID（ids内）", func(t *testing.T) {
		t.Parallel()
		ctrl := gomock.NewController(t)
		mockQ := mock.NewMockQuerier(ctrl)
		repo := &paymentMethodRepository{queries: mockQ}
		if err := repo.DeleteMany(ctx, []string{invalidUUID}, testUserIDStr); err == nil {
			t.Fatal("expected error for invalid id in ids")
		}
	})

	t.Run("空スライス", func(t *testing.T) {
		t.Parallel()
		ctrl := gomock.NewController(t)
		mockQ := mock.NewMockQuerier(ctrl)
		mockQ.EXPECT().
			DeletePaymentMethods(gomock.Any(), gomock.Any()).
			Return(nil)
		repo := &paymentMethodRepository{queries: mockQ}
		if err := repo.DeleteMany(ctx, []string{}, testUserIDStr); err != nil {
			t.Fatalf("unexpected error for empty ids: %v", err)
		}
	})

	t.Run("execエラー", func(t *testing.T) {
		t.Parallel()
		ctrl := gomock.NewController(t)
		mockQ := mock.NewMockQuerier(ctrl)
		mockQ.EXPECT().
			DeletePaymentMethods(gomock.Any(), gomock.Any()).
			Return(errors.New("exec error"))
		repo := &paymentMethodRepository{queries: mockQ}
		if err := repo.DeleteMany(ctx, []string{testPMIDStr}, testUserIDStr); err == nil {
			t.Fatal("expected exec error")
		}
	})
}

// --- FindByIDs ---

func TestPaymentMethodRepository_FindByIDs(t *testing.T) {
	t.Parallel()
	ctx := context.Background()

	t.Run("成功", func(t *testing.T) {
		t.Parallel()
		rows := []*generated.PaymentMethod{newTestPaymentMethod(t)}
		ctrl := gomock.NewController(t)
		mockQ := mock.NewMockQuerier(ctrl)
		mockQ.EXPECT().
			FindPaymentMethodsByIDs(gomock.Any(), gomock.Any()).
			Return(rows, nil)
		repo := &paymentMethodRepository{queries: mockQ}

		result, err := repo.FindByIDs(ctx, []string{testPMIDStr}, testUserIDStr)
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}
		if len(result) != 1 {
			t.Errorf("len(result) = %d, want 1", len(result))
		}
		if result[0].ID != testPMIDStr {
			t.Errorf("ID = %q, want %q", result[0].ID, testPMIDStr)
		}
	})

	t.Run("無効なuserID UUID", func(t *testing.T) {
		t.Parallel()
		ctrl := gomock.NewController(t)
		mockQ := mock.NewMockQuerier(ctrl)
		repo := &paymentMethodRepository{queries: mockQ}
		_, err := repo.FindByIDs(ctx, []string{testPMIDStr}, invalidUUID)
		if err == nil {
			t.Fatal("expected error for invalid userID UUID")
		}
	})

	t.Run("無効なID UUID（ids内）", func(t *testing.T) {
		t.Parallel()
		ctrl := gomock.NewController(t)
		mockQ := mock.NewMockQuerier(ctrl)
		repo := &paymentMethodRepository{queries: mockQ}
		_, err := repo.FindByIDs(ctx, []string{invalidUUID}, testUserIDStr)
		if err == nil {
			t.Fatal("expected error for invalid id in ids")
		}
	})

	t.Run("空スライス", func(t *testing.T) {
		t.Parallel()
		ctrl := gomock.NewController(t)
		mockQ := mock.NewMockQuerier(ctrl)
		mockQ.EXPECT().
			FindPaymentMethodsByIDs(gomock.Any(), gomock.Any()).
			Return(nil, nil)
		repo := &paymentMethodRepository{queries: mockQ}
		result, err := repo.FindByIDs(ctx, []string{}, testUserIDStr)
		if err != nil {
			t.Fatalf("unexpected error for empty ids: %v", err)
		}
		if len(result) != 0 {
			t.Errorf("len(result) = %d, want 0", len(result))
		}
	})

	t.Run("DBエラー", func(t *testing.T) {
		t.Parallel()
		ctrl := gomock.NewController(t)
		mockQ := mock.NewMockQuerier(ctrl)
		mockQ.EXPECT().
			FindPaymentMethodsByIDs(gomock.Any(), gomock.Any()).
			Return(nil, errors.New("db error"))
		repo := &paymentMethodRepository{queries: mockQ}
		_, err := repo.FindByIDs(ctx, []string{testPMIDStr}, testUserIDStr)
		if err == nil {
			t.Fatal("expected DB error")
		}
	})
}
