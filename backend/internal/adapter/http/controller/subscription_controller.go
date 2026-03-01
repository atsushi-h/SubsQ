package controller

import (
	"errors"
	"net/http"
	"time"

	"github.com/labstack/echo/v4"

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
		return problemJSON(ctx, http.StatusUnauthorized, "Unauthorized", "unauthorized")
	}

	subs, err := c.interactor.List(ctx.Request().Context(), userID)
	if err != nil {
		return problemJSON(ctx, http.StatusInternalServerError, "Internal Server Error", "unexpected error")
	}

	resp := make([]subscriptionResponse, 0, len(subs))
	totalMonthly := 0
	totalYearly := 0
	for _, sub := range subs {
		resp = append(resp, toSubscriptionResponse(sub))
		totalMonthly += sub.ToMonthlyAmount()
		totalYearly += sub.ToYearlyAmount()
	}

	return ctx.JSON(http.StatusOK, listSubscriptionsResponse{
		Subscriptions:      resp,
		TotalMonthlyAmount: totalMonthly,
		TotalYearlyAmount:  totalYearly,
	})
}

// GET /api/v1/subscriptions/:id
func (c *SubscriptionController) Get(ctx echo.Context) error {
	userID, ok := ctx.Get(middleware.UserIDKey).(string)
	if !ok {
		return problemJSON(ctx, http.StatusUnauthorized, "Unauthorized", "unauthorized")
	}

	id := ctx.Param("id")

	sub, err := c.interactor.Get(ctx.Request().Context(), id, userID)
	if err != nil {
		return c.handleError(ctx, err)
	}

	return ctx.JSON(http.StatusOK, toSubscriptionResponse(sub))
}

// POST /api/v1/subscriptions
func (c *SubscriptionController) Create(ctx echo.Context) error {
	userID, ok := ctx.Get(middleware.UserIDKey).(string)
	if !ok {
		return problemJSON(ctx, http.StatusUnauthorized, "Unauthorized", "unauthorized")
	}

	var req struct {
		ServiceName     string  `json:"serviceName"`
		Amount          int     `json:"amount"`
		BillingCycle    string  `json:"billingCycle"`
		BaseDate        int     `json:"baseDate"`
		PaymentMethodID *string `json:"paymentMethodId"`
		Memo            *string `json:"memo"`
	}
	if err := ctx.Bind(&req); err != nil {
		return problemJSON(ctx, http.StatusBadRequest, "Bad Request", "invalid request body")
	}

	sub, err := c.interactor.Create(ctx.Request().Context(), userID, usecase.CreateSubscriptionInput{
		ServiceName:     req.ServiceName,
		Amount:          req.Amount,
		BillingCycle:    domain.BillingCycle(req.BillingCycle),
		BaseDate:        req.BaseDate,
		PaymentMethodID: req.PaymentMethodID,
		Memo:            req.Memo,
	})
	if err != nil {
		return c.handleError(ctx, err)
	}

	return ctx.JSON(http.StatusCreated, toSubscriptionResponse(sub))
}

// PUT /api/v1/subscriptions/:id
func (c *SubscriptionController) Update(ctx echo.Context) error {
	userID, ok := ctx.Get(middleware.UserIDKey).(string)
	if !ok {
		return problemJSON(ctx, http.StatusUnauthorized, "Unauthorized", "unauthorized")
	}

	id := ctx.Param("id")

	var req struct {
		ServiceName     string  `json:"serviceName"`
		Amount          int     `json:"amount"`
		BillingCycle    string  `json:"billingCycle"`
		BaseDate        int     `json:"baseDate"`
		PaymentMethodID *string `json:"paymentMethodId"`
		Memo            *string `json:"memo"`
	}
	if err := ctx.Bind(&req); err != nil {
		return problemJSON(ctx, http.StatusBadRequest, "Bad Request", "invalid request body")
	}

	sub, err := c.interactor.Update(ctx.Request().Context(), id, userID, usecase.UpdateSubscriptionInput{
		ServiceName:     req.ServiceName,
		Amount:          req.Amount,
		BillingCycle:    domain.BillingCycle(req.BillingCycle),
		BaseDate:        req.BaseDate,
		PaymentMethodID: req.PaymentMethodID,
		Memo:            req.Memo,
	})
	if err != nil {
		return c.handleError(ctx, err)
	}

	return ctx.JSON(http.StatusOK, toSubscriptionResponse(sub))
}

// DELETE /api/v1/subscriptions/:id
func (c *SubscriptionController) Delete(ctx echo.Context) error {
	userID, ok := ctx.Get(middleware.UserIDKey).(string)
	if !ok {
		return problemJSON(ctx, http.StatusUnauthorized, "Unauthorized", "unauthorized")
	}

	id := ctx.Param("id")

	if err := c.interactor.Delete(ctx.Request().Context(), id, userID); err != nil {
		return c.handleError(ctx, err)
	}

	return ctx.NoContent(http.StatusNoContent)
}

// DELETE /api/v1/subscriptions
func (c *SubscriptionController) DeleteMany(ctx echo.Context) error {
	userID, ok := ctx.Get(middleware.UserIDKey).(string)
	if !ok {
		return problemJSON(ctx, http.StatusUnauthorized, "Unauthorized", "unauthorized")
	}

	var req struct {
		IDs []string `json:"ids"`
	}
	if err := ctx.Bind(&req); err != nil {
		return problemJSON(ctx, http.StatusBadRequest, "Bad Request", "invalid request body")
	}
	if len(req.IDs) == 0 {
		return problemJSON(ctx, http.StatusBadRequest, "Bad Request", "ids must not be empty")
	}

	if err := c.interactor.DeleteMany(ctx.Request().Context(), req.IDs, userID); err != nil {
		return c.handleError(ctx, err)
	}

	return ctx.NoContent(http.StatusNoContent)
}

func (c *SubscriptionController) handleError(ctx echo.Context, err error) error {
	switch {
	case errors.Is(err, usecase.ErrInvalidInput):
		return problemJSON(ctx, http.StatusBadRequest, "Bad Request", err.Error())
	case errors.Is(err, usecase.ErrSubscriptionNotFound):
		return problemJSON(ctx, http.StatusNotFound, "Not Found", err.Error())
	default:
		return problemJSON(ctx, http.StatusInternalServerError, "Internal Server Error", "unexpected error")
	}
}

type paymentMethodRef struct {
	ID   string `json:"id"`
	Name string `json:"name"`
}

type subscriptionResponse struct {
	ID            string            `json:"id"`
	UserID        string            `json:"userId"`
	ServiceName   string            `json:"serviceName"`
	Amount        int               `json:"amount"`
	BillingCycle  string            `json:"billingCycle"`
	BaseDate      int               `json:"baseDate"`
	PaymentMethod *paymentMethodRef `json:"paymentMethod"`
	Memo          *string           `json:"memo"`
	MonthlyAmount int               `json:"monthlyAmount"`
	YearlyAmount  int               `json:"yearlyAmount"`
	CreatedAt     string            `json:"createdAt"`
	UpdatedAt     string            `json:"updatedAt"`
}

type listSubscriptionsResponse struct {
	Subscriptions      []subscriptionResponse `json:"subscriptions"`
	TotalMonthlyAmount int                    `json:"totalMonthlyAmount"`
	TotalYearlyAmount  int                    `json:"totalYearlyAmount"`
}

func toSubscriptionResponse(sub *domain.Subscription) subscriptionResponse {
	resp := subscriptionResponse{
		ID:            sub.ID,
		UserID:        sub.UserID,
		ServiceName:   sub.ServiceName,
		Amount:        sub.Amount,
		BillingCycle:  string(sub.BillingCycle),
		BaseDate:      sub.BaseDate,
		Memo:          sub.Memo,
		MonthlyAmount: sub.ToMonthlyAmount(),
		YearlyAmount:  sub.ToYearlyAmount(),
		CreatedAt:     sub.CreatedAt.UTC().Format(time.RFC3339),
		UpdatedAt:     sub.UpdatedAt.UTC().Format(time.RFC3339),
	}
	if sub.PaymentMethodID != nil && sub.PaymentMethodName != nil {
		resp.PaymentMethod = &paymentMethodRef{
			ID:   *sub.PaymentMethodID,
			Name: *sub.PaymentMethodName,
		}
	}
	return resp
}
