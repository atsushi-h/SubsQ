package mock

import (
	"context"
	"fmt"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgconn"

	"github.com/atsushi-h/subsq/backend/internal/adapter/gateway/db/sqlc/generated"
)

// SubscriptionDBTX is a mock generated.DBTX for subscription repository tests.
type SubscriptionDBTX struct {
	baseRow   *generated.Subscription
	getRow    *generated.GetSubscriptionByIDRow
	listRows  []*generated.ListSubscriptionsByUserIDRow
	baseRows  []*generated.Subscription
	count     int64
	rowErr    error
	execErr   error
	queryErr  error
	useGetRow bool
	useCount  bool
}

var _ generated.DBTX = (*SubscriptionDBTX)(nil)

// NewSubscriptionDBTX creates a mock pre-configured for Create/Update QueryRow and Exec operations.
func NewSubscriptionDBTX(baseRow *generated.Subscription, rowErr, execErr error) *SubscriptionDBTX {
	return &SubscriptionDBTX{
		baseRow: baseRow,
		rowErr:  rowErr,
		execErr: execErr,
	}
}

// WithGetRow configures the mock for GetSubscriptionByID (11-column QueryRow).
func (m *SubscriptionDBTX) WithGetRow(row *generated.GetSubscriptionByIDRow) *SubscriptionDBTX {
	m.getRow = row
	m.useGetRow = true
	return m
}

// WithListRows configures the mock for ListSubscriptionsByUserID.
func (m *SubscriptionDBTX) WithListRows(rows []*generated.ListSubscriptionsByUserIDRow) *SubscriptionDBTX {
	m.listRows = rows
	return m
}

// WithBaseRows configures the mock for FindSubscriptionsByIDs.
func (m *SubscriptionDBTX) WithBaseRows(rows []*generated.Subscription) *SubscriptionDBTX {
	m.baseRows = rows
	return m
}

// WithCount configures the mock for CountSubscriptionsByPaymentMethodID/IDs.
func (m *SubscriptionDBTX) WithCount(count int64) *SubscriptionDBTX {
	m.count = count
	m.useCount = true
	return m
}

// WithQueryErr configures the mock to return an error from Query.
func (m *SubscriptionDBTX) WithQueryErr(err error) *SubscriptionDBTX {
	m.queryErr = err
	return m
}

func (m *SubscriptionDBTX) Exec(_ context.Context, _ string, _ ...interface{}) (pgconn.CommandTag, error) {
	return pgconn.CommandTag{}, m.execErr
}

// QueryRow routes based on configured mode:
//   - useCount=true   → 1-column int64 (Count*)
//   - useGetRow=true  → 11-column GetSubscriptionByIDRow
//   - default         → 10-column Subscription (Create/Update)
func (m *SubscriptionDBTX) QueryRow(_ context.Context, _ string, _ ...interface{}) pgx.Row {
	if m.rowErr != nil {
		return &mockRow{err: m.rowErr}
	}
	if m.useCount {
		return &mockRow{values: []any{m.count}}
	}
	if m.useGetRow {
		if m.getRow == nil {
			return &mockRow{err: fmt.Errorf("no get row configured")}
		}
		r := m.getRow
		return &mockRow{values: []any{
			r.ID, r.UserID, r.ServiceName, r.Amount, r.BillingCycle,
			r.BaseDate, r.PaymentMethodID, r.Memo, r.CreatedAt, r.UpdatedAt,
			r.PaymentMethodName,
		}}
	}
	if m.baseRow == nil {
		return &mockRow{err: fmt.Errorf("no base row configured")}
	}
	s := m.baseRow
	return &mockRow{values: []any{
		s.ID, s.UserID, s.ServiceName, s.Amount, s.BillingCycle,
		s.BaseDate, s.PaymentMethodID, s.Memo, s.CreatedAt, s.UpdatedAt,
	}}
}

// Query routes based on arg count:
//   - len(args)==2 → FindSubscriptionsByIDs  → 10-column Subscription
//   - len(args)==1 → ListSubscriptionsByUserID → 11-column ListSubscriptionsByUserIDRow
func (m *SubscriptionDBTX) Query(_ context.Context, _ string, args ...interface{}) (pgx.Rows, error) {
	if m.queryErr != nil {
		return nil, m.queryErr
	}
	if len(args) == 2 {
		rows := make([][]any, len(m.baseRows))
		for i, s := range m.baseRows {
			rows[i] = []any{
				s.ID, s.UserID, s.ServiceName, s.Amount, s.BillingCycle,
				s.BaseDate, s.PaymentMethodID, s.Memo, s.CreatedAt, s.UpdatedAt,
			}
		}
		return &mockRows{rows: rows}, nil
	}
	rows := make([][]any, len(m.listRows))
	for i, r := range m.listRows {
		rows[i] = []any{
			r.ID, r.UserID, r.ServiceName, r.Amount, r.BillingCycle,
			r.BaseDate, r.PaymentMethodID, r.Memo, r.CreatedAt, r.UpdatedAt,
			r.PaymentMethodName,
		}
	}
	return &mockRows{rows: rows}, nil
}
