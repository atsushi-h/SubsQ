package sqlc

import (
	"context"
	"time"

	"github.com/jackc/pgx/v5/pgtype"

	"github.com/atsushi-h/subsq/backend/internal/adapter/gateway/db/sqlc/generated"
	"github.com/atsushi-h/subsq/backend/internal/domain/user"
	"github.com/atsushi-h/subsq/backend/internal/port"
)

type userRepository struct {
	queries generated.Querier
}

func NewUserRepository(q generated.Querier) port.UserRepository {
	return &userRepository{queries: q}
}

func (r *userRepository) UpsertUser(ctx context.Context, u *user.User) (*user.User, error) {
	now := int32(time.Now().Unix()) //nolint:gosec // sqlc generated schema uses int32 for timestamps

	row, err := queriesForContext(ctx, r.queries).UpsertUser(ctx, &generated.UpsertUserParams{
		Email:             u.Email.String(),
		Name:              u.Name,
		Provider:          u.Provider,
		ProviderAccountID: u.ProviderAccountID,
		Thumbnail:         u.Thumbnail,
		CreatedAt:         now,
		UpdatedAt:         now,
	})
	if err != nil {
		return nil, err
	}

	return toUserDomain(row), nil
}

func (r *userRepository) FindByID(ctx context.Context, id string) (*user.User, error) {
	var pgID pgtype.UUID
	if err := pgID.Scan(id); err != nil {
		return nil, err
	}

	row, err := queriesForContext(ctx, r.queries).FindUserByID(ctx, pgID)
	if err != nil {
		return nil, err
	}

	return toUserDomain(row), nil
}

func (r *userRepository) UpdateUser(ctx context.Context, id string, name *string, thumbnail *string) (*user.User, error) {
	var pgID pgtype.UUID
	if err := pgID.Scan(id); err != nil {
		return nil, err
	}

	now := int32(time.Now().Unix()) //nolint:gosec // sqlc generated schema uses int32 for timestamps

	params := &generated.UpdateUserParams{
		ID:        pgID,
		Name:      name,
		UpdatedAt: now,
	}
	if thumbnail != nil {
		t := true
		params.SetThumbnail = &t
		params.Thumbnail = thumbnail
	}

	row, err := queriesForContext(ctx, r.queries).UpdateUser(ctx, params)
	if err != nil {
		return nil, err
	}
	return toUserDomain(row), nil
}

func (r *userRepository) DeleteUser(ctx context.Context, id string) error {
	var pgID pgtype.UUID
	if err := pgID.Scan(id); err != nil {
		return err
	}
	return queriesForContext(ctx, r.queries).DeleteUser(ctx, pgID)
}

func toUserDomain(row *generated.User) *user.User {
	return &user.User{
		ID:                row.ID.String(),
		Email:             user.Email(row.Email),
		Name:              row.Name,
		Provider:          row.Provider,
		ProviderAccountID: row.ProviderAccountID,
		Thumbnail:         row.Thumbnail,
		CreatedAt:         time.Unix(int64(row.CreatedAt), 0),
		UpdatedAt:         time.Unix(int64(row.UpdatedAt), 0),
	}
}
