package usecase_test

import (
	"context"
	"errors"
	"testing"

	"github.com/jackc/pgx/v5"
	"go.uber.org/mock/gomock"

	"github.com/atsushi-h/subsq/backend/internal/domain/user"
	uc "github.com/atsushi-h/subsq/backend/internal/usecase"
	mockusecase "github.com/atsushi-h/subsq/backend/internal/usecase/mock"
)

func TestUserInteractor_GetCurrentUser(t *testing.T) {
	tests := []struct {
		name      string
		userID    string
		repoUser  *user.User
		repoErr   error
		wantError error
	}{
		{
			name:     "[Success] ユーザーを取得する",
			userID:   "user-1",
			repoUser: &user.User{ID: "user-1"},
		},
		{
			name:      "[Fail] ユーザーが見つからない場合 ErrUserNotFound を返す",
			userID:    "missing",
			repoErr:   pgx.ErrNoRows,
			wantError: uc.ErrUserNotFound,
		},
		{
			name:      "[Fail] リポジトリエラーをラップして返す",
			userID:    "user-1",
			repoErr:   errors.New("db error"),
			wantError: errors.New("failed to find user: db error"),
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			ctrl := gomock.NewController(t)
			defer ctrl.Finish()

			repo := mockusecase.NewMockUserRepository(ctrl)
			out := mockusecase.NewMockUserOutputPort(ctrl)

			repo.EXPECT().FindByID(gomock.Any(), tt.userID).Return(tt.repoUser, tt.repoErr)
			if tt.wantError == nil {
				out.EXPECT().PresentUser(gomock.Any(), tt.repoUser).Return(nil)
			}

			interactor := uc.NewUserInteractor(repo, out)
			err := interactor.GetCurrentUser(context.Background(), tt.userID)

			assertError(t, tt.wantError, err)
		})
	}
}

func TestUserInteractor_UpdateCurrentUser(t *testing.T) {
	tests := []struct {
		name      string
		userID    string
		reqName   *string
		reqThumb  *string
		findUser  *user.User
		findErr   error
		updateErr error
		wantError error
	}{
		{
			name:     "[Success] name のみ更新する",
			userID:   "user-1",
			reqName:  strPtr("新しい名前"),
			findUser: &user.User{ID: "user-1"},
		},
		{
			name:     "[Success] thumbnail のみ更新する",
			userID:   "user-1",
			reqThumb: strPtr("https://example.com/avatar.png"),
			findUser: &user.User{ID: "user-1"},
		},
		{
			name:      "[Fail] ユーザーが見つからない場合 ErrUserNotFound を返す",
			userID:    "missing",
			findErr:   pgx.ErrNoRows,
			wantError: uc.ErrUserNotFound,
		},
		{
			name:      "[Fail] FindByID リポジトリエラーをラップして返す",
			userID:    "user-1",
			findErr:   errors.New("db error"),
			wantError: errors.New("failed to find user: db error"),
		},
		{
			name:      "[Fail] UpdateUser リポジトリエラーをラップして返す",
			userID:    "user-1",
			reqName:   strPtr("新しい名前"),
			findUser:  &user.User{ID: "user-1"},
			updateErr: errors.New("db error"),
			wantError: errors.New("failed to update user: db error"),
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			ctrl := gomock.NewController(t)
			defer ctrl.Finish()

			repo := mockusecase.NewMockUserRepository(ctrl)
			out := mockusecase.NewMockUserOutputPort(ctrl)

			repo.EXPECT().FindByID(gomock.Any(), tt.userID).Return(tt.findUser, tt.findErr)
			if tt.findErr == nil {
				updatedUser := &user.User{ID: tt.userID}
				repo.EXPECT().UpdateUser(gomock.Any(), tt.userID, tt.reqName, tt.reqThumb).Return(updatedUser, tt.updateErr)
				if tt.updateErr == nil {
					out.EXPECT().PresentUser(gomock.Any(), updatedUser).Return(nil)
				}
			}

			interactor := uc.NewUserInteractor(repo, out)
			err := interactor.UpdateCurrentUser(context.Background(), tt.userID, tt.reqName, tt.reqThumb)

			assertError(t, tt.wantError, err)
		})
	}
}

func TestUserInteractor_DeleteCurrentUser(t *testing.T) {
	tests := []struct {
		name      string
		userID    string
		findUser  *user.User
		findErr   error
		deleteErr error
		wantError error
	}{
		{
			name:     "[Success] ユーザーを削除する",
			userID:   "user-1",
			findUser: &user.User{ID: "user-1"},
		},
		{
			name:      "[Fail] ユーザーが見つからない場合 ErrUserNotFound を返す",
			userID:    "missing",
			findErr:   pgx.ErrNoRows,
			wantError: uc.ErrUserNotFound,
		},
		{
			name:      "[Fail] FindByID リポジトリエラーをラップして返す",
			userID:    "user-1",
			findErr:   errors.New("db error"),
			wantError: errors.New("failed to find user: db error"),
		},
		{
			name:      "[Fail] DeleteUser リポジトリエラーをラップして返す",
			userID:    "user-1",
			findUser:  &user.User{ID: "user-1"},
			deleteErr: errors.New("db error"),
			wantError: errors.New("failed to delete user: db error"),
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			ctrl := gomock.NewController(t)
			defer ctrl.Finish()

			repo := mockusecase.NewMockUserRepository(ctrl)
			out := mockusecase.NewMockUserOutputPort(ctrl)

			repo.EXPECT().FindByID(gomock.Any(), tt.userID).Return(tt.findUser, tt.findErr)
			if tt.findErr == nil {
				repo.EXPECT().DeleteUser(gomock.Any(), tt.userID).Return(tt.deleteErr)
			}

			interactor := uc.NewUserInteractor(repo, out)
			err := interactor.DeleteCurrentUser(context.Background(), tt.userID)

			assertError(t, tt.wantError, err)
		})
	}
}
