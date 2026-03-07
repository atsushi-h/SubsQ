# syntax=docker.io/docker/dockerfile:1

# ===========================
# Builder
# ===========================
FROM golang:1.26.1-alpine3.23 AS builder

ARG VERSION=dev
ARG COMMIT_SHA=unknown
ARG BUILD_TIME=unknown

WORKDIR /app

# 依存関係をコピー（キャッシュ最適化）
COPY go.mod ./
RUN go mod download

COPY . .

# 静的バイナリとしてビルド
RUN LDFLAGS="-s -w -X github.com/atsushi-h/subsq/backend/internal/version.Version=${VERSION} -X github.com/atsushi-h/subsq/backend/internal/version.CommitSHA=${COMMIT_SHA} -X github.com/atsushi-h/subsq/backend/internal/version.BuildTime=${BUILD_TIME}" && \
    CGO_ENABLED=0 GOOS=linux go build -ldflags="${LDFLAGS}" -o server ./cmd/api

# ===========================
# Runner
# ===========================
FROM gcr.io/distroless/static-debian12 AS runner

WORKDIR /app

# 非rootユーザー (distroless のデフォルト nonroot uid=65532)
COPY --from=builder /app/server .

EXPOSE 8080
ENV PORT=8080

USER nonroot:nonroot
CMD ["/app/server"]
