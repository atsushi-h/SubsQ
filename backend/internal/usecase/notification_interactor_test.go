package usecase_test

import (
	"context"
	"errors"
	"testing"

	"go.uber.org/mock/gomock"

	domain "github.com/atsushi-h/subsq/backend/internal/domain/notification"
	"github.com/atsushi-h/subsq/backend/internal/port"
	uc "github.com/atsushi-h/subsq/backend/internal/usecase"
	mockusecase "github.com/atsushi-h/subsq/backend/internal/usecase/mock"
)

func newNotificationInteractor(
	ctrl *gomock.Controller,
	repo *mockusecase.MockPushSubscriptionRepository,
	sender *mockusecase.MockWebPushSender,
	out *mockusecase.MockNotificationOutputPort,
) *uc.NotificationInteractor {
	return uc.NewNotificationInteractor(repo, sender, out)
}

func TestNotificationInteractor_Subscribe(t *testing.T) {
	tests := []struct {
		name      string
		userID    string
		input     port.SubscribeInput
		repoErr   error
		wantError error
	}{
		{
			name:   "[Success] 購読登録が成功する",
			userID: "user-1",
			input: port.SubscribeInput{
				Endpoint: "https://push.example.com/endpoint",
				P256dh:   "dGVzdA==",
				Auth:     "YXV0aA==",
			},
		},
		{
			name:   "[Fail] リポジトリエラーをラップして返す",
			userID: "user-1",
			input: port.SubscribeInput{
				Endpoint: "https://push.example.com/endpoint",
				P256dh:   "dGVzdA==",
				Auth:     "YXV0aA==",
			},
			repoErr:   errors.New("db error"),
			wantError: errors.New("failed to subscribe: db error"),
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			ctrl := gomock.NewController(t)
			defer ctrl.Finish()

			repo := mockusecase.NewMockPushSubscriptionRepository(ctrl)
			sender := mockusecase.NewMockWebPushSender(ctrl)
			out := mockusecase.NewMockNotificationOutputPort(ctrl)

			repo.EXPECT().Upsert(gomock.Any(), gomock.Any()).Return(&domain.PushSubscription{}, tt.repoErr)
			if tt.repoErr == nil {
				out.EXPECT().PresentSinglePushSubscription(gomock.Any(), gomock.Any()).Return(nil)
			}

			interactor := newNotificationInteractor(ctrl, repo, sender, out)
			err := interactor.Subscribe(context.Background(), tt.userID, tt.input)

			assertError(t, tt.wantError, err)
		})
	}
}

func TestNotificationInteractor_Unsubscribe(t *testing.T) {
	tests := []struct {
		name      string
		userID    string
		endpoint  string
		repoErr   error
		wantError error
	}{
		{
			name:     "[Success] 購読解除が成功する",
			userID:   "user-1",
			endpoint: "https://push.example.com/endpoint",
		},
		{
			name:      "[Fail] リポジトリエラーをラップして返す",
			userID:    "user-1",
			endpoint:  "https://push.example.com/endpoint",
			repoErr:   errors.New("db error"),
			wantError: errors.New("failed to unsubscribe: db error"),
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			ctrl := gomock.NewController(t)
			defer ctrl.Finish()

			repo := mockusecase.NewMockPushSubscriptionRepository(ctrl)
			sender := mockusecase.NewMockWebPushSender(ctrl)
			out := mockusecase.NewMockNotificationOutputPort(ctrl)

			repo.EXPECT().DeleteByEndpoint(gomock.Any(), tt.endpoint, tt.userID).Return(tt.repoErr)

			interactor := newNotificationInteractor(ctrl, repo, sender, out)
			err := interactor.Unsubscribe(context.Background(), tt.userID, tt.endpoint)

			assertError(t, tt.wantError, err)
		})
	}
}

func TestNotificationInteractor_ListMySubscriptions(t *testing.T) {
	tests := []struct {
		name      string
		userID    string
		repoSubs  []*domain.PushSubscription
		repoErr   error
		wantError error
	}{
		{
			name:   "[Success] 購読一覧を取得する",
			userID: "user-1",
			repoSubs: []*domain.PushSubscription{
				{ID: "sub-1", Endpoint: "https://push.example.com/1"},
				{ID: "sub-2", Endpoint: "https://push.example.com/2"},
			},
		},
		{
			name:     "[Success] 購読が0件の場合も正常に返す",
			userID:   "user-1",
			repoSubs: []*domain.PushSubscription{},
		},
		{
			name:      "[Fail] リポジトリエラーをラップして返す",
			userID:    "user-1",
			repoErr:   errors.New("db error"),
			wantError: errors.New("failed to list subscriptions: db error"),
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			ctrl := gomock.NewController(t)
			defer ctrl.Finish()

			repo := mockusecase.NewMockPushSubscriptionRepository(ctrl)
			sender := mockusecase.NewMockWebPushSender(ctrl)
			out := mockusecase.NewMockNotificationOutputPort(ctrl)

			repo.EXPECT().FindByUserID(gomock.Any(), tt.userID).Return(tt.repoSubs, tt.repoErr)
			if tt.wantError == nil {
				out.EXPECT().PresentPushSubscriptions(gomock.Any(), tt.repoSubs).Return(nil)
			}

			interactor := newNotificationInteractor(ctrl, repo, sender, out)
			err := interactor.ListMySubscriptions(context.Background(), tt.userID)

			assertError(t, tt.wantError, err)
		})
	}
}

func TestNotificationInteractor_SendTest(t *testing.T) {
	sub1 := &domain.PushSubscription{
		ID:       "sub-id-1",
		Endpoint: "https://push.example.com/1",
		P256dh:   "dGVzdA==",
		Auth:     "YXV0aA==",
	}

	tests := []struct {
		name         string
		userID       string
		repoSubs     []*domain.PushSubscription
		repoErr      error
		sendStatus   int
		sendErr      error
		expectDelete bool
		wantError    error
	}{
		{
			name:       "[Success] テスト通知を送信する",
			userID:     "user-1",
			repoSubs:   []*domain.PushSubscription{sub1},
			sendStatus: 201,
		},
		{
			name:     "[Success] 購読が0件の場合は通知を送らない",
			userID:   "user-1",
			repoSubs: []*domain.PushSubscription{},
		},
		{
			name:      "[Fail] FindByUserIDエラーをラップして返す",
			userID:    "user-1",
			repoErr:   errors.New("db error"),
			wantError: errors.New("failed to find subscriptions: db error"),
		},
		{
			name:      "[Fail] 送信エラーをラップして返す",
			userID:    "user-1",
			repoSubs:  []*domain.PushSubscription{sub1},
			sendErr:   errors.New("network error"),
			wantError: errors.New("failed to send notification: network error"),
		},
		{
			name:         "[Success] HTTP 410 で購読を削除する",
			userID:       "user-1",
			repoSubs:     []*domain.PushSubscription{sub1},
			sendStatus:   410,
			expectDelete: true,
		},
		{
			name:         "[Success] HTTP 404 で購読を削除する",
			userID:       "user-1",
			repoSubs:     []*domain.PushSubscription{sub1},
			sendStatus:   404,
			expectDelete: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			ctrl := gomock.NewController(t)
			defer ctrl.Finish()

			repo := mockusecase.NewMockPushSubscriptionRepository(ctrl)
			sender := mockusecase.NewMockWebPushSender(ctrl)
			out := mockusecase.NewMockNotificationOutputPort(ctrl)

			repo.EXPECT().FindByUserID(gomock.Any(), tt.userID).Return(tt.repoSubs, tt.repoErr)
			if tt.repoErr == nil && len(tt.repoSubs) > 0 {
				sender.EXPECT().
					Send(gomock.Any(), sub1.Endpoint, sub1.P256dh, sub1.Auth, gomock.Any()).
					Return(tt.sendStatus, tt.sendErr)
			}
			if tt.expectDelete {
				repo.EXPECT().DeleteByID(gomock.Any(), sub1.ID).Return(nil)
			}

			interactor := newNotificationInteractor(ctrl, repo, sender, out)
			err := interactor.SendTest(context.Background(), tt.userID)

			assertError(t, tt.wantError, err)
		})
	}
}

func TestNotificationInteractor_Broadcast(t *testing.T) {
	sub1 := &domain.PushSubscription{
		ID:       "sub-id-1",
		Endpoint: "https://push.example.com/1",
		P256dh:   "dGVzdA==",
		Auth:     "YXV0aA==",
	}
	sub2 := &domain.PushSubscription{
		ID:       "sub-id-2",
		Endpoint: "https://push.example.com/2",
		P256dh:   "dGVzdA==",
		Auth:     "YXV0aA==",
	}

	tests := []struct {
		name         string
		input        port.BroadcastInput
		repoSubs     []*domain.PushSubscription
		repoErr      error
		sendStatus   int
		sendErr      error
		expectDelete bool
		wantError    error
	}{
		{
			name:       "[Success] 全購読者に通知を送信する",
			input:      port.BroadcastInput{Title: "テスト", Body: "本文"},
			repoSubs:   []*domain.PushSubscription{sub1, sub2},
			sendStatus: 201,
		},
		{
			name:     "[Success] 購読が0件の場合は通知を送らない",
			input:    port.BroadcastInput{Title: "テスト", Body: "本文"},
			repoSubs: []*domain.PushSubscription{},
		},
		{
			name:      "[Fail] FindAllエラーをラップして返す",
			input:     port.BroadcastInput{Title: "テスト", Body: "本文"},
			repoErr:   errors.New("db error"),
			wantError: errors.New("failed to find all subscriptions: db error"),
		},
		{
			name:         "[Success] HTTP 410 で無効な購読を削除してスキップする",
			input:        port.BroadcastInput{Title: "テスト", Body: "本文"},
			repoSubs:     []*domain.PushSubscription{sub1},
			sendStatus:   410,
			expectDelete: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			ctrl := gomock.NewController(t)
			defer ctrl.Finish()

			repo := mockusecase.NewMockPushSubscriptionRepository(ctrl)
			sender := mockusecase.NewMockWebPushSender(ctrl)
			out := mockusecase.NewMockNotificationOutputPort(ctrl)

			repo.EXPECT().FindAll(gomock.Any()).Return(tt.repoSubs, tt.repoErr)
			if tt.repoErr == nil {
				for _, sub := range tt.repoSubs {
					sender.EXPECT().
						Send(gomock.Any(), sub.Endpoint, sub.P256dh, sub.Auth, gomock.Any()).
						Return(tt.sendStatus, tt.sendErr)
				}
			}
			if tt.expectDelete {
				repo.EXPECT().DeleteByID(gomock.Any(), sub1.ID).Return(nil)
			}

			interactor := newNotificationInteractor(ctrl, repo, sender, out)
			err := interactor.Broadcast(context.Background(), tt.input)

			assertError(t, tt.wantError, err)
		})
	}
}
