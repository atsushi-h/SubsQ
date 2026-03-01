package payment_method

import "time"

type PaymentMethod struct {
	ID        string
	UserID    string
	Name      string
	CreatedAt time.Time
	UpdatedAt time.Time
}

func (pm *PaymentMethod) BelongsTo(userID string) bool {
	return pm.UserID == userID
}
