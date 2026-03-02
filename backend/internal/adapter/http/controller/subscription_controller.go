package controller

import (
	"net/http"
	"time"

	"github.com/google/uuid"
	"github.com/labstack/echo/v4"
	openapi_types "github.com/oapi-codegen/runtime/types"

	openapi "github.com/atsushi-h/subsq/backend/internal/adapter/http/generated/openapi"
	"github.com/atsushi-h/subsq/backend/internal/adapter/http/middleware"
	domain "github.com/atsushi-h/subsq/backend/internal/domain/subscription"
	"github.com/atsushi-h/subsq/backend/internal/usecase"
)

type SubscriptionController struct {
	interactor *usecase.SubscriptionInteractor
}

func NewSubscriptionController(interactor *usecase.SubscriptionInteractor) *SubscriptionController {
	return &SubscriptionController{interactor: interactor}
}

// GET /api/v1/subscriptions
func (c *SubscriptionController) List(ctx echo.Context) error {
	userID, ok := ctx.Get(middleware.UserIDKey).(string)
	if !ok {
		return errorJSON(ctx, http.StatusUnauthorized, "Unauthorized", "unauthorized")
	}

	subs, err := c.interactor.List(ctx.Request().Context(), userID)
	if err != nil {
		return errorJSON(ctx, http.StatusInternalServerError, "Internal Server Error", "unexpected error")
	}

	items := make([]openapi.ModelsSubscriptionResponse, 0, len(subs))
	var totalMonthly, totalYearly int64
	for _, sub := range subs {
		items = append(items, toSubscriptionResponse(sub))
		totalMonthly += int64(sub.ToMonthlyAmount())
		totalYearly += int64(sub.ToYearlyAmount())
	}

	return ctx.JSON(http.StatusOK, openapi.ModelsListSubscriptionsResponse{
		Subscriptions: items,
		Summary: openapi.ModelsSubscriptionListSummary{
			Count:        int32(len(subs)),
			MonthlyTotal: totalMonthly,
			YearlyTotal:  totalYearly,
		},
	})
}

// GET /api/v1/subscriptions/:id
func (c *SubscriptionController) Get(ctx echo.Context, id openapi.ModelsUuid) error {
	userID, ok := ctx.Get(middleware.UserIDKey).(string)
	if !ok {
		return errorJSON(ctx, http.StatusUnauthorized, "Unauthorized", "unauthorized")
	}

	sub, err := c.interactor.Get(ctx.Request().Context(), id.String(), userID)
	if err != nil {
		return handleError(ctx, err)
	}

	return ctx.JSON(http.StatusOK, toSubscriptionResponse(sub))
}

// POST /api/v1/subscriptions
func (c *SubscriptionController) Create(ctx echo.Context) error {
	userID, ok := ctx.Get(middleware.UserIDKey).(string)
	if !ok {
		return errorJSON(ctx, http.StatusUnauthorized, "Unauthorized", "unauthorized")
	}

	var req openapi.SubscriptionsCreateSubscriptionJSONRequestBody
	if err := ctx.Bind(&req); err != nil {
		return errorJSON(ctx, http.StatusBadRequest, "Bad Request", "invalid request body")
	}

	var pmID *string
	if req.PaymentMethodId != nil {
		s := req.PaymentMethodId.String()
		pmID = &s
	}

	sub, err := c.interactor.Create(ctx.Request().Context(), userID, usecase.CreateSubscriptionInput{
		ServiceName:     req.ServiceName,
		Amount:          int(req.Amount),
		BillingCycle:    domain.BillingCycle(req.BillingCycle),
		BaseDate:        int(req.BaseDate),
		PaymentMethodID: pmID,
		Memo:            req.Memo,
	})
	if err != nil {
		return handleError(ctx, err)
	}

	return ctx.JSON(http.StatusCreated, toSubscriptionResponse(sub))
}

// PATCH /api/v1/subscriptions/:id
func (c *SubscriptionController) Update(ctx echo.Context, id openapi.ModelsUuid) error {
	userID, ok := ctx.Get(middleware.UserIDKey).(string)
	if !ok {
		return errorJSON(ctx, http.StatusUnauthorized, "Unauthorized", "unauthorized")
	}

	var req openapi.SubscriptionsUpdateSubscriptionJSONRequestBody
	if err := ctx.Bind(&req); err != nil {
		return errorJSON(ctx, http.StatusBadRequest, "Bad Request", "invalid request body")
	}

	// 既存の値を取得してからマージ
	existing, err := c.interactor.Get(ctx.Request().Context(), id.String(), userID)
	if err != nil {
		return handleError(ctx, err)
	}

	serviceName := existing.ServiceName
	if req.ServiceName != nil {
		serviceName = *req.ServiceName
	}
	amount := existing.Amount
	if req.Amount != nil {
		amount = int(*req.Amount)
	}
	billingCycle := existing.BillingCycle
	if req.BillingCycle != nil {
		billingCycle = domain.BillingCycle(*req.BillingCycle)
	}
	baseDate := existing.BaseDate
	if req.BaseDate != nil {
		baseDate = int(*req.BaseDate)
	}
	pmID := existing.PaymentMethodID
	if req.PaymentMethodId != nil {
		s := req.PaymentMethodId.String()
		pmID = &s
	}
	memo := existing.Memo
	if req.Memo != nil {
		memo = req.Memo
	}

	sub, err := c.interactor.Update(ctx.Request().Context(), id.String(), userID, usecase.UpdateSubscriptionInput{
		ServiceName:     serviceName,
		Amount:          amount,
		BillingCycle:    billingCycle,
		BaseDate:        baseDate,
		PaymentMethodID: pmID,
		Memo:            memo,
	})
	if err != nil {
		return handleError(ctx, err)
	}

	return ctx.JSON(http.StatusOK, toSubscriptionResponse(sub))
}

// DELETE /api/v1/subscriptions/:id
func (c *SubscriptionController) Delete(ctx echo.Context, id openapi.ModelsUuid) error {
	userID, ok := ctx.Get(middleware.UserIDKey).(string)
	if !ok {
		return errorJSON(ctx, http.StatusUnauthorized, "Unauthorized", "unauthorized")
	}

	if err := c.interactor.Delete(ctx.Request().Context(), id.String(), userID); err != nil {
		return handleError(ctx, err)
	}

	return ctx.NoContent(http.StatusNoContent)
}

// DELETE /api/v1/subscriptions
func (c *SubscriptionController) DeleteMany(ctx echo.Context) error {
	userID, ok := ctx.Get(middleware.UserIDKey).(string)
	if !ok {
		return errorJSON(ctx, http.StatusUnauthorized, "Unauthorized", "unauthorized")
	}

	var req openapi.SubscriptionsDeleteSubscriptionsJSONRequestBody
	if err := ctx.Bind(&req); err != nil {
		return errorJSON(ctx, http.StatusBadRequest, "Bad Request", "invalid request body")
	}
	if len(req.Ids) == 0 {
		return errorJSON(ctx, http.StatusBadRequest, "Bad Request", "ids must not be empty")
	}

	ids := make([]string, 0, len(req.Ids))
	for _, id := range req.Ids {
		ids = append(ids, id.String())
	}

	if err := c.interactor.DeleteMany(ctx.Request().Context(), ids, userID); err != nil {
		return handleError(ctx, err)
	}

	return ctx.NoContent(http.StatusNoContent)
}

func toSubscriptionResponse(sub *domain.Subscription) openapi.ModelsSubscriptionResponse {
	resp := openapi.ModelsSubscriptionResponse{
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

	if idVal, err := uuid.Parse(sub.ID); err == nil {
		resp.Id = idVal
	}
	if idVal, err := uuid.Parse(sub.UserID); err == nil {
		resp.UserId = idVal
	}
	if sub.PaymentMethodID != nil {
		if idVal, err := uuid.Parse(*sub.PaymentMethodID); err == nil {
			resp.PaymentMethodId = &idVal
		}
		if sub.PaymentMethodName != nil {
			pmID := resp.PaymentMethodId
			if pmID != nil {
				resp.PaymentMethod = &openapi.ModelsPaymentMethodSummary{
					Id:   *pmID,
					Name: *sub.PaymentMethodName,
				}
			}
		}
	}

	return resp
}

// calculateNextBillingDate は次回請求日を計算する。
// 年次課金の場合、請求月は契約日（createdAt）の月を使う。
// baseDate は日（1〜31）のみを持ち、月の情報がないため、
// 年次課金を現在の月で計算すると誤った日付になる。
func calculateNextBillingDate(baseDate int, cycle domain.BillingCycle, createdAt time.Time) openapi_types.Date {
	now := time.Now()
	year, month, _ := now.Date()

	if cycle == domain.BillingCycleYearly {
		// 年次課金は契約月（createdAt の月）を請求月として使う
		billingMonth := createdAt.Month()
		next := time.Date(year, billingMonth, baseDate, 0, 0, 0, 0, time.UTC)
		if !next.After(now) {
			next = time.Date(year+1, billingMonth, baseDate, 0, 0, 0, 0, time.UTC)
		}
		return openapi_types.Date{Time: next}
	}

	// monthly
	next := time.Date(year, month, baseDate, 0, 0, 0, 0, time.UTC)
	if !next.After(now) {
		next = time.Date(year, month+1, baseDate, 0, 0, 0, 0, time.UTC)
	}
	return openapi_types.Date{Time: next}
}
