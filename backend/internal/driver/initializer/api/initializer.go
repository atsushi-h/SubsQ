package initializer

import (
	"context"
	"strings"

	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
	"golang.org/x/oauth2"
	"golang.org/x/oauth2/google"

	httpcontroller "github.com/atsushi-h/subsq/backend/internal/adapter/http/controller"
	openapi "github.com/atsushi-h/subsq/backend/internal/adapter/http/generated/openapi"
	httpmiddleware "github.com/atsushi-h/subsq/backend/internal/adapter/http/middleware"
	"github.com/atsushi-h/subsq/backend/internal/driver/config"
	driverdb "github.com/atsushi-h/subsq/backend/internal/driver/db"
	"github.com/atsushi-h/subsq/backend/internal/driver/factory"
	httpfactory "github.com/atsushi-h/subsq/backend/internal/driver/factory/http"
	driverwebpush "github.com/atsushi-h/subsq/backend/internal/driver/webpush"
	"github.com/atsushi-h/subsq/backend/internal/port"
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

	// Repository factories
	userRepoFactory := factory.NewUserRepoFactory(pool)
	pmRepoFactory := factory.NewPaymentMethodRepoFactory(pool)
	subRepoFactory := factory.NewSubscriptionRepoFactory(pool)
	notificationRepoFactory := factory.NewNotificationRepoFactory(pool)

	// Output (presenter) factories
	subOutputFactory := httpfactory.NewSubscriptionOutputFactory()
	pmOutputFactory := httpfactory.NewPaymentMethodOutputFactory()
	userOutputFactory := httpfactory.NewUserOutputFactory()
	notificationOutputFactory := httpfactory.NewNotificationOutputFactory()

	// Transaction manager
	txManager := factory.NewTxManager(pool)

	// Input (interactor) factories
	subInputFactory := factory.NewSubscriptionInputFactory(txManager)
	pmInputFactory := factory.NewPaymentMethodInputFactory(txManager)
	userInputFactory := factory.NewUserInputFactory()
	notificationInputFactory := factory.NewNotificationInputFactory()

	// Auth (unchanged – not using output port pattern)
	oauthConfig := &oauth2.Config{
		ClientID:     cfg.GoogleClientID,
		ClientSecret: cfg.GoogleClientSecret,
		RedirectURL:  cfg.GoogleRedirectURL,
		Scopes:       []string{"openid", "email", "profile"},
		Endpoint:     google.Endpoint,
	}
	authInteractor := factory.NewAuthInteractorFactory(oauthConfig, cfg.JWTSecret)(userRepoFactory())
	authController := httpcontroller.NewAuthController(authInteractor, cfg.FrontendURL, cfg.CookieDomain)
	healthController := httpcontroller.NewHealthController()

	// Controllers
	subController := httpcontroller.NewSubscriptionController(subInputFactory, subOutputFactory, subRepoFactory, pmRepoFactory)
	pmController := httpcontroller.NewPaymentMethodController(pmInputFactory, pmOutputFactory, pmRepoFactory, subRepoFactory)
	userController := httpcontroller.NewUserController(userInputFactory, userOutputFactory, userRepoFactory)
	sender := driverwebpush.NewSender(cfg.VAPIDPublicKey, cfg.VAPIDPrivateKey, cfg.VAPIDSubject)
	senderFactory := func() port.WebPushSender { return sender }
	notificationController := httpcontroller.NewNotificationController(notificationInputFactory, notificationOutputFactory, notificationRepoFactory, senderFactory)

	server := httpcontroller.NewServer(subController, pmController, userController, notificationController)

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

	// JWT と AdminAuth をパスで切り替える middleware
	authMiddleware := func(next echo.HandlerFunc) echo.HandlerFunc {
		jwtMw := httpmiddleware.JWTAuth(cfg.JWTSecret)
		adminMw := httpmiddleware.AdminAuth(cfg.AdminAPIKey)
		return func(c echo.Context) error {
			if strings.HasPrefix(c.Request().URL.Path, "/api/v1/admin/") {
				return adminMw(next)(c)
			}
			return jwtMw(next)(c)
		}
	}

	protected := e.Group("", authMiddleware)
	openapi.RegisterHandlers(protected, server)

	return e, cfg, cleanup, nil
}
