package controller

import (
	"net/http"
	"net/url"

	"github.com/labstack/echo/v4"

	openapi "github.com/atsushi-h/subsq/backend/internal/adapter/http/generated/openapi"
	"github.com/atsushi-h/subsq/backend/internal/adapter/http/middleware"
	httppresenter "github.com/atsushi-h/subsq/backend/internal/adapter/http/presenter"
	"github.com/atsushi-h/subsq/backend/internal/port"
)

// UserController handles user HTTP endpoints.
type UserController struct {
	inputFactory    func(userRepo port.UserRepository, output port.UserOutputPort) port.UserInputPort
	outputFactory   func() *httppresenter.UserPresenter
	userRepoFactory func() port.UserRepository
}

// NewUserController creates UserController.
func NewUserController(
	inputFactory func(userRepo port.UserRepository, output port.UserOutputPort) port.UserInputPort,
	outputFactory func() *httppresenter.UserPresenter,
	userRepoFactory func() port.UserRepository,
) *UserController {
	return &UserController{
		inputFactory:    inputFactory,
		outputFactory:   outputFactory,
		userRepoFactory: userRepoFactory,
	}
}

func (c *UserController) newIO() (port.UserInputPort, *httppresenter.UserPresenter) {
	p := c.outputFactory()
	input := c.inputFactory(c.userRepoFactory(), p)
	return input, p
}

// GET /api/v1/users/me
func (c *UserController) GetCurrentUser(ctx echo.Context) error {
	userID, ok := ctx.Get(middleware.UserIDKey).(string)
	if !ok {
		return errorJSON(ctx, http.StatusUnauthorized, "Unauthorized", "unauthorized")
	}

	input, p := c.newIO()
	if err := input.GetCurrentUser(ctx.Request().Context(), userID); err != nil {
		return handleError(ctx, err)
	}
	return ctx.JSON(http.StatusOK, p.Response())
}

// PATCH /api/v1/users/me
func (c *UserController) UpdateCurrentUser(ctx echo.Context) error {
	userID, ok := ctx.Get(middleware.UserIDKey).(string)
	if !ok {
		return errorJSON(ctx, http.StatusUnauthorized, "Unauthorized", "unauthorized")
	}

	var req openapi.UsersUpdateCurrentUserJSONRequestBody
	if err := ctx.Bind(&req); err != nil {
		return errorJSON(ctx, http.StatusBadRequest, "Bad Request", "invalid request body")
	}
	if req.Thumbnail != nil {
		if _, err := url.ParseRequestURI(*req.Thumbnail); err != nil {
			return errorJSON(ctx, http.StatusBadRequest, "Bad Request", "thumbnail must be a valid URL")
		}
	}

	input, p := c.newIO()
	if err := input.UpdateCurrentUser(ctx.Request().Context(), userID, req.Name, req.Thumbnail); err != nil {
		return handleError(ctx, err)
	}
	return ctx.JSON(http.StatusOK, p.Response())
}

// DELETE /api/v1/users/me
func (c *UserController) DeleteCurrentUser(ctx echo.Context) error {
	userID, ok := ctx.Get(middleware.UserIDKey).(string)
	if !ok {
		return errorJSON(ctx, http.StatusUnauthorized, "Unauthorized", "unauthorized")
	}

	input, _ := c.newIO()
	if err := input.DeleteCurrentUser(ctx.Request().Context(), userID); err != nil {
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
