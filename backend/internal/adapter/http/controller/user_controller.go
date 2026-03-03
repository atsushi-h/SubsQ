package controller

import (
	"net/http"

	"github.com/google/uuid"
	"github.com/labstack/echo/v4"
	openapi_types "github.com/oapi-codegen/runtime/types"

	openapi "github.com/atsushi-h/subsq/backend/internal/adapter/http/generated/openapi"
	"github.com/atsushi-h/subsq/backend/internal/adapter/http/middleware"
	"github.com/atsushi-h/subsq/backend/internal/usecase"
)

type UserController struct {
	interactor *usecase.UserInteractor
}

func NewUserController(interactor *usecase.UserInteractor) *UserController {
	return &UserController{interactor: interactor}
}

// GET /api/v1/users/me
func (c *UserController) GetCurrentUser(ctx echo.Context) error {
	userID, ok := ctx.Get(middleware.UserIDKey).(string)
	if !ok {
		return errorJSON(ctx, http.StatusUnauthorized, "Unauthorized", "unauthorized")
	}

	u, err := c.interactor.GetCurrentUser(ctx.Request().Context(), userID)
	if err != nil {
		return handleError(ctx, err)
	}

	resp := openapi.ModelsUserResponse{
		Name:              u.Name,
		Provider:          u.Provider,
		ProviderAccountId: u.ProviderAccountID,
		CreatedAt:         u.CreatedAt.UTC(),
		UpdatedAt:         u.UpdatedAt.UTC(),
		Thumbnail:         u.Thumbnail,
		Email:             openapi_types.Email(u.Email.String()),
	}
	if idVal, err := uuid.Parse(u.ID); err == nil {
		resp.Id = idVal
	}

	return ctx.JSON(http.StatusOK, resp)
}

// DELETE /api/v1/users/me
func (c *UserController) DeleteCurrentUser(ctx echo.Context) error {
	userID, ok := ctx.Get(middleware.UserIDKey).(string)
	if !ok {
		return errorJSON(ctx, http.StatusUnauthorized, "Unauthorized", "unauthorized")
	}

	if err := c.interactor.DeleteCurrentUser(ctx.Request().Context(), userID); err != nil {
		return handleError(ctx, err)
	}

	ctx.SetCookie(&http.Cookie{
		Name:     "subsq_token",
		Value:    "",
		MaxAge:   -1,
		Path:     "/",
		HttpOnly: true,
		Secure:   true,
		SameSite: http.SameSiteLaxMode,
	})

	return ctx.NoContent(http.StatusNoContent)
}
