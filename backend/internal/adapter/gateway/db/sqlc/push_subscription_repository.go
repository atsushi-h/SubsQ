package sqlc

import (
	"context"
	"time"

	"github.com/atsushi-h/subsq/backend/internal/adapter/gateway/db/sqlc/generated"
	domain "github.com/atsushi-h/subsq/backend/internal/domain/notification"
	"github.com/atsushi-h/subsq/backend/internal/port"
)

type pushSubscriptionRepository struct {
	queries generated.Querier
}

func NewPushSubscriptionRepository(q generated.Querier) port.PushSubscriptionRepository {
	return &pushSubscriptionRepository{queries: q}
}

func (r *pushSubscriptionRepository) Upsert(ctx context.Context, sub *domain.PushSubscription) (*domain.PushSubscription, error) {
	userID, err := parseUUID(sub.UserID)
	if err != nil {
		return nil, err
	}

	now := int32(time.Now().Unix()) //nolint:gosec // sqlc generated schema uses int32 for timestamps

	row, err := r.queries.UpsertPushSubscription(ctx, &generated.UpsertPushSubscriptionParams{
		UserID:    userID,
		Endpoint:  sub.Endpoint,
		P256dh:    sub.P256dh,
		Auth:      sub.Auth,
		UserAgent: sub.UserAgent,
		CreatedAt: now,
		UpdatedAt: now,
	})
	if err != nil {
		return nil, err
	}

	return toPushSubscriptionDomain(row), nil
}

func (r *pushSubscriptionRepository) DeleteByEndpoint(ctx context.Context, endpoint, userID string) error {
	uid, err := parseUUID(userID)
	if err != nil {
		return err
	}

	return r.queries.DeletePushSubscriptionByEndpoint(ctx, &generated.DeletePushSubscriptionByEndpointParams{
		Endpoint: endpoint,
		UserID:   uid,
	})
}

func (r *pushSubscriptionRepository) DeleteByID(ctx context.Context, id string) error {
	uid, err := parseUUID(id)
	if err != nil {
		return err
	}

	return r.queries.DeletePushSubscriptionByID(ctx, uid)
}

func (r *pushSubscriptionRepository) FindByUserID(ctx context.Context, userID string) ([]*domain.PushSubscription, error) {
	uid, err := parseUUID(userID)
	if err != nil {
		return nil, err
	}

	rows, err := r.queries.ListPushSubscriptionsByUserID(ctx, uid)
	if err != nil {
		return nil, err
	}

	result := make([]*domain.PushSubscription, len(rows))
	for i, row := range rows {
		result[i] = toPushSubscriptionDomain(row)
	}
	return result, nil
}

func (r *pushSubscriptionRepository) FindAll(ctx context.Context) ([]*domain.PushSubscription, error) {
	rows, err := r.queries.ListAllPushSubscriptions(ctx)
	if err != nil {
		return nil, err
	}

	result := make([]*domain.PushSubscription, len(rows))
	for i, row := range rows {
		result[i] = toPushSubscriptionDomain(row)
	}
	return result, nil
}

func toPushSubscriptionDomain(row *generated.PushSubscription) *domain.PushSubscription {
	return &domain.PushSubscription{
		ID:        row.ID.String(),
		UserID:    row.UserID.String(),
		Endpoint:  row.Endpoint,
		P256dh:    row.P256dh,
		Auth:      row.Auth,
		UserAgent: row.UserAgent,
		CreatedAt: time.Unix(int64(row.CreatedAt), 0),
		UpdatedAt: time.Unix(int64(row.UpdatedAt), 0),
	}
}
