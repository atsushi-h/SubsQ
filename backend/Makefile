ENV_FILE ?= .env
MIGRATE ?= migrate
MIGRATIONS_DIR ?= migrations

ifneq (,$(wildcard .env))
include .env
export $(shell grep -E '^[A-Za-z0-9_]+=' .env | cut -d= -f1)
endif

.PHONY: run
run:
	@go run ./cmd/api

.PHONY: build
build:
	@go build ./...

.PHONY: migrate-up
migrate-up:
	@bash -c 'set -a; if [ -f $(ENV_FILE) ]; then source $(ENV_FILE); fi; set +a; \
	if [ -z "$$DATABASE_URL" ]; then echo "Set DATABASE_URL in $(ENV_FILE) or environment"; exit 1; fi; \
	"$(MIGRATE)" -path "$(MIGRATIONS_DIR)" -database "$$DATABASE_URL" up'

.PHONY: migrate-down
migrate-down:
	@bash -c 'set -a; if [ -f $(ENV_FILE) ]; then source $(ENV_FILE); fi; set +a; \
	if [ -z "$$DATABASE_URL" ]; then echo "Set DATABASE_URL in $(ENV_FILE) or environment"; exit 1; fi; \
	"$(MIGRATE)" -path "$(MIGRATIONS_DIR)" -database "$$DATABASE_URL" down 1'

.PHONY: migrate-new
migrate-new:
	@test -n "$(NAME)" || (echo "NAME is required, e.g. make migrate-new NAME=add_users"; exit 1)
	$(MIGRATE) create -ext sql -dir $(MIGRATIONS_DIR) $(NAME)

.PHONY: sqlc-gen
sqlc-gen:
	@sqlc generate

.PHONY: docker-up
docker-up:
	docker compose up -d

.PHONY: docker-down
docker-down:
	docker compose down
