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

// NewSubscription は新規 Subscription の値を組み立てる（ID/timestamps はrepository層が付与）
func NewSubscription(userID, serviceName string, amount int, cycle BillingCycle, baseDate int, paymentMethodID *string, memo *string) *Subscription {
	return &Subscription{
		UserID:          userID,
		ServiceName:     serviceName,
		Amount:          amount,
		BillingCycle:    cycle,
		BaseDate:        baseDate,
		PaymentMethodID: paymentMethodID,
		Memo:            memo,
	}
}

// WithUpdate は nil フィールドを既存値で補完した新しい Subscription を返す（イミュータブル）
func (s *Subscription) WithUpdate(serviceName *string, amount *int, cycle *BillingCycle, baseDate *int, paymentMethodID *string, memo *string) *Subscription {
	updated := *s
	if serviceName != nil {
		updated.ServiceName = *serviceName
	}
	if amount != nil {
		updated.Amount = *amount
	}
	if cycle != nil {
		updated.BillingCycle = *cycle
	}
	if baseDate != nil {
		updated.BaseDate = *baseDate
	}
	if paymentMethodID != nil {
		updated.PaymentMethodID = paymentMethodID
	}
	if memo != nil {
		updated.Memo = memo
	}
	return &updated
}

// CalculateNextBillingDate は logic.go の関数をメソッドとして提供する
func (s *Subscription) CalculateNextBillingDate(now time.Time) time.Time {
	return CalculateNextBillingDate(s.BaseDate, s.BillingCycle, s.CreatedAt, now)
}
