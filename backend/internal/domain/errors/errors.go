package domainerrors

import "errors"

var (
	// ErrInvalidInput はドメインルール違反の入力値に返す
	ErrInvalidInput = errors.New("invalid input")
	// ErrPaymentMethodInUse はサブスクリプションが参照中の支払い方法を削除しようとした場合に返す
	ErrPaymentMethodInUse = errors.New("payment method is in use by subscriptions")
)
