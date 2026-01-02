# TanStack Query 実装ガイド

## 概要

TanStack Queryを使用してサーバー状態を管理し、Next.js App RouterのServer Componentsと連携させます。

## セットアップ

### Provider設定

```tsx
// shared/providers/query-provider.tsx
'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { useState } from 'react'

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 0, // RSCのhydrateデータを常に優先
            gcTime: 5 * 60 * 1000, // 5分（デフォルト）
            refetchOnWindowFocus: false,
          },
        },
      })
  )

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  )
}
```

### staleTimeとgcTimeの設定意図

| 設定 | 値 | 理由 |
|------|-----|------|
| staleTime | 0 | RSCでhydrateされたデータを常に優先。ページ遷移時に最新データを反映 |
| gcTime | 5分 | キャッシュをメモリに保持。楽観的更新やコンポーネント間のデータ共有で使用 |

**staleTime: 0 でもTanStack Queryを使う意味:**
- 同一ページ内での状態共有（サイドバーとメインコンテンツなど）
- Mutation後の楽観的更新
- ローディング状態の管理

### サーバー用QueryClient

```tsx
// shared/lib/query-client.ts
import { QueryClient } from '@tanstack/react-query'
import { cache } from 'react'

export const getQueryClient = cache(() => new QueryClient())
```

## クエリキーの管理
```ts
// features/subscription/queries/keys.ts
export const subscriptionKeys = {
  all: ['subscriptions'] as const,
  list: () => [...subscriptionKeys.all, 'list'] as const,
  details: () => [...subscriptionKeys.all, 'detail'] as const,
  detail: (id: string) => [...subscriptionKeys.details(), id] as const,
}
```

## サーバーサイドプリフェッチ
```tsx
// features/subscription/components/server/SubscriptionListPageTemplate.tsx
import { HydrationBoundary, dehydrate } from '@tanstack/react-query'
import { getQueryClient } from '@/lib/query-client'
import { subscriptionKeys } from '@/features/subscription/queries/keys'
import { listSubscriptionsServer } from '@/external/handler/subscription.query.server'
import { SubscriptionListContainer } from '../client/SubscriptionList'

export async function SubscriptionListPageTemplate() {
  const queryClient = getQueryClient()

  // データをプリフェッチ
  await queryClient.prefetchQuery({
    queryKey: subscriptionKeys.list(),
    queryFn: () => listSubscriptionsServer(),
  })

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <SubscriptionListContainer />
    </HydrationBoundary>
  )
}
```

## クライアントサイドQuery

### Server Actionの使用

API RoutesではなくServer Actionsを使用してデータフェッチを行います。これにより型安全性が向上し、エンドツーエンドの型推論が可能になります。

```ts
// features/subscription/hooks/useSubscriptionQuery.ts
'use client'

import { useQuery } from '@tanstack/react-query'
import { subscriptionKeys } from '../queries/keys'
import { listSubscriptionsAction } from '@/external/handler/subscription.query.action'

// Server Actionを直接使用
export function useSubscriptionListQuery() {
  return useQuery({
    queryKey: subscriptionKeys.list(),
    queryFn: () => listSubscriptionsAction(), // Server Action呼び出し
  })
}
```

**重要**: API Routes (`/api/subscriptions`) ではなく、`external/handler` ディレクトリのServer Actionsを使用してください。

## Mutation実装

```ts
// features/subscription/hooks/useSubscriptionMutation.ts
'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { subscriptionKeys } from '../queries/keys'
import {
  createSubscriptionAction,
  deleteSubscriptionAction,
} from '@/external/handler/subscription.command.action'

export function useCreateSubscriptionMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createSubscriptionAction,
    onSuccess: (result) => {
      if (result.success) {
        // 関連するクエリを無効化
        queryClient.invalidateQueries({ queryKey: subscriptionKeys.list() })
      }
    },
  })
}

export function useDeleteSubscriptionMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteSubscriptionAction,
    onSuccess: (result) => {
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: subscriptionKeys.list() })
      }
    },
  })
}
```

## 楽観的更新
```ts
// features/subscription/hooks/useSubscriptionMutationOptimistic.ts
'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { subscriptionKeys } from '../queries/keys'
import { createSubscriptionAction } from '@/external/handler/subscription.command.action'
import type { CreateSubscriptionRequest, ListSubscriptionsResponse } from '@/external/dto/subscription.dto'

export function useCreateSubscriptionOptimistic() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (request: CreateSubscriptionRequest) => createSubscriptionAction(request),
    onMutate: async (newSubscription) => {
      // 既存のクエリをキャンセル
      await queryClient.cancelQueries({ queryKey: subscriptionKeys.list() })

      // 現在のデータを保存
      const previousData = queryClient.getQueryData<ListSubscriptionsResponse>(
        subscriptionKeys.list()
      )

      // 楽観的に更新
      if (previousData) {
        queryClient.setQueryData<ListSubscriptionsResponse>(
          subscriptionKeys.list(),
          {
            ...previousData,
            subscriptions: [
              ...previousData.subscriptions,
              {
                ...newSubscription,
                id: crypto.randomUUID(),
                userId: '',
                nextBillingDate: '',
                paymentMethod: null,
                monthlyAmount: 0,
                yearlyAmount: 0,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              },
            ],
          }
        )
      }

      return { previousData }
    },
    onError: (_error, _variables, context) => {
      // エラー時は元に戻す
      if (context?.previousData) {
        queryClient.setQueryData(subscriptionKeys.list(), context.previousData)
      }
    },
    onSettled: () => {
      // 最終的にサーバーデータで同期
      queryClient.invalidateQueries({ queryKey: subscriptionKeys.list() })
    },
  })
}
```

## パフォーマンス最適化

### Suspenseとの統合
```tsx
// features/subscription/components/client/SubscriptionDetail.tsx
import { Suspense } from 'react'
import { ErrorBoundary } from 'react-error-boundary'

export function SubscriptionDetail({ subscriptionId }: { subscriptionId: string }) {
  return (
    <ErrorBoundary fallback={<ErrorFallback />}>
      <Suspense fallback={<SubscriptionSkeleton />}>
        <SubscriptionDetailContent subscriptionId={subscriptionId} />
      </Suspense>
    </ErrorBoundary>
  )
}

function SubscriptionDetailContent({ subscriptionId }: { subscriptionId: string }) {
  // useSuspenseQueryを使用
  const { data: subscription } = useSubscriptionDetailQuery(subscriptionId)
  
  return <SubscriptionPresenter subscription={subscription} />
}
```

### 選択的な無効化
```ts
// 影響範囲を限定した無効化
onSuccess: async (_, { subscriptionId }) => {
  await Promise.all([
    queryClient.invalidateQueries({ 
      queryKey: subscriptionKeys.detail(subscriptionId),
      exact: true 
    }),
    queryClient.invalidateQueries({ 
      queryKey: subscriptionKeys.list(),
      exact: true 
    }),
  ])
}
```