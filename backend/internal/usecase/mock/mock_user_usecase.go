package mockusecase

import (
	"context"
	"reflect"

	"go.uber.org/mock/gomock"

	"github.com/atsushi-h/subsq/backend/internal/domain/user"
	"github.com/atsushi-h/subsq/backend/internal/port"
)

// MockUserRepository is a mock of port.UserRepository.
type MockUserRepository struct {
	ctrl     *gomock.Controller
	recorder *MockUserRepositoryMockRecorder
}

// MockUserRepositoryMockRecorder records invocations.
type MockUserRepositoryMockRecorder struct {
	mock *MockUserRepository
}

// NewMockUserRepository creates a new mock.
func NewMockUserRepository(ctrl *gomock.Controller) *MockUserRepository {
	mock := &MockUserRepository{ctrl: ctrl}
	mock.recorder = &MockUserRepositoryMockRecorder{mock}
	return mock
}

// EXPECT returns recorder.
func (m *MockUserRepository) EXPECT() *MockUserRepositoryMockRecorder {
	return m.recorder
}

func (m *MockUserRepository) UpsertUser(ctx context.Context, u *user.User) (*user.User, error) {
	m.ctrl.T.Helper()
	ret := m.ctrl.Call(m, "UpsertUser", ctx, u)
	res0, _ := ret[0].(*user.User)
	res1, _ := ret[1].(error)
	return res0, res1
}

func (mr *MockUserRepositoryMockRecorder) UpsertUser(ctx, u any) *gomock.Call {
	mr.mock.ctrl.T.Helper()
	return mr.mock.ctrl.RecordCallWithMethodType(mr.mock, "UpsertUser", reflect.TypeOf((*MockUserRepository)(nil).UpsertUser), ctx, u)
}

func (m *MockUserRepository) FindByID(ctx context.Context, id string) (*user.User, error) {
	m.ctrl.T.Helper()
	ret := m.ctrl.Call(m, "FindByID", ctx, id)
	res0, _ := ret[0].(*user.User)
	res1, _ := ret[1].(error)
	return res0, res1
}

func (mr *MockUserRepositoryMockRecorder) FindByID(ctx, id any) *gomock.Call {
	mr.mock.ctrl.T.Helper()
	return mr.mock.ctrl.RecordCallWithMethodType(mr.mock, "FindByID", reflect.TypeOf((*MockUserRepository)(nil).FindByID), ctx, id)
}

func (m *MockUserRepository) DeleteUser(ctx context.Context, id string) error {
	m.ctrl.T.Helper()
	ret := m.ctrl.Call(m, "DeleteUser", ctx, id)
	res0, _ := ret[0].(error)
	return res0
}

func (mr *MockUserRepositoryMockRecorder) DeleteUser(ctx, id any) *gomock.Call {
	mr.mock.ctrl.T.Helper()
	return mr.mock.ctrl.RecordCallWithMethodType(mr.mock, "DeleteUser", reflect.TypeOf((*MockUserRepository)(nil).DeleteUser), ctx, id)
}

// MockUserOutputPort is a mock of port.UserOutputPort.
type MockUserOutputPort struct {
	ctrl     *gomock.Controller
	recorder *MockUserOutputPortMockRecorder
}

// MockUserOutputPortMockRecorder records invocations.
type MockUserOutputPortMockRecorder struct {
	mock *MockUserOutputPort
}

// NewMockUserOutputPort creates a new mock.
func NewMockUserOutputPort(ctrl *gomock.Controller) *MockUserOutputPort {
	mock := &MockUserOutputPort{ctrl: ctrl}
	mock.recorder = &MockUserOutputPortMockRecorder{mock}
	return mock
}

// EXPECT returns recorder.
func (m *MockUserOutputPort) EXPECT() *MockUserOutputPortMockRecorder {
	return m.recorder
}

func (m *MockUserOutputPort) PresentUser(ctx context.Context, u *user.User) error {
	m.ctrl.T.Helper()
	ret := m.ctrl.Call(m, "PresentUser", ctx, u)
	res0, _ := ret[0].(error)
	return res0
}

func (mr *MockUserOutputPortMockRecorder) PresentUser(ctx, u any) *gomock.Call {
	mr.mock.ctrl.T.Helper()
	return mr.mock.ctrl.RecordCallWithMethodType(mr.mock, "PresentUser", reflect.TypeOf((*MockUserOutputPort)(nil).PresentUser), ctx, u)
}

// Ensure mocks implement the interfaces at compile time.
var _ port.UserRepository = (*MockUserRepository)(nil)
var _ port.UserOutputPort = (*MockUserOutputPort)(nil)
