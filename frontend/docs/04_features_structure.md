# Features ディレクトリ設計

## 概要

Featuresディレクトリは、アプリケーションの機能を**ドメイン単位**で整理します。各機能は独立したモジュールとして設計され、高い凝集性と低い結合性を保ちます。

## ディレクトリ構造
```
features/
├─ subscription/     # サブスク管理機能
├─ payment-method/   # 支払い方法管理機能
├─ auth/             # 認証機能
└─ user/             # ユーザー・設定機能
```

## 機能モジュールの内部構造
```
features/subscription/
├─ components/
│  ├─ server/    # Server Components
│  │  ├─ SubscriptionListPageTemplate/
│  │  │  ├─ index.ts
│  │  │  └─ SubscriptionListPageTemplate.tsx
│  │  ├─ SubscriptionNewPageTemplate/
│  │  │  ├─ index.ts
│  │  │  └─ SubscriptionNewPageTemplate.tsx
│  │  ├─ SubscriptionEditPageTemplate/
│  │  │  ├─ index.ts
│  │  │  └─ SubscriptionEditPageTemplate.tsx
│  │  └─ SubscriptionDetailPageTemplate/
│  │     ├─ index.ts
│  │     └─ SubscriptionDetailPageTemplate.tsx
│  └─ client/    # Client Components
│     ├─ SubscriptionList/
│     │  ├─ index.ts
│     │  ├─ SubscriptionListContainer.tsx
│     │  ├─ SubscriptionListPresenter.tsx
│     │  └─ useSubscriptionList.ts
│     ├─ SubscriptionForm/
│     │  ├─ index.ts
│     │  ├─ SubscriptionFormContainer.tsx
│     │  ├─ SubscriptionFormPresenter.tsx
│     │  └─ useSubscriptionForm.ts
│     └─ SubscriptionDetail/
│        ├─ index.ts
│        ├─ SubscriptionDetailContainer.tsx
│        ├─ SubscriptionDetailPresenter.tsx
│        └─ useSubscriptionDetail.ts
├─ hooks/        # TanStack Query Hooks
│  ├─ useSubscriptionListQuery.ts
│  ├─ useSubscriptionDetailQuery.ts
│  ├─ useCreateSubscriptionMutation.ts
│  ├─ useUpdateSubscriptionMutation.ts
│  └─ useDeleteSubscriptionMutation.ts
├─ queries/      # TanStack Query関連
│  └─ subscription.query-keys.ts
├─ schemas/      # Zodスキーマ
│  └─ subscription-form.schema.ts
└─ types/        # 型定義
   └─ subscription.types.ts

**注意:**
- Server Actions（`'use server'`を含むファイル）は、アーキテクチャ上 `external/handler/[feature]/` に配置されています
  - `external/handler/subscription/subscription.command.action.ts` - Server Actions（create, update, delete）
  - `external/handler/subscription/subscription.command.server.ts` - Command処理のビジネスロジック
  - `external/handler/subscription/subscription.query.server.ts` - Query処理（データ取得）
  - `external/handler/subscription/subscription.query.action.ts` - Query Actions
  - `external/handler/subscription/subscription.converter.ts` - DTO変換ロジック
- View専用の子コンポーネントは必要に応じて同じディレクトリ内に配置（例: SubscriptionCard.tsx）
- `utils/` ディレクトリは必要に応じて作成
```

## Container/Presenterパターン

### Container (ロジック層)

**重要な制約: ContainerはDOMを直接レンダリングせず、対応するPresenterにpropsを渡すだけにすること。**

Containerの責務:
- カスタムフックを使ってデータを取得する
- イベントハンドラーを定義する
- **Presenterコンポーネントをレンダリングしてpropsを渡す**
- **DOM要素（div、button、linkなど）を直接レンダリングしない**
```tsx
// features/subscription/components/client/SubscriptionList/SubscriptionListContainer.tsx
'use client'

import { SubscriptionListPresenter } from './SubscriptionListPresenter'
import { useSubscriptionList } from './useSubscriptionList'

export function SubscriptionListContainer() {
  const {
    subscriptions,
    summary,
    isLoading,
    handleDelete,
  } = useSubscriptionList()

  // ✅ PresenterにpropsだけをRenderingする
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

悪い例 ❌:
```tsx
// ❌ ContainerでDOMを直接レンダリングしている
export function SubscriptionListContainer() {
  const { subscriptions, summary, isLoading } = useSubscriptionList()

  return (
    <div className="space-y-6">  {/* ❌ ContainerでDOM要素を書いている */}
      <div className="bg-white p-6">
        <h1>サブスク一覧</h1>
        <SubscriptionSummary summary={summary} />
      </div>
      <SubscriptionListPresenter subscriptions={subscriptions} isLoading={isLoading} />
    </div>
  )
}
```

このような場合は、全てのDOMをPresenterに移動すること。

### Presenter (表示層)
```tsx
// features/subscription/components/client/SubscriptionList/SubscriptionListPresenter.tsx
import Link from 'next/link'
import { SubscriptionCard } from './SubscriptionCard'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import type { SubscriptionResponse, SubscriptionSummary } from '@/features/subscription/types'

interface SubscriptionListPresenterProps {
  subscriptions: SubscriptionResponse[]
  summary: SubscriptionSummary
  isLoading: boolean
  onDelete: (subscriptionId: string) => void
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
      {/* 合計金額 */}
      <div className="rounded-lg bg-zinc-100 p-4 dark:bg-zinc-800">
        <p>💰 月額合計: ¥{summary.monthlyTotal.toLocaleString()}</p>
        <p>📅 年額合計: ¥{summary.yearlyTotal.toLocaleString()}</p>
      </div>

      {/* 登録ボタン */}
      <div className="flex justify-end">
        <Link
          href="/subscriptions/new"
          className="rounded-md bg-zinc-900 px-4 py-2 text-white dark:bg-zinc-50 dark:text-zinc-900"
        >
          ＋ サブスクを登録
        </Link>
      </div>

      {/* サブスク一覧 */}
      {subscriptions.length === 0 ? (
        <p className="text-center text-zinc-500">サブスクがまだ登録されていません</p>
      ) : (
        <div className="space-y-4">
          {subscriptions.map((subscription) => (
            <SubscriptionCard
              key={subscription.id}
              subscription={subscription}
              onDelete={() => onDelete(subscription.id)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
```

### カスタムフック
```tsx
// features/subscription/components/client/SubscriptionList/useSubscriptionList.ts
import { useSubscriptionListQuery } from '@/features/subscription/hooks/useSubscriptionQuery'
import { useDeleteSubscriptionMutation } from '@/features/subscription/hooks/useSubscriptionMutation'

export function useSubscriptionList() {
  const { data, isLoading } = useSubscriptionListQuery()
  const deleteMutation = useDeleteSubscriptionMutation()

  // React Compilerが関数の参照安定性を自動的に最適化
  const handleDelete = async (subscriptionId: string) => {
    await deleteMutation.mutateAsync(subscriptionId)
  }

  return {
    subscriptions: data?.subscriptions || [],
    summary: data?.summary || { monthlyTotal: 0, yearlyTotal: 0, count: 0 },
    isLoading,
    handleDelete,
  }
}
```

## Server Componentsテンプレート

Server Components は専用のディレクトリを作成し、index.tsでエクスポートを管理します。

### ディレクトリ構成
```
server/
├─ SubscriptionListPageTemplate/
│  ├─ index.ts
│  └─ SubscriptionListPageTemplate.tsx
├─ SubscriptionNewPageTemplate/
│  ├─ index.ts
│  └─ SubscriptionNewPageTemplate.tsx
└─ SubscriptionEditPageTemplate/
   ├─ index.ts
   └─ SubscriptionEditPageTemplate.tsx
```

### 実装例
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
```tsx
// features/subscription/components/server/SubscriptionListPageTemplate/index.ts
export { SubscriptionListPageTemplate } from './SubscriptionListPageTemplate'
```

## Client Componentsの命名規則

index.tsでエクスポートする際は、エイリアスを使用して外部から使いやすい名前を提供します：
```tsx
// features/auth/components/client/Login/index.ts
export { LoginClientContainer as Login } from './LoginClientContainer'

// features/subscription/components/client/SubscriptionList/index.ts
export { SubscriptionListContainer as SubscriptionList } from './SubscriptionListContainer'

// features/subscription/components/client/SubscriptionForm/index.ts
export { SubscriptionFormContainer as SubscriptionForm } from './SubscriptionFormContainer'

// features/subscription/components/client/SubscriptionDetail/index.ts
export { SubscriptionDetailContainer as SubscriptionDetail } from './SubscriptionDetailContainer'
```

## Presenterコンポーネントの使用ルール

### 重要な制約

**Presenterコンポーネントは、同じ機能ディレクトリ内のContainerからのみ呼び出すこと。**

他の機能ディレクトリや異なるコンポーネントから直接Presenterを呼び出すことは禁止です。

### 良い例 ✅
```tsx
// features/subscription/components/client/SubscriptionList/SubscriptionListContainer.tsx
import { SubscriptionListPresenter } from './SubscriptionListPresenter'

export function SubscriptionListContainer() {
  const { subscriptions, summary, isLoading } = useSubscriptionList()

  // 同じディレクトリ内のPresenterを呼び出す
  return (
    <SubscriptionListPresenter
      subscriptions={subscriptions}
      summary={summary}
      isLoading={isLoading}
    />
  )
}
```

### 悪い例 ❌
```tsx
// features/subscription/components/client/MySubscriptionList/MySubscriptionListPresenter.tsx
import { SubscriptionListPresenter } from '../SubscriptionList/SubscriptionListPresenter' // ❌ 別のPresenterを呼び出している

export function MySubscriptionListPresenter({ subscriptions }: Props) {
  return (
    <div>
      <h1>マイサブスク</h1>
      {/* ❌ 他のコンポーネントのPresenterを直接呼び出すのは禁止 */}
      <SubscriptionListPresenter subscriptions={subscriptions} />
    </div>
  )
}
```

### 正しい対処法

他のコンポーネントの表示ロジックを再利用したい場合は、以下のいずれかの方法を取ります：

1. **Presenterの実装を直接コピーして独自に実装する**
2. **共通部分をshared/componentsに切り出す**
3. **Containerを呼び出す（Presenterではなく）**

```tsx
// features/subscription/components/client/MySubscriptionList/MySubscriptionListPresenter.tsx
import { SubscriptionList } from '../SubscriptionList' // ✅ Containerを呼び出す（index.tsでエクスポートされたもの）

export function MySubscriptionListPresenter() {
  return (
    <div>
      <h1>マイサブスク</h1>
      {/* ✅ Containerを呼び出すのはOK */}
      <SubscriptionList />
    </div>
  )
}
```

ただし、この場合はMySubscriptionListPresenterが独自のロジックと表示を持つべきなので、通常は方法1（独自に実装）を選択します。

## コンポーネント分割のルール

### 1ファイル1コンポーネントの原則

**すべてのClient Componentは1ファイルにつき1コンポーネントのみ定義すること。**

複数のコンポーネントが1ファイルに存在する場合は、以下のルールに従って分割します：

#### View専用コンポーネント（ロジックなし）の場合

**同じディレクトリ内に配置**します。
```
SubscriptionList/
├─ index.ts
├─ SubscriptionListContainer.tsx   # メインのContainer
├─ SubscriptionListPresenter.tsx   # メインのPresenter
├─ SubscriptionCard.tsx            # ✅ View専用の子コンポーネント（同じディレクトリ）
└─ SubscriptionListSkeleton.tsx    # ✅ View専用の子コンポーネント（同じディレクトリ）
```

**例：View専用コンポーネント**
```tsx
// SubscriptionCard.tsx
import Link from 'next/link'
import type { SubscriptionResponse } from '@/features/subscription/types'

interface SubscriptionCardProps {
  subscription: SubscriptionResponse
  onDelete: () => void
}

export function SubscriptionCard({ subscription, onDelete }: SubscriptionCardProps) {
  const cycleLabel = subscription.billingCycle === 'monthly' ? '月額' : '年額'

  return (
    <Link
      href={`/subscriptions/${subscription.id}/edit`}
      className="block rounded-lg border p-4 hover:bg-zinc-50 dark:hover:bg-zinc-800"
    >
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">{subscription.serviceName}</h3>
        <p>¥{subscription.amount.toLocaleString()} / {cycleLabel}</p>
      </div>
      <p className="text-sm text-zinc-500">
        次回請求日: {subscription.nextBillingDate}
      </p>
      {subscription.paymentMethod && (
        <p className="text-sm text-zinc-500">
          💳 {subscription.paymentMethod.name}
        </p>
      )}
    </Link>
  )
}
```

#### ロジックを含むコンポーネントの場合

**client配下に新しいディレクトリを作成**します。
```
client/
├─ SubscriptionList/
│  ├─ index.ts
│  ├─ SubscriptionListContainer.tsx
│  ├─ SubscriptionListPresenter.tsx
│  └─ useSubscriptionList.ts
└─ SubscriptionFilter/              # ✅ ロジックを含むため別ディレクトリ
   ├─ index.ts
   ├─ SubscriptionFilterContainer.tsx
   ├─ SubscriptionFilterPresenter.tsx
   └─ useSubscriptionFilter.ts
```

### Presenterのルール

**Presenterコンポーネントはロジックを持たず、propsで渡されたデータを表示するのみ。**

#### ❌ 悪い例：Presenterにロジックがある
```tsx
export function SubscriptionListPresenter({ subscriptions }: Props) {
  // ❌ Presenterでフィルタリングロジックを持っている
  const [filter, setFilter] = useState('all')
  const filteredSubscriptions = subscriptions.filter(sub =>
    filter === 'all' ? true : sub.billingCycle === filter
  )

  return (
    <div>
      <select onChange={(e) => setFilter(e.target.value)}>
        <option value="all">すべて</option>
        <option value="monthly">月額</option>
        <option value="yearly">年額</option>
      </select>
      {filteredSubscriptions.map(sub => (
        <SubscriptionCard key={sub.id} subscription={sub} />
      ))}
    </div>
  )
}
```

#### ✅ 良い例：ロジックはContainerとHookに分離
```tsx
// SubscriptionListPresenter.tsx
export function SubscriptionListPresenter({
  subscriptions,
  filter,
  onFilterChange
}: Props) {
  // ✅ ロジックなし、propsで渡されたものを表示するのみ
  return (
    <div>
      <select value={filter} onChange={(e) => onFilterChange(e.target.value)}>
        <option value="all">すべて</option>
        <option value="monthly">月額</option>
        <option value="yearly">年額</option>
      </select>
      {subscriptions.map(sub => (
        <SubscriptionCard key={sub.id} subscription={sub} />
      ))}
    </div>
  )
}
```
```tsx
// SubscriptionListContainer.tsx
export function SubscriptionListContainer() {
  // ✅ ロジックはContainerとHookに集約
  const { subscriptions, filter, handleFilterChange } = useSubscriptionList()

  return (
    <SubscriptionListPresenter
      subscriptions={subscriptions}
      filter={filter}
      onFilterChange={handleFilterChange}
    />
  )
}
```

## ベストプラクティス

1. **1ファイル1コンポーネント**: 複数のコンポーネントがある場合は必ず分割する
2. **Presenterは純粋な表示のみ**: ロジック（useState、useEffect等）を持たない
3. **ロジックの配置**: Container + Custom Hookにロジックを集約
4. **View専用コンポーネントの配置**: ロジックがないなら同じディレクトリ、ロジックがあるなら別ディレクトリ
5. **単一責任の原則**: 各コンポーネントは1つの責任のみを持つ
6. **再利用性**: 汎用的なコンポーネントは`shared/`へ移動
7. **テスタビリティ**: PresenterはPropsのみに依存
8. **型安全性**: 全てのインターフェースを明示的に定義
9. **Presenterの独立性**: Presenterは他のPresenterを呼び出さない（同じディレクトリ内のContainerからのみ呼び出される）
10. **命名規則**:
    - ファイル名とコンポーネント名を一致させる（アッパーキャメルケース）
    - Server ComponentsはxxxPageTemplateの命名規則
    - Client Componentsはindex.tsで適切な名前でエクスポート