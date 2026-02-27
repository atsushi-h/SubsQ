# syntax=docker.io/docker/dockerfile:1

# ===========================
# Builder
# ===========================
FROM golang:1.26.0-alpine3.21 AS builder

WORKDIR /app

# 依存関係をコピー（キャッシュ最適化）
COPY go.mod ./
RUN go mod download

COPY . .

# 静的バイナリとしてビルド
RUN CGO_ENABLED=0 GOOS=linux go build -o server ./...

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
