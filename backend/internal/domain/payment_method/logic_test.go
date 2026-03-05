package payment_method_test

import (
	"errors"
	"testing"

	domainerrors "github.com/atsushi-h/subsq/backend/internal/domain/errors"
	domain "github.com/atsushi-h/subsq/backend/internal/domain/payment_method"
)

func TestCanDelete(t *testing.T) {
	t.Parallel()
	tests := []struct {
		name       string
		usageCount int64
		wantErr    bool
		errIs      error
	}{
		{
			name:       "usageCount=0: 削除可能",
			usageCount: 0,
			wantErr:    false,
		},
		{
			name:       "usageCount=1: 削除不可",
			usageCount: 1,
			wantErr:    true,
			errIs:      domainerrors.ErrPaymentMethodInUse,
		},
		{
			name:       "usageCount が負数: 削除可能（異常値だが防御的に通す）",
			usageCount: -1,
			wantErr:    false,
		},
	}

	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()
			err := domain.CanDelete(tc.usageCount)
			if (err != nil) != tc.wantErr {
				t.Errorf("CanDelete(%d) error = %v, wantErr %v", tc.usageCount, err, tc.wantErr)
			}
			if tc.errIs != nil && !errors.Is(err, tc.errIs) {
				t.Errorf("CanDelete(%d) error should be %v, got %v", tc.usageCount, tc.errIs, err)
			}
		})
	}
}
