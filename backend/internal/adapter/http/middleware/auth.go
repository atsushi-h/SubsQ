package middleware

import (
	"net/http"

	"github.com/golang-jwt/jwt/v5"
	"github.com/labstack/echo/v4"

	"github.com/atsushi-h/subsq/backend/internal/usecase"
)

const UserIDKey = "user_id"

func JWTAuth(jwtSecret string) echo.MiddlewareFunc {
	return func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c echo.Context) error {
			cookie, err := c.Cookie("subsq_token")
			if err != nil {
				return echo.NewHTTPError(http.StatusUnauthorized, "missing token")
			}

			token, err := jwt.ParseWithClaims(
				cookie.Value,
				&usecase.Claims{},
				func(t *jwt.Token) (any, error) {
					if _, ok := t.Method.(*jwt.SigningMethodHMAC); !ok {
						return nil, echo.NewHTTPError(http.StatusUnauthorized, "invalid signing method")
					}
					return []byte(jwtSecret), nil
				},
			)
			if err != nil || !token.Valid {
				return echo.NewHTTPError(http.StatusUnauthorized, "invalid token")
			}

			claims, ok := token.Claims.(*usecase.Claims)
			if !ok {
				return echo.NewHTTPError(http.StatusUnauthorized, "invalid token claims")
			}

			c.Set(UserIDKey, claims.UserID)
			return next(c)
		}
	}
}
