# syntax=docker.io/docker/dockerfile:1

FROM node:24.13.1-slim AS base
RUN apt-get update && apt-get install -y --no-install-recommends openssl ca-certificates \
    && rm -rf /var/lib/apt/lists/*
WORKDIR /app
RUN corepack enable pnpm

# ===========================
# Builder (依存関係 + ビルド)
# ===========================
FROM base AS builder

# ビルド引数として受け取る（公開情報のみ）
ARG NEXT_PUBLIC_APP_URL
ENV NEXT_PUBLIC_APP_URL=${NEXT_PUBLIC_APP_URL}

ARG NEXT_PUBLIC_APP_ENV
ENV NEXT_PUBLIC_APP_ENV=${NEXT_PUBLIC_APP_ENV}

ARG NEXT_PUBLIC_CONTACT_FORM_URL
ENV NEXT_PUBLIC_CONTACT_FORM_URL=${NEXT_PUBLIC_CONTACT_FORM_URL}

# ビルド時は環境変数バリデーションをスキップ
# サーバー専用環境変数（BETTER_AUTH_SECRET等）はランタイムで渡すため、
# ビルド時の検証は不要
ENV SKIP_ENV_VALIDATION=true

# DATABASE_URLはダミー値で検証をパス（実際の値はランタイムで渡す）
ARG DATABASE_URL="postgresql://build-dummy:dummy@localhost:5432/dummy"
ENV DATABASE_URL=${DATABASE_URL}

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .

# Next.jsのテレメトリ（使用状況データ収集）を無効化
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

RUN pnpm build

# ===========================
# Runner
# ===========================
FROM base AS runner

# Next.jsのテレメトリ（使用状況データ収集）を無効化
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

# 非rootユーザーの作成
RUN addgroup --system --gid 1001 nodejs \
    && adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]