package usecase_test

import (
	"context"
	"errors"
	"testing"

	"github.com/jackc/pgx/v5"
	"go.uber.org/mock/gomock"

	domainerrors "github.com/atsushi-h/subsq/backend/internal/domain/errors"
	pm_domain "github.com/atsushi-h/subsq/backend/internal/domain/payment_method"
	domain "github.com/atsushi-h/subsq/backend/internal/domain/subscription"
	"github.com/atsushi-h/subsq/backend/internal/port"
	uc "github.com/atsushi-h/subsq/backend/internal/usecase"
	mockusecase "github.com/atsushi-h/subsq/backend/internal/usecase/mock"
)

func TestSubscriptionInteractor_List(t *testing.T) {
	tests := []struct {
		name      string
		userID    string
		repoSubs  []*domain.Subscription
		repoErr   error
		wantError error
	}{
		{
			name:   "[Success] サブスクリプション一覧を取得する",
			userID: "user-1",
			repoSubs: []*domain.Subscription{
				{ID: "sub-1", UserID: "user-1", ServiceName: "Netflix"},
				{ID: "sub-2", UserID: "user-1", ServiceName: "Spotify"},
			},
		},
		{
			name:     "[Success] サブスクリプションが0件の場合も正常に返す",
			userID:   "user-1",
			repoSubs: []*domain.Subscription{},
		},
		{
			name:      "[Fail] DBエラーの場合エラーをラップして返す",
			userID:    "user-1",
			repoErr:   errors.New("db error"),
			wantError: errors.New("failed to list subscriptions: db error"),
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			ctrl := gomock.NewController(t)
			defer ctrl.Finish()

			subRepo := mockusecase.NewMockSubscriptionRepository(ctrl)
			pmRepo := mockusecase.NewMockPaymentMethodRepository(ctrl)
			out := mockusecase.NewMockSubscriptionOutputPort(ctrl)
			tx := mockusecase.NewMockTxManager(ctrl)

			subRepo.EXPECT().FindByUserID(gomock.Any(), tt.userID).Return(tt.repoSubs, tt.repoErr)
			if tt.wantError == nil {
				out.EXPECT().PresentSubscriptions(gomock.Any(), tt.repoSubs).Return(nil)
			}

			interactor := uc.NewSubscriptionInteractor(subRepo, pmRepo, out, tx)
			err := interactor.List(context.Background(), tt.userID)

			assertError(t, tt.wantError, err)
		})
	}
}

func TestSubscriptionInteractor_Get(t *testing.T) {
	tests := []struct {
		name      string
		id        string
		userID    string
		repoSub   *domain.Subscription
		repoErr   error
		wantError error
	}{
		{
			name:    "[Success] サブスクリプションを取得する",
			id:      "sub-1",
			userID:  "user-1",
			repoSub: &domain.Subscription{ID: "sub-1", UserID: "user-1"},
		},
		{
			name:      "[Fail] 存在しない場合 ErrSubscriptionNotFound を返す",
			id:        "missing",
			userID:    "user-1",
			repoErr:   pgx.ErrNoRows,
			wantError: uc.ErrSubscriptionNotFound,
		},
		{
			name:      "[Fail] DBエラーの場合エラーをラップして返す",
			id:        "sub-1",
			userID:    "user-1",
			repoErr:   errors.New("db error"),
			wantError: errors.New("failed to get subscription: db error"),
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			ctrl := gomock.NewController(t)
			defer ctrl.Finish()

			subRepo := mockusecase.NewMockSubscriptionRepository(ctrl)
			pmRepo := mockusecase.NewMockPaymentMethodRepository(ctrl)
			out := mockusecase.NewMockSubscriptionOutputPort(ctrl)
			tx := mockusecase.NewMockTxManager(ctrl)

			subRepo.EXPECT().FindByID(gomock.Any(), tt.id, tt.userID).Return(tt.repoSub, tt.repoErr)
			if tt.wantError == nil {
				out.EXPECT().PresentSubscription(gomock.Any(), tt.repoSub).Return(nil)
			}

			interactor := uc.NewSubscriptionInteractor(subRepo, pmRepo, out, tx)
			err := interactor.Get(context.Background(), tt.id, tt.userID)

			assertError(t, tt.wantError, err)
		})
	}
}

func TestSubscriptionInteractor_Create(t *testing.T) {
	pmID := "pm-1"

	tests := []struct {
		name      string
		userID    string
		input     port.CreateSubscriptionInput
		findPM    *pm_domain.PaymentMethod
		findPMErr error
		createSub *domain.Subscription
		wantError error
	}{
		{
			name:   "[Success] 支払い方法なしでサブスクリプションを作成する",
			userID: "user-1",
			input: port.CreateSubscriptionInput{
				ServiceName:  "Netflix",
				Amount:       1490,
				BillingCycle: domain.BillingCycleMonthly,
				BaseDate:     1,
			},
			createSub: &domain.Subscription{ID: "sub-1"},
		},
		{
			name:   "[Success] 支払い方法ありでサブスクリプションを作成する",
			userID: "user-1",
			input: port.CreateSubscriptionInput{
				ServiceName:     "Netflix",
				Amount:          1490,
				BillingCycle:    domain.BillingCycleMonthly,
				BaseDate:        1,
				PaymentMethodID: &pmID,
			},
			findPM:    &pm_domain.PaymentMethod{ID: pmID, Name: "クレジットカード"},
			createSub: &domain.Subscription{ID: "sub-1"},
		},
		{
			name:   "[Fail] サービス名が空の場合バリデーションエラーを返す",
			userID: "user-1",
			input: port.CreateSubscriptionInput{
				ServiceName:  "",
				Amount:       1490,
				BillingCycle: domain.BillingCycleMonthly,
				BaseDate:     1,
			},
			wantError: domainerrors.ErrInvalidInput,
		},
		{
			name:   "[Fail] 金額が不正な場合バリデーションエラーを返す",
			userID: "user-1",
			input: port.CreateSubscriptionInput{
				ServiceName:  "Netflix",
				Amount:       -1,
				BillingCycle: domain.BillingCycleMonthly,
				BaseDate:     1,
			},
			wantError: domainerrors.ErrInvalidInput,
		},
		{
			name:   "[Fail] 支払い方法が見つからない場合 ErrInvalidInput を返す",
			userID: "user-1",
			input: port.CreateSubscriptionInput{
				ServiceName:     "Netflix",
				Amount:          1490,
				BillingCycle:    domain.BillingCycleMonthly,
				BaseDate:        1,
				PaymentMethodID: &pmID,
			},
			findPMErr: pgx.ErrNoRows,
			wantError: domainerrors.ErrInvalidInput,
		},
		{
			name:   "[Fail] 支払い方法検証でDBエラーの場合エラーをラップして返す",
			userID: "user-1",
			input: port.CreateSubscriptionInput{
				ServiceName:     "Netflix",
				Amount:          1490,
				BillingCycle:    domain.BillingCycleMonthly,
				BaseDate:        1,
				PaymentMethodID: &pmID,
			},
			findPMErr: errors.New("db error"),
			wantError: errors.New("failed to verify payment method: db error"),
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			ctrl := gomock.NewController(t)
			defer ctrl.Finish()

			subRepo := mockusecase.NewMockSubscriptionRepository(ctrl)
			pmRepo := mockusecase.NewMockPaymentMethodRepository(ctrl)
			out := mockusecase.NewMockSubscriptionOutputPort(ctrl)
			tx := mockusecase.NewMockTxManager(ctrl)

			if tt.input.PaymentMethodID != nil {
				pmRepo.EXPECT().FindByID(gomock.Any(), *tt.input.PaymentMethodID, tt.userID).
					Return(tt.findPM, tt.findPMErr)
			}
			if tt.wantError == nil {
				subRepo.EXPECT().Create(gomock.Any(), gomock.Any()).Return(tt.createSub, nil)
				out.EXPECT().PresentSubscription(gomock.Any(), gomock.Any()).Return(nil)
			}

			interactor := uc.NewSubscriptionInteractor(subRepo, pmRepo, out, tx)
			err := interactor.Create(context.Background(), tt.userID, tt.input)

			assertError(t, tt.wantError, err)
		})
	}
}

func TestSubscriptionInteractor_Update(t *testing.T) {
	pmID := "pm-1"
	existingSub := &domain.Subscription{
		ID:           "sub-1",
		UserID:       "user-1",
		ServiceName:  "Netflix",
		Amount:       1490,
		BillingCycle: domain.BillingCycleMonthly,
		BaseDate:     1,
	}
	updatedSub := &domain.Subscription{
		ID:           "sub-1",
		UserID:       "user-1",
		ServiceName:  "Netflix Premium",
		Amount:       1490,
		BillingCycle: domain.BillingCycleMonthly,
		BaseDate:     1,
	}

	tests := []struct {
		name      string
		id        string
		userID    string
		input     port.UpdateSubscriptionInput
		findSub   *domain.Subscription
		findErr   error
		findPM    *pm_domain.PaymentMethod // 支払い方法更新時に pmRepo.FindByID が返す値
		updateSub *domain.Subscription
		wantError error
	}{
		{
			name:      "[Success] サブスクリプションを更新する",
			id:        "sub-1",
			userID:    "user-1",
			input:     port.UpdateSubscriptionInput{ServiceName: strPtr("Netflix Premium")},
			findSub:   existingSub,
			updateSub: updatedSub,
		},
		{
			name:   "[Success] 支払い方法を変更してサブスクリプションを更新する",
			id:     "sub-1",
			userID: "user-1",
			input:  port.UpdateSubscriptionInput{PaymentMethodID: &pmID},
			findSub: existingSub,
			findPM: &pm_domain.PaymentMethod{ID: pmID, Name: "クレジットカード"},
			updateSub: &domain.Subscription{
				ID: "sub-1", UserID: "user-1", ServiceName: "Netflix",
				Amount: 1490, BillingCycle: domain.BillingCycleMonthly, BaseDate: 1,
				PaymentMethodID: &pmID,
			},
		},
		{
			name:      "[Fail] 存在しない場合 ErrSubscriptionNotFound を返す",
			id:        "missing",
			userID:    "user-1",
			input:     port.UpdateSubscriptionInput{ServiceName: strPtr("Netflix Premium")},
			findErr:   pgx.ErrNoRows,
			wantError: uc.ErrSubscriptionNotFound,
		},
		{
			name:   "[Fail] バリデーションエラーを返す（サービス名が空）",
			id:     "sub-1",
			userID: "user-1",
			input:  port.UpdateSubscriptionInput{ServiceName: strPtr("")},
			findSub: &domain.Subscription{
				ID: "sub-1", UserID: "user-1", ServiceName: "Netflix",
				Amount: 1490, BillingCycle: domain.BillingCycleMonthly, BaseDate: 1,
			},
			wantError: domainerrors.ErrInvalidInput,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			ctrl := gomock.NewController(t)
			defer ctrl.Finish()

			subRepo := mockusecase.NewMockSubscriptionRepository(ctrl)
			pmRepo := mockusecase.NewMockPaymentMethodRepository(ctrl)
			out := mockusecase.NewMockSubscriptionOutputPort(ctrl)
			tx := mockusecase.NewMockTxManager(ctrl)

			subRepo.EXPECT().FindByID(gomock.Any(), tt.id, tt.userID).Return(tt.findSub, tt.findErr)
			if tt.findPM != nil {
				pmRepo.EXPECT().FindByID(gomock.Any(), *tt.input.PaymentMethodID, tt.userID).
					Return(tt.findPM, nil)
			}
			if tt.wantError == nil {
				subRepo.EXPECT().Update(gomock.Any(), gomock.Any()).Return(tt.updateSub, nil)
				out.EXPECT().PresentSubscription(gomock.Any(), gomock.Any()).Return(nil)
			}

			interactor := uc.NewSubscriptionInteractor(subRepo, pmRepo, out, tx)
			err := interactor.Update(context.Background(), tt.id, tt.userID, tt.input)

			assertError(t, tt.wantError, err)
		})
	}
}

func TestSubscriptionInteractor_Delete(t *testing.T) {
	tests := []struct {
		name      string
		id        string
		userID    string
		findSub   *domain.Subscription
		findErr   error
		wantError error
	}{
		{
			name:    "[Success] サブスクリプションを削除する",
			id:      "sub-1",
			userID:  "user-1",
			findSub: &domain.Subscription{ID: "sub-1"},
		},
		{
			name:      "[Fail] 存在しない場合 ErrSubscriptionNotFound を返す",
			id:        "missing",
			userID:    "user-1",
			findErr:   pgx.ErrNoRows,
			wantError: uc.ErrSubscriptionNotFound,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			ctrl := gomock.NewController(t)
			defer ctrl.Finish()

			subRepo := mockusecase.NewMockSubscriptionRepository(ctrl)
			pmRepo := mockusecase.NewMockPaymentMethodRepository(ctrl)
			out := mockusecase.NewMockSubscriptionOutputPort(ctrl)
			tx := mockusecase.NewMockTxManager(ctrl)

			subRepo.EXPECT().FindByID(gomock.Any(), tt.id, tt.userID).Return(tt.findSub, tt.findErr)
			if tt.wantError == nil {
				subRepo.EXPECT().Delete(gomock.Any(), tt.id, tt.userID).Return(nil)
			}

			interactor := uc.NewSubscriptionInteractor(subRepo, pmRepo, out, tx)
			err := interactor.Delete(context.Background(), tt.id, tt.userID)

			assertError(t, tt.wantError, err)
		})
	}
}

func TestSubscriptionInteractor_DeleteMany(t *testing.T) {
	ids := []string{"sub-1", "sub-2"}
	subs := []*domain.Subscription{
		{ID: "sub-1", UserID: "user-1"},
		{ID: "sub-2", UserID: "user-1"},
	}

	tests := []struct {
		name      string
		ids       []string
		userID    string
		findSubs  []*domain.Subscription
		findErr   error
		wantError error
	}{
		{
			name:     "[Success] 複数サブスクリプションを削除する",
			ids:      ids,
			userID:   "user-1",
			findSubs: subs,
		},
		{
			name:      "[Fail] 一部が見つからない場合 ErrSubscriptionNotFound を返す",
			ids:       ids,
			userID:    "user-1",
			findSubs:  subs[:1],
			wantError: uc.ErrSubscriptionNotFound,
		},
		{
			name:      "[Fail] FindByIDs でDBエラーの場合エラーをラップして返す",
			ids:       ids,
			userID:    "user-1",
			findErr:   errors.New("db error"),
			wantError: errors.New("failed to find subscriptions: db error"),
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			ctrl := gomock.NewController(t)
			defer ctrl.Finish()

			subRepo := mockusecase.NewMockSubscriptionRepository(ctrl)
			pmRepo := mockusecase.NewMockPaymentMethodRepository(ctrl)
			out := mockusecase.NewMockSubscriptionOutputPort(ctrl)
			tx := mockusecase.NewMockTxManager(ctrl)

			tx.EXPECT().WithinTransaction(gomock.Any(), gomock.Any()).
				DoAndReturn(func(ctx context.Context, fn func(context.Context) error) error {
					return fn(ctx)
				})

			subRepo.EXPECT().FindByIDs(gomock.Any(), tt.ids, tt.userID).Return(tt.findSubs, tt.findErr)
			if tt.findErr == nil && len(tt.findSubs) == len(tt.ids) {
				subRepo.EXPECT().DeleteMany(gomock.Any(), tt.ids, tt.userID).Return(nil)
			}

			interactor := uc.NewSubscriptionInteractor(subRepo, pmRepo, out, tx)
			err := interactor.DeleteMany(context.Background(), tt.ids, tt.userID)

			assertError(t, tt.wantError, err)
		})
	}
}
