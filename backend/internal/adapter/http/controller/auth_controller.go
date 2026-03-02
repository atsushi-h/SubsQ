package controller

import (
	"net/http"
	"time"

	"github.com/labstack/echo/v4"

	"github.com/atsushi-h/subsq/backend/internal/usecase"
)

type AuthController struct {
	authInteractor *usecase.AuthInteractor
	frontendURL    string
}

func NewAuthController(authInteractor *usecase.AuthInteractor, frontendURL string) *AuthController {
	return &AuthController{
		authInteractor: authInteractor,
		frontendURL:    frontendURL,
	}
}

// GET /api/v1/auth/google
func (c *AuthController) GoogleOAuth(ctx echo.Context) error {
	url, state, err := c.authInteractor.GenerateOAuthURL()
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, "failed to generate oauth url")
	}

	ctx.SetCookie(&http.Cookie{
		Name:     "oauth_state",
		Value:    state,
		MaxAge:   300,
		HttpOnly: true,
		Secure:   true,
		SameSite: http.SameSiteLaxMode,
		Path:     "/",
	})

	return ctx.Redirect(http.StatusTemporaryRedirect, url)
}

// GET /api/v1/auth/google/callback
func (c *AuthController) GoogleCallback(ctx echo.Context) error {
	stateCookie, err := ctx.Cookie("oauth_state")
	if err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "missing state cookie")
	}

	code := ctx.QueryParam("code")
	state := ctx.QueryParam("state")

	jwtToken, _, err := c.authInteractor.HandleCallback(ctx.Request().Context(), code, state, stateCookie.Value)
	if err != nil {
		return echo.NewHTTPError(http.StatusUnauthorized, "authentication failed")
	}

	ctx.SetCookie(&http.Cookie{
		Name:   "oauth_state",
		Value:  "",
		MaxAge: -1,
		Path:   "/",
	})

	ctx.SetCookie(&http.Cookie{
		Name:     "subsq_token",
		Value:    jwtToken,
		MaxAge:   int((30 * 24 * time.Hour).Seconds()),
		HttpOnly: true,
		Secure:   true,
		SameSite: http.SameSiteLaxMode,
		Path:     "/",
	})

	return ctx.Redirect(http.StatusTemporaryRedirect, c.frontendURL)
}

// POST /api/v1/auth/logout
func (c *AuthController) Logout(ctx echo.Context) error {
	ctx.SetCookie(&http.Cookie{
		Name:     "subsq_token",
		Value:    "",
		MaxAge:   -1,
		Path:     "/",
		HttpOnly: true,
		Secure:   true,
		SameSite: http.SameSiteLaxMode,
	})

	return ctx.JSON(http.StatusOK, map[string]string{"message": "logged out"})
}
