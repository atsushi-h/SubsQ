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
- **フロントエンド**: Next.js 15+ (App Router), TypeScript, React
- **状態管理**: TanStack Query
- **データベース**: Neon PostgreSQL
- **ORM**: Drizzle ORM
- **認証**: Better Auth (Google OAuth, Stateless mode)
- **バリデーション**: Zod
- **スタイリング**: Tailwind CSS
- **デプロイ**: GCP Cloud Run + Cloudflare

**サービス構成:**
```
┌─────────────────────────────────────────────────────────────┐
│                      フロントエンド                          │
│  Next.js 15+ (App Router) + TypeScript + TailwindCSS       │
│  デプロイ先: GCP Cloud Run                                  │
└─────────────────────────────────────────────────────────────┘
                              │
              ┌───────────────┼───────────────┐
              ▼               ▼               ▼
        ┌──────────┐   ┌──────────┐   ┌──────────┐
        │   Neon   │   │  Better  │   │Cloudflare│
        │PostgreSQL│   │   Auth   │   │CDN / DNS │
        └──────────┘   └──────────┘   └──────────┘
```

**設計原則:**
1. **Server Components優先** - クライアントサイドJSを最小化
2. **型安全性** - TypeScript + Zodによる完全な型カバレッジ
3. **関心の分離** - 各レイヤーの責務を明確化
4. **テスタビリティ** - 各レイヤーを独立してテスト可能に
5. **変更容易性** - バックエンド移行を容易に（DB → 外部API）

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
└── external/                 # 外部連携層（DB/API）
    ├── dto/                  # データ転送オブジェクト
    ├── handler/              # エントリーポイント（CQRS）
    │   └── subscription/
    │       ├── subscription.query.server.ts
    │       ├── subscription.query.action.ts
    │       ├── subscription.command.server.ts
    │       ├── subscription.command.action.ts
    │       └── subscription.converter.ts
    ├── service/              # ビジネスロジック
    ├── repository/           # データベース操作
    ├── domain/               # ドメインモデル
    └── client/               # DB接続
```

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

import { getAuthenticatedSessionServer } from '@/features/auth/servers/redirect.server'
import { subscriptionService } from '@/external/service/subscription.service'
import type { ListSubscriptionsResponse } from '@/external/dto/subscription.dto'

export async function listSubscriptionsByUserIdQuery(
  userId: string
): Promise<ListSubscriptionsResponse> {
  return await subscriptionService.listSubscriptions(userId)
}
```

**Server Action（Client Componentから呼び出し）:**
```ts
// external/handler/subscription/subscription.query.action.ts
'use server'

import { getAuthenticatedSessionServer } from '@/features/auth/servers/redirect.server'
import { listSubscriptionsByUserIdQuery } from './subscription.query.server'

export type ListSubscriptionsResult =
  | { success: true; data: ListSubscriptionsResponse }
  | { success: false; error: string }

export async function listSubscriptionsByUserIdQueryAction(): Promise<ListSubscriptionsResult> {
  try {
    const session = await getAuthenticatedSessionServer()
    const data = await listSubscriptionsByUserIdQuery(session.user.id)
    return { success: true, data }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : '取得に失敗しました',
    }
  }
}
```

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
import { getAuthenticatedSessionServer } from '@/features/auth/servers/redirect.server'
import { SubscriptionList } from '@/features/subscription/components/client/SubscriptionList'
import { subscriptionKeys } from '@/features/subscription/queries/subscription.query-keys'
import { getQueryClient } from '@/shared/lib/query-client'

export async function SubscriptionListPageTemplate() {
  const session = await getAuthenticatedSessionServer()
  const queryClient = getQueryClient()

  await queryClient.prefetchQuery({
    queryKey: subscriptionKeys.lists(),
    queryFn: () => listSubscriptionsByUserIdQuery(session.user.id),
  })

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <SubscriptionList />
    </HydrationBoundary>
  )
}
```

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

```ts
// セッション情報が不要な場合
export async function listSubscriptionsQuery() {
  await requireAuthServer()  // 認証チェックのみ
  // ...
}

// セッション情報が必要な場合
export async function createSubscriptionCommand(request: unknown) {
  const session = await getAuthenticatedSessionServer()  // 認証 + セッション取得
  // session.user.id を使用
}
```

---

## テスト要件

### ユニットテスト（Vitest）

```bash
# 全テスト実行
pnpm test

# カバレッジ付き
pnpm test --coverage

# 特定ファイル
pnpm test subscription.test.ts
```

**テスト構造:**
```ts
// features/subscription/utils/calculation.test.ts
import { describe, it, expect } from 'vitest'
import { calculateNextBillingDate, toMonthlyAmount } from './calculation'

describe('calculateNextBillingDate', () => {
  it('月額サブスクの次回請求日を計算する', () => {
    const baseDate = new Date('2024-01-15').getTime() / 1000
    const result = calculateNextBillingDate(baseDate, 'monthly')
    expect(result).toBeDefined()
  })
})

describe('toMonthlyAmount', () => {
  it('年額を月額に換算する', () => {
    expect(toMonthlyAmount(12000, 'yearly')).toBe(1000)
  })

  it('月額はそのまま返す', () => {
    expect(toMonthlyAmount(1000, 'monthly')).toBe(1000)
  })
})
```

### コンポーネントテスト

```tsx
// features/subscription/components/client/SubscriptionList/SubscriptionList.test.tsx
import { render, screen } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { SubscriptionList } from './SubscriptionList'

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } }
  })

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}

describe('SubscriptionList', () => {
  it('サブスク一覧を表示する', async () => {
    render(<SubscriptionList />, { wrapper: createWrapper() })
    expect(await screen.findByText('Netflix')).toBeInTheDocument()
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
- [ ] DBマイグレーション準備完了

### 環境変数

```bash
# データベース
DATABASE_URL=postgresql://...

# 認証
BETTER_AUTH_SECRET=...
BETTER_AUTH_URL=https://...
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...

# アプリ
NEXT_PUBLIC_APP_URL=https://...
```

### CI/CD（GitHub Actions）

```yaml
# .github/workflows/frontend-ci.yml
- pnpm lint
- pnpm type:check
- pnpm build
```

---

## 必須ルール

### 禁止事項

1. **RSCからServer Actionsを呼ぶ** - `*Query`/`*Command`を使用、`*Action`は使わない
2. **ContainerでDOMを描画** - Presenterのみ描画する
3. **Presenterでstate/effectを使用** - useState、useEffectは禁止
4. **他のPresenterを呼び出す** - ContainerのみがPresenterを呼び出せる
5. **1ファイルに複数コンポーネント** - 1ファイル1コンポーネント
6. **API Routesの使用** - Server Actionsを使用する

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

## 関連スキル

- `coding-standards.md` - TypeScript/Reactベストプラクティス