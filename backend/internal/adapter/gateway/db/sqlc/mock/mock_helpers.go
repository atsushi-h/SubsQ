package mock

import (
	"fmt"
	"reflect"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgconn"
)

// mockRow implements pgx.Row for testing.
type mockRow struct {
	values []any
	err    error
}

var _ pgx.Row = (*mockRow)(nil)

func (r *mockRow) Scan(dest ...any) error {
	if r.err != nil {
		return r.err
	}
	for i, d := range dest {
		if i >= len(r.values) {
			return fmt.Errorf("not enough values: have %d, need at least %d", len(r.values), i+1)
		}
		dv := reflect.ValueOf(d)
		if dv.Kind() != reflect.Ptr {
			return fmt.Errorf("dest[%d] must be a pointer", i)
		}
		elem := dv.Elem()
		val := reflect.ValueOf(r.values[i])
		if !val.IsValid() {
			// untyped nil
			elem.Set(reflect.Zero(elem.Type()))
			continue
		}
		if !val.Type().AssignableTo(elem.Type()) {
			return fmt.Errorf("dest[%d]: cannot assign %s to %s", i, val.Type(), elem.Type())
		}
		elem.Set(val)
	}
	return nil
}

// mockRows implements pgx.Rows for testing.
type mockRows struct {
	rows    [][]any
	idx     int
	err     error
	current []any
}

var _ pgx.Rows = (*mockRows)(nil)

func (r *mockRows) Close()                                       {}
func (r *mockRows) Err() error                                   { return r.err }
func (r *mockRows) CommandTag() pgconn.CommandTag                { return pgconn.CommandTag{} }
func (r *mockRows) FieldDescriptions() []pgconn.FieldDescription { return nil }
func (r *mockRows) Values() ([]any, error)                       { return r.current, nil }
func (r *mockRows) RawValues() [][]byte                          { return nil }
func (r *mockRows) Conn() *pgx.Conn                              { return nil }

func (r *mockRows) Next() bool {
	if r.idx < len(r.rows) {
		r.current = r.rows[r.idx]
		r.idx++
		return true
	}
	return false
}

func (r *mockRows) Scan(dest ...any) error {
	row := &mockRow{values: r.current}
	return row.Scan(dest...)
}
