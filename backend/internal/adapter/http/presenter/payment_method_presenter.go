// Package presenter contains HTTP presenters that implement output ports.
package presenter

import (
	"context"
	"fmt"

	"github.com/google/uuid"

	openapi "github.com/atsushi-h/subsq/backend/internal/adapter/http/generated/openapi"
	domain "github.com/atsushi-h/subsq/backend/internal/domain/payment_method"
	"github.com/atsushi-h/subsq/backend/internal/port"
)

// PaymentMethodPresenter converts domain payment methods to OpenAPI responses.
type PaymentMethodPresenter struct {
	response     *openapi.ModelsPaymentMethodResponse
	listResponse *[]openapi.ModelsPaymentMethodResponse
}

var _ port.PaymentMethodOutputPort = (*PaymentMethodPresenter)(nil)

// NewPaymentMethodPresenter creates a new PaymentMethodPresenter.
func NewPaymentMethodPresenter() *PaymentMethodPresenter {
	return &PaymentMethodPresenter{}
}

// PresentPaymentMethod stores a converted single payment method response.
func (p *PaymentMethodPresenter) PresentPaymentMethod(_ context.Context, pm *domain.PaymentMethod, usageCount int64) error {
	resp, err := toPaymentMethodResponse(pm, usageCount)
	if err != nil {
		return err
	}
	p.response = &resp
	return nil
}

// PresentPaymentMethods stores a converted payment method list response.
func (p *PaymentMethodPresenter) PresentPaymentMethods(_ context.Context, pms []*port.PaymentMethodWithCount) error {
	items := make([]openapi.ModelsPaymentMethodResponse, 0, len(pms))
	for _, pmwc := range pms {
		item, err := toPaymentMethodResponse(pmwc.PaymentMethod, pmwc.UsageCount)
		if err != nil {
			return err
		}
		items = append(items, item)
	}
	p.listResponse = &items
	return nil
}

// Response returns the stored single payment method response.
func (p *PaymentMethodPresenter) Response() *openapi.ModelsPaymentMethodResponse {
	return p.response
}

// ListResponse returns the stored payment method list response.
func (p *PaymentMethodPresenter) ListResponse() *[]openapi.ModelsPaymentMethodResponse {
	return p.listResponse
}

func toPaymentMethodResponse(pm *domain.PaymentMethod, usageCount int64) (openapi.ModelsPaymentMethodResponse, error) {
	id, err := uuid.Parse(pm.ID)
	if err != nil {
		return openapi.ModelsPaymentMethodResponse{}, fmt.Errorf("invalid payment_method id %q: %w", pm.ID, err)
	}
	userID, err := uuid.Parse(pm.UserID)
	if err != nil {
		return openapi.ModelsPaymentMethodResponse{}, fmt.Errorf("invalid user id %q: %w", pm.UserID, err)
	}
	return openapi.ModelsPaymentMethodResponse{
		Id:         id,
		UserId:     userID,
		Name:       pm.Name,
		CreatedAt:  pm.CreatedAt.UTC(),
		UpdatedAt:  pm.UpdatedAt.UTC(),
		UsageCount: int32(usageCount),
	}, nil
}
