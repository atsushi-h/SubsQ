package subscription

import (
	"fmt"
	"time"

	domainerrors "github.com/atsushi-h/subsq/backend/internal/domain/errors"
)

// SubscriptionSummary は複数サブスクの集計結果
type SubscriptionSummary struct {
	Count        int
	MonthlyTotal int64
	YearlyTotal  int64
}

// ValidateFields はサブスクリプションのフィールドに対するドメインバリデーション
func ValidateFields(serviceName string, amount int, cycle BillingCycle, baseDate int) error {
	if len(serviceName) == 0 || len(serviceName) > 100 {
		return fmt.Errorf("%w: service_name must be between 1 and 100 characters", domainerrors.ErrInvalidInput)
	}
	if amount < 0 || amount > 1000000 {
		return fmt.Errorf("%w: amount must be between 0 and 1000000", domainerrors.ErrInvalidInput)
	}
	if cycle != BillingCycleMonthly && cycle != BillingCycleYearly {
		return fmt.Errorf("%w: billing_cycle must be 'monthly' or 'yearly'", domainerrors.ErrInvalidInput)
	}
	if baseDate < 1 || baseDate > 31 {
		return fmt.Errorf("%w: base_date must be between 1 and 31", domainerrors.ErrInvalidInput)
	}
	return nil
}

// ParseBillingCycle は文字列を BillingCycle に変換する
func ParseBillingCycle(s string) (BillingCycle, error) {
	switch BillingCycle(s) {
	case BillingCycleMonthly, BillingCycleYearly:
		return BillingCycle(s), nil
	default:
		return "", fmt.Errorf("%w: billing_cycle must be 'monthly' or 'yearly'", domainerrors.ErrInvalidInput)
	}
}

// CalculateNextBillingDate は次回請求日を計算する。
// 年次課金の請求月は createdAt の月を使う（baseDate は日のみ保持するため）。
// baseDate が対象月の日数を超える場合は月末にクランプする。
func CalculateNextBillingDate(baseDate int, cycle BillingCycle, createdAt, now time.Time) time.Time {
	year, month, _ := now.Date()

	if cycle == BillingCycleYearly {
		billingMonth := createdAt.Month()
		next := time.Date(year, billingMonth, clampDay(baseDate, year, billingMonth), 0, 0, 0, 0, time.UTC)
		if !next.After(now) {
			next = time.Date(year+1, billingMonth, clampDay(baseDate, year+1, billingMonth), 0, 0, 0, 0, time.UTC)
		}
		return next
	}

	next := time.Date(year, month, clampDay(baseDate, year, month), 0, 0, 0, 0, time.UTC)
	if !next.After(now) {
		next = time.Date(year, month+1, clampDay(baseDate, year, month+1), 0, 0, 0, 0, time.UTC)
	}
	return next
}

// CalculateSummary はサブスク一覧の月額/年額合計を計算する
func CalculateSummary(subs []*Subscription) SubscriptionSummary {
	summary := SubscriptionSummary{Count: len(subs)}
	for _, s := range subs {
		summary.MonthlyTotal += int64(s.ToMonthlyAmount())
		summary.YearlyTotal += int64(s.ToYearlyAmount())
	}
	return summary
}

func clampDay(baseDate, year int, month time.Month) int {
	lastDay := time.Date(year, month+1, 0, 0, 0, 0, 0, time.UTC).Day()
	if baseDate > lastDay {
		return lastDay
	}
	return baseDate
}
