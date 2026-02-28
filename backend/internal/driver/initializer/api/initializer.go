package initializer

import (
	"context"

	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
	"golang.org/x/oauth2"
	"golang.org/x/oauth2/google"

	gatewaydb "github.com/atsushi-h/subsq/backend/internal/adapter/gateway/db"
	httpcontroller "github.com/atsushi-h/subsq/backend/internal/adapter/http/controller"
	httpmiddleware "github.com/atsushi-h/subsq/backend/internal/adapter/http/middleware"
	"github.com/atsushi-h/subsq/backend/internal/driver/config"
	driverdb "github.com/atsushi-h/subsq/backend/internal/driver/db"
	"github.com/atsushi-h/subsq/backend/internal/usecase"
)

func BuildServer(ctx context.Context) (*echo.Echo, *config.Config, func(), error) {
	cfg, err := config.Load()
	if err != nil {
		return nil, nil, func() {}, err
	}

	pool, err := driverdb.NewPool(ctx, cfg.DatabaseURL)
	if err != nil {
		return nil, nil, func() {}, err
	}
	cleanup := func() {
		pool.Close()
	}

	// DI
	userRepo := gatewaydb.NewUserRepository(pool)

	oauthConfig := &oauth2.Config{
		ClientID:     cfg.GoogleClientID,
		ClientSecret: cfg.GoogleClientSecret,
		RedirectURL:  cfg.GoogleRedirectURL,
		Scopes:       []string{"openid", "email", "profile"},
		Endpoint:     google.Endpoint,
	}

	authInteractor := usecase.NewAuthInteractor(userRepo, oauthConfig, cfg.JWTSecret)
	authController := httpcontroller.NewAuthController(authInteractor, cfg.FrontendURL)
	healthController := httpcontroller.NewHealthController()

	// Echo
	e := echo.New()

	e.Use(middleware.CORSWithConfig(middleware.CORSConfig{
		AllowOrigins: cfg.AllowedOrigins,
		AllowMethods: []string{echo.GET, echo.POST, echo.PUT, echo.DELETE, echo.PATCH, echo.OPTIONS},
		AllowHeaders: []string{
			echo.HeaderOrigin,
			echo.HeaderContentType,
			echo.HeaderAccept,
		},
		AllowCredentials: true,
	}))

	// Routes
	e.GET("/health", healthController.Health)

	v1 := e.Group("/api/v1")

	auth := v1.Group("/auth")
	auth.GET("/google", authController.GoogleOAuth)
	auth.GET("/google/callback", authController.GoogleCallback)
	auth.GET("/me", authController.Me, httpmiddleware.JWTAuth(cfg.JWTSecret))
	auth.POST("/logout", authController.Logout)

	// 後続フェーズ用（空グループ）
	v1.Group("/subscriptions")
	v1.Group("/payment-methods")
	v1.Group("/users")

	return e, cfg, cleanup, nil
}
