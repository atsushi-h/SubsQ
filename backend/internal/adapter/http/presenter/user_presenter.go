// Package presenter contains HTTP presenters that implement output ports.
package presenter

import (
	"context"
	"fmt"

	"github.com/google/uuid"
	openapi_types "github.com/oapi-codegen/runtime/types"

	openapi "github.com/atsushi-h/subsq/backend/internal/adapter/http/generated/openapi"
	"github.com/atsushi-h/subsq/backend/internal/domain/user"
	"github.com/atsushi-h/subsq/backend/internal/port"
)

// UserPresenter converts domain users to OpenAPI responses.
type UserPresenter struct {
	response *openapi.ModelsUserResponse
}

var _ port.UserOutputPort = (*UserPresenter)(nil)

// NewUserPresenter creates a new UserPresenter.
func NewUserPresenter() *UserPresenter {
	return &UserPresenter{}
}

// PresentUser stores a converted user response.
func (p *UserPresenter) PresentUser(_ context.Context, u *user.User) error {
	id, err := uuid.Parse(u.ID)
	if err != nil {
		return fmt.Errorf("invalid user id %q: %w", u.ID, err)
	}
	resp := openapi.ModelsUserResponse{
		Id:                id,
		Name:              u.Name,
		Provider:          u.Provider,
		ProviderAccountId: u.ProviderAccountID,
		CreatedAt:         u.CreatedAt.UTC(),
		UpdatedAt:         u.UpdatedAt.UTC(),
		Thumbnail:         u.Thumbnail,
		Email:             openapi_types.Email(u.Email.String()),
	}
	p.response = &resp
	return nil
}

// Response returns the stored user response.
func (p *UserPresenter) Response() *openapi.ModelsUserResponse {
	return p.response
}
