package controller

import (
	"net/http"

	"github.com/labstack/echo/v4"

	"github.com/atsushi-h/subsq/backend/internal/version"
)

type HealthController struct{}

func NewHealthController() *HealthController {
	return &HealthController{}
}

// GET /health
func (c *HealthController) Health(ctx echo.Context) error {
	return ctx.JSON(http.StatusOK, map[string]string{
		"status":     "ok",
		"version":    version.Version,
		"commit":     version.CommitSHA,
		"build_time": version.BuildTime,
	})
}
