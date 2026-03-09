package main

import (
	"context"
	"errors"
	"fmt"
	"log"
	"net/http"
	"os/signal"
	"syscall"
	"time"

	"github.com/labstack/echo/v4"

	initializer "github.com/atsushi-h/subsq/backend/internal/driver/initializer/api"
	"github.com/atsushi-h/subsq/backend/internal/version"
)

func main() {
	ctx, stop := signal.NotifyContext(context.Background(), syscall.SIGINT, syscall.SIGTERM)
	defer stop()

	e, cfg, cleanup, err := initializer.BuildServer(ctx)
	if err != nil {
		log.Fatalf("failed to build server: %v", err)
	}

	errCh := make(chan error, 1)

	go func() {
		addr := fmt.Sprintf(":%d", cfg.ServerPort)
		log.Printf("Server listening on %s (version: %s, commit: %s, built: %s)", addr, version.Version, version.CommitSHA, version.BuildTime)
		if err := e.Start(addr); !errors.Is(err, http.ErrServerClosed) {
			errCh <- err
		}
		close(errCh)
	}()

	select {
	case <-ctx.Done():
		shutdown(e, cleanup)
	case err := <-errCh:
		if err != nil {
			cleanup()
			log.Fatalf("server error: %v", err)
		}
	}
}

func shutdown(e *echo.Echo, cleanup func()) {
	log.Println("Shutting down server...")

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	if err := e.Shutdown(ctx); err != nil {
		log.Printf("server shutdown error: %v", err)
	}

	cleanup()
	log.Println("Server stopped")
}
