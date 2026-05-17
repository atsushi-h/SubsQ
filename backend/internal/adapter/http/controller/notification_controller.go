package controller

import (
	"net/http"

	"github.com/labstack/echo/v4"

	openapi "github.com/atsushi-h/subsq/backend/internal/adapter/http/generated/openapi"
	"github.com/atsushi-h/subsq/backend/internal/adapter/http/middleware"
	httppresenter "github.com/atsushi-h/subsq/backend/internal/adapter/http/presenter"
	"github.com/atsushi-h/subsq/backend/internal/port"
)

type NotificationController struct {
	inputFactory  func(repo port.PushSubscriptionRepository, sender port.WebPushSender, output port.NotificationOutputPort) port.NotificationInputPort
	outputFactory func() *httppresenter.NotificationPresenter
	repoFactory   func() port.PushSubscriptionRepository
	senderFactory func() port.WebPushSender
}

func NewNotificationController(
	inputFactory func(repo port.PushSubscriptionRepository, sender port.WebPushSender, output port.NotificationOutputPort) port.NotificationInputPort,
	outputFactory func() *httppresenter.NotificationPresenter,
	repoFactory func() port.PushSubscriptionRepository,
	senderFactory func() port.WebPushSender,
) *NotificationController {
	return &NotificationController{
		inputFactory:  inputFactory,
		outputFactory: outputFactory,
		repoFactory:   repoFactory,
		senderFactory: senderFactory,
	}
}

func (c *NotificationController) newIO() (port.NotificationInputPort, *httppresenter.NotificationPresenter) {
	p := c.outputFactory()
	input := c.inputFactory(c.repoFactory(), c.senderFactory(), p)
	return input, p
}

// POST /api/v1/notifications/subscriptions
func (c *NotificationController) NotificationsSubscribe(ctx echo.Context) error {
	userID, ok := ctx.Get(middleware.UserIDKey).(string)
	if !ok {
		return errorJSON(ctx, http.StatusUnauthorized, "Unauthorized", "unauthorized")
	}

	var req openapi.NotificationsSubscribeJSONRequestBody
	if err := ctx.Bind(&req); err != nil {
		return errorJSON(ctx, http.StatusBadRequest, "Bad Request", "invalid request body")
	}

	input, p := c.newIO()
	if err := input.Subscribe(ctx.Request().Context(), userID, port.SubscribeInput{
		Endpoint:  req.Endpoint,
		P256dh:    req.P256dh,
		Auth:      req.Auth,
		UserAgent: req.UserAgent,
	}); err != nil {
		return handleError(ctx, err)
	}
	return ctx.JSON(http.StatusOK, p.ListResponse())
}

// DELETE /api/v1/notifications/subscriptions
func (c *NotificationController) NotificationsUnsubscribe(ctx echo.Context) error {
	userID, ok := ctx.Get(middleware.UserIDKey).(string)
	if !ok {
		return errorJSON(ctx, http.StatusUnauthorized, "Unauthorized", "unauthorized")
	}

	var req openapi.NotificationsUnsubscribeJSONRequestBody
	if err := ctx.Bind(&req); err != nil {
		return errorJSON(ctx, http.StatusBadRequest, "Bad Request", "invalid request body")
	}

	input, _ := c.newIO()
	if err := input.Unsubscribe(ctx.Request().Context(), userID, req.Endpoint); err != nil {
		return handleError(ctx, err)
	}
	return ctx.NoContent(http.StatusNoContent)
}

// GET /api/v1/notifications/subscriptions/me
func (c *NotificationController) NotificationsListMySubscriptions(ctx echo.Context) error {
	userID, ok := ctx.Get(middleware.UserIDKey).(string)
	if !ok {
		return errorJSON(ctx, http.StatusUnauthorized, "Unauthorized", "unauthorized")
	}

	input, p := c.newIO()
	if err := input.ListMySubscriptions(ctx.Request().Context(), userID); err != nil {
		return handleError(ctx, err)
	}
	return ctx.JSON(http.StatusOK, p.ListResponse())
}

// POST /api/v1/notifications/test
func (c *NotificationController) NotificationsSendTest(ctx echo.Context) error {
	userID, ok := ctx.Get(middleware.UserIDKey).(string)
	if !ok {
		return errorJSON(ctx, http.StatusUnauthorized, "Unauthorized", "unauthorized")
	}

	input, _ := c.newIO()
	if err := input.SendTest(ctx.Request().Context(), userID); err != nil {
		return handleError(ctx, err)
	}
	return ctx.NoContent(http.StatusNoContent)
}

// POST /api/v1/admin/notifications/broadcast
func (c *NotificationController) AdminNotificationsBroadcast(ctx echo.Context) error {
	var req openapi.AdminNotificationsBroadcastJSONRequestBody
	if err := ctx.Bind(&req); err != nil {
		return errorJSON(ctx, http.StatusBadRequest, "Bad Request", "invalid request body")
	}

	input, _ := c.newIO()
	if err := input.Broadcast(ctx.Request().Context(), port.BroadcastInput{
		Title: req.Title,
		Body:  req.Body,
	}); err != nil {
		return handleError(ctx, err)
	}
	return ctx.NoContent(http.StatusNoContent)
}
