package subscription

import "time"

type BillingCycle string

const (
	BillingCycleMonthly BillingCycle = "monthly"
	BillingCycleYearly  BillingCycle = "yearly"
)

type Subscription struct {
	ID                string
	UserID            string
	ServiceName       string
	Amount            int
	BillingCycle      BillingCycle
	BaseDate          int
	PaymentMethodID   *string
	PaymentMethodName *string // JOIN結果（読み取り専用）
	Memo              *string
	CreatedAt         time.Time
	UpdatedAt         time.Time
}

func (s *Subscription) BelongsTo(userID string) bool {
	return s.UserID == userID
}

func (s *Subscription) ToMonthlyAmount() int {
	if s.BillingCycle == BillingCycleYearly {
		return s.Amount / 12
	}
	return s.Amount
}

func (s *Subscription) ToYearlyAmount() int {
	if s.BillingCycle == BillingCycleMonthly {
		return s.Amount * 12
	}
	return s.Amount
}
