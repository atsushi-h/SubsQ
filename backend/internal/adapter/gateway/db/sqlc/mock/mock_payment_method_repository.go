package mock

import (
	"context"
	"fmt"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgconn"

	"github.com/atsushi-h/subsq/backend/internal/adapter/gateway/db/sqlc/generated"
)

// PaymentMethodDBTX is a mock generated.DBTX for payment method repository tests.
type PaymentMethodDBTX struct {
	row          *generated.PaymentMethod
	rows         []*generated.PaymentMethod
	countRows    []*generated.ListPaymentMethodsWithCountByUserIDRow
	rowErr       error
	execErr      error
	queryErr     error
	useCountRows bool
}

var _ generated.DBTX = (*PaymentMethodDBTX)(nil)

// NewPaymentMethodDBTX creates a mock pre-configured for QueryRow and Exec operations.
func NewPaymentMethodDBTX(row *generated.PaymentMethod, rowErr, execErr error) *PaymentMethodDBTX {
	return &PaymentMethodDBTX{
		row:     row,
		rowErr:  rowErr,
		execErr: execErr,
	}
}

// WithRows configures the mock for Query operations returning plain PaymentMethod rows.
func (m *PaymentMethodDBTX) WithRows(rows []*generated.PaymentMethod) *PaymentMethodDBTX {
	m.rows = rows
	return m
}

// WithCountRows configures the mock for ListPaymentMethodsWithCountByUserID.
func (m *PaymentMethodDBTX) WithCountRows(rows []*generated.ListPaymentMethodsWithCountByUserIDRow) *PaymentMethodDBTX {
	m.countRows = rows
	m.useCountRows = true
	return m
}

// WithQueryErr configures the mock to return an error from Query.
func (m *PaymentMethodDBTX) WithQueryErr(err error) *PaymentMethodDBTX {
	m.queryErr = err
	return m
}

func (m *PaymentMethodDBTX) Exec(_ context.Context, _ string, _ ...interface{}) (pgconn.CommandTag, error) {
	return pgconn.CommandTag{}, m.execErr
}

func (m *PaymentMethodDBTX) QueryRow(_ context.Context, _ string, _ ...interface{}) pgx.Row {
	if m.rowErr != nil {
		return &mockRow{err: m.rowErr}
	}
	if m.row == nil {
		return &mockRow{err: fmt.Errorf("no row configured")}
	}
	return &mockRow{values: []any{
		m.row.ID,
		m.row.UserID,
		m.row.Name,
		m.row.CreatedAt,
		m.row.UpdatedAt,
	}}
}

// Query returns rows based on configuration.
// useCountRows=true  → 6-column ListPaymentMethodsWithCountByUserIDRow
// default            → 5-column PaymentMethod (ListByUserID or FindByIDs)
func (m *PaymentMethodDBTX) Query(_ context.Context, _ string, _ ...interface{}) (pgx.Rows, error) {
	if m.queryErr != nil {
		return nil, m.queryErr
	}
	if m.useCountRows {
		rows := make([][]any, len(m.countRows))
		for i, r := range m.countRows {
			rows[i] = []any{r.ID, r.UserID, r.Name, r.CreatedAt, r.UpdatedAt, r.UsageCount}
		}
		return &mockRows{rows: rows}, nil
	}
	rows := make([][]any, len(m.rows))
	for i, r := range m.rows {
		rows[i] = []any{r.ID, r.UserID, r.Name, r.CreatedAt, r.UpdatedAt}
	}
	return &mockRows{rows: rows}, nil
}
