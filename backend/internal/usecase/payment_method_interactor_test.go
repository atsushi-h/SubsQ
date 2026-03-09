package usecase_test

import (
	"context"
	"errors"
	"testing"

	"github.com/jackc/pgx/v5"
	"go.uber.org/mock/gomock"

	domainerrors "github.com/atsushi-h/subsq/backend/internal/domain/errors"
	domain "github.com/atsushi-h/subsq/backend/internal/domain/payment_method"
	"github.com/atsushi-h/subsq/backend/internal/port"
	uc "github.com/atsushi-h/subsq/backend/internal/usecase"
	mockusecase "github.com/atsushi-h/subsq/backend/internal/usecase/mock"
)

func TestPaymentMethodInteractor_List(t *testing.T) {
	tests := []struct {
		name    string
		userID  string
		repoPMs []*port.PaymentMethodWithCount
	}{
		{
			name:   "[Success] 支払い方法一覧を取得する",
			userID: "user-1",
			repoPMs: []*port.PaymentMethodWithCount{
				{PaymentMethod: &domain.PaymentMethod{ID: "pm-1", Name: "クレジットカード"}, UsageCount: 2},
			},
		},
		{
			name:    "[Success] 支払い方法が0件の場合も正常に返す",
			userID:  "user-1",
			repoPMs: []*port.PaymentMethodWithCount{},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			ctrl := gomock.NewController(t)
			defer ctrl.Finish()

			pmRepo := mockusecase.NewMockPaymentMethodRepository(ctrl)
			subRepo := mockusecase.NewMockSubscriptionRepository(ctrl)
			out := mockusecase.NewMockPaymentMethodOutputPort(ctrl)
			tx := mockusecase.NewMockTxManager(ctrl)

			pmRepo.EXPECT().FindByUserIDWithCount(gomock.Any(), tt.userID).Return(tt.repoPMs, nil)
			out.EXPECT().PresentPaymentMethods(gomock.Any(), tt.repoPMs).Return(nil)

			interactor := uc.NewPaymentMethodInteractor(pmRepo, subRepo, out, tx)
			if err := interactor.List(context.Background(), tt.userID); err != nil {
				t.Fatalf("unexpected error: %v", err)
			}
		})
	}
}

func TestPaymentMethodInteractor_GetByID(t *testing.T) {
	tests := []struct {
		name       string
		id         string
		userID     string
		findPM     *domain.PaymentMethod
		findErr    error
		usageCount int64
		wantError  error
	}{
		{
			name:       "[Success] 支払い方法を取得する（使用中あり）",
			id:         "pm-1",
			userID:     "user-1",
			findPM:     &domain.PaymentMethod{ID: "pm-1", Name: "クレジットカード"},
			usageCount: 3,
		},
		{
			name:       "[Success] 支払い方法を取得する（使用中なし）",
			id:         "pm-1",
			userID:     "user-1",
			findPM:     &domain.PaymentMethod{ID: "pm-1", Name: "クレジットカード"},
			usageCount: 0,
		},
		{
			name:      "[Fail] 存在しない場合 ErrPaymentMethodNotFound を返す",
			id:        "missing",
			userID:    "user-1",
			findErr:   pgx.ErrNoRows,
			wantError: uc.ErrPaymentMethodNotFound,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			ctrl := gomock.NewController(t)
			defer ctrl.Finish()

			pmRepo := mockusecase.NewMockPaymentMethodRepository(ctrl)
			subRepo := mockusecase.NewMockSubscriptionRepository(ctrl)
			out := mockusecase.NewMockPaymentMethodOutputPort(ctrl)
			tx := mockusecase.NewMockTxManager(ctrl)

			pmRepo.EXPECT().FindByID(gomock.Any(), tt.id, tt.userID).Return(tt.findPM, tt.findErr)
			if tt.findErr == nil {
				subRepo.EXPECT().CountByPaymentMethodID(gomock.Any(), tt.id).Return(tt.usageCount, nil)
				out.EXPECT().PresentPaymentMethod(gomock.Any(), tt.findPM, tt.usageCount).Return(nil)
			}

			interactor := uc.NewPaymentMethodInteractor(pmRepo, subRepo, out, tx)
			err := interactor.GetByID(context.Background(), tt.id, tt.userID)

			assertError(t, tt.wantError, err)
		})
	}
}

func TestPaymentMethodInteractor_Create(t *testing.T) {
	tests := []struct {
		name      string
		userID    string
		pmName    string
		createPM  *domain.PaymentMethod
		wantError error
	}{
		{
			name:     "[Success] 支払い方法を作成する",
			userID:   "user-1",
			pmName:   "クレジットカード",
			createPM: &domain.PaymentMethod{ID: "pm-1", Name: "クレジットカード"},
		},
		{
			name:      "[Fail] 名前が空の場合バリデーションエラーを返す",
			userID:    "user-1",
			pmName:    "",
			wantError: domainerrors.ErrInvalidInput,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			ctrl := gomock.NewController(t)
			defer ctrl.Finish()

			pmRepo := mockusecase.NewMockPaymentMethodRepository(ctrl)
			subRepo := mockusecase.NewMockSubscriptionRepository(ctrl)
			out := mockusecase.NewMockPaymentMethodOutputPort(ctrl)
			tx := mockusecase.NewMockTxManager(ctrl)

			if tt.wantError == nil {
				pmRepo.EXPECT().Create(gomock.Any(), gomock.Any()).Return(tt.createPM, nil)
				out.EXPECT().PresentPaymentMethod(gomock.Any(), tt.createPM, int64(0)).Return(nil)
			}

			interactor := uc.NewPaymentMethodInteractor(pmRepo, subRepo, out, tx)
			err := interactor.Create(context.Background(), tt.userID, tt.pmName)

			assertError(t, tt.wantError, err)
		})
	}
}

func TestPaymentMethodInteractor_Update(t *testing.T) {
	existingPM := &domain.PaymentMethod{ID: "pm-1", UserID: "user-1", Name: "クレジットカード"}
	updatedPM := &domain.PaymentMethod{ID: "pm-1", UserID: "user-1", Name: "デビットカード"}

	tests := []struct {
		name       string
		id         string
		userID     string
		pmName     string
		findPM     *domain.PaymentMethod
		findErr    error
		updatePM   *domain.PaymentMethod
		usageCount int64
		wantError  error
	}{
		{
			name:       "[Success] 支払い方法を更新する",
			id:         "pm-1",
			userID:     "user-1",
			pmName:     "デビットカード",
			findPM:     existingPM,
			updatePM:   updatedPM,
			usageCount: 1,
		},
		{
			name:      "[Fail] 名前が空の場合バリデーションエラーを返す",
			id:        "pm-1",
			userID:    "user-1",
			pmName:    "",
			wantError: domainerrors.ErrInvalidInput,
		},
		{
			name:      "[Fail] 存在しない場合 ErrPaymentMethodNotFound を返す",
			id:        "missing",
			userID:    "user-1",
			pmName:    "デビットカード",
			findErr:   pgx.ErrNoRows,
			wantError: uc.ErrPaymentMethodNotFound,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			ctrl := gomock.NewController(t)
			defer ctrl.Finish()

			pmRepo := mockusecase.NewMockPaymentMethodRepository(ctrl)
			subRepo := mockusecase.NewMockSubscriptionRepository(ctrl)
			out := mockusecase.NewMockPaymentMethodOutputPort(ctrl)
			tx := mockusecase.NewMockTxManager(ctrl)

			// バリデーション失敗時は FindByID まで到達しない
			if !errors.Is(tt.wantError, domainerrors.ErrInvalidInput) {
				pmRepo.EXPECT().FindByID(gomock.Any(), tt.id, tt.userID).Return(tt.findPM, tt.findErr)
			}
			if tt.wantError == nil {
				pmRepo.EXPECT().Update(gomock.Any(), gomock.Any()).Return(tt.updatePM, nil)
				subRepo.EXPECT().CountByPaymentMethodID(gomock.Any(), tt.id).Return(tt.usageCount, nil)
				out.EXPECT().PresentPaymentMethod(gomock.Any(), tt.updatePM, tt.usageCount).Return(nil)
			}

			interactor := uc.NewPaymentMethodInteractor(pmRepo, subRepo, out, tx)
			err := interactor.Update(context.Background(), tt.id, tt.userID, tt.pmName)

			assertError(t, tt.wantError, err)
		})
	}
}

func TestPaymentMethodInteractor_Delete(t *testing.T) {
	existingPM := &domain.PaymentMethod{ID: "pm-1", UserID: "user-1", Name: "クレジットカード"}

	tests := []struct {
		name       string
		id         string
		userID     string
		findPM     *domain.PaymentMethod
		findErr    error
		usageCount int64
		wantError  error
	}{
		{
			name:       "[Success] 支払い方法を削除する",
			id:         "pm-1",
			userID:     "user-1",
			findPM:     existingPM,
			usageCount: 0,
		},
		{
			name:      "[Fail] 存在しない場合 ErrPaymentMethodNotFound を返す",
			id:        "missing",
			userID:    "user-1",
			findErr:   pgx.ErrNoRows,
			wantError: uc.ErrPaymentMethodNotFound,
		},
		{
			name:       "[Fail] サブスクリプションから参照中の場合 ErrPaymentMethodInUse を返す",
			id:         "pm-1",
			userID:     "user-1",
			findPM:     existingPM,
			usageCount: 2,
			wantError:  domainerrors.ErrPaymentMethodInUse,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			ctrl := gomock.NewController(t)
			defer ctrl.Finish()

			pmRepo := mockusecase.NewMockPaymentMethodRepository(ctrl)
			subRepo := mockusecase.NewMockSubscriptionRepository(ctrl)
			out := mockusecase.NewMockPaymentMethodOutputPort(ctrl)
			tx := mockusecase.NewMockTxManager(ctrl)

			tx.EXPECT().WithinTransaction(gomock.Any(), gomock.Any()).
				DoAndReturn(func(ctx context.Context, fn func(context.Context) error) error {
					return fn(ctx)
				})

			pmRepo.EXPECT().FindByID(gomock.Any(), tt.id, tt.userID).Return(tt.findPM, tt.findErr)
			if tt.findErr == nil {
				subRepo.EXPECT().CountByPaymentMethodID(gomock.Any(), tt.id).Return(tt.usageCount, nil)
				if tt.usageCount == 0 {
					pmRepo.EXPECT().Delete(gomock.Any(), tt.id, tt.userID).Return(nil)
				}
			}

			interactor := uc.NewPaymentMethodInteractor(pmRepo, subRepo, out, tx)
			err := interactor.Delete(context.Background(), tt.id, tt.userID)

			assertError(t, tt.wantError, err)
		})
	}
}

func TestPaymentMethodInteractor_DeleteMany(t *testing.T) {
	ids := []string{"pm-1", "pm-2"}
	pms := []*domain.PaymentMethod{
		{ID: "pm-1", UserID: "user-1", Name: "クレジットカード"},
		{ID: "pm-2", UserID: "user-1", Name: "デビットカード"},
	}

	tests := []struct {
		name       string
		ids        []string
		userID     string
		findPMs    []*domain.PaymentMethod
		usageCount int64
		wantError  error
	}{
		{
			name:       "[Success] 複数支払い方法を削除する",
			ids:        ids,
			userID:     "user-1",
			findPMs:    pms,
			usageCount: 0,
		},
		{
			name:      "[Fail] 一部が見つからない場合 ErrPaymentMethodNotFound を返す",
			ids:       ids,
			userID:    "user-1",
			findPMs:   pms[:1],
			wantError: uc.ErrPaymentMethodNotFound,
		},
		{
			name:       "[Fail] サブスクリプションから参照中の場合 ErrPaymentMethodInUse を返す",
			ids:        ids,
			userID:     "user-1",
			findPMs:    pms,
			usageCount: 1,
			wantError:  domainerrors.ErrPaymentMethodInUse,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			ctrl := gomock.NewController(t)
			defer ctrl.Finish()

			pmRepo := mockusecase.NewMockPaymentMethodRepository(ctrl)
			subRepo := mockusecase.NewMockSubscriptionRepository(ctrl)
			out := mockusecase.NewMockPaymentMethodOutputPort(ctrl)
			tx := mockusecase.NewMockTxManager(ctrl)

			tx.EXPECT().WithinTransaction(gomock.Any(), gomock.Any()).
				DoAndReturn(func(ctx context.Context, fn func(context.Context) error) error {
					return fn(ctx)
				})

			pmRepo.EXPECT().FindByIDs(gomock.Any(), tt.ids, tt.userID).Return(tt.findPMs, nil)
			if len(tt.findPMs) == len(tt.ids) {
				subRepo.EXPECT().CountByPaymentMethodIDs(gomock.Any(), tt.ids).Return(tt.usageCount, nil)
				if tt.usageCount == 0 {
					pmRepo.EXPECT().DeleteMany(gomock.Any(), tt.ids, tt.userID).Return(nil)
				}
			}

			interactor := uc.NewPaymentMethodInteractor(pmRepo, subRepo, out, tx)
			err := interactor.DeleteMany(context.Background(), tt.ids, tt.userID)

			assertError(t, tt.wantError, err)
		})
	}
}
