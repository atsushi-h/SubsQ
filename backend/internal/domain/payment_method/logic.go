package payment_method

import (
	"fmt"

	domainerrors "github.com/atsushi-h/subsq/backend/internal/domain/errors"
)

// CanDelete は支払い方法が安全に削除できる場合 nil を返す。
// サブスクリプションから参照中の場合は ErrPaymentMethodInUse を返す。
func CanDelete(usageCount int64) error {
	if usageCount > 0 {
		return fmt.Errorf("%w", domainerrors.ErrPaymentMethodInUse)
	}
	return nil
}
