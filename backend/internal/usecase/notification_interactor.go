package usecase

import (
	"context"
	"encoding/json"
	"fmt"

	domain "github.com/atsushi-h/subsq/backend/internal/domain/notification"
	"github.com/atsushi-h/subsq/backend/internal/port"
)

type NotificationInteractor struct {
	repo   port.PushSubscriptionRepository
	sender port.WebPushSender
	output port.NotificationOutputPort
}

var _ port.NotificationInputPort = (*NotificationInteractor)(nil)

func NewNotificationInteractor(repo port.PushSubscriptionRepository, sender port.WebPushSender, output port.NotificationOutputPort) *NotificationInteractor {
	return &NotificationInteractor{repo: repo, sender: sender, output: output}
}

func (i *NotificationInteractor) Subscribe(ctx context.Context, userID string, input port.SubscribeInput) error {
	sub := &domain.PushSubscription{
		UserID:    userID,
		Endpoint:  input.Endpoint,
		P256dh:    input.P256dh,
		Auth:      input.Auth,
		UserAgent: input.UserAgent,
	}
	if _, err := i.repo.Upsert(ctx, sub); err != nil {
		return fmt.Errorf("failed to subscribe: %w", err)
	}
	return nil
}

func (i *NotificationInteractor) Unsubscribe(ctx context.Context, userID, endpoint string) error {
	if err := i.repo.DeleteByEndpoint(ctx, endpoint, userID); err != nil {
		return fmt.Errorf("failed to unsubscribe: %w", err)
	}
	return nil
}

func (i *NotificationInteractor) ListMySubscriptions(ctx context.Context, userID string) error {
	subs, err := i.repo.FindByUserID(ctx, userID)
	if err != nil {
		return fmt.Errorf("failed to list subscriptions: %w", err)
	}
	return i.output.PresentPushSubscriptions(ctx, subs)
}

func (i *NotificationInteractor) SendTest(ctx context.Context, userID string) error {
	subs, err := i.repo.FindByUserID(ctx, userID)
	if err != nil {
		return fmt.Errorf("failed to find subscriptions: %w", err)
	}
	payload, err := buildPayload("テスト通知", "SubsQからのテスト通知です", "/")
	if err != nil {
		return err
	}
	for _, sub := range subs {
		if err := i.sendAndCleanup(ctx, sub, payload); err != nil {
			return err
		}
	}
	return nil
}

func (i *NotificationInteractor) Broadcast(ctx context.Context, input port.BroadcastInput) error {
	subs, err := i.repo.FindAll(ctx)
	if err != nil {
		return fmt.Errorf("failed to find all subscriptions: %w", err)
	}
	payload, err := buildPayload(input.Title, input.Body, "/")
	if err != nil {
		return err
	}
	for _, sub := range subs {
		if err := i.sendAndCleanup(ctx, sub, payload); err != nil {
			return err
		}
	}
	return nil
}

func (i *NotificationInteractor) sendAndCleanup(ctx context.Context, sub *domain.PushSubscription, payload []byte) error {
	statusCode, err := i.sender.Send(ctx, sub.Endpoint, sub.P256dh, sub.Auth, payload)
	if err != nil {
		return fmt.Errorf("failed to send notification: %w", err)
	}
	if statusCode == 404 || statusCode == 410 {
		_ = i.repo.DeleteByID(ctx, sub.ID) //nolint:errcheck // 購読無効化済みのため削除失敗は無視
	}
	return nil
}

func buildPayload(title, body, url string) ([]byte, error) {
	data, err := json.Marshal(map[string]string{"title": title, "body": body, "url": url})
	if err != nil {
		return nil, fmt.Errorf("failed to build payload: %w", err)
	}
	return data, nil
}
