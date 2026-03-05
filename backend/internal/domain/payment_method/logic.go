package payment_method

import (
	"fmt"

	domainerrors "github.com/atsushi-h/subsq/backend/internal/domain/errors"
)

// ValidateFields は支払い方法のフィールドに対するドメインバリデーション
func ValidateFields(name string) error {
	if len(name) == 0 || len(name) > 100 {
		return fmt.Errorf("%w: name must be between 1 and 100 characters", domainerrors.ErrInvalidInput)
	}
	return nil
}

// CanDelete は支払い方法が安全に削除できる場合 nil を返す。
// サブスクリプションから参照中の場合は ErrPaymentMethodInUse を返す。
func CanDelete(usageCount int64) error {
	if usageCount > 0 {
		return domainerrors.ErrPaymentMethodInUse
	}
	return nil
}
