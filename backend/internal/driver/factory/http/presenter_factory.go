// Package http provides factory functions for HTTP presenters.
package http

import httppresenter "github.com/atsushi-h/subsq/backend/internal/adapter/http/presenter"

// NewSubscriptionOutputFactory returns a factory for SubscriptionPresenter.
func NewSubscriptionOutputFactory() func() *httppresenter.SubscriptionPresenter {
	return func() *httppresenter.SubscriptionPresenter {
		return httppresenter.NewSubscriptionPresenter()
	}
}

// NewPaymentMethodOutputFactory returns a factory for PaymentMethodPresenter.
func NewPaymentMethodOutputFactory() func() *httppresenter.PaymentMethodPresenter {
	return func() *httppresenter.PaymentMethodPresenter {
		return httppresenter.NewPaymentMethodPresenter()
	}
}

// NewUserOutputFactory returns a factory for UserPresenter.
func NewUserOutputFactory() func() *httppresenter.UserPresenter {
	return func() *httppresenter.UserPresenter {
		return httppresenter.NewUserPresenter()
	}
}
