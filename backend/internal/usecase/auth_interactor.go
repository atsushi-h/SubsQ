package usecase

import (
	"context"
	"crypto/rand"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/oauth2"

	"github.com/atsushi-h/subsq/backend/internal/domain/user"
	"github.com/atsushi-h/subsq/backend/internal/port"
)

type Claims struct {
	UserID string `json:"sub"`
	Email  string `json:"email"`
	Name   string `json:"name"`
	jwt.RegisteredClaims
}

type AuthInteractor struct {
	userRepo    port.UserRepository
	oauthConfig *oauth2.Config
	jwtSecret   string
}

func NewAuthInteractor(
	userRepo port.UserRepository,
	oauthConfig *oauth2.Config,
	jwtSecret string,
) *AuthInteractor {
	return &AuthInteractor{
		userRepo:    userRepo,
		oauthConfig: oauthConfig,
		jwtSecret:   jwtSecret,
	}
}

func (a *AuthInteractor) GenerateOAuthURL() (string, string, error) {
	b := make([]byte, 32)
	if _, err := rand.Read(b); err != nil {
		return "", "", fmt.Errorf("failed to generate state: %w", err)
	}
	state := base64.URLEncoding.EncodeToString(b)
	url := a.oauthConfig.AuthCodeURL(state, oauth2.AccessTypeOnline)
	return url, state, nil
}

type googleUserInfo struct {
	ID      string `json:"id"`
	Email   string `json:"email"`
	Name    string `json:"name"`
	Picture string `json:"picture"`
}

func (a *AuthInteractor) HandleCallback(
	ctx context.Context,
	code, state, expectedState string,
) (string, *user.User, error) {
	if state != expectedState {
		return "", nil, fmt.Errorf("invalid oauth state")
	}

	token, err := a.oauthConfig.Exchange(ctx, code)
	if err != nil {
		return "", nil, fmt.Errorf("failed to exchange token: %w", err)
	}

	client := a.oauthConfig.Client(ctx, token)
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, "https://www.googleapis.com/oauth2/v2/userinfo", nil)
	if err != nil {
		return "", nil, fmt.Errorf("failed to create userinfo request: %w", err)
	}
	resp, err := client.Do(req)
	if err != nil {
		return "", nil, fmt.Errorf("failed to get user info: %w", err)
	}
	defer func() { _ = resp.Body.Close() }() //nolint:errcheck // body is already read, close error is not actionable

	if resp.StatusCode != http.StatusOK {
		return "", nil, fmt.Errorf("userinfo request failed with status: %d", resp.StatusCode)
	}

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return "", nil, fmt.Errorf("failed to read user info: %w", err)
	}

	var googleUser googleUserInfo
	if err := json.Unmarshal(body, &googleUser); err != nil {
		return "", nil, fmt.Errorf("failed to parse user info: %w", err)
	}

	var thumbnail *string
	if googleUser.Picture != "" {
		thumbnail = &googleUser.Picture
	}

	u := &user.User{
		Email:             user.Email(googleUser.Email),
		Name:              googleUser.Name,
		Provider:          "google",
		ProviderAccountID: googleUser.ID,
		Thumbnail:         thumbnail,
	}

	savedUser, err := a.userRepo.UpsertUser(ctx, u)
	if err != nil {
		return "", nil, fmt.Errorf("failed to upsert user: %w", err)
	}

	jwtToken, err := a.generateJWT(savedUser)
	if err != nil {
		return "", nil, fmt.Errorf("failed to generate jwt: %w", err)
	}

	return jwtToken, savedUser, nil
}

func (a *AuthInteractor) generateJWT(u *user.User) (string, error) {
	claims := Claims{
		UserID: u.ID,
		Email:  u.Email.String(),
		Name:   u.Name,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(30 * 24 * time.Hour)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(a.jwtSecret))
}
