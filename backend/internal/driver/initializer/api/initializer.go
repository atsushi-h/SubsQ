package initializer

import (
	"context"

	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
	"golang.org/x/oauth2"
	"golang.org/x/oauth2/google"

	gatewaydb "github.com/atsushi-h/subsq/backend/internal/adapter/gateway/db"
	httpcontroller "github.com/atsushi-h/subsq/backend/internal/adapter/http/controller"
	openapi "github.com/atsushi-h/subsq/backend/internal/adapter/http/generated/openapi"
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
	pmRepo := gatewaydb.NewPaymentMethodRepository(pool)
	subRepo := gatewaydb.NewSubscriptionRepository(pool)

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
	pmInteractor := usecase.NewPaymentMethodInteractor(pmRepo, subRepo)
	pmController := httpcontroller.NewPaymentMethodController(pmInteractor)
	subInteractor := usecase.NewSubscriptionInteractor(subRepo, pmRepo)
	subController := httpcontroller.NewSubscriptionController(subInteractor)
	userController := httpcontroller.NewUserController(authInteractor)

	server := httpcontroller.NewServer(subController, pmController, userController)

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

	// Health check (no auth)
	e.GET("/health", healthController.Health)

	// Auth endpoints (no JWT required)
	auth := e.Group("/api/v1/auth")
	auth.GET("/google", authController.GoogleOAuth)
	auth.GET("/google/callback", authController.GoogleCallback)
	auth.POST("/logout", authController.Logout)

	// Protected routes via OpenAPI RegisterHandlers (JWT required for all)
	protected := e.Group("", httpmiddleware.JWTAuth(cfg.JWTSecret))
	openapi.RegisterHandlers(protected, server)

	return e, cfg, cleanup, nil
}
