# -------------------------------------------------------------------
# Config
# -------------------------------------------------------------------

ENV_FILE       ?= .env
MIGRATE        ?= migrate
MIGRATIONS_DIR ?= migrations

GOCACHE        ?= $(CURDIR)/.gocache
GOMODCACHE     ?= $(CURDIR)/.gomodcache
GO_TEST        ?= go test
PKG            ?=
FILE           ?=
RUN            ?=
TEST_FLAGS     ?= -count=1

ifneq (,$(wildcard .env))
include .env
export $(shell grep -E '^[A-Za-z0-9_]+=' .env | cut -d= -f1)
endif

# -------------------------------------------------------------------
# App
# -------------------------------------------------------------------

.PHONY: run
run:
	@go run ./cmd/api

.PHONY: build
build:
	@go build ./...

# -------------------------------------------------------------------
# Test
# -------------------------------------------------------------------

.PHONY: test
test:
	@GOCACHE=$(GOCACHE) GOMODCACHE=$(GOMODCACHE) $(GO_TEST) $(TEST_FLAGS) ./...

# Run package-level tests. Example:
#   make test-pkg PKG=./internal/domain/user
.PHONY: test-pkg
test-pkg:
	@test -n "$(PKG)" || (echo "PKG is required, e.g. make test-pkg PKG=./internal/domain/user"; exit 1)
	@GOCACHE=$(GOCACHE) GOMODCACHE=$(GOMODCACHE) $(GO_TEST) $(TEST_FLAGS) $(PKG)

# Run a single test file. Example:
#   make test-file FILE=internal/domain/user/entity_test.go
.PHONY: test-file
test-file:
	@test -n "$(FILE)" || (echo "FILE is required, e.g. make test-file FILE=internal/domain/user/entity_test.go"; exit 1)
	@dir=$$(dirname $(FILE)); \
	GOCACHE=$(GOCACHE) GOMODCACHE=$(GOMODCACHE) $(GO_TEST) $(TEST_FLAGS) ./$$dir

# Run a specific test (regexp). Example:
#   make test-run PKG=./internal/domain/user RUN=TestValidateUser
.PHONY: test-run
test-run:
	@test -n "$(PKG)" || (echo "PKG is required, e.g. make test-run PKG=./internal/domain/user RUN=TestValidateUser"; exit 1)
	@test -n "$(RUN)" || (echo "RUN is required, e.g. make test-run PKG=./internal/domain/user RUN=TestValidateUser"; exit 1)
	@GOCACHE=$(GOCACHE) GOMODCACHE=$(GOMODCACHE) $(GO_TEST) $(TEST_FLAGS) -run $(RUN) $(PKG)

# -------------------------------------------------------------------
# Migration
# -------------------------------------------------------------------

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

# -------------------------------------------------------------------
# Tools
# -------------------------------------------------------------------

.PHONY: sqlc-gen
sqlc-gen:
	@sqlc generate

# -------------------------------------------------------------------
# Docker
# -------------------------------------------------------------------

.PHONY: docker-up
docker-up:
	docker compose up -d

.PHONY: docker-down
docker-down:
	docker compose down
