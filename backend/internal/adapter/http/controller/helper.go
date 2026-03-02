package controller

import (
	"errors"
	"net/http"

	"github.com/labstack/echo/v4"

	openapi "github.com/atsushi-h/subsq/backend/internal/adapter/http/generated/openapi"
	"github.com/atsushi-h/subsq/backend/internal/usecase"
)

func handleError(ctx echo.Context, err error) error {
	switch {
	case errors.Is(err, usecase.ErrInvalidInput):
		return errorJSON(ctx, http.StatusBadRequest, "Bad Request", err.Error())
	case errors.Is(err, usecase.ErrSubscriptionNotFound):
		return errorJSON(ctx, http.StatusNotFound, "Not Found", err.Error())
	case errors.Is(err, usecase.ErrPaymentMethodNotFound):
		return errorJSON(ctx, http.StatusNotFound, "Not Found", err.Error())
	case errors.Is(err, usecase.ErrPaymentMethodInUse):
		return errorJSON(ctx, http.StatusConflict, "Conflict", err.Error())
	default:
		return errorJSON(ctx, http.StatusInternalServerError, "Internal Server Error", "unexpected error")
	}
}

func errorJSON(ctx echo.Context, status int, title, detail string) error {
	d := detail
	return ctx.JSON(status, openapi.ModelsErrorResponse{
		Type:   "about:blank",
		Title:  title,
		Status: int32(status),
		Detail: &d,
	})
}
