package notification

import "time"

type PushSubscription struct {
	ID        string
	UserID    string
	Endpoint  string
	P256dh    string
	Auth      string
	UserAgent *string
	CreatedAt time.Time
	UpdatedAt time.Time
}
