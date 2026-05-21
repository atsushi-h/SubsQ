package presenter

import (
	"context"
	"fmt"

	"github.com/google/uuid"

	openapi "github.com/atsushi-h/subsq/backend/internal/adapter/http/generated/openapi"
	domain "github.com/atsushi-h/subsq/backend/internal/domain/notification"
	"github.com/atsushi-h/subsq/backend/internal/port"
)

type NotificationPresenter struct {
	listResponse      *openapi.ModelsListPushSubscriptionsResponse
	subscribeResponse *openapi.ModelsPushSubscriptionResponse
}

var _ port.NotificationOutputPort = (*NotificationPresenter)(nil)

func NewNotificationPresenter() *NotificationPresenter {
	return &NotificationPresenter{}
}

func (p *NotificationPresenter) PresentPushSubscriptions(_ context.Context, subs []*domain.PushSubscription) error {
	items := make([]openapi.ModelsPushSubscriptionResponse, 0, len(subs))
	for _, sub := range subs {
		item, err := toPushSubscriptionResponse(sub)
		if err != nil {
			return err
		}
		items = append(items, item)
	}
	p.listResponse = &openapi.ModelsListPushSubscriptionsResponse{
		Subscriptions: items,
	}
	return nil
}

func (p *NotificationPresenter) ListResponse() *openapi.ModelsListPushSubscriptionsResponse {
	return p.listResponse
}

func (p *NotificationPresenter) PresentSinglePushSubscription(_ context.Context, sub *domain.PushSubscription) error {
	resp, err := toPushSubscriptionResponse(sub)
	if err != nil {
		return err
	}
	p.subscribeResponse = &resp
	return nil
}

func (p *NotificationPresenter) SubscribeResponse() *openapi.ModelsPushSubscriptionResponse {
	return p.subscribeResponse
}

func toPushSubscriptionResponse(sub *domain.PushSubscription) (openapi.ModelsPushSubscriptionResponse, error) {
	id, err := uuid.Parse(sub.ID)
	if err != nil {
		return openapi.ModelsPushSubscriptionResponse{}, fmt.Errorf("invalid push subscription id %q: %w", sub.ID, err)
	}
	return openapi.ModelsPushSubscriptionResponse{
		Id:        id,
		Endpoint:  sub.Endpoint,
		CreatedAt: sub.CreatedAt.UTC(),
	}, nil
}
