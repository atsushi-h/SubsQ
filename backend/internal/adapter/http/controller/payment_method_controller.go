package controller

import (
	"errors"
	"net/http"
	"time"

	"github.com/labstack/echo/v4"

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
		return problemJSON(ctx, http.StatusUnauthorized, "Unauthorized", "unauthorized")
	}

	pms, err := c.interactor.List(ctx.Request().Context(), userID)
	if err != nil {
		return problemJSON(ctx, http.StatusInternalServerError, "Internal Server Error", "unexpected error")
	}

	resp := make([]paymentMethodResponse, 0, len(pms))
	for _, pm := range pms {
		resp = append(resp, toPaymentMethodResponse(pm))
	}

	return ctx.JSON(http.StatusOK, resp)
}

// POST /api/v1/payment-methods
func (c *PaymentMethodController) Create(ctx echo.Context) error {
	userID, ok := ctx.Get(middleware.UserIDKey).(string)
	if !ok {
		return problemJSON(ctx, http.StatusUnauthorized, "Unauthorized", "unauthorized")
	}

	var req struct {
		Name string `json:"name"`
	}
	if err := ctx.Bind(&req); err != nil {
		return problemJSON(ctx, http.StatusBadRequest, "Bad Request", "invalid request body")
	}

	pm, err := c.interactor.Create(ctx.Request().Context(), userID, req.Name)
	if err != nil {
		return c.handleError(ctx, err)
	}

	return ctx.JSON(http.StatusCreated, toPaymentMethodResponse(pm))
}

// PUT /api/v1/payment-methods/:id
func (c *PaymentMethodController) Update(ctx echo.Context) error {
	userID, ok := ctx.Get(middleware.UserIDKey).(string)
	if !ok {
		return problemJSON(ctx, http.StatusUnauthorized, "Unauthorized", "unauthorized")
	}

	id := ctx.Param("id")

	var req struct {
		Name string `json:"name"`
	}
	if err := ctx.Bind(&req); err != nil {
		return problemJSON(ctx, http.StatusBadRequest, "Bad Request", "invalid request body")
	}

	pm, err := c.interactor.Update(ctx.Request().Context(), id, userID, req.Name)
	if err != nil {
		return c.handleError(ctx, err)
	}

	return ctx.JSON(http.StatusOK, toPaymentMethodResponse(pm))
}

// DELETE /api/v1/payment-methods/:id
func (c *PaymentMethodController) Delete(ctx echo.Context) error {
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

// DELETE /api/v1/payment-methods
func (c *PaymentMethodController) DeleteMany(ctx echo.Context) error {
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

func (c *PaymentMethodController) handleError(ctx echo.Context, err error) error {
	switch {
	case errors.Is(err, usecase.ErrPaymentMethodNotFound):
		return problemJSON(ctx, http.StatusNotFound, "Not Found", err.Error())
	case errors.Is(err, usecase.ErrPaymentMethodInUse):
		return problemJSON(ctx, http.StatusConflict, "Conflict", err.Error())
	default:
		return problemJSON(ctx, http.StatusInternalServerError, "Internal Server Error", "unexpected error")
	}
}

type paymentMethodResponse struct {
	ID        string `json:"id"`
	UserID    string `json:"userId"`
	Name      string `json:"name"`
	CreatedAt string `json:"createdAt"`
	UpdatedAt string `json:"updatedAt"`
}

func toPaymentMethodResponse(pm *domain.PaymentMethod) paymentMethodResponse {
	return paymentMethodResponse{
		ID:        pm.ID,
		UserID:    pm.UserID,
		Name:      pm.Name,
		CreatedAt: pm.CreatedAt.UTC().Format(time.RFC3339),
		UpdatedAt: pm.UpdatedAt.UTC().Format(time.RFC3339),
	}
}

type problemDetail struct {
	Type   string `json:"type"`
	Title  string `json:"title"`
	Status int    `json:"status"`
	Detail string `json:"detail"`
}

func problemJSON(ctx echo.Context, status int, title, detail string) error {
	return ctx.JSON(status, problemDetail{
		Type:   "about:blank",
		Title:  title,
		Status: status,
		Detail: detail,
	})
}
