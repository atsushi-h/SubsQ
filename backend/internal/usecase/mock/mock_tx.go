package mockusecase

import (
	"context"
	"reflect"

	"go.uber.org/mock/gomock"

	"github.com/atsushi-h/subsq/backend/internal/port"
)

// MockTxManager is a mock of port.TxManager.
type MockTxManager struct {
	ctrl     *gomock.Controller
	recorder *MockTxManagerMockRecorder
}

// MockTxManagerMockRecorder records invocations.
type MockTxManagerMockRecorder struct {
	mock *MockTxManager
}

// NewMockTxManager creates a new mock.
func NewMockTxManager(ctrl *gomock.Controller) *MockTxManager {
	mock := &MockTxManager{ctrl: ctrl}
	mock.recorder = &MockTxManagerMockRecorder{mock}
	return mock
}

// EXPECT returns recorder.
func (m *MockTxManager) EXPECT() *MockTxManagerMockRecorder {
	return m.recorder
}

func (m *MockTxManager) WithinTransaction(ctx context.Context, fn func(ctx context.Context) error) error {
	m.ctrl.T.Helper()
	ret := m.ctrl.Call(m, "WithinTransaction", ctx, fn)
	res0, _ := ret[0].(error)
	return res0
}

func (mr *MockTxManagerMockRecorder) WithinTransaction(ctx, fn any) *gomock.Call {
	mr.mock.ctrl.T.Helper()
	return mr.mock.ctrl.RecordCallWithMethodType(mr.mock, "WithinTransaction", reflect.TypeOf((*MockTxManager)(nil).WithinTransaction), ctx, fn)
}

// Ensure mock implements the interface at compile time.
var _ port.TxManager = (*MockTxManager)(nil)
