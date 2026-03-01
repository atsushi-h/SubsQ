# -------------------------------------------------------------------
# Config
# -------------------------------------------------------------------

BACKEND_CONTAINER_NAME ?= subsq-backend

ENV_FILE       ?= .env
MIGRATE        ?= migrate
MIGRATIONS_DIR ?= migrations

PKG        ?=
FILE       ?=
RUN        ?=
NAME       ?=
TEST_FLAGS ?= -count=1

ifneq (,$(wildcard .env))
include .env
export $(shell grep -E '^[A-Za-z0-9_]+=' .env | cut -d= -f1)
endif

DOCKER_EXEC := docker exec -i $(BACKEND_CONTAINER_NAME)

# -------------------------------------------------------------------
# App
# -------------------------------------------------------------------

.PHONY: run
run:
	$(DOCKER_EXEC) go run ./cmd/api

.PHONY: build
build:
	$(DOCKER_EXEC) go build ./...

# -------------------------------------------------------------------
# Test
# -------------------------------------------------------------------

.PHONY: test
test:
	$(DOCKER_EXEC) go test $(TEST_FLAGS) ./...

# Run package-level tests. Example:
#   make test-pkg PKG=./internal/domain/user
.PHONY: test-pkg
test-pkg:
	@test -n "$(PKG)" || (echo "PKG is required, e.g. make test-pkg PKG=./internal/domain/user"; exit 1)
	$(DOCKER_EXEC) go test $(TEST_FLAGS) $(PKG)

# Run a single test file. Example:
#   make test-file FILE=internal/domain/user/entity_test.go
.PHONY: test-file
test-file:
	@test -n "$(FILE)" || (echo "FILE is required, e.g. make test-file FILE=internal/domain/user/entity_test.go"; exit 1)
	@dir=$$(dirname $(FILE)); \
	$(DOCKER_EXEC) go test $(TEST_FLAGS) ./$$dir

# Run a specific test (regexp). Example:
#   make test-run PKG=./internal/domain/user RUN=TestValidateUser
.PHONY: test-run
test-run:
	@test -n "$(PKG)" || (echo "PKG is required, e.g. make test-run PKG=./internal/domain/user RUN=TestValidateUser"; exit 1)
	@test -n "$(RUN)" || (echo "RUN is required, e.g. make test-run PKG=./internal/domain/user RUN=TestValidateUser"; exit 1)
	$(DOCKER_EXEC) go test $(TEST_FLAGS) -run $(RUN) $(PKG)

# -------------------------------------------------------------------
# Migration
# -------------------------------------------------------------------

.PHONY: migrate-up
migrate-up:
	$(DOCKER_EXEC) $(MIGRATE) -path $(MIGRATIONS_DIR) -database "$(DATABASE_URL)" up

.PHONY: migrate-down
migrate-down:
	$(DOCKER_EXEC) $(MIGRATE) -path $(MIGRATIONS_DIR) -database "$(DATABASE_URL)" down 1

.PHONY: migrate-new
migrate-new:
	@test -n "$(NAME)" || (echo "NAME is required, e.g. make migrate-new NAME=add_users"; exit 1)
	$(DOCKER_EXEC) $(MIGRATE) create -ext sql -dir $(MIGRATIONS_DIR) $(NAME)

# -------------------------------------------------------------------
# Tools
# -------------------------------------------------------------------

.PHONY: fmt
fmt:
	$(DOCKER_EXEC) golangci-lint run --fix --enable-only gofumpt ./...

.PHONY: lint
lint:
	$(DOCKER_EXEC) golangci-lint run ./...

.PHONY: sqlc-gen
sqlc-gen:
	$(DOCKER_EXEC) sqlc generate

# -------------------------------------------------------------------
# Docker
# -------------------------------------------------------------------

.PHONY: docker-build
docker-build:
	docker compose -f ../compose.yml build

.PHONY: docker-up
docker-up:
	docker compose -f ../compose.yml up -d

.PHONY: docker-down
docker-down:
	docker compose -f ../compose.yml down

.PHONY: ssh
ssh:
	docker exec -it $(BACKEND_CONTAINER_NAME) sh
