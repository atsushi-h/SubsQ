package config_test

import (
	"os"
	"testing"

	"github.com/atsushi-h/subsq/backend/internal/driver/config"
)

func TestLoad(t *testing.T) {
	requiredEnvVars := map[string]string{
		"DATABASE_URL":         "postgres://user:pass@localhost:5432/db",
		"JWT_SECRET":           "test-jwt-secret",
		"GOOGLE_CLIENT_ID":     "test-client-id",
		"GOOGLE_CLIENT_SECRET": "test-client-secret",
		"GOOGLE_REDIRECT_URL":  "http://localhost:8080/auth/callback",
		"FRONTEND_URL":         "http://localhost:3000",
	}

	tests := []struct {
		name       string
		envVars    map[string]string
		wantErr    bool
		wantPort   int
		wantOrigin int
	}{
		{
			name: "[Success] 全必須変数 + カスタムポート + カスタムorigin",
			envVars: func() map[string]string {
				m := map[string]string{"API_PORT": "9090", "CLIENT_ORIGIN": "http://example.com,http://test.com"}
				for k, v := range requiredEnvVars {
					m[k] = v
				}
				return m
			}(),
			wantPort:   9090,
			wantOrigin: 2,
		},
		{
			name:       "[Success] 必須変数のみ（API_PORT/CLIENT_ORIGINはデフォルト）",
			envVars:    requiredEnvVars,
			wantPort:   8080,
			wantOrigin: 2,
		},
		{
			name: "[Success] CLIENT_ORIGINのスペースを除去",
			envVars: func() map[string]string {
				m := map[string]string{"CLIENT_ORIGIN": " http://example.com , http://test.com "}
				for k, v := range requiredEnvVars {
					m[k] = v
				}
				return m
			}(),
			wantPort:   8080,
			wantOrigin: 2,
		},
		{
			name: "[Fail] DATABASE_URLが未設定",
			envVars: map[string]string{
				"JWT_SECRET":           "test-jwt-secret",
				"GOOGLE_CLIENT_ID":     "test-client-id",
				"GOOGLE_CLIENT_SECRET": "test-client-secret",
				"GOOGLE_REDIRECT_URL":  "http://localhost:8080/auth/callback",
				"FRONTEND_URL":         "http://localhost:3000",
			},
			wantErr: true,
		},
		{
			name: "[Fail] API_PORTが無効な値",
			envVars: func() map[string]string {
				m := map[string]string{"API_PORT": "not-a-number"}
				for k, v := range requiredEnvVars {
					m[k] = v
				}
				return m
			}(),
			wantErr: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			os.Clearenv()
			for k, v := range tt.envVars {
				os.Setenv(k, v)
			}

			cfg, err := config.Load()

			if tt.wantErr {
				if err == nil {
					t.Fatal("expected error but got nil")
				}
				return
			}

			if err != nil {
				t.Fatalf("unexpected error: %v", err)
			}

			if cfg.ServerPort != tt.wantPort {
				t.Errorf("ServerPort = %d, want %d", cfg.ServerPort, tt.wantPort)
			}

			if len(cfg.AllowedOrigins) != tt.wantOrigin {
				t.Errorf("len(AllowedOrigins) = %d, want %d", len(cfg.AllowedOrigins), tt.wantOrigin)
			}
		})
	}
}

func TestLoad_DefaultOrigins(t *testing.T) {
	os.Clearenv()
	os.Setenv("DATABASE_URL", "postgres://user:pass@localhost:5432/db")
	os.Setenv("JWT_SECRET", "test-jwt-secret")
	os.Setenv("GOOGLE_CLIENT_ID", "test-client-id")
	os.Setenv("GOOGLE_CLIENT_SECRET", "test-client-secret")
	os.Setenv("GOOGLE_REDIRECT_URL", "http://localhost:8080/auth/callback")
	os.Setenv("FRONTEND_URL", "http://localhost:3000")

	cfg, err := config.Load()
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	expectedOrigins := []string{"http://localhost:3000", "http://127.0.0.1:3000"}
	if len(cfg.AllowedOrigins) != len(expectedOrigins) {
		t.Fatalf("expected %d origins, got %d", len(expectedOrigins), len(cfg.AllowedOrigins))
	}

	for i, origin := range expectedOrigins {
		if cfg.AllowedOrigins[i] != origin {
			t.Errorf("AllowedOrigins[%d] = %q, want %q", i, cfg.AllowedOrigins[i], origin)
		}
	}
}
