package controller

import (
	"github.com/labstack/echo/v4"

	openapi "github.com/atsushi-h/subsq/backend/internal/adapter/http/generated/openapi"
)

// Server implements openapi.ServerInterface by delegating to each controller.
type Server struct {
	subscription  *SubscriptionController
	paymentMethod *PaymentMethodController
	user          *UserController
}

func NewServer(
	subscription *SubscriptionController,
	paymentMethod *PaymentMethodController,
	user *UserController,
) *Server {
	return &Server{
		subscription:  subscription,
		paymentMethod: paymentMethod,
		user:          user,
	}
}

// Payment Methods

func (s *Server) PaymentMethodsDeletePaymentMethods(ctx echo.Context) error {
	return s.paymentMethod.DeleteMany(ctx)
}

func (s *Server) PaymentMethodsListPaymentMethods(ctx echo.Context) error {
	return s.paymentMethod.List(ctx)
}

func (s *Server) PaymentMethodsCreatePaymentMethod(ctx echo.Context) error {
	return s.paymentMethod.Create(ctx)
}

func (s *Server) PaymentMethodsDeletePaymentMethod(ctx echo.Context, id openapi.ModelsUuid) error {
	return s.paymentMethod.Delete(ctx, id)
}

func (s *Server) PaymentMethodsGetPaymentMethod(ctx echo.Context, id openapi.ModelsUuid) error {
	return s.paymentMethod.GetByID(ctx, id)
}

func (s *Server) PaymentMethodsUpdatePaymentMethod(ctx echo.Context, id openapi.ModelsUuid) error {
	return s.paymentMethod.Update(ctx, id)
}

// Subscriptions

func (s *Server) SubscriptionsDeleteSubscriptions(ctx echo.Context) error {
	return s.subscription.DeleteMany(ctx)
}

func (s *Server) SubscriptionsListSubscriptions(ctx echo.Context) error {
	return s.subscription.List(ctx)
}

func (s *Server) SubscriptionsCreateSubscription(ctx echo.Context) error {
	return s.subscription.Create(ctx)
}

func (s *Server) SubscriptionsDeleteSubscription(ctx echo.Context, id openapi.ModelsUuid) error {
	return s.subscription.Delete(ctx, id)
}

func (s *Server) SubscriptionsGetSubscription(ctx echo.Context, id openapi.ModelsUuid) error {
	return s.subscription.Get(ctx, id)
}

func (s *Server) SubscriptionsUpdateSubscription(ctx echo.Context, id openapi.ModelsUuid) error {
	return s.subscription.Update(ctx, id)
}

// Users

func (s *Server) UsersGetCurrentUser(ctx echo.Context) error {
	return s.user.GetCurrentUser(ctx)
}

func (s *Server) UsersUpdateCurrentUser(ctx echo.Context) error {
	return s.user.UpdateCurrentUser(ctx)
}

func (s *Server) UsersDeleteCurrentUser(ctx echo.Context) error {
	return s.user.DeleteCurrentUser(ctx)
}
