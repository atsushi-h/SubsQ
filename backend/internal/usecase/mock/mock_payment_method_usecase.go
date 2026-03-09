package mockusecase

import (
	"context"
	"reflect"

	"go.uber.org/mock/gomock"

	domain "github.com/atsushi-h/subsq/backend/internal/domain/payment_method"
	"github.com/atsushi-h/subsq/backend/internal/port"
)

// MockPaymentMethodRepository is a mock of port.PaymentMethodRepository.
type MockPaymentMethodRepository struct {
	ctrl     *gomock.Controller
	recorder *MockPaymentMethodRepositoryMockRecorder
}

// MockPaymentMethodRepositoryMockRecorder records invocations.
type MockPaymentMethodRepositoryMockRecorder struct {
	mock *MockPaymentMethodRepository
}

// NewMockPaymentMethodRepository creates a new mock.
func NewMockPaymentMethodRepository(ctrl *gomock.Controller) *MockPaymentMethodRepository {
	mock := &MockPaymentMethodRepository{ctrl: ctrl}
	mock.recorder = &MockPaymentMethodRepositoryMockRecorder{mock}
	return mock
}

// EXPECT returns recorder.
func (m *MockPaymentMethodRepository) EXPECT() *MockPaymentMethodRepositoryMockRecorder {
	return m.recorder
}

func (m *MockPaymentMethodRepository) FindByID(ctx context.Context, id, userID string) (*domain.PaymentMethod, error) {
	m.ctrl.T.Helper()
	ret := m.ctrl.Call(m, "FindByID", ctx, id, userID)
	res0, _ := ret[0].(*domain.PaymentMethod)
	res1, _ := ret[1].(error)
	return res0, res1
}

func (mr *MockPaymentMethodRepositoryMockRecorder) FindByID(ctx, id, userID any) *gomock.Call {
	mr.mock.ctrl.T.Helper()
	return mr.mock.ctrl.RecordCallWithMethodType(mr.mock, "FindByID", reflect.TypeOf((*MockPaymentMethodRepository)(nil).FindByID), ctx, id, userID)
}

func (m *MockPaymentMethodRepository) FindByUserID(ctx context.Context, userID string) ([]*domain.PaymentMethod, error) {
	m.ctrl.T.Helper()
	ret := m.ctrl.Call(m, "FindByUserID", ctx, userID)
	res0, _ := ret[0].([]*domain.PaymentMethod)
	res1, _ := ret[1].(error)
	return res0, res1
}

func (mr *MockPaymentMethodRepositoryMockRecorder) FindByUserID(ctx, userID any) *gomock.Call {
	mr.mock.ctrl.T.Helper()
	return mr.mock.ctrl.RecordCallWithMethodType(mr.mock, "FindByUserID", reflect.TypeOf((*MockPaymentMethodRepository)(nil).FindByUserID), ctx, userID)
}

func (m *MockPaymentMethodRepository) FindByUserIDWithCount(ctx context.Context, userID string) ([]*port.PaymentMethodWithCount, error) {
	m.ctrl.T.Helper()
	ret := m.ctrl.Call(m, "FindByUserIDWithCount", ctx, userID)
	res0, _ := ret[0].([]*port.PaymentMethodWithCount)
	res1, _ := ret[1].(error)
	return res0, res1
}

func (mr *MockPaymentMethodRepositoryMockRecorder) FindByUserIDWithCount(ctx, userID any) *gomock.Call {
	mr.mock.ctrl.T.Helper()
	return mr.mock.ctrl.RecordCallWithMethodType(mr.mock, "FindByUserIDWithCount", reflect.TypeOf((*MockPaymentMethodRepository)(nil).FindByUserIDWithCount), ctx, userID)
}

func (m *MockPaymentMethodRepository) Create(ctx context.Context, pm *domain.PaymentMethod) (*domain.PaymentMethod, error) {
	m.ctrl.T.Helper()
	ret := m.ctrl.Call(m, "Create", ctx, pm)
	res0, _ := ret[0].(*domain.PaymentMethod)
	res1, _ := ret[1].(error)
	return res0, res1
}

func (mr *MockPaymentMethodRepositoryMockRecorder) Create(ctx, pm any) *gomock.Call {
	mr.mock.ctrl.T.Helper()
	return mr.mock.ctrl.RecordCallWithMethodType(mr.mock, "Create", reflect.TypeOf((*MockPaymentMethodRepository)(nil).Create), ctx, pm)
}

func (m *MockPaymentMethodRepository) Update(ctx context.Context, pm *domain.PaymentMethod) (*domain.PaymentMethod, error) {
	m.ctrl.T.Helper()
	ret := m.ctrl.Call(m, "Update", ctx, pm)
	res0, _ := ret[0].(*domain.PaymentMethod)
	res1, _ := ret[1].(error)
	return res0, res1
}

func (mr *MockPaymentMethodRepositoryMockRecorder) Update(ctx, pm any) *gomock.Call {
	mr.mock.ctrl.T.Helper()
	return mr.mock.ctrl.RecordCallWithMethodType(mr.mock, "Update", reflect.TypeOf((*MockPaymentMethodRepository)(nil).Update), ctx, pm)
}

func (m *MockPaymentMethodRepository) Delete(ctx context.Context, id, userID string) error {
	m.ctrl.T.Helper()
	ret := m.ctrl.Call(m, "Delete", ctx, id, userID)
	res0, _ := ret[0].(error)
	return res0
}

func (mr *MockPaymentMethodRepositoryMockRecorder) Delete(ctx, id, userID any) *gomock.Call {
	mr.mock.ctrl.T.Helper()
	return mr.mock.ctrl.RecordCallWithMethodType(mr.mock, "Delete", reflect.TypeOf((*MockPaymentMethodRepository)(nil).Delete), ctx, id, userID)
}

func (m *MockPaymentMethodRepository) DeleteMany(ctx context.Context, ids []string, userID string) error {
	m.ctrl.T.Helper()
	ret := m.ctrl.Call(m, "DeleteMany", ctx, ids, userID)
	res0, _ := ret[0].(error)
	return res0
}

func (mr *MockPaymentMethodRepositoryMockRecorder) DeleteMany(ctx, ids, userID any) *gomock.Call {
	mr.mock.ctrl.T.Helper()
	return mr.mock.ctrl.RecordCallWithMethodType(mr.mock, "DeleteMany", reflect.TypeOf((*MockPaymentMethodRepository)(nil).DeleteMany), ctx, ids, userID)
}

func (m *MockPaymentMethodRepository) FindByIDs(ctx context.Context, ids []string, userID string) ([]*domain.PaymentMethod, error) {
	m.ctrl.T.Helper()
	ret := m.ctrl.Call(m, "FindByIDs", ctx, ids, userID)
	res0, _ := ret[0].([]*domain.PaymentMethod)
	res1, _ := ret[1].(error)
	return res0, res1
}

func (mr *MockPaymentMethodRepositoryMockRecorder) FindByIDs(ctx, ids, userID any) *gomock.Call {
	mr.mock.ctrl.T.Helper()
	return mr.mock.ctrl.RecordCallWithMethodType(mr.mock, "FindByIDs", reflect.TypeOf((*MockPaymentMethodRepository)(nil).FindByIDs), ctx, ids, userID)
}

// MockPaymentMethodOutputPort is a mock of port.PaymentMethodOutputPort.
type MockPaymentMethodOutputPort struct {
	ctrl     *gomock.Controller
	recorder *MockPaymentMethodOutputPortMockRecorder
}

// MockPaymentMethodOutputPortMockRecorder records invocations.
type MockPaymentMethodOutputPortMockRecorder struct {
	mock *MockPaymentMethodOutputPort
}

// NewMockPaymentMethodOutputPort creates a new mock.
func NewMockPaymentMethodOutputPort(ctrl *gomock.Controller) *MockPaymentMethodOutputPort {
	mock := &MockPaymentMethodOutputPort{ctrl: ctrl}
	mock.recorder = &MockPaymentMethodOutputPortMockRecorder{mock}
	return mock
}

// EXPECT returns recorder.
func (m *MockPaymentMethodOutputPort) EXPECT() *MockPaymentMethodOutputPortMockRecorder {
	return m.recorder
}

func (m *MockPaymentMethodOutputPort) PresentPaymentMethod(ctx context.Context, pm *domain.PaymentMethod, usageCount int64) error {
	m.ctrl.T.Helper()
	ret := m.ctrl.Call(m, "PresentPaymentMethod", ctx, pm, usageCount)
	res0, _ := ret[0].(error)
	return res0
}

func (mr *MockPaymentMethodOutputPortMockRecorder) PresentPaymentMethod(ctx, pm, usageCount any) *gomock.Call {
	mr.mock.ctrl.T.Helper()
	return mr.mock.ctrl.RecordCallWithMethodType(mr.mock, "PresentPaymentMethod", reflect.TypeOf((*MockPaymentMethodOutputPort)(nil).PresentPaymentMethod), ctx, pm, usageCount)
}

func (m *MockPaymentMethodOutputPort) PresentPaymentMethods(ctx context.Context, pms []*port.PaymentMethodWithCount) error {
	m.ctrl.T.Helper()
	ret := m.ctrl.Call(m, "PresentPaymentMethods", ctx, pms)
	res0, _ := ret[0].(error)
	return res0
}

func (mr *MockPaymentMethodOutputPortMockRecorder) PresentPaymentMethods(ctx, pms any) *gomock.Call {
	mr.mock.ctrl.T.Helper()
	return mr.mock.ctrl.RecordCallWithMethodType(mr.mock, "PresentPaymentMethods", reflect.TypeOf((*MockPaymentMethodOutputPort)(nil).PresentPaymentMethods), ctx, pms)
}

// Ensure mocks implement the interfaces at compile time.
var _ port.PaymentMethodRepository = (*MockPaymentMethodRepository)(nil)
var _ port.PaymentMethodOutputPort = (*MockPaymentMethodOutputPort)(nil)
