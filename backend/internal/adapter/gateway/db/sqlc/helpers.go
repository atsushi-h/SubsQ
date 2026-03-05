package sqlc

import (
	"context"
	"fmt"

	"github.com/jackc/pgx/v5/pgtype"

	"github.com/atsushi-h/subsq/backend/internal/adapter/gateway/db/sqlc/generated"
	driverdb "github.com/atsushi-h/subsq/backend/internal/driver/db"
)

func queriesForContext(ctx context.Context, q *generated.Queries) *generated.Queries {
	if tx := driverdb.TxFromContext(ctx); tx != nil {
		return q.WithTx(tx)
	}
	return q
}

func parseUUID(s string) (pgtype.UUID, error) {
	var id pgtype.UUID
	if err := id.Scan(s); err != nil {
		return pgtype.UUID{}, fmt.Errorf("invalid uuid %q: %w", s, err)
	}
	return id, nil
}
