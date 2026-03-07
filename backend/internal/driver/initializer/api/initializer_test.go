package initializer

import (
	"testing"

	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/labstack/echo/v4"
	"golang.org/x/oauth2"
	"golang.org/x/oauth2/google"

	httpcontroller "github.com/atsushi-h/subsq/backend/internal/adapter/http/controller"
	openapi "github.com/atsushi-h/subsq/backend/internal/adapter/http/generated/openapi"
	httpmiddleware "github.com/atsushi-h/subsq/backend/internal/adapter/http/middleware"
	"github.com/atsushi-h/subsq/backend/internal/driver/factory"
	httpfactory "github.com/atsushi-h/subsq/backend/internal/driver/factory/http"
)

// Smoke test: nil pool を使っても配線がパニックせず、server が nil でないことを確認する。
func TestBuildServer_Wiring(t *testing.T) {
	var pool *pgxpool.Pool

	userRepoFactory := factory.NewUserRepoFactory(pool)
	pmRepoFactory := factory.NewPaymentMethodRepoFactory(pool)
	subRepoFactory := factory.NewSubscriptionRepoFactory(pool)

	subOutputFactory := httpfactory.NewSubscriptionOutputFactory()
	pmOutputFactory := httpfactory.NewPaymentMethodOutputFactory()
	userOutputFactory := httpfactory.NewUserOutputFactory()

	txManager := factory.NewTxManager(pool)
	subInputFactory := factory.NewSubscriptionInputFactory(txManager)
	pmInputFactory := factory.NewPaymentMethodInputFactory(txManager)
	userInputFactory := factory.NewUserInputFactory()

	oauthConfig := &oauth2.Config{
		ClientID:     "dummy-client-id",
		ClientSecret: "dummy-client-secret",
		RedirectURL:  "http://localhost:8080/auth/callback",
		Scopes:       []string{"openid", "email", "profile"},
		Endpoint:     google.Endpoint,
	}
	authInteractor := factory.NewAuthInteractorFactory(oauthConfig, "dummy-jwt-secret")(userRepoFactory())
	authController := httpcontroller.NewAuthController(authInteractor, "http://localhost:3000")
	healthController := httpcontroller.NewHealthController()

	subController := httpcontroller.NewSubscriptionController(subInputFactory, subOutputFactory, subRepoFactory, pmRepoFactory)
	pmController := httpcontroller.NewPaymentMethodController(pmInputFactory, pmOutputFactory, pmRepoFactory, subRepoFactory)
	userController := httpcontroller.NewUserController(userInputFactory, userOutputFactory, userRepoFactory)

	server := httpcontroller.NewServer(subController, pmController, userController)
	if server == nil {
		t.Fatal("server is nil")
	}

	e := echo.New()
	e.GET("/health", healthController.Health)

	auth := e.Group("/api/v1/auth")
	auth.GET("/google", authController.GoogleOAuth)
	auth.GET("/google/callback", authController.GoogleCallback)
	auth.POST("/logout", authController.Logout)

	protected := e.Group("", httpmiddleware.JWTAuth("dummy-jwt-secret"))
	openapi.RegisterHandlers(protected, server)
}
