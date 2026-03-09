package mockusecase

import (
	"context"
	"reflect"

	"go.uber.org/mock/gomock"

	domain "github.com/atsushi-h/subsq/backend/internal/domain/subscription"
	"github.com/atsushi-h/subsq/backend/internal/port"
)

// MockSubscriptionRepository is a mock of port.SubscriptionRepository.
type MockSubscriptionRepository struct {
	ctrl     *gomock.Controller
	recorder *MockSubscriptionRepositoryMockRecorder
}

// MockSubscriptionRepositoryMockRecorder records invocations.
type MockSubscriptionRepositoryMockRecorder struct {
	mock *MockSubscriptionRepository
}

// NewMockSubscriptionRepository creates a new mock.
func NewMockSubscriptionRepository(ctrl *gomock.Controller) *MockSubscriptionRepository {
	mock := &MockSubscriptionRepository{ctrl: ctrl}
	mock.recorder = &MockSubscriptionRepositoryMockRecorder{mock}
	return mock
}

// EXPECT returns recorder.
func (m *MockSubscriptionRepository) EXPECT() *MockSubscriptionRepositoryMockRecorder {
	return m.recorder
}

func (m *MockSubscriptionRepository) FindByID(ctx context.Context, id, userID string) (*domain.Subscription, error) {
	m.ctrl.T.Helper()
	ret := m.ctrl.Call(m, "FindByID", ctx, id, userID)
	res0, _ := ret[0].(*domain.Subscription)
	res1, _ := ret[1].(error)
	return res0, res1
}

func (mr *MockSubscriptionRepositoryMockRecorder) FindByID(ctx, id, userID any) *gomock.Call {
	mr.mock.ctrl.T.Helper()
	return mr.mock.ctrl.RecordCallWithMethodType(mr.mock, "FindByID", reflect.TypeOf((*MockSubscriptionRepository)(nil).FindByID), ctx, id, userID)
}

func (m *MockSubscriptionRepository) FindByUserID(ctx context.Context, userID string) ([]*domain.Subscription, error) {
	m.ctrl.T.Helper()
	ret := m.ctrl.Call(m, "FindByUserID", ctx, userID)
	res0, _ := ret[0].([]*domain.Subscription)
	res1, _ := ret[1].(error)
	return res0, res1
}

func (mr *MockSubscriptionRepositoryMockRecorder) FindByUserID(ctx, userID any) *gomock.Call {
	mr.mock.ctrl.T.Helper()
	return mr.mock.ctrl.RecordCallWithMethodType(mr.mock, "FindByUserID", reflect.TypeOf((*MockSubscriptionRepository)(nil).FindByUserID), ctx, userID)
}

func (m *MockSubscriptionRepository) Create(ctx context.Context, s *domain.Subscription) (*domain.Subscription, error) {
	m.ctrl.T.Helper()
	ret := m.ctrl.Call(m, "Create", ctx, s)
	res0, _ := ret[0].(*domain.Subscription)
	res1, _ := ret[1].(error)
	return res0, res1
}

func (mr *MockSubscriptionRepositoryMockRecorder) Create(ctx, s any) *gomock.Call {
	mr.mock.ctrl.T.Helper()
	return mr.mock.ctrl.RecordCallWithMethodType(mr.mock, "Create", reflect.TypeOf((*MockSubscriptionRepository)(nil).Create), ctx, s)
}

func (m *MockSubscriptionRepository) Update(ctx context.Context, s *domain.Subscription) (*domain.Subscription, error) {
	m.ctrl.T.Helper()
	ret := m.ctrl.Call(m, "Update", ctx, s)
	res0, _ := ret[0].(*domain.Subscription)
	res1, _ := ret[1].(error)
	return res0, res1
}

func (mr *MockSubscriptionRepositoryMockRecorder) Update(ctx, s any) *gomock.Call {
	mr.mock.ctrl.T.Helper()
	return mr.mock.ctrl.RecordCallWithMethodType(mr.mock, "Update", reflect.TypeOf((*MockSubscriptionRepository)(nil).Update), ctx, s)
}

func (m *MockSubscriptionRepository) Delete(ctx context.Context, id, userID string) error {
	m.ctrl.T.Helper()
	ret := m.ctrl.Call(m, "Delete", ctx, id, userID)
	res0, _ := ret[0].(error)
	return res0
}

func (mr *MockSubscriptionRepositoryMockRecorder) Delete(ctx, id, userID any) *gomock.Call {
	mr.mock.ctrl.T.Helper()
	return mr.mock.ctrl.RecordCallWithMethodType(mr.mock, "Delete", reflect.TypeOf((*MockSubscriptionRepository)(nil).Delete), ctx, id, userID)
}

func (m *MockSubscriptionRepository) DeleteMany(ctx context.Context, ids []string, userID string) error {
	m.ctrl.T.Helper()
	ret := m.ctrl.Call(m, "DeleteMany", ctx, ids, userID)
	res0, _ := ret[0].(error)
	return res0
}

func (mr *MockSubscriptionRepositoryMockRecorder) DeleteMany(ctx, ids, userID any) *gomock.Call {
	mr.mock.ctrl.T.Helper()
	return mr.mock.ctrl.RecordCallWithMethodType(mr.mock, "DeleteMany", reflect.TypeOf((*MockSubscriptionRepository)(nil).DeleteMany), ctx, ids, userID)
}

func (m *MockSubscriptionRepository) FindByIDs(ctx context.Context, ids []string, userID string) ([]*domain.Subscription, error) {
	m.ctrl.T.Helper()
	ret := m.ctrl.Call(m, "FindByIDs", ctx, ids, userID)
	res0, _ := ret[0].([]*domain.Subscription)
	res1, _ := ret[1].(error)
	return res0, res1
}

func (mr *MockSubscriptionRepositoryMockRecorder) FindByIDs(ctx, ids, userID any) *gomock.Call {
	mr.mock.ctrl.T.Helper()
	return mr.mock.ctrl.RecordCallWithMethodType(mr.mock, "FindByIDs", reflect.TypeOf((*MockSubscriptionRepository)(nil).FindByIDs), ctx, ids, userID)
}

func (m *MockSubscriptionRepository) CountByPaymentMethodID(ctx context.Context, pmID string) (int64, error) {
	m.ctrl.T.Helper()
	ret := m.ctrl.Call(m, "CountByPaymentMethodID", ctx, pmID)
	res0, _ := ret[0].(int64)
	res1, _ := ret[1].(error)
	return res0, res1
}

func (mr *MockSubscriptionRepositoryMockRecorder) CountByPaymentMethodID(ctx, pmID any) *gomock.Call {
	mr.mock.ctrl.T.Helper()
	return mr.mock.ctrl.RecordCallWithMethodType(mr.mock, "CountByPaymentMethodID", reflect.TypeOf((*MockSubscriptionRepository)(nil).CountByPaymentMethodID), ctx, pmID)
}

func (m *MockSubscriptionRepository) CountByPaymentMethodIDs(ctx context.Context, ids []string) (int64, error) {
	m.ctrl.T.Helper()
	ret := m.ctrl.Call(m, "CountByPaymentMethodIDs", ctx, ids)
	res0, _ := ret[0].(int64)
	res1, _ := ret[1].(error)
	return res0, res1
}

func (mr *MockSubscriptionRepositoryMockRecorder) CountByPaymentMethodIDs(ctx, ids any) *gomock.Call {
	mr.mock.ctrl.T.Helper()
	return mr.mock.ctrl.RecordCallWithMethodType(mr.mock, "CountByPaymentMethodIDs", reflect.TypeOf((*MockSubscriptionRepository)(nil).CountByPaymentMethodIDs), ctx, ids)
}

// MockSubscriptionOutputPort is a mock of port.SubscriptionOutputPort.
type MockSubscriptionOutputPort struct {
	ctrl     *gomock.Controller
	recorder *MockSubscriptionOutputPortMockRecorder
}

// MockSubscriptionOutputPortMockRecorder records invocations.
type MockSubscriptionOutputPortMockRecorder struct {
	mock *MockSubscriptionOutputPort
}

// NewMockSubscriptionOutputPort creates a new mock.
func NewMockSubscriptionOutputPort(ctrl *gomock.Controller) *MockSubscriptionOutputPort {
	mock := &MockSubscriptionOutputPort{ctrl: ctrl}
	mock.recorder = &MockSubscriptionOutputPortMockRecorder{mock}
	return mock
}

// EXPECT returns recorder.
func (m *MockSubscriptionOutputPort) EXPECT() *MockSubscriptionOutputPortMockRecorder {
	return m.recorder
}

func (m *MockSubscriptionOutputPort) PresentSubscription(ctx context.Context, sub *domain.Subscription) error {
	m.ctrl.T.Helper()
	ret := m.ctrl.Call(m, "PresentSubscription", ctx, sub)
	res0, _ := ret[0].(error)
	return res0
}

func (mr *MockSubscriptionOutputPortMockRecorder) PresentSubscription(ctx, sub any) *gomock.Call {
	mr.mock.ctrl.T.Helper()
	return mr.mock.ctrl.RecordCallWithMethodType(mr.mock, "PresentSubscription", reflect.TypeOf((*MockSubscriptionOutputPort)(nil).PresentSubscription), ctx, sub)
}

func (m *MockSubscriptionOutputPort) PresentSubscriptions(ctx context.Context, subs []*domain.Subscription) error {
	m.ctrl.T.Helper()
	ret := m.ctrl.Call(m, "PresentSubscriptions", ctx, subs)
	res0, _ := ret[0].(error)
	return res0
}

func (mr *MockSubscriptionOutputPortMockRecorder) PresentSubscriptions(ctx, subs any) *gomock.Call {
	mr.mock.ctrl.T.Helper()
	return mr.mock.ctrl.RecordCallWithMethodType(mr.mock, "PresentSubscriptions", reflect.TypeOf((*MockSubscriptionOutputPort)(nil).PresentSubscriptions), ctx, subs)
}

// Ensure mock implements the interface at compile time.
var (
	_ port.SubscriptionRepository = (*MockSubscriptionRepository)(nil)
	_ port.SubscriptionOutputPort = (*MockSubscriptionOutputPort)(nil)
)
