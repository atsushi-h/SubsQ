package mock

import (
	"context"
	"fmt"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgconn"

	"github.com/atsushi-h/subsq/backend/internal/adapter/gateway/db/sqlc/generated"
)

// UserDBTX is a mock generated.DBTX for user repository tests.
type UserDBTX struct {
	row      *generated.User
	rowErr   error
	execErr  error
	queryErr error
}

var _ generated.DBTX = (*UserDBTX)(nil)

// NewUserDBTX creates a mock for user repository operations.
func NewUserDBTX(row *generated.User, rowErr, execErr error) *UserDBTX {
	return &UserDBTX{
		row:     row,
		rowErr:  rowErr,
		execErr: execErr,
	}
}

// WithQueryErr configures the mock to return an error from Query.
func (m *UserDBTX) WithQueryErr(err error) *UserDBTX {
	m.queryErr = err
	return m
}

func (m *UserDBTX) Exec(_ context.Context, _ string, _ ...interface{}) (pgconn.CommandTag, error) {
	return pgconn.CommandTag{}, m.execErr
}

func (m *UserDBTX) QueryRow(_ context.Context, _ string, _ ...interface{}) pgx.Row {
	if m.rowErr != nil {
		return &mockRow{err: m.rowErr}
	}
	if m.row == nil {
		return &mockRow{err: fmt.Errorf("no row configured")}
	}
	u := m.row
	return &mockRow{values: []any{
		u.ID, u.Email, u.Name, u.Provider, u.ProviderAccountID,
		u.Thumbnail, u.CreatedAt, u.UpdatedAt,
	}}
}

func (m *UserDBTX) Query(_ context.Context, _ string, _ ...interface{}) (pgx.Rows, error) {
	if m.queryErr != nil {
		return nil, m.queryErr
	}
	return &mockRows{}, nil
}
