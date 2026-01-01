# App Router 設計ガイド

## 基本方針

- `page.tsx`と`layout.tsx`は全てRSC (React Server Component)
- `error.tsx`のみClient Component
- ビジネスロジックは`features/`に委譲
- ルート構造で認証状態を表現
- Next.js 15+のグローバル型定義（`LayoutProps`/`PageProps`）を活用

## ルートグループ戦略

### 認証別グループ
```
app/
├─ (guest)/              # 未ログインユーザー向け
│  └─ login/
├─ (authenticated)/      # ログイン必須
│  ├─ subscriptions/
│  ├─ payment-methods/
│  └─ settings/
└─ not-found.tsx         # 404ページ
```

### グループ別設定

| グループ | Layout | 認証チェック | 共通UI |
|---------|--------|------------|---------|
| `(guest)` | シンプル | 認証済みなら /subscriptions へリダイレクト | ロゴのみ |
| `(authenticated)` | フル機能 | 未認証なら /login へリダイレクト | Header（ナビゲーション） |

## ページコンポーネントパターン

### 基本構造
```tsx
// app/(authenticated)/subscriptions/[id]/edit/page.tsx
import { SubscriptionEditPageTemplate } from '@/features/subscription/components/server/SubscriptionEditPageTemplate'

// Next.js 15+のグローバル型定義を使用（importなし）
export default async function SubscriptionEditPage(
  props: PageProps<'/subscriptions/[id]/edit'>
) {
  const params = await props.params

  return <SubscriptionEditPageTemplate subscriptionId={params.id} />
}
```

### メタデータ設定
```tsx
// app/(authenticated)/subscriptions/layout.tsx
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'サブスク一覧 | SubsQ',
  description: 'あなたのサブスクリプションを一覧で管理',
}

// Next.js 15+のグローバル型定義を使用（importなし）
export default function SubscriptionsLayout(props: LayoutProps<'/subscriptions'>) {
  return <>{props.children}</>
}
```

### ページ別メタデータ
```tsx
// app/(authenticated)/subscriptions/new/page.tsx
import type { Metadata } from 'next'
import { SubscriptionNewPageTemplate } from '@/features/subscription/components/server/SubscriptionNewPageTemplate'

export const metadata: Metadata = {
  title: 'サブスク登録 | SubsQ',
}

export default function SubscriptionNewPage() {
  return <SubscriptionNewPageTemplate />
}
```

## 認証レイアウト実装

```tsx
// app/(authenticated)/layout.tsx
import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/shared/lib/auth'
import { AuthenticatedLayoutWrapper } from '@/shared/components/layout/server/AuthenticatedLayoutWrapper'

export default async function AuthenticatedLayout(props: LayoutProps<'/'>) {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    redirect('/login')
  }

  return (
    <AuthenticatedLayoutWrapper user={session.user}>
      {props.children}
    </AuthenticatedLayoutWrapper>
  )
}
```

## エラーハンドリング

```tsx
// app/(authenticated)/error.tsx
'use client'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px]">
      <h2 className="text-2xl font-bold mb-4">エラーが発生しました</h2>
      <p className="text-gray-600 mb-6">{error.message}</p>
      <button
        onClick={reset}
        className="px-4 py-2 bg-primary text-white rounded-md"
      >
        再試行
      </button>
    </div>
  )
}
```

## ローディング状態
```tsx
// app/(authenticated)/subscriptions/loading.tsx
export default function Loading() {
  return (
    <div className="animate-pulse">
      {/* 合計金額エリア */}
      <div className="mb-6 h-16 rounded-lg bg-zinc-200 dark:bg-zinc-800" />

      {/* サブスクカード */}
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="h-24 rounded-lg bg-zinc-200 dark:bg-zinc-800"
          />
        ))}
      </div>
    </div>
  )
}
```

## Not Found ページ
```tsx
// app/not-found.tsx
import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <h2 className="mb-4 text-2xl font-bold">404 - ページが見つかりません</h2>
      <p className="mb-6 text-zinc-600 dark:text-zinc-400">
        お探しのページは存在しないか、移動した可能性があります。
      </p>
      <Link
        href="/subscriptions"
        className="rounded-md bg-zinc-900 px-4 py-2 text-white dark:bg-zinc-50 dark:text-zinc-900"
      >
        ホームに戻る
      </Link>
    </div>
  )
}
```

## ルートリダイレクト
```tsx
// app/page.tsx
import { redirect } from 'next/navigation'
import { getSessionServer } from '@/features/auth/servers/auth.server'

export default async function RootPage() {
  const session = await getSessionServer()

  if (session) {
    redirect('/subscriptions')
  }

  redirect('/login')
}
```

## 画面とルートの対応表

| 画面ID | パス | ページファイル |
|--------|------|---------------|
| AUTH-LOGIN | /login | `(guest)/login/page.tsx` |
| SUB-LIST | /subscriptions | `(authenticated)/subscriptions/page.tsx` |
| SUB-NEW | /subscriptions/new | `(authenticated)/subscriptions/new/page.tsx` |
| SUB-EDIT | /subscriptions/:id/edit | `(authenticated)/subscriptions/[id]/edit/page.tsx` |
| PAY-LIST | /payment-methods | `(authenticated)/payment-methods/page.tsx` |
| PAY-NEW | /payment-methods/new | `(authenticated)/payment-methods/new/page.tsx` |
| PAY-EDIT | /payment-methods/:id/edit | `(authenticated)/payment-methods/[id]/edit/page.tsx` |
| SETTINGS | /settings | `(authenticated)/settings/page.tsx` |