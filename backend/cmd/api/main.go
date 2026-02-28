package main

import (
	"context"
	"fmt"
	"log"

	initializer "github.com/atsushi-h/subsq/backend/internal/driver/initializer/api"
)

func main() {
	ctx := context.Background()

	e, cfg, cleanup, err := initializer.BuildServer(ctx)
	if err != nil {
		log.Fatalf("failed to build server: %v", err)
	}
	defer cleanup()

	addr := fmt.Sprintf(":%d", cfg.ServerPort)
	log.Printf("Server listening on %s", addr)
	log.Fatal(e.Start(addr))
}
