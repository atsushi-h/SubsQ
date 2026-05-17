package middleware

import (
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/labstack/echo/v4"
)

func TestAdminAuth(t *testing.T) {
	t.Parallel()

	const validKey = "secret-admin-key"

	okHandler := func(c echo.Context) error {
		return c.String(http.StatusOK, "ok")
	}

	tests := []struct {
		name       string
		adminKey   string
		headerVal  string
		wantStatus int
	}{
		{
			name:       "正しいトークンで通過する",
			adminKey:   validKey,
			headerVal:  validKey,
			wantStatus: http.StatusOK,
		},
		{
			name:       "誤ったトークンで 401 を返す",
			adminKey:   validKey,
			headerVal:  "wrong-key",
			wantStatus: http.StatusUnauthorized,
		},
		{
			name:       "トークンヘッダなしで 401 を返す",
			adminKey:   validKey,
			headerVal:  "",
			wantStatus: http.StatusUnauthorized,
		},
		{
			name:       "adminKey が空の場合は正しいトークンを送っても 401 を返す",
			adminKey:   "",
			headerVal:  validKey,
			wantStatus: http.StatusUnauthorized,
		},
		{
			name:       "adminKey が空でトークンも空の場合も 401 を返す",
			adminKey:   "",
			headerVal:  "",
			wantStatus: http.StatusUnauthorized,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			e := echo.New()
			e.POST("/test", okHandler, AdminAuth(tt.adminKey))

			req := httptest.NewRequest(http.MethodPost, "/test", nil)
			if tt.headerVal != "" {
				req.Header.Set("X-Admin-Token", tt.headerVal)
			}
			rec := httptest.NewRecorder()
			e.ServeHTTP(rec, req)

			if rec.Code != tt.wantStatus {
				t.Errorf("status = %d, want %d", rec.Code, tt.wantStatus)
			}
		})
	}
}
