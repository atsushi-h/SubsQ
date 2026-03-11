//go:generate go tool mockgen -source=tx_port.go -destination=../usecase/mock/mock_tx.go -package=mockusecase

package port

import "context"

// TxManager abstracts database transaction management.
type TxManager interface {
	WithinTransaction(ctx context.Context, fn func(ctx context.Context) error) error
}
