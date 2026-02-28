package config                                                              
														
import (                                                                    
	"errors"
	"os"                                                                  
	"strconv"                                                             
	"strings"                                                             
)                                                                           

type Config struct {
	DatabaseURL    string
	ServerPort     int
	AllowedOrigins []string

	// JWT
	JWTSecret string

	// Google OAuth
	GoogleClientID     string
	GoogleClientSecret string
	GoogleRedirectURL  string

	// Frontend
	FrontendURL string
}

func Load() (*Config, error) {
	dbURL := os.Getenv("DATABASE_URL")
	if dbURL == "" {
		return nil, errors.New("DATABASE_URL is not set")
	}

	jwtSecret := os.Getenv("JWT_SECRET")
	if jwtSecret == "" {
		return nil, errors.New("JWT_SECRET is not set")
	}

	googleClientID := os.Getenv("GOOGLE_CLIENT_ID")
	if googleClientID == "" {
		return nil, errors.New("GOOGLE_CLIENT_ID is not set")
	}

	googleClientSecret := os.Getenv("GOOGLE_CLIENT_SECRET")
	if googleClientSecret == "" {
		return nil, errors.New("GOOGLE_CLIENT_SECRET is not set")
	}

	googleRedirectURL := os.Getenv("GOOGLE_REDIRECT_URL")
	if googleRedirectURL == "" {
		return nil, errors.New("GOOGLE_REDIRECT_URL is not set")
	}

	frontendURL := os.Getenv("FRONTEND_URL")
	if frontendURL == "" {
		return nil, errors.New("FRONTEND_URL is not set")
	}

	port := 8080
	if portStr := os.Getenv("API_PORT"); portStr != "" {
		parsedPort, err := strconv.Atoi(portStr)
		if err != nil {
			return nil, errors.New("API_PORT must be a valid integer")
		}
		port = parsedPort
	}

	origins := parseAllowedOrigins(os.Getenv("CLIENT_ORIGIN"))

	return &Config{
		DatabaseURL:        dbURL,
		ServerPort:         port,
		AllowedOrigins:     origins,
		JWTSecret:          jwtSecret,
		GoogleClientID:     googleClientID,
		GoogleClientSecret: googleClientSecret,
		GoogleRedirectURL:  googleRedirectURL,
		FrontendURL:        frontendURL,
	}, nil
}

func parseAllowedOrigins(fromEnv string) []string {
	if strings.TrimSpace(fromEnv) == "" {
		return []string{"http://localhost:3000", "http://127.0.0.1:3000"}
	}

	parts := strings.Split(fromEnv, ",")
	origins := make([]string, 0, len(parts))
	for _, p := range parts {
		if trimmed := strings.TrimSpace(p); trimmed != "" {
			origins = append(origins, trimmed)
		}
	}

	if len(origins) == 0 {
		return []string{"http://localhost:3000", "http://127.0.0.1:3000"}
	}

	return origins
}
