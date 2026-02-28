package user                                              

import "time"

type User struct {
	ID                string
	Email             Email
	Name              string
	Provider          string
	ProviderAccountID string
	Thumbnail         *string
	CreatedAt         time.Time
	UpdatedAt         time.Time
}
