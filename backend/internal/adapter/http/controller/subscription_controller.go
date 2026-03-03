package controller

import (
	"net/http"

	"github.com/labstack/echo/v4"

	openapi "github.com/atsushi-h/subsq/backend/internal/adapter/http/generated/openapi"
	"github.com/atsushi-h/subsq/backend/internal/adapter/http/middleware"
	httppresenter "github.com/atsushi-h/subsq/backend/internal/adapter/http/presenter"
	domain "github.com/atsushi-h/subsq/backend/internal/domain/subscription"
	"github.com/atsushi-h/subsq/backend/internal/port"
)

// SubscriptionController handles subscription HTTP endpoints.
type SubscriptionController struct {
	inputFactory   func(subRepo port.SubscriptionRepository, pmRepo port.PaymentMethodRepository, output port.SubscriptionOutputPort) port.SubscriptionInputPort
	outputFactory  func() *httppresenter.SubscriptionPresenter
	subRepoFactory func() port.SubscriptionRepository
	pmRepoFactory  func() port.PaymentMethodRepository
}

// NewSubscriptionController creates SubscriptionController.
func NewSubscriptionController(
	inputFactory func(subRepo port.SubscriptionRepository, pmRepo port.PaymentMethodRepository, output port.SubscriptionOutputPort) port.SubscriptionInputPort,
	outputFactory func() *httppresenter.SubscriptionPresenter,
	subRepoFactory func() port.SubscriptionRepository,
	pmRepoFactory func() port.PaymentMethodRepository,
) *SubscriptionController {
	return &SubscriptionController{
		inputFactory:   inputFactory,
		outputFactory:  outputFactory,
		subRepoFactory: subRepoFactory,
		pmRepoFactory:  pmRepoFactory,
	}
}

func (c *SubscriptionController) newIO() (port.SubscriptionInputPort, *httppresenter.SubscriptionPresenter) {
	p := c.outputFactory()
	input := c.inputFactory(c.subRepoFactory(), c.pmRepoFactory(), p)
	return input, p
}

// GET /api/v1/subscriptions
func (c *SubscriptionController) List(ctx echo.Context) error {
	userID, ok := ctx.Get(middleware.UserIDKey).(string)
	if !ok {
		return errorJSON(ctx, http.StatusUnauthorized, "Unauthorized", "unauthorized")
	}

	input, p := c.newIO()
	if err := input.List(ctx.Request().Context(), userID); err != nil {
		return errorJSON(ctx, http.StatusInternalServerError, "Internal Server Error", "unexpected error")
	}
	return ctx.JSON(http.StatusOK, p.ListResponse())
}

// GET /api/v1/subscriptions/:id
func (c *SubscriptionController) Get(ctx echo.Context, id openapi.ModelsUuid) error {
	userID, ok := ctx.Get(middleware.UserIDKey).(string)
	if !ok {
		return errorJSON(ctx, http.StatusUnauthorized, "Unauthorized", "unauthorized")
	}

	input, p := c.newIO()
	if err := input.Get(ctx.Request().Context(), id.String(), userID); err != nil {
		return handleError(ctx, err)
	}
	return ctx.JSON(http.StatusOK, p.Response())
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

	input, p := c.newIO()
	if err := input.Create(ctx.Request().Context(), userID, port.CreateSubscriptionInput{
		ServiceName:     req.ServiceName,
		Amount:          int(req.Amount),
		BillingCycle:    domain.BillingCycle(req.BillingCycle),
		BaseDate:        int(req.BaseDate),
		PaymentMethodID: pmID,
		Memo:            req.Memo,
	}); err != nil {
		return handleError(ctx, err)
	}
	return ctx.JSON(http.StatusCreated, p.Response())
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

	var pmID *string
	if req.PaymentMethodId != nil {
		s := req.PaymentMethodId.String()
		pmID = &s
	}

	var billingCycle *domain.BillingCycle
	if req.BillingCycle != nil {
		bc := domain.BillingCycle(*req.BillingCycle)
		billingCycle = &bc
	}

	var amount *int
	if req.Amount != nil {
		a := int(*req.Amount)
		amount = &a
	}

	var baseDate *int
	if req.BaseDate != nil {
		bd := int(*req.BaseDate)
		baseDate = &bd
	}

	input, p := c.newIO()
	if err := input.Update(ctx.Request().Context(), id.String(), userID, port.UpdateSubscriptionInput{
		ServiceName:     req.ServiceName,
		Amount:          amount,
		BillingCycle:    billingCycle,
		BaseDate:        baseDate,
		PaymentMethodID: pmID,
		Memo:            req.Memo,
	}); err != nil {
		return handleError(ctx, err)
	}
	return ctx.JSON(http.StatusOK, p.Response())
}

// DELETE /api/v1/subscriptions/:id
func (c *SubscriptionController) Delete(ctx echo.Context, id openapi.ModelsUuid) error {
	userID, ok := ctx.Get(middleware.UserIDKey).(string)
	if !ok {
		return errorJSON(ctx, http.StatusUnauthorized, "Unauthorized", "unauthorized")
	}

	input, _ := c.newIO()
	if err := input.Delete(ctx.Request().Context(), id.String(), userID); err != nil {
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

	input, _ := c.newIO()
	if err := input.DeleteMany(ctx.Request().Context(), ids, userID); err != nil {
		return handleError(ctx, err)
	}
	return ctx.NoContent(http.StatusNoContent)
}
