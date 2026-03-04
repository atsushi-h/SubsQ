package factory

import (
	"github.com/jackc/pgx/v5/pgxpool"

	driverdb "github.com/atsushi-h/subsq/backend/internal/driver/db"
	"github.com/atsushi-h/subsq/backend/internal/port"
)

// NewTxManager creates a port.TxManager backed by pgxpool.
func NewTxManager(pool *pgxpool.Pool) port.TxManager {
	return driverdb.NewTxManager(pool)
}
