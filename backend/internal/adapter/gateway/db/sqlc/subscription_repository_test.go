package sqlc

import (
	"context"
	"errors"
	"testing"

	"github.com/jackc/pgx/v5/pgtype"

	"github.com/atsushi-h/subsq/backend/internal/adapter/gateway/db/sqlc/generated"
	"github.com/atsushi-h/subsq/backend/internal/adapter/gateway/db/sqlc/mock"
	domain "github.com/atsushi-h/subsq/backend/internal/domain/subscription"
)

const (
	testSubIDStr  = "7ba7b810-9dad-11d1-80b4-00c04fd430c8"
	testSub2IDStr = "7ba7b811-9dad-11d1-80b4-00c04fd430c8"
)

func strPtr(s string) *string { return &s }

func newTestSubscription(t *testing.T) *generated.Subscription {
	t.Helper()
	return &generated.Subscription{
		ID:              mustUUID(t, testSubIDStr),
		UserID:          mustUUID(t, testUserIDStr),
		ServiceName:     "Netflix",
		Amount:          980,
		BillingCycle:    "monthly",
		BaseDate:        1,
		PaymentMethodID: pgtype.UUID{},
		Memo:            nil,
		CreatedAt:       1_000_000,
		UpdatedAt:       1_000_001,
	}
}

func newTestGetSubscriptionRow(t *testing.T, withPM bool) *generated.GetSubscriptionByIDRow {
	t.Helper()
	row := &generated.GetSubscriptionByIDRow{
		ID:                mustUUID(t, testSubIDStr),
		UserID:            mustUUID(t, testUserIDStr),
		ServiceName:       "Netflix",
		Amount:            980,
		BillingCycle:      "monthly",
		BaseDate:          1,
		PaymentMethodID:   pgtype.UUID{},
		Memo:              nil,
		CreatedAt:         1_000_000,
		UpdatedAt:         1_000_001,
		PaymentMethodName: nil,
	}
	if withPM {
		row.PaymentMethodID = mustUUID(t, testPMIDStr)
		row.PaymentMethodName = strPtr("Test Card")
	}
	return row
}

func newTestListSubRow(t *testing.T) *generated.ListSubscriptionsByUserIDRow {
	t.Helper()
	return &generated.ListSubscriptionsByUserIDRow{
		ID:                mustUUID(t, testSubIDStr),
		UserID:            mustUUID(t, testUserIDStr),
		ServiceName:       "Netflix",
		Amount:            980,
		BillingCycle:      "monthly",
		BaseDate:          1,
		PaymentMethodID:   pgtype.UUID{},
		Memo:              nil,
		CreatedAt:         1_000_000,
		UpdatedAt:         1_000_001,
		PaymentMethodName: nil,
	}
}

// --- FindByID ---

func TestSubscriptionRepository_FindByID(t *testing.T) {
	t.Parallel()
	ctx := context.Background()

	t.Run("成功（PM付き）", func(t *testing.T) {
		t.Parallel()
		getRow := newTestGetSubscriptionRow(t, true)
		mockDB := mock.NewSubscriptionDBTX(nil, nil, nil).WithGetRow(getRow)
		repo := &subscriptionRepository{queries: generated.New(mockDB)}

		result, err := repo.FindByID(ctx, testSubIDStr, testUserIDStr)
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}
		if result.ID != testSubIDStr {
			t.Errorf("ID = %q, want %q", result.ID, testSubIDStr)
		}
		if result.PaymentMethodID == nil || *result.PaymentMethodID != testPMIDStr {
			t.Errorf("PaymentMethodID = %v, want %q", result.PaymentMethodID, testPMIDStr)
		}
		if result.PaymentMethodName == nil || *result.PaymentMethodName != "Test Card" {
			t.Errorf("PaymentMethodName = %v, want %q", result.PaymentMethodName, "Test Card")
		}
	})

	t.Run("成功（PMなし）", func(t *testing.T) {
		t.Parallel()
		getRow := newTestGetSubscriptionRow(t, false)
		mockDB := mock.NewSubscriptionDBTX(nil, nil, nil).WithGetRow(getRow)
		repo := &subscriptionRepository{queries: generated.New(mockDB)}

		result, err := repo.FindByID(ctx, testSubIDStr, testUserIDStr)
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}
		if result.PaymentMethodID != nil {
			t.Errorf("PaymentMethodID should be nil, got %v", *result.PaymentMethodID)
		}
		if result.PaymentMethodName != nil {
			t.Errorf("PaymentMethodName should be nil, got %v", *result.PaymentMethodName)
		}
	})

	t.Run("無効なID UUID", func(t *testing.T) {
		t.Parallel()
		repo := &subscriptionRepository{queries: generated.New(mock.NewSubscriptionDBTX(nil, nil, nil))}
		_, err := repo.FindByID(ctx, invalidUUID, testUserIDStr)
		if err == nil {
			t.Fatal("expected error for invalid id UUID")
		}
	})

	t.Run("無効なuserID UUID", func(t *testing.T) {
		t.Parallel()
		repo := &subscriptionRepository{queries: generated.New(mock.NewSubscriptionDBTX(nil, nil, nil))}
		_, err := repo.FindByID(ctx, testSubIDStr, invalidUUID)
		if err == nil {
			t.Fatal("expected error for invalid userID UUID")
		}
	})

	t.Run("DBエラー", func(t *testing.T) {
		t.Parallel()
		mockDB := mock.NewSubscriptionDBTX(nil, errors.New("db error"), nil)
		repo := &subscriptionRepository{queries: generated.New(mockDB)}
		_, err := repo.FindByID(ctx, testSubIDStr, testUserIDStr)
		if err == nil {
			t.Fatal("expected DB error")
		}
	})
}

// --- FindByUserID ---

func TestSubscriptionRepository_FindByUserID(t *testing.T) {
	t.Parallel()
	ctx := context.Background()

	t.Run("複数行返却", func(t *testing.T) {
		t.Parallel()
		listRows := []*generated.ListSubscriptionsByUserIDRow{
			newTestListSubRow(t),
			{
				ID:           mustUUID(t, testSub2IDStr),
				UserID:       mustUUID(t, testUserIDStr),
				ServiceName:  "Spotify",
				Amount:       980,
				BillingCycle: "monthly",
				BaseDate:     1,
				CreatedAt:    2_000_000,
				UpdatedAt:    2_000_001,
			},
		}
		mockDB := mock.NewSubscriptionDBTX(nil, nil, nil).WithListRows(listRows)
		repo := &subscriptionRepository{queries: generated.New(mockDB)}

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
		mockDB := mock.NewSubscriptionDBTX(nil, nil, nil).WithListRows(nil)
		repo := &subscriptionRepository{queries: generated.New(mockDB)}

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
		repo := &subscriptionRepository{queries: generated.New(mock.NewSubscriptionDBTX(nil, nil, nil))}
		_, err := repo.FindByUserID(ctx, invalidUUID)
		if err == nil {
			t.Fatal("expected error for invalid userID UUID")
		}
	})

	t.Run("DBエラー", func(t *testing.T) {
		t.Parallel()
		mockDB := mock.NewSubscriptionDBTX(nil, nil, nil).WithQueryErr(errors.New("db error"))
		repo := &subscriptionRepository{queries: generated.New(mockDB)}
		_, err := repo.FindByUserID(ctx, testUserIDStr)
		if err == nil {
			t.Fatal("expected DB error")
		}
	})
}

// --- Create ---

func TestSubscriptionRepository_Create(t *testing.T) {
	t.Parallel()
	ctx := context.Background()

	t.Run("成功（PM付き）", func(t *testing.T) {
		t.Parallel()
		row := newTestSubscription(t)
		row.PaymentMethodID = mustUUID(t, testPMIDStr)
		mockDB := mock.NewSubscriptionDBTX(row, nil, nil)
		repo := &subscriptionRepository{queries: generated.New(mockDB)}

		pmID := testPMIDStr
		input := domain.NewSubscription(testUserIDStr, "Netflix", 980, domain.BillingCycleMonthly, 1, &pmID, nil)
		result, err := repo.Create(ctx, input)
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}
		if result.ServiceName != "Netflix" {
			t.Errorf("ServiceName = %q, want %q", result.ServiceName, "Netflix")
		}
	})

	t.Run("成功（PMなし）", func(t *testing.T) {
		t.Parallel()
		row := newTestSubscription(t)
		mockDB := mock.NewSubscriptionDBTX(row, nil, nil)
		repo := &subscriptionRepository{queries: generated.New(mockDB)}

		input := domain.NewSubscription(testUserIDStr, "Netflix", 980, domain.BillingCycleMonthly, 1, nil, nil)
		result, err := repo.Create(ctx, input)
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}
		if result.PaymentMethodID != nil {
			t.Errorf("PaymentMethodID should be nil")
		}
	})

	t.Run("無効なuserID UUID", func(t *testing.T) {
		t.Parallel()
		repo := &subscriptionRepository{queries: generated.New(mock.NewSubscriptionDBTX(nil, nil, nil))}
		input := domain.NewSubscription(invalidUUID, "Netflix", 980, domain.BillingCycleMonthly, 1, nil, nil)
		_, err := repo.Create(ctx, input)
		if err == nil {
			t.Fatal("expected error for invalid userID UUID")
		}
	})

	t.Run("無効なPaymentMethodID UUID", func(t *testing.T) {
		t.Parallel()
		repo := &subscriptionRepository{queries: generated.New(mock.NewSubscriptionDBTX(nil, nil, nil))}
		badPMID := invalidUUID
		input := domain.NewSubscription(testUserIDStr, "Netflix", 980, domain.BillingCycleMonthly, 1, &badPMID, nil)
		_, err := repo.Create(ctx, input)
		if err == nil {
			t.Fatal("expected error for invalid paymentMethodID UUID")
		}
	})

	t.Run("DBエラー", func(t *testing.T) {
		t.Parallel()
		mockDB := mock.NewSubscriptionDBTX(nil, errors.New("db error"), nil)
		repo := &subscriptionRepository{queries: generated.New(mockDB)}
		input := domain.NewSubscription(testUserIDStr, "Netflix", 980, domain.BillingCycleMonthly, 1, nil, nil)
		_, err := repo.Create(ctx, input)
		if err == nil {
			t.Fatal("expected DB error")
		}
	})
}

// --- Update ---

func TestSubscriptionRepository_Update(t *testing.T) {
	t.Parallel()
	ctx := context.Background()

	t.Run("成功", func(t *testing.T) {
		t.Parallel()
		row := newTestSubscription(t)
		row.ServiceName = "Netflix Premium"
		mockDB := mock.NewSubscriptionDBTX(row, nil, nil)
		repo := &subscriptionRepository{queries: generated.New(mockDB)}

		input := &domain.Subscription{
			ID:           testSubIDStr,
			UserID:       testUserIDStr,
			ServiceName:  "Netflix Premium",
			Amount:       1480,
			BillingCycle: domain.BillingCycleMonthly,
			BaseDate:     1,
		}
		result, err := repo.Update(ctx, input)
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}
		if result.ServiceName != "Netflix Premium" {
			t.Errorf("ServiceName = %q, want %q", result.ServiceName, "Netflix Premium")
		}
	})

	t.Run("無効なID UUID", func(t *testing.T) {
		t.Parallel()
		repo := &subscriptionRepository{queries: generated.New(mock.NewSubscriptionDBTX(nil, nil, nil))}
		input := &domain.Subscription{ID: invalidUUID, UserID: testUserIDStr, ServiceName: "Test"}
		_, err := repo.Update(ctx, input)
		if err == nil {
			t.Fatal("expected error for invalid id UUID")
		}
	})

	t.Run("無効なuserID UUID", func(t *testing.T) {
		t.Parallel()
		repo := &subscriptionRepository{queries: generated.New(mock.NewSubscriptionDBTX(nil, nil, nil))}
		input := &domain.Subscription{ID: testSubIDStr, UserID: invalidUUID, ServiceName: "Test"}
		_, err := repo.Update(ctx, input)
		if err == nil {
			t.Fatal("expected error for invalid userID UUID")
		}
	})

	t.Run("DBエラー", func(t *testing.T) {
		t.Parallel()
		mockDB := mock.NewSubscriptionDBTX(nil, errors.New("db error"), nil)
		repo := &subscriptionRepository{queries: generated.New(mockDB)}
		input := &domain.Subscription{
			ID: testSubIDStr, UserID: testUserIDStr, ServiceName: "Test",
			BillingCycle: domain.BillingCycleMonthly,
		}
		_, err := repo.Update(ctx, input)
		if err == nil {
			t.Fatal("expected DB error")
		}
	})
}

// --- Delete ---

func TestSubscriptionRepository_Delete(t *testing.T) {
	t.Parallel()
	ctx := context.Background()

	t.Run("成功", func(t *testing.T) {
		t.Parallel()
		mockDB := mock.NewSubscriptionDBTX(nil, nil, nil)
		repo := &subscriptionRepository{queries: generated.New(mockDB)}
		if err := repo.Delete(ctx, testSubIDStr, testUserIDStr); err != nil {
			t.Fatalf("unexpected error: %v", err)
		}
	})

	t.Run("無効なID UUID", func(t *testing.T) {
		t.Parallel()
		repo := &subscriptionRepository{queries: generated.New(mock.NewSubscriptionDBTX(nil, nil, nil))}
		if err := repo.Delete(ctx, invalidUUID, testUserIDStr); err == nil {
			t.Fatal("expected error for invalid id UUID")
		}
	})

	t.Run("無効なuserID UUID", func(t *testing.T) {
		t.Parallel()
		repo := &subscriptionRepository{queries: generated.New(mock.NewSubscriptionDBTX(nil, nil, nil))}
		if err := repo.Delete(ctx, testSubIDStr, invalidUUID); err == nil {
			t.Fatal("expected error for invalid userID UUID")
		}
	})

	t.Run("execエラー", func(t *testing.T) {
		t.Parallel()
		mockDB := mock.NewSubscriptionDBTX(nil, nil, errors.New("exec error"))
		repo := &subscriptionRepository{queries: generated.New(mockDB)}
		if err := repo.Delete(ctx, testSubIDStr, testUserIDStr); err == nil {
			t.Fatal("expected exec error")
		}
	})
}

// --- DeleteMany ---

func TestSubscriptionRepository_DeleteMany(t *testing.T) {
	t.Parallel()
	ctx := context.Background()

	t.Run("成功", func(t *testing.T) {
		t.Parallel()
		mockDB := mock.NewSubscriptionDBTX(nil, nil, nil)
		repo := &subscriptionRepository{queries: generated.New(mockDB)}
		if err := repo.DeleteMany(ctx, []string{testSubIDStr, testSub2IDStr}, testUserIDStr); err != nil {
			t.Fatalf("unexpected error: %v", err)
		}
	})

	t.Run("無効なuserID UUID", func(t *testing.T) {
		t.Parallel()
		repo := &subscriptionRepository{queries: generated.New(mock.NewSubscriptionDBTX(nil, nil, nil))}
		if err := repo.DeleteMany(ctx, []string{testSubIDStr}, invalidUUID); err == nil {
			t.Fatal("expected error for invalid userID UUID")
		}
	})

	t.Run("無効なID UUID（ids内）", func(t *testing.T) {
		t.Parallel()
		repo := &subscriptionRepository{queries: generated.New(mock.NewSubscriptionDBTX(nil, nil, nil))}
		if err := repo.DeleteMany(ctx, []string{invalidUUID}, testUserIDStr); err == nil {
			t.Fatal("expected error for invalid id in ids")
		}
	})

	t.Run("空スライス", func(t *testing.T) {
		t.Parallel()
		mockDB := mock.NewSubscriptionDBTX(nil, nil, nil)
		repo := &subscriptionRepository{queries: generated.New(mockDB)}
		if err := repo.DeleteMany(ctx, []string{}, testUserIDStr); err != nil {
			t.Fatalf("unexpected error for empty ids: %v", err)
		}
	})

	t.Run("execエラー", func(t *testing.T) {
		t.Parallel()
		mockDB := mock.NewSubscriptionDBTX(nil, nil, errors.New("exec error"))
		repo := &subscriptionRepository{queries: generated.New(mockDB)}
		if err := repo.DeleteMany(ctx, []string{testSubIDStr}, testUserIDStr); err == nil {
			t.Fatal("expected exec error")
		}
	})
}

// --- FindByIDs ---

func TestSubscriptionRepository_FindByIDs(t *testing.T) {
	t.Parallel()
	ctx := context.Background()

	t.Run("成功", func(t *testing.T) {
		t.Parallel()
		baseRows := []*generated.Subscription{newTestSubscription(t)}
		mockDB := mock.NewSubscriptionDBTX(nil, nil, nil).WithBaseRows(baseRows)
		repo := &subscriptionRepository{queries: generated.New(mockDB)}

		result, err := repo.FindByIDs(ctx, []string{testSubIDStr}, testUserIDStr)
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}
		if len(result) != 1 {
			t.Errorf("len(result) = %d, want 1", len(result))
		}
	})

	t.Run("無効なuserID UUID", func(t *testing.T) {
		t.Parallel()
		repo := &subscriptionRepository{queries: generated.New(mock.NewSubscriptionDBTX(nil, nil, nil))}
		_, err := repo.FindByIDs(ctx, []string{testSubIDStr}, invalidUUID)
		if err == nil {
			t.Fatal("expected error for invalid userID UUID")
		}
	})

	t.Run("無効なID UUID（ids内）", func(t *testing.T) {
		t.Parallel()
		repo := &subscriptionRepository{queries: generated.New(mock.NewSubscriptionDBTX(nil, nil, nil))}
		_, err := repo.FindByIDs(ctx, []string{invalidUUID}, testUserIDStr)
		if err == nil {
			t.Fatal("expected error for invalid id in ids")
		}
	})

	t.Run("空スライス", func(t *testing.T) {
		t.Parallel()
		mockDB := mock.NewSubscriptionDBTX(nil, nil, nil).WithBaseRows(nil)
		repo := &subscriptionRepository{queries: generated.New(mockDB)}
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
		mockDB := mock.NewSubscriptionDBTX(nil, nil, nil).WithQueryErr(errors.New("db error"))
		repo := &subscriptionRepository{queries: generated.New(mockDB)}
		_, err := repo.FindByIDs(ctx, []string{testSubIDStr}, testUserIDStr)
		if err == nil {
			t.Fatal("expected DB error")
		}
	})
}

// --- CountByPaymentMethodID ---

func TestSubscriptionRepository_CountByPaymentMethodID(t *testing.T) {
	t.Parallel()
	ctx := context.Background()

	t.Run("成功", func(t *testing.T) {
		t.Parallel()
		mockDB := mock.NewSubscriptionDBTX(nil, nil, nil).WithCount(5)
		repo := &subscriptionRepository{queries: generated.New(mockDB)}

		count, err := repo.CountByPaymentMethodID(ctx, testPMIDStr)
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}
		if count != 5 {
			t.Errorf("count = %d, want 5", count)
		}
	})

	t.Run("無効なUUID", func(t *testing.T) {
		t.Parallel()
		repo := &subscriptionRepository{queries: generated.New(mock.NewSubscriptionDBTX(nil, nil, nil))}
		_, err := repo.CountByPaymentMethodID(ctx, invalidUUID)
		if err == nil {
			t.Fatal("expected error for invalid UUID")
		}
	})
}

// --- CountByPaymentMethodIDs ---

func TestSubscriptionRepository_CountByPaymentMethodIDs(t *testing.T) {
	t.Parallel()
	ctx := context.Background()

	t.Run("成功", func(t *testing.T) {
		t.Parallel()
		mockDB := mock.NewSubscriptionDBTX(nil, nil, nil).WithCount(3)
		repo := &subscriptionRepository{queries: generated.New(mockDB)}

		count, err := repo.CountByPaymentMethodIDs(ctx, []string{testPMIDStr})
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}
		if count != 3 {
			t.Errorf("count = %d, want 3", count)
		}
	})

	t.Run("無効なUUID（ids内）", func(t *testing.T) {
		t.Parallel()
		repo := &subscriptionRepository{queries: generated.New(mock.NewSubscriptionDBTX(nil, nil, nil))}
		_, err := repo.CountByPaymentMethodIDs(ctx, []string{invalidUUID})
		if err == nil {
			t.Fatal("expected error for invalid UUID in ids")
		}
	})

	t.Run("DBエラー", func(t *testing.T) {
		t.Parallel()
		mockDB := mock.NewSubscriptionDBTX(nil, errors.New("db error"), nil)
		repo := &subscriptionRepository{queries: generated.New(mockDB)}
		_, err := repo.CountByPaymentMethodIDs(ctx, []string{testPMIDStr})
		if err == nil {
			t.Fatal("expected DB error")
		}
	})
}
