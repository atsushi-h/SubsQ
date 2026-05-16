//go:generate go tool mockgen -source=notification_port.go -destination=../usecase/mock/mock_notification_usecase.go -package=mockusecase

package port

import (
	"context"

	domain "github.com/atsushi-h/subsq/backend/internal/domain/notification"
)

type SubscribeInput struct {
	Endpoint  string
	P256dh    string
	Auth      string
	UserAgent *string
}

type BroadcastInput struct {
	Title string
	Body  string
}

type NotificationInputPort interface {
	Subscribe(ctx context.Context, userID string, input SubscribeInput) error
	Unsubscribe(ctx context.Context, userID, endpoint string) error
	ListMySubscriptions(ctx context.Context, userID string) error
	SendTest(ctx context.Context, userID string) error
	Broadcast(ctx context.Context, input BroadcastInput) error
}

type NotificationOutputPort interface {
	PresentPushSubscriptions(ctx context.Context, subs []*domain.PushSubscription) error
}

type PushSubscriptionRepository interface {
	Upsert(ctx context.Context, sub *domain.PushSubscription) (*domain.PushSubscription, error)
	DeleteByEndpoint(ctx context.Context, endpoint, userID string) error
	DeleteByID(ctx context.Context, id string) error
	FindByUserID(ctx context.Context, userID string) ([]*domain.PushSubscription, error)
	FindAll(ctx context.Context) ([]*domain.PushSubscription, error)
}

// WebPushSender はWebPush通知の送信を抽象化するインターフェース
// driver/webpush.Sender が実装する
type WebPushSender interface {
	Send(ctx context.Context, endpoint, p256dh, auth string, payload []byte) (statusCode int, err error)
}
