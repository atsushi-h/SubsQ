# 開発ガイド

## 新規画面追加フロー

### 1. ルート設計

適切なルートグループを選択：
- `(guest)` - 未ログインユーザー向け
- `(authenticated)` - ログイン必須

### 2. ページ作成
```bash
# 例：サブスク編集画面
mkdir -p app/(authenticated)/subscriptions/[id]/edit
touch app/(authenticated)/subscriptions/[id]/edit/page.tsx
touch app/(authenticated)/subscriptions/[id]/edit/loading.tsx
```

### 3. Feature実装
```bash
# Featureモジュール作成
mkdir -p features/subscription/components/server
mkdir -p features/subscription/components/client/SubscriptionForm
mkdir -p features/subscription/hooks
mkdir -p features/subscription/types
```

### 4. 実装チェックリスト

- [ ] ページコンポーネント（RSC）
- [ ] サーバーテンプレート
- [ ] クライアントコンポーネント（Container/Presenter）
- [ ] カスタムフック
- [ ] Server Actions
- [ ] 型定義
- [ ] ローディング状態
- [ ] エラーハンドリング

## コーディング規約

### ファイル命名規則
```
- コンポーネント: PascalCase.tsx
- フック: useCamelCase.ts
- ユーティリティ: camelCase.ts
- 型定義: types/index.ts
- Server Actions: camelCase.action.ts
```

### インポート順序
```tsx
// 1. React/Next
import { useState } from 'react'
import { useRouter } from 'next/navigation'

// 2. 外部ライブラリ
import { useQuery } from '@tanstack/react-query'
import { z } from 'zod'

// 3. 内部モジュール（絶対パス）
import { Button } from '@/components/ui/button'
import { useAuth } from '@/lib/auth'

// 4. 相対パス
import { SubscriptionCard } from './SubscriptionCard'
import type { SubscriptionListProps } from './types'
```

### コンポーネント構造
```tsx
// 1. 型定義
interface ComponentProps {
  // ...
}

// 2. コンポーネント定義
export function Component({ prop1, prop2 }: ComponentProps) {
  // 3. フック
  const router = useRouter()
  const { data } = useQuery()
  
  // 4. ローカル状態
  const [state, setState] = useState()
  
  // 5. 副作用
  useEffect(() => {}, [])
  
  // 6. ハンドラー（必ずuseCallbackを使用）
  const handleClick = useCallback(() => {
    // 処理
  }, [/* 依存配列 */])
  
  // 7. レンダリング
  return <div>...</div>
}
```

## 型定義ガイドライン

### 基本的な型定義
```ts
// ❌ 避けるべき
const data: any = {}
const items: Array<Object> = []

// ✅ 推奨
const data: SubscriptionResponse = {}
const items: PaymentMethodResponse[] = []
```

### ユーティリティ型の活用
```ts
// Partial（一部のプロパティ）
type UpdateSubscriptionInput = Partial<Subscription>

// Omit（特定のプロパティを除外）
type CreateSubscriptionInput = Omit<Subscription, 'id' | 'createdAt'>

// Pick（特定のプロパティのみ）
type SubscriptionPreview = Pick<Subscription, 'id' | 'serviceName' | 'amount'>
```

## Next.js グローバル型定義

Next.js 15以降では、`LayoutProps`と`PageProps`がグローバルに利用可能です。importする必要はありません。

### Layout Component
```tsx
// app/(authenticated)/layout.tsx
export default function AuthenticatedLayout(props: LayoutProps<'/'>) {
  return (
    <AuthenticatedLayoutWrapper>
      {props.children}
    </AuthenticatedLayoutWrapper>
  )
}
```

### Page Component
```tsx
// app/(authenticated)/subscriptions/[id]/edit/page.tsx
export default async function SubscriptionEditPage(props: PageProps<'/subscriptions/[id]/edit'>) {
  const params = await props.params
  
  return <SubscriptionEditPageTemplate subscriptionId={params.id} />
}

// パラメータが不要な場合
export default function SubscriptionsPage(_props: PageProps<'/subscriptions'>) {
  return <SubscriptionListPageTemplate />
}
```

### 型の詳細

- `LayoutProps<T>`: Tはルートパス。childrenとparamsを含む
- `PageProps<T>`: Tはルートパス。paramsとsearchParamsを含む
- 両方ともPromiseを返すため、awaitが必要

## Server ActionsとServer Functions

### 命名規則

`external/handler`ディレクトリ内の関数は、以下の命名規則に従ってください：

#### Server Functions（`*.server.ts`）

サーバー専用関数は、操作の種類に応じて以下の命名規則を使用します：

- **Query（読み取り）**: `xxxQuery` または `xxxQueryServer`
- **Command（書き込み）**: `xxxCommand` または `xxxCommandServer`

```ts
// ❌ 悪い例
export async function getSubscriptionByIdServer(id: string) { ... }

// ✅ 良い例
export async function getSubscriptionByIdQuery(id: string) { ... }
export async function createSubscriptionCommand(data: CreateSubscriptionRequest) { ... }
```

#### Server Actions（`*.action.ts`）

Server Actionsは、対応するServer Functionに`Action`サフィックスを付けます：

- **Query Actions**: `xxxQueryAction`
- **Command Actions**: `xxxCommandAction`

```ts
// ❌ 悪い例
export async function getSubscriptionByIdAction(id: string) { ... }

// ✅ 良い例
export async function getSubscriptionByIdQueryAction(id: string) { ... }
export async function createSubscriptionCommandAction(data: CreateSubscriptionRequest) { ... }
```

### 重要な使い分けルール

**RSC (React Server Component) から呼び出す場合は必ず`*Query`/`*Command`関数を使用すること。`*Action`関数は使用しない。**

| 呼び出し元 | 使用すべき関数 | 例 |
|---|---|---|
| Client Component | `*Action` | `useQuery`のqueryFn、フォームsubmit |
| Server Component (RSC) | `*Query`/`*Command` | page.tsx, layout.tsx, PageTemplate.tsx |

### 認証ヘルパー関数

#### requireAuthServer

認証チェックのみを行い、未認証の場合は`/login`にリダイレクトします。セッション情報が不要な場合に使用します。
```ts
// external/handler/subscription.query.server.ts
import { requireAuthServer } from '@/features/auth/servers/redirect.server'

export async function listSubscriptionsQuery() {
  await requireAuthServer() // 認証チェックのみ

  const subscriptions = await subscriptionService.listSubscriptions()
  return subscriptions
}
```

#### getAuthenticatedSessionServer

認証チェックとセッション取得を1回で行います。未認証の場合は`/login`にリダイレクトします。セッション情報（`session.user.id`など）が必要な場合に使用します。
```ts
// external/handler/subscription.command.server.ts
import { getAuthenticatedSessionServer } from '@/features/auth/servers/redirect.server'

export async function createSubscriptionCommand(request: unknown) {
  const session = await getAuthenticatedSessionServer() // 認証チェック + セッション取得

  const validated = CreateSubscriptionRequestSchema.parse(request)
  const subscription = await subscriptionService.createSubscription(session.user.id, validated)
  return subscription
}
```

**使い分けのポイント:**
- セッション情報が**不要** → `requireAuthServer()`
- セッション情報が**必要** → `getAuthenticatedSessionServer()`

### Server Actions（クライアントから呼び出し可能）
```ts
// external/handler/subscription.command.action.ts
'use server'

import { createSubscriptionCommand } from './subscription.command.server'
import type { CreateSubscriptionRequest, SubscriptionResponse } from '../dto/subscription.dto'

export type CreateSubscriptionResult =
  | { success: true; data: SubscriptionResponse }
  | { success: false; error?: string; fieldErrors?: Record<string, string[]> }

export async function createSubscriptionCommandAction(
  request: CreateSubscriptionRequest
): Promise<CreateSubscriptionResult> {
  try {
    const subscription = await createSubscriptionCommand(request)
    return { success: true, data: subscription }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : '作成に失敗しました',
    }
  }
}
```

**使用例（Client Component）:**
```tsx
// features/subscription/hooks/useSubscriptionQuery.ts
export function useSubscriptionListQuery() {
  return useQuery({
    queryKey: subscriptionKeys.list(),
    queryFn: () => listSubscriptionsQueryAction(), // ✅ Client ComponentからはAction
  })
}
```

### Server Functions（サーバー専用）
```ts
// external/handler/subscription.query.server.ts
import 'server-only'

export async function listSubscriptionsQuery() {
  // ビジネスロジック
}
```

**使用例（Server Component）:**
```tsx
// app/(authenticated)/subscriptions/page.tsx
export default async function SubscriptionsPage() {
  const data = await listSubscriptionsQuery() // ✅ RSCからはQuery/Command

  return <SubscriptionListPageTemplate initialData={data} />
}
```

## テスト戦略

### 単体テスト
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
  it('年額を月額換算する', () => {
    expect(toMonthlyAmount(12000, 'yearly')).toBe(1000)
  })

  it('月額はそのまま返す', () => {
    expect(toMonthlyAmount(1000, 'monthly')).toBe(1000)
  })
})
```

### 統合テスト
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

## パフォーマンス最適化

### 動的インポート
```tsx
// 重いコンポーネントの遅延読み込み
const DatePicker = dynamic(
  () => import('@/components/ui/DatePicker'),
  { 
    loading: () => <DatePickerSkeleton />,
    ssr: false 
  }
)
```

### 画像最適化
```tsx
import Image from 'next/image'

<Image
  src="/logo.png"
  alt="SubsQ Logo"
  width={40}
  height={40}
  priority // Above the fold画像
/>
```

### バンドルサイズ削減
```ts
// ❌ 全体インポート
import _ from 'lodash'

// ✅ 個別インポート
import debounce from 'lodash/debounce'
```

## トランザクション管理（externalディレクトリ）

> **注意**: このセクションは`external`ディレクトリ内のRepository/Service層の実装に関する内容です。
>
> - **適用範囲**: `external`ディレクトリのみ
> - **適用外**: `features`、`shared`、`app`ディレクトリには適用されません
>
> **Next.js自体をクリーンアーキテクチャにしているわけではありません**。Next.jsのApp Router、Server Components、Server Actionsといった機能は通常通り使用し、データアクセス層（Repository/Service）のみをクリーンアーキテクチャで設計しています。

### アーキテクチャ概要

`external`ディレクトリでは、クリーンアーキテクチャに基づいたトランザクション管理を実装しています。

```
Service層 (use case)
    ↓ 依存 (interface)
Domain層 (ITransactionManager, IRepository)
    ↑ 実装
Repository層 (TransactionRepository, Repository実装)
    ↓ 依存
Client層 (db, Drizzle ORM)
```

### トランザクションが必要な操作

トランザクションは以下の条件で使用します：

1. **複数テーブルへの書き込み操作**
   - 複数の集約を順番に削除する場合
   - 例: ユーザー退会（subscriptions + payment_methods + user の削除）

2. **読み取り + 書き込みのセット**
   - データの存在確認や使用状況チェック後に削除を行う場合
   - 例: 支払い方法削除（使用中チェック + 削除）

#### SubsQでの具体例

| 操作 | トランザクション | 理由 |
|------|-----------------|------|
| ユーザー退会 | ✅ 必要 | subscriptions → payment_methods → user の順で削除 |
| 支払い方法削除 | ✅ 必要 | 使用中チェックと削除の間に不整合が起きないようにする |
| サブスク作成/更新/削除 | ❌ 不要 | 単一テーブル操作 |
| 支払い方法 作成/更新 | ❌ 不要 | 単一テーブル操作 |
| 一覧取得 | ❌ 不要 | 読み取りのみ |

#### 補足：DB制約との関係

SubsQではDB制約も設定しています：

users → subscriptions (CASCADE)
users → payment_methods (CASCADE)
payment_methods → subscriptions (RESTRICT)

### トランザクション実装パターン

#### Service層での使用
```ts
// external/service/user.service.ts
export class UserService {
  constructor(
    private userRepository: IUserRepository,
    private subscriptionRepository: ISubscriptionRepository,
    private paymentMethodRepository: IPaymentMethodRepository,
    private transactionManager: ITransactionManager<DbClient>,
  ) {}

  async deleteAccount(userId: string): Promise<void> {
    return this.transactionManager.execute(async (tx) => {
      // 1. サブスク全削除
      await this.subscriptionRepository.deleteAllByUserId(userId, tx);

      // 2. 支払い方法全削除
      await this.paymentMethodRepository.deleteAllByUserId(userId, tx);

      // 3. ユーザー削除
      await this.userRepository.delete(userId, tx);
    });
  }
}
```
```ts
// external/service/payment-method.service.ts
export class PaymentMethodService {
  constructor(
    private paymentMethodRepository: IPaymentMethodRepository,
    private subscriptionRepository: ISubscriptionRepository,
    private transactionManager: ITransactionManager<DbClient>,
  ) {}

  async deletePaymentMethod(userId: string, paymentMethodId: string): Promise<void> {
    return this.transactionManager.execute(async (tx) => {
      // 1. 使用中チェック（読み取り）
      const usageCount = await this.subscriptionRepository.countByPaymentMethodId(paymentMethodId, tx);
      if (usageCount > 0) {
        throw new Error("この支払い方法は使用中のため削除できません");
      }

      // 2. 削除（書き込み）
      await this.paymentMethodRepository.delete(userId, paymentMethodId, tx);
    });
  }
}
```

#### Repository層での対応
```ts
// external/repository/subscription.repository.ts
export class SubscriptionRepository implements ISubscriptionRepository {
  async deleteAllByUserId(userId: string, client: DbClient = db): Promise<void> {
    await client
      .delete(subscriptions)
      .where(eq(subscriptions.userId, userId));
  }

  async countByPaymentMethodId(paymentMethodId: string, client: DbClient = db): Promise<number> {
    const [result] = await client
      .select({ count: count() })
      .from(subscriptions)
      .where(eq(subscriptions.paymentMethodId, paymentMethodId));

    return result.count;
  }
}
```
```ts
// external/repository/payment-method.repository.ts
export class PaymentMethodRepository implements IPaymentMethodRepository {
  async delete(userId: string, paymentMethodId: string, client: DbClient = db): Promise<void> {
    await client
      .delete(paymentMethods)
      .where(
        and(
          eq(paymentMethods.id, paymentMethodId),
          eq(paymentMethods.userId, userId)
        )
      );
  }

  async deleteAllByUserId(userId: string, client: DbClient = db): Promise<void> {
    await client
      .delete(paymentMethods)
      .where(eq(paymentMethods.userId, userId));
  }
}
```

### COMMIT/ROLLBACK

Drizzle ORMの`db.transaction()`が自動的に処理します：

- **自動COMMIT**: コールバック関数が正常に完了したら自動的にCOMMIT
- **自動ROLLBACK**: コールバック関数内でエラーがthrowされたら自動的にROLLBACK

```ts
// TransactionRepository実装
async execute<T>(callback: (tx: DbClient) => Promise<T>): Promise<T> {
  return await db.transaction(async (tx) => {
    return await callback(tx);
    // 成功 → 自動COMMIT
    // エラー → 自動ROLLBACK
  });
}
```

明示的に`commit()`や`rollback()`を呼ぶ必要はありません。

### トランザクション不要な操作

以下の場合はトランザクションを使用しません：

1. **読み取り専用のクエリ**
```ts
async getSubscriptionById(id: string): Promise<Subscription | null> {
  return this.subscriptionRepository.findById(id); // トランザクション不要
}
```

2. **単一テーブルへの単純な操作**
```ts
async createSubscription(userId: string, input: CreateSubscriptionInput) {
  return this.subscriptionRepository.create(userId, input); // 単一テーブルへの書き込み
}
```

3. **単一エンティティの操作**
   - Subscription、PaymentMethod（作成/更新）など、1つのテーブルで完結する操作

### 実装例まとめ

| ユースケース | トランザクション使用 | 理由 |
|---|---|---|
| ユーザー退会 | ✅ 必要 | subscriptions + payment_methods + user の削除 |
| 支払い方法削除 | ✅ 必要 | 使用中チェック + 削除 |
| サブスク作成 | ❌ 不要 | 単一テーブル操作 |
| サブスク更新 | ❌ 不要 | 単一テーブル操作 |
| サブスク削除 | ❌ 不要 | 単一テーブル操作 |
| 支払い方法作成 | ❌ 不要 | 単一テーブル操作 |
| 支払い方法更新 | ❌ 不要 | 単一テーブル操作 |
| サブスク一覧取得 | ❌ 不要 | 読み取りのみ |
| 支払い方法一覧取得 | ❌ 不要 | 読み取りのみ |
| ユーザー情報取得 | ❌ 不要 | 単一エンティティの読み取り |

## デバッグテクニック

### React Query Devtools

開発環境で自動的に有効化されます。

### Server Componentsのデバッグ
```tsx
// コンソール出力はサーバー側に表示
export default async function Page() {
  console.log('This logs on the server')

  const data = await listSubscriptionsQuery()
  console.log('Fetched data:', data)

  return <div>...</div>
}
```

### Client Componentsのデバッグ
```tsx
'use client'

export function Component() {
  // ブラウザコンソールに表示
  console.log('This logs in the browser')

  // React Developer Tools で確認可能
  return <div>...</div>
}
```