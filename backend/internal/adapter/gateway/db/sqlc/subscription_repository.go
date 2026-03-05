package sqlc

import (
	"context"
	"time"

	"github.com/jackc/pgx/v5/pgtype"
	"github.com/jackc/pgx/v5/pgxpool"

	"github.com/atsushi-h/subsq/backend/internal/adapter/gateway/db/sqlc/generated"
	domain "github.com/atsushi-h/subsq/backend/internal/domain/subscription"
	"github.com/atsushi-h/subsq/backend/internal/port"
)

type subscriptionRepository struct {
	queries *generated.Queries
}

func NewSubscriptionRepository(pool *pgxpool.Pool) port.SubscriptionRepository {
	return &subscriptionRepository{queries: generated.New(pool)}
}

func (r *subscriptionRepository) FindByID(ctx context.Context, id, userID string) (*domain.Subscription, error) {
	subID, err := parseUUID(id)
	if err != nil {
		return nil, err
	}
	uid, err := parseUUID(userID)
	if err != nil {
		return nil, err
	}

	row, err := queriesForContext(ctx, r.queries).GetSubscriptionByID(ctx, &generated.GetSubscriptionByIDParams{
		ID:     subID,
		UserID: uid,
	})
	if err != nil {
		return nil, err
	}

	return toSubscriptionDomainFromGetRow(row), nil
}

func (r *subscriptionRepository) FindByUserID(ctx context.Context, userID string) ([]*domain.Subscription, error) {
	uid, err := parseUUID(userID)
	if err != nil {
		return nil, err
	}

	rows, err := queriesForContext(ctx, r.queries).ListSubscriptionsByUserID(ctx, uid)
	if err != nil {
		return nil, err
	}

	result := make([]*domain.Subscription, len(rows))
	for i, row := range rows {
		result[i] = toSubscriptionDomainFromListRow(row)
	}
	return result, nil
}

func (r *subscriptionRepository) Create(ctx context.Context, s *domain.Subscription) (*domain.Subscription, error) {
	uid, err := parseUUID(s.UserID)
	if err != nil {
		return nil, err
	}

	var pmID pgtype.UUID
	if s.PaymentMethodID != nil {
		pmID, err = parseUUID(*s.PaymentMethodID)
		if err != nil {
			return nil, err
		}
	}

	now := int32(time.Now().Unix()) //nolint:gosec // sqlc generated schema uses int32 for timestamps

	created, err := queriesForContext(ctx, r.queries).CreateSubscription(ctx, &generated.CreateSubscriptionParams{
		UserID:          uid,
		ServiceName:     s.ServiceName,
		Amount:          int32(s.Amount), //nolint:gosec // amount is validated (0-1000000)
		BillingCycle:    string(s.BillingCycle),
		BaseDate:        int32(s.BaseDate), //nolint:gosec // base_date is validated (1-31)
		PaymentMethodID: pmID,
		Memo:            s.Memo,
		CreatedAt:       now,
		UpdatedAt:       now,
	})
	if err != nil {
		return nil, err
	}

	return toSubscriptionDomainFromBase(created), nil
}

func (r *subscriptionRepository) Update(ctx context.Context, s *domain.Subscription) (*domain.Subscription, error) {
	subID, err := parseUUID(s.ID)
	if err != nil {
		return nil, err
	}
	uid, err := parseUUID(s.UserID)
	if err != nil {
		return nil, err
	}

	var pmID pgtype.UUID
	if s.PaymentMethodID != nil {
		pmID, err = parseUUID(*s.PaymentMethodID)
		if err != nil {
			return nil, err
		}
	}

	now := int32(time.Now().Unix()) //nolint:gosec // sqlc generated schema uses int32 for timestamps

	updated, err := queriesForContext(ctx, r.queries).UpdateSubscription(ctx, &generated.UpdateSubscriptionParams{
		ID:              subID,
		UserID:          uid,
		ServiceName:     s.ServiceName,
		Amount:          int32(s.Amount), //nolint:gosec // amount is validated (0-1000000)
		BillingCycle:    string(s.BillingCycle),
		BaseDate:        int32(s.BaseDate), //nolint:gosec // base_date is validated (1-31)
		PaymentMethodID: pmID,
		Memo:            s.Memo,
		UpdatedAt:       now,
	})
	if err != nil {
		return nil, err
	}

	return toSubscriptionDomainFromBase(updated), nil
}

func (r *subscriptionRepository) Delete(ctx context.Context, id, userID string) error {
	subID, err := parseUUID(id)
	if err != nil {
		return err
	}
	uid, err := parseUUID(userID)
	if err != nil {
		return err
	}

	return queriesForContext(ctx, r.queries).DeleteSubscription(ctx, &generated.DeleteSubscriptionParams{
		ID:     subID,
		UserID: uid,
	})
}

func (r *subscriptionRepository) DeleteMany(ctx context.Context, ids []string, userID string) error {
	uid, err := parseUUID(userID)
	if err != nil {
		return err
	}

	uuids := make([]pgtype.UUID, len(ids))
	for i, id := range ids {
		uuids[i], err = parseUUID(id)
		if err != nil {
			return err
		}
	}

	return queriesForContext(ctx, r.queries).DeleteSubscriptions(ctx, &generated.DeleteSubscriptionsParams{
		Column1: uuids,
		UserID:  uid,
	})
}

func (r *subscriptionRepository) FindByIDs(ctx context.Context, ids []string, userID string) ([]*domain.Subscription, error) {
	uid, err := parseUUID(userID)
	if err != nil {
		return nil, err
	}

	uuids := make([]pgtype.UUID, len(ids))
	for i, id := range ids {
		uuids[i], err = parseUUID(id)
		if err != nil {
			return nil, err
		}
	}

	rows, err := queriesForContext(ctx, r.queries).FindSubscriptionsByIDs(ctx, &generated.FindSubscriptionsByIDsParams{
		Column1: uuids,
		UserID:  uid,
	})
	if err != nil {
		return nil, err
	}

	result := make([]*domain.Subscription, 0, len(rows))
	for _, row := range rows {
		result = append(result, toSubscriptionDomainFromBase(row))
	}
	return result, nil
}

func (r *subscriptionRepository) CountByPaymentMethodID(ctx context.Context, pmID string) (int64, error) {
	id, err := parseUUID(pmID)
	if err != nil {
		return 0, err
	}

	return queriesForContext(ctx, r.queries).CountSubscriptionsByPaymentMethodID(ctx, id)
}

func (r *subscriptionRepository) CountByPaymentMethodIDs(ctx context.Context, ids []string) (int64, error) {
	uuids := make([]pgtype.UUID, len(ids))
	for i, id := range ids {
		var err error
		uuids[i], err = parseUUID(id)
		if err != nil {
			return 0, err
		}
	}

	return queriesForContext(ctx, r.queries).CountSubscriptionsByPaymentMethodIDs(ctx, uuids)
}

func toSubscriptionDomainFromGetRow(row *generated.GetSubscriptionByIDRow) *domain.Subscription {
	return subscriptionRowToDomain(
		row.ID, row.UserID, row.ServiceName, int(row.Amount),
		domain.BillingCycle(row.BillingCycle), int(row.BaseDate),
		row.PaymentMethodID, row.Memo, row.CreatedAt, row.UpdatedAt,
		row.PaymentMethodName,
	)
}

func toSubscriptionDomainFromListRow(row *generated.ListSubscriptionsByUserIDRow) *domain.Subscription {
	return subscriptionRowToDomain(
		row.ID, row.UserID, row.ServiceName, int(row.Amount),
		domain.BillingCycle(row.BillingCycle), int(row.BaseDate),
		row.PaymentMethodID, row.Memo, row.CreatedAt, row.UpdatedAt,
		row.PaymentMethodName,
	)
}

func toSubscriptionDomainFromBase(row *generated.Subscription) *domain.Subscription {
	return subscriptionRowToDomain(
		row.ID, row.UserID, row.ServiceName, int(row.Amount),
		domain.BillingCycle(row.BillingCycle), int(row.BaseDate),
		row.PaymentMethodID, row.Memo, row.CreatedAt, row.UpdatedAt,
		nil,
	)
}

func subscriptionRowToDomain(
	id, userID pgtype.UUID,
	serviceName string,
	amount int,
	billingCycle domain.BillingCycle,
	baseDate int,
	paymentMethodID pgtype.UUID,
	memo *string,
	createdAt, updatedAt int32,
	paymentMethodName *string,
) *domain.Subscription {
	s := &domain.Subscription{
		ID:                id.String(),
		UserID:            userID.String(),
		ServiceName:       serviceName,
		Amount:            amount,
		BillingCycle:      billingCycle,
		BaseDate:          baseDate,
		Memo:              memo,
		CreatedAt:         time.Unix(int64(createdAt), 0),
		UpdatedAt:         time.Unix(int64(updatedAt), 0),
		PaymentMethodName: paymentMethodName,
	}
	if paymentMethodID.Valid {
		pmIDStr := paymentMethodID.String()
		s.PaymentMethodID = &pmIDStr
	}
	return s
}
