package middleware

import (
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/labstack/echo/v4"

	"github.com/atsushi-h/subsq/backend/internal/usecase"
)

const testJWTSecret = "test-secret"

func makeJWT(t *testing.T, userID, secret string, expiry time.Time) string {
	t.Helper()
	claims := &usecase.Claims{
		UserID: userID,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(expiry),
		},
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	signed, err := token.SignedString([]byte(secret))
	if err != nil {
		t.Fatalf("makeJWT: %v", err)
	}
	return signed
}

func TestJWTAuth(t *testing.T) {
	t.Parallel()

	tests := []struct {
		name       string
		cookie     *http.Cookie
		wantStatus int
		wantUserID string
	}{
		{
			name:       "Cookie なしで 401",
			cookie:     nil,
			wantStatus: http.StatusUnauthorized,
		},
		{
			name:       "不正な JWT で 401",
			cookie:     &http.Cookie{Name: "subsq_token", Value: "invalid.token.value"},
			wantStatus: http.StatusUnauthorized,
		},
		{
			name: "別の secret で署名された JWT で 401",
			cookie: &http.Cookie{
				Name:  "subsq_token",
				Value: makeJWT(t, "user-1", "wrong-secret", time.Now().Add(time.Hour)),
			},
			wantStatus: http.StatusUnauthorized,
		},
		{
			name: "期限切れ JWT で 401",
			cookie: &http.Cookie{
				Name:  "subsq_token",
				Value: makeJWT(t, "user-1", testJWTSecret, time.Now().Add(-time.Hour)),
			},
			wantStatus: http.StatusUnauthorized,
		},
		{
			name: "有効な JWT で通過し UserIDKey がセットされる",
			cookie: &http.Cookie{
				Name:  "subsq_token",
				Value: makeJWT(t, "user-1", testJWTSecret, time.Now().Add(time.Hour)),
			},
			wantStatus: http.StatusOK,
			wantUserID: "user-1",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			var gotUserID string
			okHandler := func(c echo.Context) error {
				gotUserID = c.Get(UserIDKey).(string) //nolint:errcheck // テストで型が保証されている
				return c.String(http.StatusOK, "ok")
			}

			e := echo.New()
			e.GET("/test", okHandler, JWTAuth(testJWTSecret))

			req := httptest.NewRequest(http.MethodGet, "/test", nil)
			if tt.cookie != nil {
				req.AddCookie(tt.cookie)
			}
			rec := httptest.NewRecorder()
			e.ServeHTTP(rec, req)

			if rec.Code != tt.wantStatus {
				t.Errorf("status = %d, want %d", rec.Code, tt.wantStatus)
			}
			if tt.wantUserID != "" && gotUserID != tt.wantUserID {
				t.Errorf("userID = %q, want %q", gotUserID, tt.wantUserID)
			}
		})
	}
}
