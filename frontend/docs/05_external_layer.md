# External Layer (外部連携層)

## 概要

External層は、アプリケーションと外部システム（DB、API）との境界を管理します。**将来的にバックエンドをGoなどの別のAPIに移行する際の変更容易性を考慮**した設計になっています。

### MVP段階と将来の関係

| フェーズ | データアクセス方式 | 備考 |
|---------|------------------|------|
| **MVP（現在）** | Server Functions / Server Actions → Service → DB直接 | 開発効率重視 |
| **将来** | Server Functions / Server Actions → 外部API | スケーラビリティ重視 |

### Server Functions と Server Actions の使い分け

| 呼び出し元 | 使用する関数 | ファイル | 用途 |
|-----------|------------|---------|------|
| Server Component (RSC) | Server Functions | `*.server.ts` | ページ表示時のデータ取得 |
| Client Component | Server Actions | `*.action.ts` | ユーザー操作（フォーム送信等） |

**重要**: RSCからは必ずServer Functions（`*Query`/`*Command`）を使用し、Server Actions（`*Action`）は使用しないでください。

## 設計思想

- **変更容易性**: バックエンドの実装が変わっても、フロントエンドの変更を最小限に抑える
- **関心の分離**: ビジネスロジックと外部依存を明確に分離
- **型安全性**: DTOによる入出力の型保証

## ディレクトリ構造

```
external/
├─ dto/          # データ転送オブジェクト（入出力の型定義）
├─ handler/      # エントリーポイント（CQRSパターン）
├─ service/      # ビジネスロジック・データアクセス
├─ repository/   # データベース操作（将来的にはAPI呼び出し）
└─ client/       # DB接続・HTTPクライアント
```

## レイヤーの責務

### DTO (Data Transfer Object)

入出力の型を定義。バックエンドがどの技術で実装されていても、このインターフェースは維持されます。
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

#### 命名規則

| 種類 | ファイル | 関数名 | 呼び出し元 |
|------|---------|--------|-----------|
| Query (Server Function) | `*.query.server.ts` | `xxxQuery` | RSC |
| Command (Server Function) | `*.command.server.ts` | `xxxCommand` | RSC |
| Query (Server Action) | `*.query.action.ts` | `xxxQueryAction` | Client Component |
| Command (Server Action) | `*.command.action.ts` | `xxxCommandAction` | Client Component |

#### Server Functions（RSCから呼び出し）
```ts
// external/handler/subscription.query.server.ts
import 'server-only'

import { requireAuthServer } from '@/features/auth/servers/redirect.server'
import { subscriptionService } from '../service/subscription.service'
import type { ListSubscriptionsResponse } from '../dto/subscription.dto'

export async function listSubscriptionsQuery(): Promise<ListSubscriptionsResponse> {
  const session = await requireAuthServer()

  // サービス層を通じてデータ取得
  return await subscriptionService.listSubscriptions(session.user.id)
}
```
```ts
// external/handler/subscription.command.server.ts
import 'server-only'

import { getAuthenticatedSessionServer } from '@/features/auth/servers/redirect.server'
import { CreateSubscriptionRequestSchema } from '../dto/subscription.dto'
import { subscriptionService } from '../service/subscription.service'
import type { SubscriptionResponse } from '../dto/subscription.dto'

export async function createSubscriptionCommand(
  request: unknown
): Promise<SubscriptionResponse> {
  const session = await getAuthenticatedSessionServer()

  // バリデーション
  const validated = CreateSubscriptionRequestSchema.parse(request)

  // サービス層を通じて作成
  return await subscriptionService.createSubscription(session.user.id, validated)
}
```

#### Server Actions（Client Componentから呼び出し）
```ts
// external/handler/subscription.query.action.ts
'use server'

import { listSubscriptionsQuery } from './subscription.query.server'
import type { ListSubscriptionsResponse } from '../dto/subscription.dto'

export type ListSubscriptionsResult =
  | { success: true; data: ListSubscriptionsResponse }
  | { success: false; error: string }

export async function listSubscriptionsQueryAction(): Promise<ListSubscriptionsResult> {
  try {
    const data = await listSubscriptionsQuery()
    return { success: true, data }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : '取得に失敗しました',
    }
  }
}
```
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

### Service (ビジネスロジック)

ビジネスロジックを実装。**現在はDBに直接アクセスしているが、将来的には外部APIを呼び出すように変更可能**な設計。
```ts
// external/service/subscription.service.ts
import { subscriptionRepository } from '../repository/subscription.repository'
import type { CreateSubscriptionRequest, SubscriptionResponse, ListSubscriptionsResponse } from '../dto/subscription.dto'
import { calculateNextBillingDate, toMonthlyAmount, toYearlyAmount } from './calculation'

class SubscriptionService {
  async listSubscriptions(userId: string): Promise<ListSubscriptionsResponse> {
    const subscriptions = await subscriptionRepository.findAllByUserId(userId)

    const mapped = subscriptions.map((sub) => this.toResponse(sub))
    const summary = this.calculateSummary(mapped)

    return { subscriptions: mapped, summary }
  }

  async createSubscription(
    userId: string,
    input: CreateSubscriptionRequest
  ): Promise<SubscriptionResponse> {
    const subscription = await subscriptionRepository.create(userId, input)
    return this.toResponse(subscription)
  }

  private toResponse(sub: Subscription): SubscriptionResponse {
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
      paymentMethod: sub.paymentMethod || null,
      memo: sub.memo,
      monthlyAmount: toMonthlyAmount(sub.amount, cycle),
      yearlyAmount: toYearlyAmount(sub.amount, cycle),
      createdAt: new Date(sub.createdAt * 1000).toISOString(),
      updatedAt: new Date(sub.updatedAt * 1000).toISOString(),
    }
  }

  private calculateSummary(subscriptions: SubscriptionResponse[]) {
    return {
      monthlyTotal: subscriptions.reduce((sum, s) => sum + s.monthlyAmount, 0),
      yearlyTotal: subscriptions.reduce((sum, s) => sum + s.yearlyAmount, 0),
      count: subscriptions.length,
    }
  }
}

export const subscriptionService = new SubscriptionService()
```

### Repository (データアクセス)

データベース操作を担当。将来的にはAPI呼び出しに置き換え可能。
```ts
// external/repository/subscription.repository.ts
import { db } from '../client/db'
import { subscriptions, paymentMethods } from '../client/schema'
import { eq } from 'drizzle-orm'
import type { CreateSubscriptionRequest } from '../dto/subscription.dto'

class SubscriptionRepository {
  async findAllByUserId(userId: string) {
    return await db.query.subscriptions.findMany({
      where: eq(subscriptions.userId, userId),
      with: { paymentMethod: true },
      orderBy: (subscriptions, { desc }) => [desc(subscriptions.createdAt)],
    })
  }

  async create(userId: string, input: CreateSubscriptionRequest) {
    const now = Math.floor(Date.now() / 1000)
    const [result] = await db
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

    return result
  }
}

export const subscriptionRepository = new SubscriptionRepository()
```

### Client (外部通信)

DB接続とHTTPクライアントを管理。将来的にはAPIクライアントに一本化。
スキーマ定義は[データベース設計書](../../docs/global_design/06_database_design.md)を参照。
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

#### RSCからのデータ取得
```
Server Component (RSC)
    ↓
Server Function (*.query.server.ts / *.command.server.ts)
    ↓
Service
    ↓
Repository
    ↓
Database (Neon PostgreSQL via Drizzle ORM)
```

#### Client Componentからのデータ操作
```
Client Component
    ↓
Server Action (*.action.ts)
    ↓
Server Function (*.server.ts)
    ↓
Service
    ↓
Repository
    ↓
Database (Neon PostgreSQL via Drizzle ORM)
```

### 将来の実装（Next.js + 外部API）
```
Server Component / Client Component
    ↓
Server Function / Server Action
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

| 種類 | ファイル名 | 関数名 |
|------|-----------|--------|
| Query (Server Function) | `*.query.server.ts` | `xxxQuery` |
| Command (Server Function) | `*.command.server.ts` | `xxxCommand` |
| Query (Server Action) | `*.query.action.ts` | `xxxQueryAction` |
| Command (Server Action) | `*.command.action.ts` | `xxxCommandAction` |

**例:**
- `listSubscriptionsQuery` - サブスク一覧取得（Server Function）
- `createSubscriptionCommand` - サブスク作成（Server Function）
- `listSubscriptionsQueryAction` - サブスク一覧取得（Server Action）
- `createSubscriptionCommandAction` - サブスク作成（Server Action）

## ベストプラクティス

1. **DTOを変更しない**: バックエンドの実装が変わってもインターフェースは維持
2. **サービス層で抽象化**: DB操作とAPI呼び出しを同じインターフェースで扱う
3. **エラーハンドリング統一**: DB/APIどちらでも同じエラー型を返す
4. **テスト容易性**: サービス層をモックすることで、バックエンドに依存しないテストが可能
5. **RSCからはServer Functionsを使用**: `*Query`/`*Command`関数を直接呼び出す
6. **Client ComponentからはServer Actionsを使用**: `*Action`関数を呼び出す
7. **認証チェックはServer Functionsで実施**: `requireAuthServer()`または`getAuthenticatedSessionServer()`を使用