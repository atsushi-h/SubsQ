package webpush

import (
	"context"
	"fmt"
	"strings"

	webpushgo "github.com/SherClockHolmes/webpush-go"
	"github.com/atsushi-h/subsq/backend/internal/port"
)

type Sender struct {
	publicKey  string
	privateKey string
	subject    string
}

var _ port.WebPushSender = (*Sender)(nil)

func NewSender(publicKey, privateKey, subject string) *Sender {
	return &Sender{publicKey: publicKey, privateKey: privateKey, subject: subject}
}

// fcm.googleapis.com/fcm/send/ は旧 Legacy FCM API。
// VAPID 認証には /wp/ 形式が必要なためリライトする。
func rewriteFCMEndpoint(endpoint string) string {
	const legacy = "https://fcm.googleapis.com/fcm/send/"
	const modern = "https://fcm.googleapis.com/wp/"
	if strings.HasPrefix(endpoint, legacy) {
		return modern + endpoint[len(legacy):]
	}
	return endpoint
}

func (s *Sender) Send(_ context.Context, endpoint, p256dh, auth string, payload []byte) (statusCode int, err error) {
	rewritten := rewriteFCMEndpoint(endpoint)
	sub := &webpushgo.Subscription{
		Endpoint: rewritten,
		Keys: webpushgo.Keys{
			P256dh: p256dh,
			Auth:   auth,
		},
	}

	resp, err := webpushgo.SendNotification(payload, sub, &webpushgo.Options{
		VAPIDPublicKey:  s.publicKey,
		VAPIDPrivateKey: s.privateKey,
		Subscriber:      s.subject,
		TTL:             86400,
	})
	if err != nil {
		return 0, fmt.Errorf("failed to send web push: %w", err)
	}
	defer resp.Body.Close() //nolint:errcheck // レスポンスボディのClose errorは無視

	return resp.StatusCode, nil
}
