package factory

import (
	"golang.org/x/oauth2"

	"github.com/atsushi-h/subsq/backend/internal/port"
	"github.com/atsushi-h/subsq/backend/internal/usecase"
)

// NewAuthInteractorFactory returns a factory for AuthInteractor.
func NewAuthInteractorFactory(oauthConfig *oauth2.Config, jwtSecret string) func(userRepo port.UserRepository) *usecase.AuthInteractor {
	return func(userRepo port.UserRepository) *usecase.AuthInteractor {
		return usecase.NewAuthInteractor(userRepo, oauthConfig, jwtSecret)
	}
}

// NewSubscriptionInputFactory returns a factory for SubscriptionInteractor.
func NewSubscriptionInputFactory() func(subRepo port.SubscriptionRepository, pmRepo port.PaymentMethodRepository, output port.SubscriptionOutputPort) port.SubscriptionInputPort {
	return func(subRepo port.SubscriptionRepository, pmRepo port.PaymentMethodRepository, output port.SubscriptionOutputPort) port.SubscriptionInputPort {
		return usecase.NewSubscriptionInteractor(subRepo, pmRepo, output)
	}
}

// NewPaymentMethodInputFactory returns a factory for PaymentMethodInteractor.
func NewPaymentMethodInputFactory() func(pmRepo port.PaymentMethodRepository, subRepo port.SubscriptionRepository, output port.PaymentMethodOutputPort) port.PaymentMethodInputPort {
	return func(pmRepo port.PaymentMethodRepository, subRepo port.SubscriptionRepository, output port.PaymentMethodOutputPort) port.PaymentMethodInputPort {
		return usecase.NewPaymentMethodInteractor(pmRepo, subRepo, output)
	}
}

// NewUserInputFactory returns a factory for UserInteractor.
func NewUserInputFactory() func(userRepo port.UserRepository, output port.UserOutputPort) port.UserInputPort {
	return func(userRepo port.UserRepository, output port.UserOutputPort) port.UserInputPort {
		return usecase.NewUserInteractor(userRepo, output)
	}
}
