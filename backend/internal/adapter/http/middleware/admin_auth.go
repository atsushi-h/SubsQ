package middleware

import (
	"crypto/subtle"
	"net/http"

	"github.com/labstack/echo/v4"
)

func AdminAuth(adminKey string) echo.MiddlewareFunc {
	return func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c echo.Context) error {
			if adminKey == "" || subtle.ConstantTimeCompare(
				[]byte(c.Request().Header.Get("X-Admin-Token")),
				[]byte(adminKey),
			) != 1 {
				return echo.NewHTTPError(http.StatusUnauthorized)
			}
			return next(c)
		}
	}
}
