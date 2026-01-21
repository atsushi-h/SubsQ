# BFF（Backend for Frontend）テスト戦略ガイド

## BFFとは何か

### BFF層の役割

BFF（Backend for Frontend）層は、フロントエンドとバックエンドAPIの間に位置し、以下の責務を担います:

- **認証・認可チェック**
- **入力バリデーション**（Zodスキーマ）
- **APIレスポンスの型安全性保証**
- **エラーハンドリングの統一**

本プロジェクトでは、Next.js App Routerの`external/`ディレクトリがBFF層に相当します。

---

## external層のアーキテクチャ

### ディレクトリ構成

```
src/external/
├── client/               # APIクライアント（OpenAPI生成）
├── dto/                  # Data Transfer Object（Zodスキーマ）
│   ├── subscription.dto.ts
│   ├── payment-method.dto.ts
│   └── user.dto.ts
├── service/              # ビジネスロジック
│   ├── subscription/
│   ├── payment-method/
│   └── user/
└── handler/              # Server Actions / Server Functions
    ├── subscription/
    ├── payment-method/
    └── user/
```

### データフロー

```
Handler（認証 + バリデーション）
    ↓
Service（ビジネスロジック + データ変換）
    ↓
DTO（型変換 + バリデーション）
    ↓
Repository / Client（データアクセス）
    ↓
Database / Go Backend API
```

### レイヤー別の責務

| レイヤー | 責務 | テスト対象 |
|---------|------|-----------|
| **Handler** | 認証チェック、入力バリデーション、Serviceの呼び出し | ✅ Unit Test |
| **Service** | ビジネスロジック、データ変換、エラーハンドリング | ✅ Unit Test |
| **DTO** | Zodスキーマ定義、型変換、バリデーション | ✅ Unit Test |
| **Client** | HTTP通信（OpenAPI生成） | ❌ 自動生成なのでテスト不要 |

---

## テスト戦略

### レイヤー別テスト方針

```
┌─────────────────────────────────────────────────────────────────┐
│                    BFF テスト戦略                                │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  Unit Test（Vitest）                                     │   │
│  │                                                         │   │
│  │  DTO / Zod        ✅ 必須   APIとの契約確認             │   │
│  │  Service          ✅ 必須   データ変換、エラーハンドリング│   │
│  │  Handler          ✅ 推奨   認証、バリデーション          │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  Client はOpenAPI生成なのでテスト不要                           │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### まとめ表

| 対象 | Unit Test | テスト内容 |
|------|-----------|-----------|
| **DTO / Zod** | ✅ 必須 | バリデーション、型変換 |
| **Service** | ✅ 必須 | ビジネスロジック、データ変換、エラーハンドリング |
| **Handler** | ✅ 推奨 | 認証チェック、入力バリデーション |
| **Client** | ❌ 不要 | OpenAPI自動生成 |

---

## 各レイヤーのテスト実装例

### 1. DTO / Zodスキーマのテスト

**テスト対象**: `subscription.dto.ts`

```typescript
// external/dto/subscription.dto.ts
import { z } from 'zod'

export const PaymentMethodInSubscriptionSchema = z.object({
  id: z.uuid(),
  name: z.string(),
})

export const SubscriptionResponseSchema = z.object({
  id: z.uuid(),
  userId: z.uuid(),
  serviceName: z.string(),
  amount: z.number(),
  billingCycle: z.enum(['monthly', 'yearly']),
  baseDate: z.iso.datetime(),
  paymentMethod: PaymentMethodInSubscriptionSchema.nullable(),
  memo: z.string(),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
})

export const CreateSubscriptionRequestSchema = z.object({
  userId: z.uuid(),
  serviceName: z.string().min(1).max(100),
  amount: z.number().int().min(0).max(1000000),
  billingCycle: z.enum(['monthly', 'yearly']),
  baseDate: z.iso.datetime(),
  paymentMethodId: z.uuid().nullable().optional(),
  memo: z.string().optional(),
})
```

**テストコード**:

```typescript
// external/dto/subscription.dto.test.ts
import { describe, it, expect } from 'vitest';
import {
  SubscriptionResponseSchema,
  CreateSubscriptionRequestSchema
} from './subscription.dto';

describe('SubscriptionResponseSchema', () => {
  const validResponse = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    userId: '123e4567-e89b-12d3-a456-426614174001',
    serviceName: 'Netflix',
    amount: 1200,
    billingCycle: 'monthly' as const,
    baseDate: '2024-01-01T00:00:00.000Z',
    paymentMethod: { id: '123e4567-e89b-12d3-a456-426614174002', name: 'クレジットカード' },
    memo: '',
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  };

  it('有効なレスポンスをパースできる', () => {
    const result = SubscriptionResponseSchema.safeParse(validResponse);
    expect(result.success).toBe(true);
  });

  it('billingCycleが不正な値でエラーになる', () => {
    const invalid = { ...validResponse, billingCycle: 'weekly' };
    const result = SubscriptionResponseSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });

  it('UUIDが不正な形式でエラーになる', () => {
    const invalid = { ...validResponse, id: 'not-a-uuid' };
    const result = SubscriptionResponseSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });
});

describe('CreateSubscriptionRequestSchema', () => {
  it('amountが負の数でエラーになる', () => {
    const request = {
      userId: '123e4567-e89b-12d3-a456-426614174000',
      serviceName: 'Netflix',
      amount: -100,
      billingCycle: 'monthly' as const,
      baseDate: '2024-01-01T00:00:00.000Z',
    };
    const result = CreateSubscriptionRequestSchema.safeParse(request);
    expect(result.success).toBe(false);
  });

  it('serviceNameが100文字を超えるとエラーになる', () => {
    const request = {
      userId: '123e4567-e89b-12d3-a456-426614174000',
      serviceName: 'a'.repeat(101),
      amount: 1200,
      billingCycle: 'monthly' as const,
      baseDate: '2024-01-01T00:00:00.000Z',
    };
    const result = CreateSubscriptionRequestSchema.safeParse(request);
    expect(result.success).toBe(false);
  });
});
```

**このテストで守れるもの**: バックエンドAPIの仕様変更、Zodライブラリのバージョンアップをテストで検知

---

### 2. Serviceレイヤーのテスト

**テスト対象**: `subscription.service.ts`

```typescript
// external/service/subscription/subscription.service.ts
export class SubscriptionService {
  constructor(
    private subscriptionRepository: ISubscriptionRepository,
    private transactionManager: ITransactionManager<DbClient>,
  ) {}

  async getSubscriptionById(id: SubscriptionId): Promise<Subscription | null> {
    return this.subscriptionRepository.findById(id)
  }

  async getSubscriptionsByUserId(userId: UserId): Promise<Subscription[]> {
    return this.subscriptionRepository.findByUserId(userId)
  }

  async create(input: CreateSubscriptionInput): Promise<Subscription> {
    if (!Subscription.isServiceNameValid(input.serviceName)) {
      throw new Error('Invalid service name')
    }

    const amount = Amount.fromValue(input.amount)
    const billingCycle = BillingCycle.fromValue(input.billingCycle)
    const baseDate = BaseDate.fromValue(input.baseDate)

    const subscription = Subscription.create({
      userId: input.userId,
      serviceName: input.serviceName,
      amount,
      billingCycle,
      baseDate,
      paymentMethodId: input.paymentMethodId,
      memo: input.memo,
    })

    return this.subscriptionRepository.save(subscription)
  }

  async update(
    id: SubscriptionId,
    userId: UserId,
    input: UpdateSubscriptionInput,
  ): Promise<Subscription> {
    const subscription = await this.getSubscriptionById(id)
    if (!subscription) {
      throw new Error(`Subscription not found: ${id}`)
    }

    if (!subscription.belongsTo(userId)) {
      throw new Error(`Unauthorized: User ${userId} cannot access subscription ${id}`)
    }

    // Value Objectsを作成して更新
    const updateData: any = {}
    if (input.amount !== undefined) {
      updateData.amount = Amount.fromValue(input.amount)
    }
    if (input.billingCycle !== undefined) {
      updateData.billingCycle = BillingCycle.fromValue(input.billingCycle)
    }
    // ... 他のフィールド

    const updatedSubscription = subscription.withUpdate(updateData)
    return this.subscriptionRepository.save(updatedSubscription)
  }
}
```

**テストコード**:

```typescript
// external/service/subscription/subscription.service.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SubscriptionService } from './subscription.service';

describe('SubscriptionService', () => {
  const mockRepository = {
    findById: vi.fn(),
    findByUserId: vi.fn(),
    save: vi.fn(),
    delete: vi.fn(),
  };

  const mockTxManager = {
    execute: vi.fn(),
  };

  const service = new SubscriptionService(mockRepository as any, mockTxManager as any);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getSubscriptionById', () => {
    it('サブスクリプションを取得する', async () => {
      const mockSubscription = {
        id: 'sub-123',
        userId: 'user-123',
        serviceName: 'Netflix',
        amount: { value: 1200 },
        billingCycle: { value: 'monthly' },
      };
      mockRepository.findById.mockResolvedValue(mockSubscription);

      const result = await service.getSubscriptionById('sub-123');

      expect(result).toEqual(mockSubscription);
      expect(mockRepository.findById).toHaveBeenCalledWith('sub-123');
    });

    it('サブスクリプションが見つからない場合はnullを返す', async () => {
      mockRepository.findById.mockResolvedValue(null);

      const result = await service.getSubscriptionById('not-exist');

      expect(result).toBeNull();
    });
  });

  describe('update', () => {
    it('認可チェック: 他のユーザーのデータは更新できない', async () => {
      const mockSubscription = {
        id: 'sub-123',
        userId: 'user-123',
        belongsTo: vi.fn(() => false),
      };
      mockRepository.findById.mockResolvedValue(mockSubscription);

      await expect(
        service.update('sub-123', 'user-456', { serviceName: 'Updated' })
      ).rejects.toThrow('Unauthorized');
    });
  });
});
```

**このテストで守れるもの**: ビジネスロジックの誤り、認可チェックの漏れをテストで検知

---

### 3. Handlerのテスト

**テスト対象**: `subscription.query.server.ts`

```typescript
// external/handler/subscription/subscription.query.server.ts
import 'server-only'

export async function getSubscriptionByIdQuery(
  request: GetSubscriptionByIdRequest,
  userId: string,
): Promise<SubscriptionResponse | null> {
  const validated = GetSubscriptionByIdRequestSchema.parse(request)

  const subscription = await subscriptionService.getSubscriptionById(validated.id)
  if (!subscription) return null

  // 認可チェック: 自分のサブスクリプションのみ取得可能
  if (!subscription.belongsTo(userId)) {
    throw new Error('Forbidden: You can only access your own subscriptions')
  }

  const paymentMethod = await subscriptionService.getPaymentMethodForSubscription(
    subscription.paymentMethodId,
  )

  return toSubscriptionResponse(subscription, paymentMethod)
}
```

**テストコード**:

```typescript
// external/handler/subscription/subscription.query.server.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../service/subscription/subscription.service', () => ({
  subscriptionService: {
    getSubscriptionById: vi.fn(),
    getPaymentMethodForSubscription: vi.fn(),
  },
}));

import { getSubscriptionByIdQuery } from './subscription.query.server';
import { subscriptionService } from '../../service/subscription/subscription.service';

describe('getSubscriptionByIdQuery', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('不正なUUIDでエラーになる', async () => {
    await expect(getSubscriptionByIdQuery({ id: 'invalid-uuid' }, 'user-123'))
      .rejects.toThrow();
  });

  it('認可チェック: 他のユーザーのデータは取得できない', async () => {
    const mockSubscription = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      userId: 'user-456',
      belongsTo: vi.fn(() => false),
    };
    vi.mocked(subscriptionService.getSubscriptionById).mockResolvedValue(mockSubscription as any);

    await expect(
      getSubscriptionByIdQuery({ id: '123e4567-e89b-12d3-a456-426614174000' }, 'user-123')
    ).rejects.toThrow('Forbidden');
  });

  it('サブスクリプションを正しく返す', async () => {
    const mockSubscription = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      userId: 'user-123',
      serviceName: 'Netflix',
      belongsTo: vi.fn(() => true),
      paymentMethodId: 'pm-123',
    };
    const mockPaymentMethod = { id: 'pm-123', name: 'クレジットカード' };

    vi.mocked(subscriptionService.getSubscriptionById).mockResolvedValue(mockSubscription as any);
    vi.mocked(subscriptionService.getPaymentMethodForSubscription).mockResolvedValue(mockPaymentMethod);

    const result = await getSubscriptionByIdQuery(
      { id: '123e4567-e89b-12d3-a456-426614174000' },
      'user-123'
    );

    expect(result).toBeDefined();
  });
});
```

**このテストで守れるもの**: 入力バリデーションの漏れ、認可チェックの漏れをテストで検知

---

## テストファイルの配置

### コロケーション（同じディレクトリに配置）

```
src/external/
├── dto/
│   ├── subscription.dto.ts
│   └── subscription.dto.test.ts           # ← コロケーション
├── service/
│   └── subscription/
│       ├── subscription.service.ts
│       └── subscription.service.test.ts   # ← コロケーション
└── handler/
    └── subscription/
        ├── subscription.query.server.ts
        └── subscription.query.server.test.ts  # ← コロケーション
```

---

## 補足事項

### ServiceとHandlerの違い

**Handler（Controller相当）**: 認証・認可チェック、入力バリデーション、Serviceの呼び出し、レスポンスの整形

**Service（UseCase相当）**: ビジネスロジック、データ変換、エラーハンドリング、Repositoryの呼び出し

### query.server と query.action の違い

**\*.query.server.ts / \*.command.server.ts**: Server Componentから呼び出される（"server-only"でクライアント利用を禁止）

**\*.query.action.ts / \*.command.action.ts**: Client Componentから呼び出される（"use server"でServer Actionとして定義）

---

## 実行コマンド

```bash
# Unit テスト（BFF層）
pnpm test src/external        # external配下のテストのみ
pnpm test:watch               # ウォッチモード
pnpm test:coverage            # カバレッジ付き
```

---

## まとめ

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  ✅ テストする                                              │
│  ├── DTO / Zod → APIとの契約確認、型安全性                 │
│  ├── Service → ビジネスロジック、エラーハンドリング        │
│  └── Handler → 認証チェック、入力バリデーション            │
│                                                             │
│  ❌ テストしない                                            │
│  └── Client → OpenAPI自動生成                              │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 参考リソース

- [Vitest 公式ドキュメント](https://vitest.dev/)
- [Zod 公式ドキュメント](https://zod.dev/)
- [OpenAPI Generator](https://openapi-generator.tech/)
