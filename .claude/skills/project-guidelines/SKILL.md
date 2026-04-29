---
name: project-guidelines
description: SubsQプロジェクト固有のアーキテクチャ、ファイル構造、コードパターン（Container/Presenter、CQRS、TanStack Query）、テスト要件、デプロイワークフローのガイドライン。Next.js App Router、Go バックエンド (Echo + sqlc) を OpenAPI (Orval) 経由で利用。
---

# プロジェクトガイドライン

SubsQ - サブスクリプション管理Webアプリケーション（日本市場向け）

---

## 使用タイミング

SubsQプロジェクトで作業する際にこのスキルを参照すること。このスキルには以下が含まれる：
- アーキテクチャ概要
- ファイル構造
- コードパターン（Container/Presenter、CQRS、TanStack Query）
- テスト要件
- デプロイワークフロー

---

## アーキテクチャ概要

**技術スタック:**
- **フロントエンド**: Next.js 15+ (App Router), TypeScript, React 19
- **状態管理**: TanStack Query v5
- **API クライアント**: TypeSpec → OpenAPI → Orval 自動生成 (`fetch` ベース)
- **バックエンド**: Go (Echo + sqlc) ※ Frontend は HTTP 経由でのみ通信
- **認証**: Go バックエンド発行の JWT を HTTPOnly Cookie (`subsq_token`) で保持。Google OAuth はバックエンドで処理
- **バリデーション**: Zod
- **スタイリング**: Tailwind CSS
- **Lint / Format**: Biome
- **テスト**: Vitest (Unit), Playwright + MSW (E2E)
- **デプロイ**: GCP Cloud Run + Cloudflare

**サービス構成:**
```
┌─────────────────────────────────────────────────────────────┐
│                      フロントエンド                          │
│  Next.js 15+ (App Router) + TypeScript + TailwindCSS       │
│  デプロイ先: GCP Cloud Run                                  │
└─────────────────────────────────────────────────────────────┘
                              │ HTTP (OpenAPI)
                              ▼
                  ┌─────────────────────────┐
                  │   Go バックエンド API     │
                  │   Echo + sqlc + JWT      │
                  │   デプロイ先: Cloud Run   │
                  └───────────┬─────────────┘
                              │
                              ▼
                       ┌──────────────┐
                       │  PostgreSQL  │
                       │    (Neon)    │
                       └──────────────┘

  Cloudflare: CDN / DNS / カスタムドメイン管理
```

**設計原則:**
1. **Server Components優先** - クライアントサイドJSを最小化
2. **型安全性** - TypeScript + Zodによる完全な型カバレッジ
3. **OpenAPI 契約駆動** - TypeSpec でスキーマ定義、Frontend / Backend ともに自動生成コードで型を共有
4. **関心の分離** - 各レイヤーの責務を明確化（Handler / Service / Client）
5. **テスタビリティ** - 各レイヤーを独立してテスト可能に

---

## ファイル構造

```
frontend/src/
├── app/                      # App Router（薄く保つ）
│   ├── (guest)/              # 未認証ルート
│   │   └── login/
│   ├── (authenticated)/      # 認証必須ルート
│   │   ├── subscriptions/
│   │   ├── payment-methods/
│   │   └── settings/
│   └── not-found.tsx
│
├── features/                 # 機能モジュール
│   ├── subscription/
│   │   ├── components/
│   │   │   ├── server/       # Server Components（PageTemplate）
│   │   │   │   └── SubscriptionListPageTemplate/
│   │   │   │       ├── index.ts
│   │   │   │       └── SubscriptionListPageTemplate.tsx
│   │   │   └── client/       # Client Components（Container/Presenter）
│   │   │       └── SubscriptionList/
│   │   │           ├── index.ts
│   │   │           ├── SubscriptionListContainer.tsx
│   │   │           ├── SubscriptionListPresenter.tsx
│   │   │           ├── useSubscriptionList.ts
│   │   │           └── SubscriptionCard.tsx
│   │   ├── hooks/            # TanStack Query フック
│   │   │   ├── useSubscriptionListQuery.ts
│   │   │   └── useCreateSubscriptionMutation.ts
│   │   ├── queries/          # Query Keys
│   │   │   └── subscription.query-keys.ts
│   │   ├── schemas/          # Zodスキーマ
│   │   └── types/
│   ├── payment-method/
│   ├── auth/
│   └── user/
│
├── shared/                   # 共通ユーティリティ
│   ├── components/
│   ├── lib/
│   └── providers/
│
└── external/                 # 外部連携層（Go バックエンド API）
    ├── dto/                  # 入出力 DTO（Zod スキーマ + 型）
    ├── handler/              # エントリーポイント（CQRS）
    │   └── subscription/
    │       ├── subscription.query.server.ts
    │       ├── subscription.query.action.ts
    │       ├── subscription.command.server.ts
    │       ├── subscription.command.action.ts
    │       └── subscription.converter.ts
    ├── service/              # Go バックエンド呼び出し + データ変換
    │   └── subscription/
    │       └── subscription.service.ts
    └── client/               # OpenAPI 自動生成クライアント (Orval)
        └── api/
            ├── fetcher.ts    # 共通 fetch ラッパー
            └── generated/    # Orval 生成物（手動編集禁止）
```

> **NOTE**: 旧構成にあった `external/repository/` `external/domain/` は廃止済み。
> Frontend は DB に直接接続せず、Go バックエンドの REST API のみを呼び出す。

---

## コードパターン

### Container/Presenterパターン

**Container** - ロジックのみ、DOM描画なし:
```tsx
// features/subscription/components/client/SubscriptionList/SubscriptionListContainer.tsx
'use client'

import { SubscriptionListPresenter } from './SubscriptionListPresenter'
import { useSubscriptionList } from './useSubscriptionList'

export function SubscriptionListContainer() {
  const { subscriptions, summary, isLoading, handleDelete } = useSubscriptionList()

  // Presenterのみ描画、DOM要素は書かない
  return (
    <SubscriptionListPresenter
      subscriptions={subscriptions}
      summary={summary}
      isLoading={isLoading}
      onDelete={handleDelete}
    />
  )
}
```

**Presenter** - 純粋な表示、ロジックなし:
```tsx
// features/subscription/components/client/SubscriptionList/SubscriptionListPresenter.tsx
interface SubscriptionListPresenterProps {
  subscriptions: SubscriptionResponse[]
  summary: SubscriptionSummary
  isLoading: boolean
  onDelete: (id: string) => void
}

export function SubscriptionListPresenter({
  subscriptions,
  summary,
  isLoading,
  onDelete,
}: SubscriptionListPresenterProps) {
  if (isLoading) return <LoadingSpinner />

  return (
    <div className="space-y-6">
      <SummaryCard summary={summary} />
      {subscriptions.map(sub => (
        <SubscriptionCard
          key={sub.id}
          subscription={sub}
          onDelete={() => onDelete(sub.id)}
        />
      ))}
    </div>
  )
}
```

**エイリアスでエクスポート:**
```tsx
// features/subscription/components/client/SubscriptionList/index.ts
export { SubscriptionListContainer as SubscriptionList } from './SubscriptionListContainer'
```

### CQRS Handlerパターン

**Server Function（RSCから呼び出し）:**
```ts
// external/handler/subscription/subscription.query.server.ts
import 'server-only'

import { requireAuthServer } from '@/features/auth/servers/redirect.server'
import * as subscriptionService from '@/external/service/subscription/subscription.service'
import { toListSubscriptionsResponse } from './subscription.converter'
import type { ListSubscriptionsResponse } from '@/external/dto/subscription.dto'

export async function listSubscriptionsByUserIdQuery(): Promise<ListSubscriptionsResponse> {
  await requireAuthServer()
  const data = await subscriptionService.listSubscriptions()
  return toListSubscriptionsResponse(data)
}
```

> ユーザー ID は Go バックエンド側で JWT Cookie から解決されるため、Frontend からは渡さない。

**Server Action（Client Componentから呼び出し）:**

`*.action.ts` は `withAuth()` で包み、認証エラー時のリダイレクトとレスポンス整形を統一する。

```ts
// external/handler/subscription/subscription.query.action.ts
'use server'

import { withAuth } from '@/features/auth/servers/auth.guard'
import { listSubscriptionsByUserIdQuery } from './subscription.query.server'

export async function listSubscriptionsByUserIdQueryAction() {
  return withAuth(() => listSubscriptionsByUserIdQuery())
}
```

`withAuth()` は `{ success: true; data } | { success: false; error }` 形式の判別共用体を返す（呼び出し側のフックは `success` フラグで分岐する）。

**命名規則:**
| 種類 | ファイル | 関数名 | 呼び出し元 |
|------|---------|--------|-----------|
| Query (Server Function) | `*.query.server.ts` | `xxxQuery` | RSC |
| Command (Server Function) | `*.command.server.ts` | `xxxCommand` | RSC |
| Query (Server Action) | `*.query.action.ts` | `xxxQueryAction` | Client |
| Command (Server Action) | `*.command.action.ts` | `xxxCommandAction` | Client |

### TanStack Queryパターン

**Query Keys:**
```ts
// features/subscription/queries/subscription.query-keys.ts
export const subscriptionKeys = {
  all: ['subscriptions'] as const,
  lists: () => [...subscriptionKeys.all, 'list'] as const,
  details: () => [...subscriptionKeys.all, 'detail'] as const,
  detail: (id: string) => [...subscriptionKeys.details(), id] as const,
}
```

**サーバーサイドプリフェッチ（PageTemplate）:**
```tsx
// features/subscription/components/server/SubscriptionListPageTemplate/SubscriptionListPageTemplate.tsx
import { dehydrate, HydrationBoundary } from '@tanstack/react-query'
import { listSubscriptionsByUserIdQuery } from '@/external/handler/subscription/subscription.query.server'
import { SubscriptionList } from '@/features/subscription/components/client/SubscriptionList'
import { subscriptionKeys } from '@/features/subscription/queries/subscription.query-keys'
import { getQueryClient } from '@/shared/lib/query-client'

export async function SubscriptionListPageTemplate() {
  const queryClient = getQueryClient()

  await queryClient.prefetchQuery({
    queryKey: subscriptionKeys.lists(),
    queryFn: () => listSubscriptionsByUserIdQuery(),
  })

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <SubscriptionList />
    </HydrationBoundary>
  )
}
```

> 認証チェックは `*.query.server.ts` 内の `requireAuthServer()` で行うため、PageTemplate では明示しない。

**クライアントサイドQueryフック:**
```ts
// features/subscription/hooks/useSubscriptionListQuery.ts
'use client'

import { useQuery } from '@tanstack/react-query'
import { listSubscriptionsByUserIdQueryAction } from '@/external/handler/subscription/subscription.query.action'
import { subscriptionKeys } from '@/features/subscription/queries/subscription.query-keys'

export function useSubscriptionListQuery() {
  return useQuery({
    queryKey: subscriptionKeys.lists(),
    queryFn: () => listSubscriptionsByUserIdQueryAction(),
  })
}
```

**Mutationフック:**
```ts
// features/subscription/hooks/useCreateSubscriptionMutation.ts
'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { createSubscriptionCommandAction } from '@/external/handler/subscription/subscription.command.action'
import { subscriptionKeys } from '@/features/subscription/queries/subscription.query-keys'

export function useCreateSubscriptionMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createSubscriptionCommandAction,
    onSuccess: () => {
      toast.success('サブスクリプションを作成しました')
      queryClient.invalidateQueries({ queryKey: subscriptionKeys.lists() })
    },
    onError: (error: Error) => {
      toast.error(error.message || '作成に失敗しました')
    },
  })
}
```

### Service 層 / OpenAPI クライアント

Service は OpenAPI 自動生成クライアント (`external/client/api/generated/`) を直接呼び出す薄い層。
ステータスコード分岐とエラーメッセージの統一のみ行い、データ変換は Handler の `*.converter.ts` に委譲する。

```ts
// external/service/subscription/subscription.service.ts
import {
  subscriptionsListSubscriptions,
  subscriptionsCreateSubscription,
} from '@/external/client/api/generated/subscriptions/subscriptions'
import type {
  ModelsListSubscriptionsResponse,
  ModelsCreateSubscriptionRequest,
  ModelsSubscriptionResponse,
} from '@/external/client/api/generated/model'

export async function listSubscriptions(): Promise<ModelsListSubscriptionsResponse> {
  const res = await subscriptionsListSubscriptions()
  if (res.status !== 200) {
    throw new Error('サブスクリプション一覧の取得に失敗しました')
  }
  return res.data
}

export async function createSubscription(
  request: ModelsCreateSubscriptionRequest,
): Promise<ModelsSubscriptionResponse> {
  const res = await subscriptionsCreateSubscription(request)
  if (res.status !== 201) {
    throw new Error('サブスクリプションの作成に失敗しました')
  }
  return res.data
}
```

> `external/client/api/generated/` は `pnpm gen:api` で再生成されるため、**手動編集禁止**。

### DTOとZod

```ts
// external/dto/subscription.dto.ts
import { z } from 'zod'

export const BillingCycleSchema = z.enum(['monthly', 'yearly'])

export const CreateSubscriptionRequestSchema = z.object({
  serviceName: z.string().min(1, 'サービス名は必須です'),
  amount: z.number().int().min(0).max(1000000),
  billingCycle: BillingCycleSchema,
  baseDate: z.number().int(),
  paymentMethodId: z.string().uuid().optional(),
  memo: z.string().optional(),
})

export const SubscriptionResponseSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  serviceName: z.string(),
  amount: z.number(),
  billingCycle: BillingCycleSchema,
  baseDate: z.number(),
  nextBillingDate: z.string(),
  paymentMethodId: z.string().uuid().nullable(),
  paymentMethod: z.object({ id: z.string().uuid(), name: z.string() }).nullable(),
  memo: z.string().nullable(),
  monthlyAmount: z.number(),
  yearlyAmount: z.number(),
  createdAt: z.string(),
  updatedAt: z.string(),
})

export type CreateSubscriptionRequest = z.infer<typeof CreateSubscriptionRequestSchema>
export type SubscriptionResponse = z.infer<typeof SubscriptionResponseSchema>
```

### 認証ヘルパー

認証は **Go バックエンドの JWT を HTTPOnly Cookie (`subsq_token`) で保持**する方式。
Frontend のセッション取得は Go バックエンドの `/api/v1/users/me` を Orval 生成クライアント経由で呼ぶ。

```ts
// セッション情報が不要な場合（認証チェックのみ）
import { requireAuthServer } from '@/features/auth/servers/redirect.server'

export async function listSubscriptionsQuery() {
  await requireAuthServer()  // 未認証なら /login へリダイレクト
  // ...
}

// セッション情報が必要な場合
import { getAuthenticatedSessionServer } from '@/features/auth/servers/redirect.server'

export async function getMyProfileQuery() {
  const session = await getAuthenticatedSessionServer()  // 認証 + セッション取得
  return session.user                                    // バックエンドが解決したユーザー情報
}
```

> ユーザー識別は Cookie の JWT を Go バックエンドが解決するため、Frontend → Backend の呼び出しに `userId` を明示的に渡す必要はない。

---

## テスト要件

詳細な戦略は以下のドキュメントを参照:
- `frontend/docs/09_testing_strategy.md` - フロントエンド全体のテスト戦略
- `frontend/docs/10_bff_testing_strategy.md` - BFF 層 (`external/`) のテスト戦略

### テスト対象の方針

| レイヤー | テスト | 理由 |
|---------|-------|------|
| カスタム Hook (`useXxx*`) | ✅ Vitest 必須 | ビジネスロジックの核心 |
| Query Keys | ✅ Vitest 必須 | キャッシュ管理の要 |
| Utils / 計算関数 | ✅ Vitest 推奨 | 純粋関数で検証容易 |
| DTO / Zod スキーマ | ✅ Vitest 必須 | API 契約の検証 |
| Service / Converter | ✅ Vitest 必須 | データ変換ロジック |
| Handler (`*.action.ts` 等) | ✅ Vitest 推奨 | 認証 + バリデーション |
| Container / Presenter | ❌ E2E でカバー | Server Actions モックのコスパが悪く UI 変更頻度も高い |
| OpenAPI Client (Orval) | ❌ 自動生成 | テスト不要 |
| 主要画面遷移 | ✅ Playwright + MSW 必須 | E2E |

### コマンド

```bash
pnpm test           # 全 Unit テスト実行 (Vitest)
pnpm test:watch     # ウォッチモード
pnpm test:coverage  # カバレッジ付き
pnpm e2e            # E2E テスト (Playwright)
pnpm e2e:ui         # E2E UI モード
```

### 配置とパターン

- **コロケーション**: テストは対象ファイルと同じディレクトリに `*.test.ts` / `*.test.tsx`
- **AAA パターン**: Arrange → Act → Assert
- **テスト名**: 日本語で「〜する」「〜の場合、〜を返す」形式

```ts
// features/subscription/utils/calculation.test.ts
import { describe, it, expect } from 'vitest'
import { toMonthlyAmount } from './calculation'

describe('toMonthlyAmount', () => {
  it('年額を月額に換算する', () => {
    expect(toMonthlyAmount(12000, 'yearly')).toBe(1000)
  })

  it('月額はそのまま返す', () => {
    expect(toMonthlyAmount(1000, 'monthly')).toBe(1000)
  })
})
```

---

## デプロイワークフロー

### デプロイ前チェックリスト

- [ ] 全テスト通過（`pnpm test`）
- [ ] Lint通過（`pnpm lint`）
- [ ] 型チェック通過（`pnpm type:check`）
- [ ] ビルド成功（`pnpm build`）
- [ ] ハードコードされたシークレットがない
- [ ] 環境変数がドキュメント化されている
- [ ] OpenAPI スキーマに変更がある場合は `pnpm gen:api` で再生成済み
- [ ] DB マイグレーションが必要な場合は Backend 側で準備完了

### 環境変数

Frontend で使用するのは `NEXT_PUBLIC_*` のみ。`@t3-oss/env-nextjs` で `frontend/src/shared/lib/env.ts` に定義。

```bash
NEXT_PUBLIC_APP_URL=...               # Frontend 自身の URL
NEXT_PUBLIC_APP_ENV=dev|prd           # アプリ環境
NEXT_PUBLIC_CONTACT_FORM_URL=...      # 問い合わせフォーム URL
NEXT_PUBLIC_API_BASE_URL=...          # Go バックエンド URL（任意、未指定時は localhost:8080）

# E2E テスト用（任意）
E2E_TEST_PASSWORD=...
PLAYWRIGHT_E2E_MODE=...
```

> `DATABASE_URL` / `BETTER_AUTH_*` / `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` などは **Backend (Go) のみ**で使用。Frontend のビルドや Cloud Run 環境変数には含めないこと。

### CI/CD（GitHub Actions）

```yaml
# .github/workflows/frontend-ci.yml
- pnpm lint            # Biome
- pnpm next typegen    # Next.js 型生成
- pnpm type:check      # TypeScript
- pnpm test            # Vitest
- pnpm build           # Next.js ビルド
# - pnpm e2e           # Playwright（Go バックエンドの E2E 認証実装後に有効化予定）
```

デプロイ (`frontend-deploy.yml`) は手動トリガー。Docker イメージを Artifact Registry にプッシュし Cloud Run にデプロイ。

---

## 必須ルール

### 禁止事項

1. **RSCからServer Actionsを呼ぶ** - `*Query`/`*Command`を使用、`*Action`は使わない
2. **ContainerでDOMを描画** - Presenterのみ描画する
3. **Presenterでstate/effectを使用** - useState、useEffectは禁止
4. **他のPresenterを呼び出す** - ContainerのみがPresenterを呼び出せる
5. **1ファイルに複数コンポーネント** - 1ファイル1コンポーネント
6. **業務ロジックを API Routes (`route.ts`) に書く** - Server Actions / Server Functions を使用する
   - 例外: ヘルスチェックなどインフラ目的のエンドポイント（`/api/health` 等）は許容

### 必須事項

1. **イミュータビリティ** - オブジェクトや配列を直接変更しない
2. **型安全性** - 全てのpropsに明示的なinterface定義
3. **1ファイル = 1コンポーネント** - 複数ある場合は分割
4. **Presenter = 純粋な表示** - ロジックを持たない
5. **ロジックはContainer + Hookに集約** - 状態管理を一元化
6. **適切なエラーハンドリング** - try/catchでユーザーフィードバック

### ファイル命名規則

| 種類 | パターン | 例 |
|------|---------|-----|
| コンポーネント | PascalCase.tsx | `SubscriptionList.tsx` |
| フック | useCamelCase.ts | `useSubscriptionList.ts` |
| ユーティリティ | camelCase.ts | `calculation.ts` |
| Server Function | `*.server.ts` | `subscription.query.server.ts` |
| Server Action | `*.action.ts` | `subscription.command.action.ts` |
| Query Keys | `*.query-keys.ts` | `subscription.query-keys.ts` |

---

## ブランチ命名規則

詳細は`CLAUDE.md`を参照してください。

要約:
- 新機能: `feat/`（`feature/`は使用しない）
- バグ修正: `fix/`
- その他: `chore/`, `refactor/`, `test/`, `docs/`

---

## 関連スキル

- `coding-standards` - TypeScript/React ベストプラクティス
- `testing` - Frontend / BFF 層のテスト戦略
