package sqlc

import (
	"context"
	"errors"
	"testing"

	"github.com/jackc/pgx/v5/pgtype"
	"go.uber.org/mock/gomock"

	"github.com/atsushi-h/subsq/backend/internal/adapter/gateway/db/sqlc/generated"
	"github.com/atsushi-h/subsq/backend/internal/adapter/gateway/db/sqlc/mock"
	domain "github.com/atsushi-h/subsq/backend/internal/domain/notification"
)

const testPushSubIDStr = "7ba7b820-9dad-11d1-80b4-00c04fd430c8"

func newTestPushSubscriptionRow(t *testing.T) *generated.PushSubscription {
	t.Helper()
	ua := "Mozilla/5.0"
	return &generated.PushSubscription{
		ID:        mustUUID(t, testPushSubIDStr),
		UserID:    mustUUID(t, testUserIDStr),
		Endpoint:  "https://push.example.com/endpoint",
		P256dh:    "dGVzdA==",
		Auth:      "YXV0aA==",
		UserAgent: &ua,
		CreatedAt: 1_000_000,
		UpdatedAt: 1_000_001,
	}
}

func newTestPushSubscriptionDomain() *domain.PushSubscription {
	return &domain.PushSubscription{
		ID:       testPushSubIDStr,
		UserID:   testUserIDStr,
		Endpoint: "https://push.example.com/endpoint",
		P256dh:   "dGVzdA==",
		Auth:     "YXV0aA==",
	}
}

// --- Upsert ---

func TestPushSubscriptionRepository_Upsert(t *testing.T) {
	t.Parallel()
	ctx := context.Background()

	t.Run("成功", func(t *testing.T) {
		t.Parallel()
		ctrl := gomock.NewController(t)
		mockQ := mock.NewMockQuerier(ctrl)
		mockQ.EXPECT().
			UpsertPushSubscription(gomock.Any(), gomock.Any()).
			Return(newTestPushSubscriptionRow(t), nil)
		repo := &pushSubscriptionRepository{queries: mockQ}

		input := newTestPushSubscriptionDomain()
		result, err := repo.Upsert(ctx, input)
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}
		if result.ID != testPushSubIDStr {
			t.Errorf("ID = %q, want %q", result.ID, testPushSubIDStr)
		}
		if result.Endpoint != input.Endpoint {
			t.Errorf("Endpoint = %q, want %q", result.Endpoint, input.Endpoint)
		}
	})

	t.Run("無効なuserID UUID", func(t *testing.T) {
		t.Parallel()
		ctrl := gomock.NewController(t)
		mockQ := mock.NewMockQuerier(ctrl)
		repo := &pushSubscriptionRepository{queries: mockQ}

		input := &domain.PushSubscription{UserID: invalidUUID, Endpoint: "https://push.example.com/endpoint"}
		_, err := repo.Upsert(ctx, input)
		if err == nil {
			t.Fatal("expected error for invalid userID UUID")
		}
	})

	t.Run("DBエラー", func(t *testing.T) {
		t.Parallel()
		ctrl := gomock.NewController(t)
		mockQ := mock.NewMockQuerier(ctrl)
		mockQ.EXPECT().
			UpsertPushSubscription(gomock.Any(), gomock.Any()).
			Return(nil, errors.New("db error"))
		repo := &pushSubscriptionRepository{queries: mockQ}

		_, err := repo.Upsert(ctx, newTestPushSubscriptionDomain())
		if err == nil {
			t.Fatal("expected DB error")
		}
	})
}

// --- DeleteByEndpoint ---

func TestPushSubscriptionRepository_DeleteByEndpoint(t *testing.T) {
	t.Parallel()
	ctx := context.Background()
	endpoint := "https://push.example.com/endpoint"

	t.Run("成功", func(t *testing.T) {
		t.Parallel()
		ctrl := gomock.NewController(t)
		mockQ := mock.NewMockQuerier(ctrl)
		mockQ.EXPECT().
			DeletePushSubscriptionByEndpoint(gomock.Any(), &generated.DeletePushSubscriptionByEndpointParams{
				Endpoint: endpoint,
				UserID:   mustUUID(t, testUserIDStr),
			}).
			Return(nil)
		repo := &pushSubscriptionRepository{queries: mockQ}

		if err := repo.DeleteByEndpoint(ctx, endpoint, testUserIDStr); err != nil {
			t.Fatalf("unexpected error: %v", err)
		}
	})

	t.Run("無効なuserID UUID", func(t *testing.T) {
		t.Parallel()
		ctrl := gomock.NewController(t)
		mockQ := mock.NewMockQuerier(ctrl)
		repo := &pushSubscriptionRepository{queries: mockQ}

		if err := repo.DeleteByEndpoint(ctx, endpoint, invalidUUID); err == nil {
			t.Fatal("expected error for invalid userID UUID")
		}
	})

	t.Run("DBエラー", func(t *testing.T) {
		t.Parallel()
		ctrl := gomock.NewController(t)
		mockQ := mock.NewMockQuerier(ctrl)
		mockQ.EXPECT().
			DeletePushSubscriptionByEndpoint(gomock.Any(), gomock.Any()).
			Return(errors.New("db error"))
		repo := &pushSubscriptionRepository{queries: mockQ}

		if err := repo.DeleteByEndpoint(ctx, endpoint, testUserIDStr); err == nil {
			t.Fatal("expected DB error")
		}
	})
}

// --- DeleteByID ---

func TestPushSubscriptionRepository_DeleteByID(t *testing.T) {
	t.Parallel()
	ctx := context.Background()

	t.Run("成功", func(t *testing.T) {
		t.Parallel()
		ctrl := gomock.NewController(t)
		mockQ := mock.NewMockQuerier(ctrl)
		mockQ.EXPECT().
			DeletePushSubscriptionByID(gomock.Any(), mustUUID(t, testPushSubIDStr)).
			Return(nil)
		repo := &pushSubscriptionRepository{queries: mockQ}

		if err := repo.DeleteByID(ctx, testPushSubIDStr); err != nil {
			t.Fatalf("unexpected error: %v", err)
		}
	})

	t.Run("無効なID UUID", func(t *testing.T) {
		t.Parallel()
		ctrl := gomock.NewController(t)
		mockQ := mock.NewMockQuerier(ctrl)
		repo := &pushSubscriptionRepository{queries: mockQ}

		if err := repo.DeleteByID(ctx, invalidUUID); err == nil {
			t.Fatal("expected error for invalid ID UUID")
		}
	})

	t.Run("DBエラー", func(t *testing.T) {
		t.Parallel()
		ctrl := gomock.NewController(t)
		mockQ := mock.NewMockQuerier(ctrl)
		mockQ.EXPECT().
			DeletePushSubscriptionByID(gomock.Any(), gomock.Any()).
			Return(errors.New("db error"))
		repo := &pushSubscriptionRepository{queries: mockQ}

		if err := repo.DeleteByID(ctx, testPushSubIDStr); err == nil {
			t.Fatal("expected DB error")
		}
	})
}

// --- FindByUserID ---

func TestPushSubscriptionRepository_FindByUserID(t *testing.T) {
	t.Parallel()
	ctx := context.Background()

	t.Run("複数件返却", func(t *testing.T) {
		t.Parallel()
		ctrl := gomock.NewController(t)
		mockQ := mock.NewMockQuerier(ctrl)
		rows := []*generated.PushSubscription{
			newTestPushSubscriptionRow(t),
			{
				ID:        mustUUID(t, "7ba7b821-9dad-11d1-80b4-00c04fd430c8"),
				UserID:    mustUUID(t, testUserIDStr),
				Endpoint:  "https://push.example.com/endpoint2",
				P256dh:    "dGVzdA==",
				Auth:      "YXV0aA==",
				UserAgent: nil,
				CreatedAt: 1_000_002,
				UpdatedAt: 1_000_003,
			},
		}
		mockQ.EXPECT().
			ListPushSubscriptionsByUserID(gomock.Any(), mustUUID(t, testUserIDStr)).
			Return(rows, nil)
		repo := &pushSubscriptionRepository{queries: mockQ}

		result, err := repo.FindByUserID(ctx, testUserIDStr)
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}
		if len(result) != 2 {
			t.Errorf("len = %d, want 2", len(result))
		}
		if result[0].ID != testPushSubIDStr {
			t.Errorf("ID = %q, want %q", result[0].ID, testPushSubIDStr)
		}
	})

	t.Run("0件返却", func(t *testing.T) {
		t.Parallel()
		ctrl := gomock.NewController(t)
		mockQ := mock.NewMockQuerier(ctrl)
		mockQ.EXPECT().
			ListPushSubscriptionsByUserID(gomock.Any(), gomock.Any()).
			Return([]*generated.PushSubscription{}, nil)
		repo := &pushSubscriptionRepository{queries: mockQ}

		result, err := repo.FindByUserID(ctx, testUserIDStr)
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}
		if len(result) != 0 {
			t.Errorf("len = %d, want 0", len(result))
		}
	})

	t.Run("無効なuserID UUID", func(t *testing.T) {
		t.Parallel()
		ctrl := gomock.NewController(t)
		mockQ := mock.NewMockQuerier(ctrl)
		repo := &pushSubscriptionRepository{queries: mockQ}

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
			ListPushSubscriptionsByUserID(gomock.Any(), gomock.Any()).
			Return(nil, errors.New("db error"))
		repo := &pushSubscriptionRepository{queries: mockQ}

		_, err := repo.FindByUserID(ctx, testUserIDStr)
		if err == nil {
			t.Fatal("expected DB error")
		}
	})
}

// --- FindAll ---

func TestPushSubscriptionRepository_FindAll(t *testing.T) {
	t.Parallel()
	ctx := context.Background()

	t.Run("複数件返却", func(t *testing.T) {
		t.Parallel()
		ctrl := gomock.NewController(t)
		mockQ := mock.NewMockQuerier(ctrl)
		rows := []*generated.PushSubscription{
			newTestPushSubscriptionRow(t),
			{
				ID:        mustUUID(t, "7ba7b821-9dad-11d1-80b4-00c04fd430c8"),
				UserID:    mustUUID(t, testPMIDStr),
				Endpoint:  "https://push.example.com/endpoint2",
				P256dh:    "dGVzdA==",
				Auth:      "YXV0aA==",
				UserAgent: nil,
				CreatedAt: 1_000_002,
				UpdatedAt: 1_000_003,
			},
		}
		mockQ.EXPECT().
			ListAllPushSubscriptions(gomock.Any()).
			Return(rows, nil)
		repo := &pushSubscriptionRepository{queries: mockQ}

		result, err := repo.FindAll(ctx)
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}
		if len(result) != 2 {
			t.Errorf("len = %d, want 2", len(result))
		}
	})

	t.Run("0件返却", func(t *testing.T) {
		t.Parallel()
		ctrl := gomock.NewController(t)
		mockQ := mock.NewMockQuerier(ctrl)
		mockQ.EXPECT().
			ListAllPushSubscriptions(gomock.Any()).
			Return([]*generated.PushSubscription{}, nil)
		repo := &pushSubscriptionRepository{queries: mockQ}

		result, err := repo.FindAll(ctx)
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}
		if len(result) != 0 {
			t.Errorf("len = %d, want 0", len(result))
		}
	})

	t.Run("DBエラー", func(t *testing.T) {
		t.Parallel()
		ctrl := gomock.NewController(t)
		mockQ := mock.NewMockQuerier(ctrl)
		mockQ.EXPECT().
			ListAllPushSubscriptions(gomock.Any()).
			Return(nil, errors.New("db error"))
		repo := &pushSubscriptionRepository{queries: mockQ}

		_, err := repo.FindAll(ctx)
		if err == nil {
			t.Fatal("expected DB error")
		}
	})
}

// toPushSubscriptionDomain の変換検証

func TestToPushSubscriptionDomain(t *testing.T) {
	t.Parallel()

	t.Run("UserAgent ありで正しく変換する", func(t *testing.T) {
		t.Parallel()
		ua := "Mozilla/5.0"
		row := &generated.PushSubscription{
			ID:        pgtype.UUID{Bytes: [16]byte{1}, Valid: true},
			UserID:    pgtype.UUID{Bytes: [16]byte{2}, Valid: true},
			Endpoint:  "https://push.example.com/endpoint",
			P256dh:    "dGVzdA==",
			Auth:      "YXV0aA==",
			UserAgent: &ua,
			CreatedAt: 1_000_000,
			UpdatedAt: 1_000_001,
		}
		result := toPushSubscriptionDomain(row)
		if result.Endpoint != row.Endpoint {
			t.Errorf("Endpoint = %q, want %q", result.Endpoint, row.Endpoint)
		}
		if result.UserAgent == nil || *result.UserAgent != ua {
			t.Errorf("UserAgent = %v, want %q", result.UserAgent, ua)
		}
	})

	t.Run("UserAgent なしで nil を保持する", func(t *testing.T) {
		t.Parallel()
		row := &generated.PushSubscription{
			ID:        pgtype.UUID{Bytes: [16]byte{1}, Valid: true},
			UserID:    pgtype.UUID{Bytes: [16]byte{2}, Valid: true},
			Endpoint:  "https://push.example.com/endpoint",
			P256dh:    "dGVzdA==",
			Auth:      "YXV0aA==",
			UserAgent: nil,
			CreatedAt: 1_000_000,
			UpdatedAt: 1_000_001,
		}
		result := toPushSubscriptionDomain(row)
		if result.UserAgent != nil {
			t.Errorf("UserAgent should be nil, got %v", *result.UserAgent)
		}
	})
}
