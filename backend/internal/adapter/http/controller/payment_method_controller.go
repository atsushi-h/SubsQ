package controller

import (
	"net/http"

	"github.com/google/uuid"
	"github.com/labstack/echo/v4"

	openapi "github.com/atsushi-h/subsq/backend/internal/adapter/http/generated/openapi"
	"github.com/atsushi-h/subsq/backend/internal/adapter/http/middleware"
	domain "github.com/atsushi-h/subsq/backend/internal/domain/payment_method"
	"github.com/atsushi-h/subsq/backend/internal/usecase"
)

type PaymentMethodController struct {
	interactor *usecase.PaymentMethodInteractor
}

func NewPaymentMethodController(interactor *usecase.PaymentMethodInteractor) *PaymentMethodController {
	return &PaymentMethodController{interactor: interactor}
}

// GET /api/v1/payment-methods
func (c *PaymentMethodController) List(ctx echo.Context) error {
	userID, ok := ctx.Get(middleware.UserIDKey).(string)
	if !ok {
		return errorJSON(ctx, http.StatusUnauthorized, "Unauthorized", "unauthorized")
	}

	pms, err := c.interactor.ListWithCount(ctx.Request().Context(), userID)
	if err != nil {
		return errorJSON(ctx, http.StatusInternalServerError, "Internal Server Error", "unexpected error")
	}

	resp := make([]openapi.ModelsPaymentMethodResponse, 0, len(pms))
	for _, pm := range pms {
		resp = append(resp, toPaymentMethodResponse(pm.PaymentMethod, pm.UsageCount))
	}

	return ctx.JSON(http.StatusOK, resp)
}

// GET /api/v1/payment-methods/:id
func (c *PaymentMethodController) GetByID(ctx echo.Context, id openapi.ModelsUuid) error {
	userID, ok := ctx.Get(middleware.UserIDKey).(string)
	if !ok {
		return errorJSON(ctx, http.StatusUnauthorized, "Unauthorized", "unauthorized")
	}

	pm, err := c.interactor.Get(ctx.Request().Context(), id.String(), userID)
	if err != nil {
		return handleError(ctx, err)
	}

	count, err := c.interactor.CountUsage(ctx.Request().Context(), id.String())
	if err != nil {
		return errorJSON(ctx, http.StatusInternalServerError, "Internal Server Error", "unexpected error")
	}

	return ctx.JSON(http.StatusOK, toPaymentMethodResponse(pm, count))
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

	pm, err := c.interactor.Create(ctx.Request().Context(), userID, req.Name)
	if err != nil {
		return handleError(ctx, err)
	}

	return ctx.JSON(http.StatusCreated, toPaymentMethodResponse(pm, 0))
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

	pm, err := c.interactor.Update(ctx.Request().Context(), id.String(), userID, name)
	if err != nil {
		return handleError(ctx, err)
	}

	count, err := c.interactor.CountUsage(ctx.Request().Context(), id.String())
	if err != nil {
		return errorJSON(ctx, http.StatusInternalServerError, "Internal Server Error", "unexpected error")
	}

	return ctx.JSON(http.StatusOK, toPaymentMethodResponse(pm, count))
}

// DELETE /api/v1/payment-methods/:id
func (c *PaymentMethodController) Delete(ctx echo.Context, id openapi.ModelsUuid) error {
	userID, ok := ctx.Get(middleware.UserIDKey).(string)
	if !ok {
		return errorJSON(ctx, http.StatusUnauthorized, "Unauthorized", "unauthorized")
	}

	if err := c.interactor.Delete(ctx.Request().Context(), id.String(), userID); err != nil {
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

	if err := c.interactor.DeleteMany(ctx.Request().Context(), ids, userID); err != nil {
		return handleError(ctx, err)
	}

	return ctx.NoContent(http.StatusNoContent)
}

func toPaymentMethodResponse(pm *domain.PaymentMethod, usageCount int64) openapi.ModelsPaymentMethodResponse {
	resp := openapi.ModelsPaymentMethodResponse{
		Name:       pm.Name,
		CreatedAt:  pm.CreatedAt.UTC(),
		UpdatedAt:  pm.UpdatedAt.UTC(),
		UsageCount: int32(usageCount),
	}
	if idVal, err := uuid.Parse(pm.ID); err == nil {
		resp.Id = idVal
	}
	if idVal, err := uuid.Parse(pm.UserID); err == nil {
		resp.UserId = idVal
	}
	return resp
}
