// Package presenter contains HTTP presenters that implement output ports.
package presenter

import (
	"context"
	"fmt"
	"time"

	"github.com/google/uuid"
	openapi_types "github.com/oapi-codegen/runtime/types"

	openapi "github.com/atsushi-h/subsq/backend/internal/adapter/http/generated/openapi"
	domain "github.com/atsushi-h/subsq/backend/internal/domain/subscription"
	"github.com/atsushi-h/subsq/backend/internal/port"
)

// SubscriptionPresenter converts domain subscriptions to OpenAPI responses.
type SubscriptionPresenter struct {
	response     *openapi.ModelsSubscriptionResponse
	listResponse *openapi.ModelsListSubscriptionsResponse
}

var _ port.SubscriptionOutputPort = (*SubscriptionPresenter)(nil)

// NewSubscriptionPresenter creates a new SubscriptionPresenter.
func NewSubscriptionPresenter() *SubscriptionPresenter {
	return &SubscriptionPresenter{}
}

// PresentSubscription stores a converted single subscription response.
func (p *SubscriptionPresenter) PresentSubscription(_ context.Context, sub *domain.Subscription) error {
	resp, err := toSubscriptionResponse(sub)
	if err != nil {
		return err
	}
	p.response = &resp
	return nil
}

// PresentSubscriptions stores a converted subscription list response with summary.
func (p *SubscriptionPresenter) PresentSubscriptions(_ context.Context, subs []*domain.Subscription) error {
	items := make([]openapi.ModelsSubscriptionResponse, 0, len(subs))
	var totalMonthly, totalYearly int64
	for _, sub := range subs {
		item, err := toSubscriptionResponse(sub)
		if err != nil {
			return err
		}
		items = append(items, item)
		totalMonthly += int64(sub.ToMonthlyAmount())
		totalYearly += int64(sub.ToYearlyAmount())
	}
	p.listResponse = &openapi.ModelsListSubscriptionsResponse{
		Subscriptions: items,
		Summary: openapi.ModelsSubscriptionListSummary{
			Count:        int32(len(subs)),
			MonthlyTotal: totalMonthly,
			YearlyTotal:  totalYearly,
		},
	}
	return nil
}

// Response returns the stored single subscription response.
func (p *SubscriptionPresenter) Response() *openapi.ModelsSubscriptionResponse {
	return p.response
}

// ListResponse returns the stored subscription list response.
func (p *SubscriptionPresenter) ListResponse() *openapi.ModelsListSubscriptionsResponse {
	return p.listResponse
}

func toSubscriptionResponse(sub *domain.Subscription) (openapi.ModelsSubscriptionResponse, error) {
	id, err := uuid.Parse(sub.ID)
	if err != nil {
		return openapi.ModelsSubscriptionResponse{}, fmt.Errorf("invalid subscription id %q: %w", sub.ID, err)
	}
	userID, err := uuid.Parse(sub.UserID)
	if err != nil {
		return openapi.ModelsSubscriptionResponse{}, fmt.Errorf("invalid user id %q: %w", sub.UserID, err)
	}

	resp := openapi.ModelsSubscriptionResponse{
		Id:              id,
		UserId:          userID,
		Amount:          int64(sub.Amount),
		BaseDate:        int32(sub.BaseDate),
		BillingCycle:    openapi.ModelsBillingCycle(sub.BillingCycle),
		CreatedAt:       sub.CreatedAt.UTC(),
		ServiceName:     sub.ServiceName,
		UpdatedAt:       sub.UpdatedAt.UTC(),
		Memo:            sub.Memo,
		NextBillingDate: calculateNextBillingDate(sub.BaseDate, sub.BillingCycle, sub.CreatedAt),
		MonthlyAmount:   int64(sub.ToMonthlyAmount()),
		YearlyAmount:    int64(sub.ToYearlyAmount()),
	}

	if sub.PaymentMethodID != nil {
		pmID, err := uuid.Parse(*sub.PaymentMethodID)
		if err != nil {
			return openapi.ModelsSubscriptionResponse{}, fmt.Errorf("invalid payment_method_id %q: %w", *sub.PaymentMethodID, err)
		}
		resp.PaymentMethodId = &pmID
		if sub.PaymentMethodName != nil {
			resp.PaymentMethod = &openapi.ModelsPaymentMethodSummary{
				Id:   pmID,
				Name: *sub.PaymentMethodName,
			}
		}
	}

	return resp, nil
}

// calculateNextBillingDate は次回請求日を計算する。
// 年次課金の場合、請求月は契約日（createdAt）の月を使う。
// baseDate は日（1〜31）のみを持ち、月の情報がないため、
// 年次課金を現在の月で計算すると誤った日付になる。
// baseDate が対象月の日数を超える場合は月末にクランプする（例: 4月31日 → 4月30日）。
func calculateNextBillingDate(baseDate int, cycle domain.BillingCycle, createdAt time.Time) openapi_types.Date {
	now := time.Now().UTC()
	year, month, _ := now.Date()

	if cycle == domain.BillingCycleYearly {
		billingMonth := createdAt.Month()
		next := time.Date(year, billingMonth, clampDay(baseDate, year, billingMonth), 0, 0, 0, 0, time.UTC)
		if !next.After(now) {
			next = time.Date(year+1, billingMonth, clampDay(baseDate, year+1, billingMonth), 0, 0, 0, 0, time.UTC)
		}
		return openapi_types.Date{Time: next}
	}

	next := time.Date(year, month, clampDay(baseDate, year, month), 0, 0, 0, 0, time.UTC)
	if !next.After(now) {
		next = time.Date(year, month+1, clampDay(baseDate, year, month+1), 0, 0, 0, 0, time.UTC)
	}
	return openapi_types.Date{Time: next}
}

// clampDay は baseDate がその月の日数を超える場合に月末の日にクランプする。
func clampDay(baseDate, year int, month time.Month) int {
	lastDay := time.Date(year, month+1, 0, 0, 0, 0, 0, time.UTC).Day()
	if baseDate > lastDay {
		return lastDay
	}
	return baseDate
}
