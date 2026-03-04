package subscription_test

import (
	"errors"
	"testing"
	"time"

	domainerrors "github.com/atsushi-h/subsq/backend/internal/domain/errors"
	domain "github.com/atsushi-h/subsq/backend/internal/domain/subscription"
)

func TestValidateForCreate(t *testing.T) {
	t.Parallel()
	tests := []struct {
		name        string
		serviceName string
		amount      int
		cycle       domain.BillingCycle
		baseDate    int
		wantErr     bool
	}{
		{
			name:        "正常: 最小値",
			serviceName: "A",
			amount:      0,
			cycle:       domain.BillingCycleMonthly,
			baseDate:    1,
			wantErr:     false,
		},
		{
			name:        "正常: 最大値",
			serviceName: "A",
			amount:      1000000,
			cycle:       domain.BillingCycleYearly,
			baseDate:    31,
			wantErr:     false,
		},
		{
			name:        "異常: serviceName が空",
			serviceName: "",
			amount:      100,
			cycle:       domain.BillingCycleMonthly,
			baseDate:    1,
			wantErr:     true,
		},
		{
			name:        "異常: serviceName が 101 文字",
			serviceName: string(make([]byte, 101)),
			amount:      100,
			cycle:       domain.BillingCycleMonthly,
			baseDate:    1,
			wantErr:     true,
		},
		{
			name:        "異常: amount が -1",
			serviceName: "Netflix",
			amount:      -1,
			cycle:       domain.BillingCycleMonthly,
			baseDate:    1,
			wantErr:     true,
		},
		{
			name:        "異常: amount が 1000001",
			serviceName: "Netflix",
			amount:      1000001,
			cycle:       domain.BillingCycleMonthly,
			baseDate:    1,
			wantErr:     true,
		},
		{
			name:        "異常: 不正な billing_cycle",
			serviceName: "Netflix",
			amount:      100,
			cycle:       domain.BillingCycle("weekly"),
			baseDate:    1,
			wantErr:     true,
		},
		{
			name:        "異常: baseDate が 0",
			serviceName: "Netflix",
			amount:      100,
			cycle:       domain.BillingCycleMonthly,
			baseDate:    0,
			wantErr:     true,
		},
		{
			name:        "異常: baseDate が 32",
			serviceName: "Netflix",
			amount:      100,
			cycle:       domain.BillingCycleMonthly,
			baseDate:    32,
			wantErr:     true,
		},
	}

	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()
			err := domain.ValidateForCreate(tc.serviceName, tc.amount, tc.cycle, tc.baseDate)
			if (err != nil) != tc.wantErr {
				t.Errorf("ValidateForCreate() error = %v, wantErr %v", err, tc.wantErr)
			}
			if tc.wantErr && err != nil && !errors.Is(err, domainerrors.ErrInvalidInput) {
				t.Errorf("ValidateForCreate() error should wrap ErrInvalidInput, got %v", err)
			}
		})
	}
}

func TestParseBillingCycle(t *testing.T) {
	t.Parallel()
	tests := []struct {
		name    string
		input   string
		want    domain.BillingCycle
		wantErr bool
	}{
		{name: "monthly", input: "monthly", want: domain.BillingCycleMonthly, wantErr: false},
		{name: "yearly", input: "yearly", want: domain.BillingCycleYearly, wantErr: false},
		{name: "異常: weekly", input: "weekly", wantErr: true},
		{name: "異常: 空文字", input: "", wantErr: true},
		{name: "異常: 大文字 Monthly", input: "Monthly", wantErr: true},
	}

	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()
			got, err := domain.ParseBillingCycle(tc.input)
			if (err != nil) != tc.wantErr {
				t.Errorf("ParseBillingCycle(%q) error = %v, wantErr %v", tc.input, err, tc.wantErr)
			}
			if !tc.wantErr && got != tc.want {
				t.Errorf("ParseBillingCycle(%q) = %v, want %v", tc.input, got, tc.want)
			}
			if tc.wantErr && err != nil && !errors.Is(err, domainerrors.ErrInvalidInput) {
				t.Errorf("ParseBillingCycle() error should wrap ErrInvalidInput, got %v", err)
			}
		})
	}
}

func TestCalculateNextBillingDate(t *testing.T) {
	t.Parallel()

	// 基準時刻: 2024-03-15
	now := time.Date(2024, 3, 15, 0, 0, 0, 0, time.UTC)
	createdAt := time.Date(2023, 6, 1, 0, 0, 0, 0, time.UTC)

	tests := []struct {
		name      string
		baseDate  int
		cycle     domain.BillingCycle
		createdAt time.Time
		now       time.Time
		want      time.Time
	}{
		{
			name:      "月額: baseDate が未来 (20日)",
			baseDate:  20,
			cycle:     domain.BillingCycleMonthly,
			createdAt: createdAt,
			now:       now,
			want:      time.Date(2024, 3, 20, 0, 0, 0, 0, time.UTC),
		},
		{
			name:      "月額: baseDate が過去 (10日) → 翌月",
			baseDate:  10,
			cycle:     domain.BillingCycleMonthly,
			createdAt: createdAt,
			now:       now,
			want:      time.Date(2024, 4, 10, 0, 0, 0, 0, time.UTC),
		},
		{
			name:      "月額: baseDate が今日 → 翌月",
			baseDate:  15,
			cycle:     domain.BillingCycleMonthly,
			createdAt: createdAt,
			now:       now,
			want:      time.Date(2024, 4, 15, 0, 0, 0, 0, time.UTC),
		},
		{
			name:      "月額: baseDate が月末クランプ (2月31日 → 2月29日)",
			baseDate:  31,
			cycle:     domain.BillingCycleMonthly,
			createdAt: createdAt,
			now:       time.Date(2024, 2, 1, 0, 0, 0, 0, time.UTC), // 2024年はうるう年
			want:      time.Date(2024, 2, 29, 0, 0, 0, 0, time.UTC),
		},
		{
			name:      "年額: createdAt の月 (6月) が未来",
			baseDate:  1,
			cycle:     domain.BillingCycleYearly,
			createdAt: createdAt,
			now:       now,
			want:      time.Date(2024, 6, 1, 0, 0, 0, 0, time.UTC),
		},
		{
			name:      "年額: createdAt の月 (6月) が過去 → 翌年",
			baseDate:  1,
			cycle:     domain.BillingCycleYearly,
			createdAt: createdAt,
			now:       time.Date(2024, 7, 1, 0, 0, 0, 0, time.UTC),
			want:      time.Date(2025, 6, 1, 0, 0, 0, 0, time.UTC),
		},
	}

	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()
			got := domain.CalculateNextBillingDate(tc.baseDate, tc.cycle, tc.createdAt, tc.now)
			if !got.Equal(tc.want) {
				t.Errorf("CalculateNextBillingDate() = %v, want %v", got, tc.want)
			}
		})
	}
}

func TestCalculateSummary(t *testing.T) {
	t.Parallel()

	tests := []struct {
		name        string
		subs        []*domain.Subscription
		wantCount   int
		wantMonthly int64
		wantYearly  int64
	}{
		{
			name:        "空リスト",
			subs:        []*domain.Subscription{},
			wantCount:   0,
			wantMonthly: 0,
			wantYearly:  0,
		},
		{
			name: "月額のみ",
			subs: []*domain.Subscription{
				{Amount: 1000, BillingCycle: domain.BillingCycleMonthly},
				{Amount: 2000, BillingCycle: domain.BillingCycleMonthly},
			},
			wantCount:   2,
			wantMonthly: 3000,
			wantYearly:  36000,
		},
		{
			name: "年額のみ",
			subs: []*domain.Subscription{
				{Amount: 12000, BillingCycle: domain.BillingCycleYearly},
			},
			wantCount:   1,
			wantMonthly: 1000,
			wantYearly:  12000,
		},
		{
			name: "月額と年額の混在",
			subs: []*domain.Subscription{
				{Amount: 1000, BillingCycle: domain.BillingCycleMonthly},
				{Amount: 12000, BillingCycle: domain.BillingCycleYearly},
			},
			wantCount:   2,
			wantMonthly: 2000,
			wantYearly:  24000,
		},
	}

	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()
			got := domain.CalculateSummary(tc.subs)
			if got.Count != tc.wantCount {
				t.Errorf("CalculateSummary().Count = %d, want %d", got.Count, tc.wantCount)
			}
			if got.MonthlyTotal != tc.wantMonthly {
				t.Errorf("CalculateSummary().MonthlyTotal = %d, want %d", got.MonthlyTotal, tc.wantMonthly)
			}
			if got.YearlyTotal != tc.wantYearly {
				t.Errorf("CalculateSummary().YearlyTotal = %d, want %d", got.YearlyTotal, tc.wantYearly)
			}
		})
	}
}
