# External Layer (外部連携層)

## 概要

External層は、アプリケーションと外部システム（DB、API）との境界を管理します。**将来的にバックエンドをGoなどの別のAPIに移行する際の変更可用性を考慮**し、Next.jsから直接DBに接続せず、API層を通じてデータをやり取りする設計になっています。

## 設計思想

- **変更容易性**: バックエンドの実装が変わっても、フロントエンドの変更を最小限に抑える
- **関心の分離**: ビジネスロジックと外部依存を明確に分離
- **型安全性**: DTOによる入出力の型保証

## ディレクトリ構造

```
external/
├─ dto/          # データ転送オブジェクト（API契約）
├─ handler/      # エントリーポイント（CQRSパターン）
├─ service/      # ビジネスロジック・API呼び出し
└─ client/       # HTTPクライアント・DB接続（将来的にはAPIクライアントのみ）
```

## レイヤーの責務

### DTO (Data Transfer Object)

APIとの契約を定義。バックエンドがどの技術で実装されていても、このインターフェースは維持されます。
```ts
// external/dto/subscription.dto.ts
import { z } from 'zod'

// ===========================================
// リクエスト
// ===========================================
export const BillingCycleSchema = z.enum(['monthly', 'yearly'])

export const CreateSubscriptionRequestSchema = z.object({
  serviceName: z.string().min(1, 'サービス名は必須です'),
  amount: z.number().int().min(0).max(1000000),
  billingCycle: BillingCycleSchema,
  baseDate: z.number().int(),
  paymentMethodId: z.string().uuid().optional(),
  memo: z.string().optional(),
})

// ===========================================
// レスポンス
// ===========================================
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

export const ListSubscriptionsResponseSchema = z.object({
  subscriptions: z.array(SubscriptionResponseSchema),
  summary: z.object({
    monthlyTotal: z.number(),
    yearlyTotal: z.number(),
    count: z.number(),
  }),
})

// 型エクスポート
export type BillingCycle = z.infer<typeof BillingCycleSchema>
export type CreateSubscriptionRequest = z.infer<typeof CreateSubscriptionRequestSchema>
export type SubscriptionResponse = z.infer<typeof SubscriptionResponseSchema>
export type ListSubscriptionsResponse = z.infer<typeof ListSubscriptionsResponseSchema>
```
```ts
// external/dto/error.dto.ts
import { z } from 'zod'

// RFC 7807準拠のエラーレスポンス
export const ErrorResponseSchema = z.object({
  type: z.string(),
  title: z.string(),
  status: z.number(),
  detail: z.string(),
  instance: z.string().optional(),
})

export type ErrorResponse = z.infer<typeof ErrorResponseSchema>
```

### Handler (CQRSパターン)

外部からのエントリーポイント。コマンドとクエリを分離し、読み書きの責務を明確化。
```ts
// external/handler/subscription.query.server.ts
import 'server-only'

import { subscriptionService } from '../service/subscription.service'
import { ListSubscriptionsResponseSchema, SubscriptionResponseSchema } from '../dto/subscription.dto'

export async function listSubscriptionsServer(userId: string) {
  // サービス層を通じてデータ取得
  const result = await subscriptionService.listSubscriptions(userId)

  // DTOで型を保証して返す
  return ListSubscriptionsResponseSchema.parse(result)
}
```
```ts
// external/handler/subscription.command.action.ts
'use server'

import { CreateSubscriptionRequestSchema } from '../dto/subscription.dto'
import { subscriptionService } from '../service/subscription.service'
import { getCurrentUser } from '@/lib/auth'
import type { SubscriptionResponse } from '../dto/subscription.dto'

export type CreateSubscriptionResult =
  | { success: true; data: SubscriptionResponse }
  | { success: false; error?: string; fieldErrors?: Record<string, string[]> }

export async function createSubscriptionAction(
  request: unknown
): Promise<CreateSubscriptionResult> {
  // 認証チェック
  const user = await getCurrentUser()
  if (!user) {
    return { success: false, error: '認証が必要です' }
  }

  // バリデーション
  const result = CreateSubscriptionRequestSchema.safeParse(request)
  if (!result.success) {
    return {
      success: false,
      fieldErrors: result.error.flatten().fieldErrors as Record<string, string[]>,
    }
  }

  // サービス層を通じて作成
  try {
    const subscription = await subscriptionService.createSubscription(user.id, result.data)
    return { success: true, data: subscription }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : '作成に失敗しました',
    }
  }
}
```

### Service (ビジネスロジック)

ビジネスロジックを実装し、**現在はDBに直接アクセスしているが、将来的には外部APIを呼び出すように変更可能**な設計。
```ts
// external/service/subscription.service.ts
import { db } from '../client/db'
import { subscriptions } from '../client/schema'
import type { CreateSubscriptionRequest, SubscriptionResponse } from '../dto/subscription.dto'
import { calculateNextBillingDate, toMonthlyAmount, toYearlyAmount } from './calculation'

class SubscriptionService {
  async createSubscription(
    userId: string,
    input: CreateSubscriptionRequest
  ): Promise<SubscriptionResponse> {
    // 現在: Next.jsから直接DB操作（開発効率重視）
    const now = Math.floor(Date.now() / 1000)
    const result = await db
      .insert(subscriptions)
      .values({
        userId,
        serviceName: input.serviceName,
        amount: input.amount,
        billingCycle: input.billingCycle,
        baseDate: input.baseDate,
        paymentMethodId: input.paymentMethodId || null,
        memo: input.memo || null,
        createdAt: now,
        updatedAt: now,
      })
      .returning()

    const sub = result[0]
    const cycle = sub.billingCycle as 'monthly' | 'yearly'

    return {
      id: sub.id,
      userId: sub.userId,
      serviceName: sub.serviceName,
      amount: sub.amount,
      billingCycle: cycle,
      baseDate: sub.baseDate,
      nextBillingDate: calculateNextBillingDate(sub.baseDate, cycle),
      paymentMethodId: sub.paymentMethodId,
      paymentMethod: null,
      memo: sub.memo,
      monthlyAmount: toMonthlyAmount(sub.amount, cycle),
      yearlyAmount: toYearlyAmount(sub.amount, cycle),
      createdAt: new Date(sub.createdAt * 1000).toISOString(),
      updatedAt: new Date(sub.updatedAt * 1000).toISOString(),
    }

    // 将来: 外部APIを呼び出す実装に変更可能
    async createSubscriptionViaAPI(
      userId: string,
      input: CreateSubscriptionRequest
    ): Promise<SubscriptionResponse> {
      const response = await apiClient.post('/api/subscription', {
        ...input,
        userId,
      })
      
      return SubscriptionResponseSchema.parse(response.data)
    }
  }
}

export const subscriptionService = new SubscriptionService()
```

### Client (外部通信)

DB接続とHTTPクライアントを管理。将来的にはAPIクライアントに一本化。
スキーマ定義は[データベース設計書](./06_database_design.md)を参照。
```ts
// external/client/db.ts
import { drizzle } from 'drizzle-orm/neon-http'
import { neon } from '@neondatabase/serverless'
import * as schema from './schema'

const sql = neon(process.env.DATABASE_URL!)
export const db = drizzle(sql, { schema })
```
```ts
// external/client/api-client.ts
import axios from 'axios'

// 将来的に外部APIサーバーと通信する際のクライアント
export const apiClient = axios.create({
  baseURL: process.env.API_BASE_URL || 'http://localhost:8080',
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
})

// レスポンスインターセプター
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // 認証エラー処理
    }
    return Promise.reject(error)
  }
)
```

## データフロー

### 現在の実装（Next.js + DB直接接続）
```
Client Component
    ↓
Server Action (*.action.ts)
    ↓
Service (DB直接操作)
    ↓
Database (Neon PostgreSQL via Drizzle ORM)
```

### 将来の実装（Next.js + 外部API）
```
Client Component
    ↓
Server Action (*.action.ts)
    ↓
Service (API呼び出し)
    ↓
External API (Go/Rust/etc)
    ↓
Database
```

## 移行戦略

1. **インターフェースの維持**: DTOの型定義は変更しない
2. **段階的移行**: サービス層のメソッドを1つずつAPIに置き換え
3. **フィーチャーフラグ**: 環境変数でDB直接/API切り替え

```ts
// external/service/base.service.ts
export abstract class BaseService {
  protected get useExternalAPI(): boolean {
    return process.env.USE_EXTERNAL_API === 'true'
  }

  protected async fetchData<T>(
    dbFetcher: () => Promise<T>,
    apiFetcher: () => Promise<T>
  ): Promise<T> {
    return this.useExternalAPI ? apiFetcher() : dbFetcher()
  }
}
```

## 命名規則

- **Query**: `*.query.server.ts` / `*.query.action.ts`
- **Command**: `*.command.server.ts` / `*.command.action.ts`
- **Server専用**: `import 'server-only'`を必ず記載
- **型定義**: DTOは入出力の契約、内部実装に依存しない

## ベストプラクティス

1. **DTOを変更しない**: バックエンドの実装が変わってもインターフェースは維持
2. **サービス層で抽象化**: DB操作とAPI呼び出しを同じインターフェースで扱う
3. **エラーハンドリング統一**: DB/APIどちらでも同じエラー型を返す
4. **テスト容易性**: サービス層をモックすることで、バックエンドに依存しないテストが可能
5. **認証チェック**: Command（Server Action）では必ず`getCurrentUser()`で認証チェック