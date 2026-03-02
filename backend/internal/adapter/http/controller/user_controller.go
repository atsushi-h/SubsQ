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
	authInteractor *usecase.AuthInteractor
}

func NewUserController(authInteractor *usecase.AuthInteractor) *UserController {
	return &UserController{authInteractor: authInteractor}
}

// GET /api/v1/users/me
func (c *UserController) GetCurrentUser(ctx echo.Context) error {
	userID, ok := ctx.Get(middleware.UserIDKey).(string)
	if !ok {
		return errorJSON(ctx, http.StatusUnauthorized, "Unauthorized", "unauthorized")
	}

	u, err := c.authInteractor.GetCurrentUser(ctx.Request().Context(), userID)
	if err != nil {
		return errorJSON(ctx, http.StatusInternalServerError, "Internal Server Error", "failed to get user")
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
	return ctx.NoContent(http.StatusNotImplemented)
}
