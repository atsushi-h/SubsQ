package controller

import (
	"net/http"

	"github.com/labstack/echo/v4"

	openapi "github.com/atsushi-h/subsq/backend/internal/adapter/http/generated/openapi"
	"github.com/atsushi-h/subsq/backend/internal/adapter/http/middleware"
	httppresenter "github.com/atsushi-h/subsq/backend/internal/adapter/http/presenter"
	"github.com/atsushi-h/subsq/backend/internal/port"
)

// PaymentMethodController handles payment method HTTP endpoints.
type PaymentMethodController struct {
	inputFactory   func(pmRepo port.PaymentMethodRepository, subRepo port.SubscriptionRepository, output port.PaymentMethodOutputPort) port.PaymentMethodInputPort
	outputFactory  func() *httppresenter.PaymentMethodPresenter
	pmRepoFactory  func() port.PaymentMethodRepository
	subRepoFactory func() port.SubscriptionRepository
}

// NewPaymentMethodController creates PaymentMethodController.
func NewPaymentMethodController(
	inputFactory func(pmRepo port.PaymentMethodRepository, subRepo port.SubscriptionRepository, output port.PaymentMethodOutputPort) port.PaymentMethodInputPort,
	outputFactory func() *httppresenter.PaymentMethodPresenter,
	pmRepoFactory func() port.PaymentMethodRepository,
	subRepoFactory func() port.SubscriptionRepository,
) *PaymentMethodController {
	return &PaymentMethodController{
		inputFactory:   inputFactory,
		outputFactory:  outputFactory,
		pmRepoFactory:  pmRepoFactory,
		subRepoFactory: subRepoFactory,
	}
}

func (c *PaymentMethodController) newIO() (port.PaymentMethodInputPort, *httppresenter.PaymentMethodPresenter) {
	p := c.outputFactory()
	input := c.inputFactory(c.pmRepoFactory(), c.subRepoFactory(), p)
	return input, p
}

// GET /api/v1/payment-methods
func (c *PaymentMethodController) List(ctx echo.Context) error {
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

// GET /api/v1/payment-methods/:id
func (c *PaymentMethodController) GetByID(ctx echo.Context, id openapi.ModelsUuid) error {
	userID, ok := ctx.Get(middleware.UserIDKey).(string)
	if !ok {
		return errorJSON(ctx, http.StatusUnauthorized, "Unauthorized", "unauthorized")
	}

	input, p := c.newIO()
	if err := input.GetByID(ctx.Request().Context(), id.String(), userID); err != nil {
		return handleError(ctx, err)
	}
	return ctx.JSON(http.StatusOK, p.Response())
}

// POST /api/v1/payment-methods
func (c *PaymentMethodController) Create(ctx echo.Context) error {
	userID, ok := ctx.Get(middleware.UserIDKey).(string)
	if !ok {
		return errorJSON(ctx, http.StatusUnauthorized, "Unauthorized", "unauthorized")
	}

	var req openapi.PaymentMethodsCreatePaymentMethodJSONRequestBody
	if err := ctx.Bind(&req); err != nil {
		return errorJSON(ctx, http.StatusBadRequest, "Bad Request", "invalid request body")
	}

	input, p := c.newIO()
	if err := input.Create(ctx.Request().Context(), userID, req.Name); err != nil {
		return handleError(ctx, err)
	}
	return ctx.JSON(http.StatusCreated, p.Response())
}

// PATCH /api/v1/payment-methods/:id
func (c *PaymentMethodController) Update(ctx echo.Context, id openapi.ModelsUuid) error {
	userID, ok := ctx.Get(middleware.UserIDKey).(string)
	if !ok {
		return errorJSON(ctx, http.StatusUnauthorized, "Unauthorized", "unauthorized")
	}

	var req openapi.PaymentMethodsUpdatePaymentMethodJSONRequestBody
	if err := ctx.Bind(&req); err != nil {
		return errorJSON(ctx, http.StatusBadRequest, "Bad Request", "invalid request body")
	}

	name := ""
	if req.Name != nil {
		name = *req.Name
	}

	input, p := c.newIO()
	if err := input.Update(ctx.Request().Context(), id.String(), userID, name); err != nil {
		return handleError(ctx, err)
	}
	return ctx.JSON(http.StatusOK, p.Response())
}

// DELETE /api/v1/payment-methods/:id
func (c *PaymentMethodController) Delete(ctx echo.Context, id openapi.ModelsUuid) error {
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

// DELETE /api/v1/payment-methods
func (c *PaymentMethodController) DeleteMany(ctx echo.Context) error {
	userID, ok := ctx.Get(middleware.UserIDKey).(string)
	if !ok {
		return errorJSON(ctx, http.StatusUnauthorized, "Unauthorized", "unauthorized")
	}

	var req openapi.PaymentMethodsDeletePaymentMethodsJSONRequestBody
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
