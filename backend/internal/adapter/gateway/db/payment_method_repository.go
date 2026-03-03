package db

import (
	"context"
	"time"

	"github.com/jackc/pgx/v5/pgtype"
	"github.com/jackc/pgx/v5/pgxpool"

	"github.com/atsushi-h/subsq/backend/internal/adapter/gateway/db/sqlc/generated"
	domain "github.com/atsushi-h/subsq/backend/internal/domain/payment_method"
	"github.com/atsushi-h/subsq/backend/internal/port"
)

var _ port.PaymentMethodRepository = (*paymentMethodRepository)(nil)

type paymentMethodRepository struct {
	queries *generated.Queries
}

func NewPaymentMethodRepository(pool *pgxpool.Pool) port.PaymentMethodRepository {
	return &paymentMethodRepository{queries: generated.New(pool)}
}

func (r *paymentMethodRepository) FindByID(ctx context.Context, id, userID string) (*domain.PaymentMethod, error) {
	pmID, err := parseUUID(id)
	if err != nil {
		return nil, err
	}
	uid, err := parseUUID(userID)
	if err != nil {
		return nil, err
	}

	row, err := queriesForContext(ctx, r.queries).GetPaymentMethodByID(ctx, &generated.GetPaymentMethodByIDParams{
		ID:     pmID,
		UserID: uid,
	})
	if err != nil {
		return nil, err
	}

	return toPaymentMethodDomain(row), nil
}

func (r *paymentMethodRepository) FindByUserID(ctx context.Context, userID string) ([]*domain.PaymentMethod, error) {
	uid, err := parseUUID(userID)
	if err != nil {
		return nil, err
	}

	rows, err := queriesForContext(ctx, r.queries).ListPaymentMethodsByUserID(ctx, uid)
	if err != nil {
		return nil, err
	}

	result := make([]*domain.PaymentMethod, len(rows))
	for i, row := range rows {
		result[i] = toPaymentMethodDomain(row)
	}

	return result, nil
}

func (r *paymentMethodRepository) FindByUserIDWithCount(ctx context.Context, userID string) ([]*port.PaymentMethodWithCount, error) {
	uid, err := parseUUID(userID)
	if err != nil {
		return nil, err
	}

	rows, err := queriesForContext(ctx, r.queries).ListPaymentMethodsWithCountByUserID(ctx, uid)
	if err != nil {
		return nil, err
	}

	result := make([]*port.PaymentMethodWithCount, 0, len(rows))
	for _, row := range rows {
		result = append(result, &port.PaymentMethodWithCount{
			PaymentMethod: toPaymentMethodDomain(&generated.PaymentMethod{
				ID:        row.ID,
				UserID:    row.UserID,
				Name:      row.Name,
				CreatedAt: row.CreatedAt,
				UpdatedAt: row.UpdatedAt,
			}),
			UsageCount: row.UsageCount,
		})
	}

	return result, nil
}

func (r *paymentMethodRepository) Create(ctx context.Context, pm *domain.PaymentMethod) (*domain.PaymentMethod, error) {
	uid, err := parseUUID(pm.UserID)
	if err != nil {
		return nil, err
	}

	now := int32(time.Now().Unix()) //nolint:gosec // sqlc generated schema uses int32 for timestamps

	row, err := queriesForContext(ctx, r.queries).CreatePaymentMethod(ctx, &generated.CreatePaymentMethodParams{
		UserID:    uid,
		Name:      pm.Name,
		CreatedAt: now,
		UpdatedAt: now,
	})
	if err != nil {
		return nil, err
	}

	return toPaymentMethodDomain(row), nil
}

func (r *paymentMethodRepository) Update(ctx context.Context, pm *domain.PaymentMethod) (*domain.PaymentMethod, error) {
	pmID, err := parseUUID(pm.ID)
	if err != nil {
		return nil, err
	}
	uid, err := parseUUID(pm.UserID)
	if err != nil {
		return nil, err
	}

	now := int32(time.Now().Unix()) //nolint:gosec // sqlc generated schema uses int32 for timestamps

	row, err := queriesForContext(ctx, r.queries).UpdatePaymentMethod(ctx, &generated.UpdatePaymentMethodParams{
		ID:        pmID,
		Name:      pm.Name,
		UpdatedAt: now,
		UserID:    uid,
	})
	if err != nil {
		return nil, err
	}

	return toPaymentMethodDomain(row), nil
}

func (r *paymentMethodRepository) Delete(ctx context.Context, id, userID string) error {
	pmID, err := parseUUID(id)
	if err != nil {
		return err
	}
	uid, err := parseUUID(userID)
	if err != nil {
		return err
	}

	return queriesForContext(ctx, r.queries).DeletePaymentMethod(ctx, &generated.DeletePaymentMethodParams{
		ID:     pmID,
		UserID: uid,
	})
}

func (r *paymentMethodRepository) DeleteMany(ctx context.Context, ids []string, userID string) error {
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

	return queriesForContext(ctx, r.queries).DeletePaymentMethods(ctx, &generated.DeletePaymentMethodsParams{
		Column1: uuids,
		UserID:  uid,
	})
}

func (r *paymentMethodRepository) FindByIDs(ctx context.Context, ids []string, userID string) ([]*domain.PaymentMethod, error) {
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

	rows, err := queriesForContext(ctx, r.queries).FindPaymentMethodsByIDs(ctx, &generated.FindPaymentMethodsByIDsParams{
		Column1: uuids,
		UserID:  uid,
	})
	if err != nil {
		return nil, err
	}

	result := make([]*domain.PaymentMethod, 0, len(rows))
	for _, row := range rows {
		result = append(result, toPaymentMethodDomain(row))
	}

	return result, nil
}

func toPaymentMethodDomain(row *generated.PaymentMethod) *domain.PaymentMethod {
	return &domain.PaymentMethod{
		ID:        row.ID.String(),
		UserID:    row.UserID.String(),
		Name:      row.Name,
		CreatedAt: time.Unix(int64(row.CreatedAt), 0),
		UpdatedAt: time.Unix(int64(row.UpdatedAt), 0),
	}
}
