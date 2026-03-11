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
	now          func() time.Time
}

var _ port.SubscriptionOutputPort = (*SubscriptionPresenter)(nil)

// NewSubscriptionPresenter creates a new SubscriptionPresenter.
func NewSubscriptionPresenter() *SubscriptionPresenter {
	return &SubscriptionPresenter{now: func() time.Time { return time.Now().UTC() }}
}

// NewSubscriptionPresenterWithClock creates a SubscriptionPresenter with an injectable clock.
// Use this constructor in tests to control the current time.
func NewSubscriptionPresenterWithClock(now func() time.Time) *SubscriptionPresenter {
	return &SubscriptionPresenter{now: now}
}

// PresentSubscription stores a converted single subscription response.
func (p *SubscriptionPresenter) PresentSubscription(_ context.Context, sub *domain.Subscription) error {
	resp, err := toSubscriptionResponse(sub, p.now())
	if err != nil {
		return err
	}
	p.response = &resp
	return nil
}

// PresentSubscriptions stores a converted subscription list response with summary.
func (p *SubscriptionPresenter) PresentSubscriptions(_ context.Context, subs []*domain.Subscription) error {
	now := p.now()
	items := make([]openapi.ModelsSubscriptionResponse, 0, len(subs))
	for _, sub := range subs {
		item, err := toSubscriptionResponse(sub, now)
		if err != nil {
			return err
		}
		items = append(items, item)
	}
	summary := domain.CalculateSummary(subs)
	p.listResponse = &openapi.ModelsListSubscriptionsResponse{
		Subscriptions: items,
		Summary: openapi.ModelsSubscriptionListSummary{
			Count:        int32(summary.Count),
			MonthlyTotal: summary.MonthlyTotal,
			YearlyTotal:  summary.YearlyTotal,
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

func toSubscriptionResponse(sub *domain.Subscription, now time.Time) (openapi.ModelsSubscriptionResponse, error) {
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
		BaseDate:        time.Unix(int64(sub.BaseDate), 0).UTC(),
		BillingCycle:    openapi.ModelsBillingCycle(sub.BillingCycle),
		CreatedAt:       sub.CreatedAt.UTC(),
		ServiceName:     sub.ServiceName,
		UpdatedAt:       sub.UpdatedAt.UTC(),
		Memo:            sub.Memo,
		NextBillingDate: openapi_types.Date{Time: sub.CalculateNextBillingDate(now)},
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
