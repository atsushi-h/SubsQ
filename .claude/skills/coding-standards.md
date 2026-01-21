# コーディング規約・ベストプラクティス

全プロジェクトに適用される汎用的なコーディング規約。

---

## コード品質の原則

### 1. 可読性ファースト
- コードは書く回数より読む回数の方が多い
- 明確な変数名・関数名を使用
- コメントよりも自己文書化コードを優先
- 一貫したフォーマット

### 2. KISS（Keep It Simple, Stupid）
- 動作する最もシンプルな解決策を選ぶ
- 過剰設計を避ける
- 早すぎる最適化はしない
- 賢いコードより理解しやすいコード

### 3. DRY（Don't Repeat Yourself）
- 共通ロジックは関数に抽出
- 再利用可能なコンポーネントを作成
- モジュール間でユーティリティを共有
- コピペプログラミングを避ける

### 4. YAGNI（You Aren't Gonna Need It）
- 必要になる前に機能を作らない
- 投機的な汎用化を避ける
- 必要になってから複雑さを追加
- シンプルに始めて、必要に応じてリファクタリング

---

## TypeScript規約

### 変数命名

```typescript
// ✅ 良い例: 説明的な名前
const subscriptionSearchQuery = 'Netflix'
const isUserAuthenticated = true
const totalMonthlyAmount = 1000

// ❌ 悪い例: 不明確な名前
const q = 'Netflix'
const flag = true
const x = 1000
```

### 関数命名

```typescript
// ✅ 良い例: 動詞-名詞パターン
async function fetchSubscriptionData(subscriptionId: string) { }
function calculateMonthlyAmount(amount: number, cycle: BillingCycle) { }
function isValidEmail(email: string): boolean { }

// ❌ 悪い例: 不明確または名詞のみ
async function subscription(id: string) { }
function amount(a, c) { }
function email(e) { }
```

### イミュータビリティパターン（重要）

```typescript
// ✅ 常にスプレッド演算子を使用
const updatedSubscription = {
  ...subscription,
  serviceName: 'New Name'
}

const updatedArray = [...subscriptions, newSubscription]

// ❌ 直接変更は禁止
subscription.serviceName = 'New Name'  // ダメ
subscriptions.push(newSubscription)    // ダメ
```

### エラーハンドリング

```typescript
// ✅ 良い例: 包括的なエラーハンドリング
async function fetchSubscriptions(userId: string) {
  try {
    const response = await fetch(`/api/subscriptions?userId=${userId}`)

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    return await response.json()
  } catch (error) {
    console.error('取得に失敗:', error)
    throw new Error('サブスクリプションの取得に失敗しました')
  }
}

// ❌ 悪い例: エラーハンドリングなし
async function fetchSubscriptions(userId) {
  const response = await fetch(`/api/subscriptions?userId=${userId}`)
  return response.json()
}
```

### 非同期処理のベストプラクティス

```typescript
// ✅ 良い例: 可能な限り並列実行
const [subscriptions, paymentMethods, user] = await Promise.all([
  fetchSubscriptions(userId),
  fetchPaymentMethods(userId),
  fetchUser(userId)
])

// ❌ 悪い例: 不要な直列実行
const subscriptions = await fetchSubscriptions(userId)
const paymentMethods = await fetchPaymentMethods(userId)
const user = await fetchUser(userId)
```

### 型安全性

```typescript
// ✅ 良い例: 適切な型定義
interface Subscription {
  id: string
  serviceName: string
  amount: number
  billingCycle: 'monthly' | 'yearly'
  createdAt: string
}

function getSubscription(id: string): Promise<Subscription> {
  // 実装
}

// ❌ 悪い例: anyの使用
function getSubscription(id: any): Promise<any> {
  // 実装
}
```

---

## React規約

### コンポーネント構造

```typescript
// ✅ 良い例: 型付き関数コンポーネント
type Props = {
  children: React.ReactNode
  onClick: () => void
  disabled?: boolean
  variant?: 'primary' | 'secondary'
}

export function Button({
  children,
  onClick,
  disabled = false,
  variant = 'primary'
}: Props) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`btn btn-${variant}`}
    >
      {children}
    </button>
  )
}

// ❌ 悪い例: 型なし、不明確な構造
export function Button(props) {
  return <button onClick={props.onClick}>{props.children}</button>
}
```

### カスタムフック

```typescript
// ✅ 良い例: 再利用可能なカスタムフック
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => clearTimeout(handler)
  }, [value, delay])

  return debouncedValue
}

// 使用例
const debouncedQuery = useDebounce(searchQuery, 500)
```

### 状態管理

```typescript
// ✅ 良い例: 適切な状態更新
const [count, setCount] = useState(0)

// 前の状態に基づく更新は関数形式を使用
setCount(prev => prev + 1)

// ❌ 悪い例: 直接参照
setCount(count + 1)  // 非同期シナリオで古い値になる可能性あり
```

### 条件付きレンダリング

```typescript
// ✅ 良い例: 明確な条件付きレンダリング
{isLoading && <Spinner />}
{error && <ErrorMessage error={error} />}
{data && <DataDisplay data={data} />}

// ❌ 悪い例: 三項演算子の入れ子
{isLoading ? <Spinner /> : error ? <ErrorMessage error={error} /> : data ? <DataDisplay data={data} /> : null}
```

### useCallbackの使用

```typescript
// ✅ 良い例: イベントハンドラーはuseCallbackでメモ化
const handleDelete = useCallback((id: string) => {
  deleteSubscription(id)
}, [deleteSubscription])

const handleSubmit = useCallback(async (data: FormData) => {
  await createSubscription(data)
}, [createSubscription])
```

---

## Zodバリデーション

### スキーマ定義

```typescript
import { z } from 'zod'

// ✅ 良い例: 明確なスキーマ定義
const CreateSubscriptionSchema = z.object({
  serviceName: z.string().min(1, 'サービス名は必須です').max(100),
  amount: z.number().int().min(0).max(1000000),
  billingCycle: z.enum(['monthly', 'yearly']),
  baseDate: z.number().int(),
  paymentMethodId: z.string().uuid().optional(),
  memo: z.string().max(500).optional(),
})

// 型を自動生成
export type CreateSubscriptionRequest = z.infer<typeof CreateSubscriptionSchema>
```

### バリデーション実行

```typescript
// ✅ 良い例: Server Actionでのバリデーション
export async function createSubscriptionCommandAction(
  request: CreateSubscriptionRequest
): Promise<CreateSubscriptionResult> {
  try {
    const validated = CreateSubscriptionSchema.parse(request)
    const subscription = await createSubscriptionCommand(validated)
    return { success: true, data: subscription }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        fieldErrors: error.flatten().fieldErrors as Record<string, string[]>,
      }
    }
    return {
      success: false,
      error: error instanceof Error ? error.message : '作成に失敗しました',
    }
  }
}
```

---

## ファイル構成

### インポート順序

```typescript
// 1. React/Next
import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'

// 2. 外部ライブラリ
import { useQuery } from '@tanstack/react-query'
import { z } from 'zod'

// 3. 内部モジュール（絶対パス）
import { Button } from '@/shared/components/ui/Button'
import { subscriptionKeys } from '@/features/subscription/queries/subscription.query-keys'

// 4. 相対パス
import { SubscriptionCard } from './SubscriptionCard'
import type { SubscriptionListProps } from './types'
```

### ファイル命名

```
components/SubscriptionList.tsx    # PascalCase（コンポーネント）
hooks/useSubscriptionList.ts       # camelCase + useプレフィックス
lib/calculation.ts                 # camelCase（ユーティリティ）
types/subscription.types.ts        # camelCase + .typesサフィックス
schemas/subscription.schema.ts     # camelCase + .schemaサフィックス
```

---

## コメントとドキュメント

### コメントを書くタイミング

```typescript
// ✅ 良い例: 「なぜ」を説明する（「何を」ではない）
// API過負荷を避けるため、指数バックオフを使用
const delay = Math.min(1000 * Math.pow(2, retryCount), 30000)

// 大量データのパフォーマンスのため、意図的にミューテーションを使用
items.push(newItem)

// ❌ 悪い例: 自明なことを説明
// カウンターを1増やす
count++

// ユーザー名を設定
name = user.name
```

### JSDocの使用

```typescript
/**
 * 次回請求日を計算する
 *
 * @param baseDate - 基準日（Unix timestamp）
 * @param billingCycle - 請求サイクル（'monthly' | 'yearly'）
 * @returns 次回請求日（ISO 8601形式）
 *
 * @example
 * ```typescript
 * const nextDate = calculateNextBillingDate(1704067200, 'monthly')
 * console.log(nextDate) // "2024-02-01"
 * ```
 */
export function calculateNextBillingDate(
  baseDate: number,
  billingCycle: BillingCycle
): string {
  // 実装
}
```

---

## パフォーマンス

### メモ化

```typescript
import { useMemo, useCallback } from 'react'

// ✅ 良い例: 高コストな計算をメモ化
const sortedSubscriptions = useMemo(() => {
  return subscriptions.sort((a, b) => b.amount - a.amount)
}, [subscriptions])

// ✅ 良い例: コールバックをメモ化
const handleSearch = useCallback((query: string) => {
  setSearchQuery(query)
}, [])
```

### 遅延読み込み

```typescript
import { lazy, Suspense } from 'react'

// ✅ 良い例: 重いコンポーネントを遅延読み込み
const HeavyChart = lazy(() => import('./HeavyChart'))

export function Dashboard() {
  return (
    <Suspense fallback={<Spinner />}>
      <HeavyChart />
    </Suspense>
  )
}
```

### データベースクエリ

```typescript
// ✅ 良い例: 必要なカラムのみ選択
const subscriptions = await db
  .select({
    id: subscriptionsTable.id,
    serviceName: subscriptionsTable.serviceName,
    amount: subscriptionsTable.amount,
  })
  .from(subscriptionsTable)
  .where(eq(subscriptionsTable.userId, userId))

// ❌ 悪い例: 全カラム選択
const subscriptions = await db
  .select()
  .from(subscriptionsTable)
```

---

## テスト規約

### テスト構造（AAAパターン）

```typescript
test('月額を正しく計算する', () => {
  // Arrange（準備）
  const amount = 12000
  const cycle: BillingCycle = 'yearly'

  // Act（実行）
  const monthlyAmount = toMonthlyAmount(amount, cycle)

  // Assert（検証）
  expect(monthlyAmount).toBe(1000)
})
```

### テスト命名

```typescript
// ✅ 良い例: 説明的なテスト名
test('検索クエリに一致するサブスクがない場合、空配列を返す', () => { })
test('認証されていない場合、エラーをスローする', () => { })
test('支払い方法が使用中の場合、削除に失敗する', () => { })

// ❌ 悪い例: 曖昧なテスト名
test('動作する', () => { })
test('検索テスト', () => { })
```

---

## コードスメル検出

以下のアンチパターンに注意：

### 1. 長い関数
```typescript
// ❌ 悪い例: 50行を超える関数
function processSubscriptionData() {
  // 100行のコード
}

// ✅ 良い例: 小さな関数に分割
function processSubscriptionData() {
  const validated = validateData()
  const transformed = transformData(validated)
  return saveData(transformed)
}
```

### 2. 深いネスト
```typescript
// ❌ 悪い例: 5レベル以上のネスト
if (user) {
  if (user.isAuthenticated) {
    if (subscription) {
      if (subscription.isActive) {
        if (hasPermission) {
          // 何かをする
        }
      }
    }
  }
}

// ✅ 良い例: 早期リターン
if (!user) return
if (!user.isAuthenticated) return
if (!subscription) return
if (!subscription.isActive) return
if (!hasPermission) return

// 何かをする
```

### 3. マジックナンバー
```typescript
// ❌ 悪い例: 説明のない数値
if (retryCount > 3) { }
setTimeout(callback, 500)

// ✅ 良い例: 名前付き定数
const MAX_RETRIES = 3
const DEBOUNCE_DELAY_MS = 500

if (retryCount > MAX_RETRIES) { }
setTimeout(callback, DEBOUNCE_DELAY_MS)
```

---

## 重要な原則

**コード品質は妥協しない。** 明確で保守可能なコードが、高速な開発と自信を持ったリファクタリングを可能にする。