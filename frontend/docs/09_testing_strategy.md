# フロントエンドテスト戦略ガイド

## App Router時代のテストの課題

Next.js App Routerでは、Presenterコンポーネントのテストにいくつかの課題があります:

- **Server Actionsのモック問題**: 子コンポーネント内のServer Actionsをモックするのが困難
- **Props Drilling**: テストのためにServer Actionsを親から渡すと、実装が複雑になる
- **UI変更の頻度**: デザイン変更のたびにテストを修正する必要がある

**結論**: Presenterのテストはコスパが悪いため、テストすべき場所を「絞る」のが現実的なアプローチです。

---

## 本プロジェクトのテスト戦略

### レイヤー別テスト方針

```
┌─────────────────────────────────────────────────────────────────┐
│              フロントエンド テスト戦略                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  Unit Test（Vitest）                                     │   │
│  │                                                         │   │
│  │  カスタムHook     ✅ 必須   ビジネスロジックの核心      │   │
│  │  Query Keys       ✅ 必須   キャッシュ管理の要          │   │
│  │  Utils            ✅ 推奨   ユーティリティ関数          │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  E2E Test（Playwright + MSW）                            │   │
│  │                                                         │   │
│  │  主要ユーザーフロー   ✅ 必須   一覧表示、作成、編集     │   │
│  │  画面間の遷移         ✅ 必須   ルーティング確認         │   │
│  │  エラー表示           ✅ 推奨   エラーハンドリング       │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ─────────────────────────────────                             │
│    Presenter / Container は直接テストしない                     │
│    （E2Eでカバー）                                              │
│                                                                 │
│  ※ external層（DTO, Service, Handler）のテストは              │
│    BFFテスト戦略ドキュメントを参照                              │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### まとめ表

| 対象 | Unit Test | E2E | テスト内容 |
|------|-----------|-----|-----------|
| **カスタムHook** | ✅ 必須 | - | ロジック、状態管理 |
| **Query Keys** | ✅ 必須 | - | キャッシュキーの正しさ |
| **Utils** | ✅ 推奨 | - | ユーティリティ関数 |
| **Presenter** | ❌ | E2Eでカバー | Server Actions問題 |
| **Container** | ❌ | E2Eでカバー | Hookテストで十分 |
| **主要フロー** | - | ✅ 必須 | ユーザー操作 |

> 📝 **Note**: external層（DTO, Service, Handler）のテストは [BFFテスト戦略](./10_bff_testing_strategy.md) を参照

### この戦略で達成できること

| 目的 | どのテストでカバー？ |
|------|---------------------|
| **デグレ防止** | Hook テスト |
| **ライブラリ更新の安全性** | Hook / Query Keys テスト |
| **UIの動作保証** | E2Eテスト |

> 📝 **Note**: APIとの契約確認は [BFFテスト戦略](./10_bff_testing_strategy.md) を参照

### データフローとテストポイント

```
Page (Server Component)
  └── PageTemplate (Server Component)
        └── Container (Client Component)
              └── useXxx Hook ← ★ テストポイント
                    └── useXxxQuery (TanStack Query)
                          └── Server Action ← BFFテスト戦略へ
                                └── Service  ← BFFテスト戦略へ
              └── Presenter (View) ← E2Eでカバー
```

---

## 各テストの実装例

### 本プロジェクトのアーキテクチャ（おさらい）

```
features/subscription/
├── components/
│   ├── server/          # Server Components（プリフェッチ担当）
│   │   └── SubscriptionListPageTemplate/
│   └── client/          # Client Components
│       └── SubscriptionList/
│           ├── SubscriptionListContainer.tsx    # ロジック層
│           ├── SubscriptionListPresenter.tsx    # 表示層（テストしない）
│           └── useSubscriptionList.ts           # カスタムHook ← ★テスト対象
├── hooks/
│   ├── useSubscriptionListQuery.ts              # TanStack Query ← ★テスト対象
│   ├── useDeleteSubscriptionMutation.ts
│   └── ...
└── queries/
    └── subscription.query-keys.ts                # Query Keys ← ★テスト対象
```

---

### 1. カスタムHookのテスト

**目的**: ビジネスロジックが正しく動作するか検証

**特徴**:
- 外部依存はモックで差し替え
- UIに依存しない
- 超高速

**テスト対象**: `useSubscriptionList.ts`

```typescript
// features/subscription/components/client/SubscriptionList/useSubscriptionList.ts
export function useSubscriptionList() {
  const router = useRouter()
  const { data, isLoading, error } = useSubscriptionListQuery()
  const deleteMutation = useDeleteSubscriptionMutation()
  const [deleteTarget, setDeleteTarget] = useState<Subscription | null>(null)

  const handleCreate = useCallback(() => {
    router.push('/subscriptions/new')
  }, [router])

  const handleView = useCallback(
    (id: string) => {
      router.push(`/subscriptions/${id}`)
    },
    [router],
  )

  const handleEdit = useCallback(
    (id: string) => {
      router.push(`/subscriptions/${id}/edit`)
    },
    [router],
  )

  const handleDeleteRequest = useCallback((subscription: Subscription) => {
    setDeleteTarget(subscription)
  }, [])

  const handleDeleteConfirm = useCallback(() => {
    if (deleteTarget) {
      deleteMutation.mutate(deleteTarget.id, {
        onSuccess: () => {
          setDeleteTarget(null)
        },
      })
    }
  }, [deleteTarget, deleteMutation])

  const handleDeleteCancel = useCallback(() => {
    setDeleteTarget(null)
  }, [])

  return {
    subscriptions: data?.subscriptions ?? [],
    totals: data?.totals,
    isLoading,
    error,
    isDeleting: deleteMutation.isPending,
    deleteTarget,
    handleCreate,
    handleView,
    handleEdit,
    handleDeleteRequest,
    handleDeleteConfirm,
    handleDeleteCancel,
  }
}
```

**テストコード**:

```typescript
// features/subscription/components/client/SubscriptionList/useSubscriptionList.test.ts
import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useSubscriptionList } from './useSubscriptionList';

// 依存関係をモック
vi.mock('@/features/subscription/hooks/useSubscriptionListQuery', () => ({
  useSubscriptionListQuery: vi.fn(),
}));

vi.mock('@/features/subscription/hooks/useDeleteSubscriptionMutation', () => ({
  useDeleteSubscriptionMutation: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  useRouter: vi.fn(() => ({
    push: vi.fn(),
  })),
}));

import { useSubscriptionListQuery } from '@/features/subscription/hooks/useSubscriptionListQuery';
import { useDeleteSubscriptionMutation } from '@/features/subscription/hooks/useDeleteSubscriptionMutation';

describe('useSubscriptionList', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('サブスクリプション一覧を取得する', () => {
    // Arrange
    vi.mocked(useSubscriptionListQuery).mockReturnValue({
      data: {
        subscriptions: [
          {
            id: 'sub-1',
            serviceName: 'Netflix',
            amount: 1200,
            billingCycle: 'monthly' as const,
            userId: 'user-1',
            baseDate: '2024-01-01T00:00:00Z',
            paymentMethod: null,
            memo: '',
            createdAt: '2024-01-01T00:00:00Z',
            updatedAt: '2024-01-01T00:00:00Z',
          },
          {
            id: 'sub-2',
            serviceName: 'Spotify',
            amount: 980,
            billingCycle: 'monthly' as const,
            userId: 'user-1',
            baseDate: '2024-01-01T00:00:00Z',
            paymentMethod: null,
            memo: '',
            createdAt: '2024-01-01T00:00:00Z',
            updatedAt: '2024-01-01T00:00:00Z',
          },
        ],
        totals: { monthlyTotal: 2180, yearlyTotal: 0 }
      },
      isLoading: false,
      error: null,
    } as any);

    vi.mocked(useDeleteSubscriptionMutation).mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    } as any);

    // Act
    const { result } = renderHook(() => useSubscriptionList());

    // Assert
    expect(result.current.subscriptions).toHaveLength(2);
    expect(result.current.totals?.monthlyTotal).toBe(2180);
  });

  it('削除確認ダイアログを開く', () => {
    // Arrange
    vi.mocked(useSubscriptionListQuery).mockReturnValue({
      data: undefined,
      isLoading: false,
      error: null,
    } as any);

    vi.mocked(useDeleteSubscriptionMutation).mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    } as any);

    const subscription = {
      id: 'sub-1',
      serviceName: 'Netflix',
      amount: 1200,
      billingCycle: 'monthly' as const,
      userId: 'user-1',
      baseDate: '2024-01-01T00:00:00Z',
      paymentMethod: null,
      memo: '',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    };

    // Act
    const { result } = renderHook(() => useSubscriptionList());
    act(() => {
      result.current.handleDeleteRequest(subscription);
    });

    // Assert
    expect(result.current.deleteTarget).toEqual(subscription);
  });

  it('ローディング中はisLoadingがtrue、subscriptionsは空配列', () => {
    // Arrange
    vi.mocked(useSubscriptionListQuery).mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
    } as any);

    vi.mocked(useDeleteSubscriptionMutation).mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    } as any);

    // Act
    const { result } = renderHook(() => useSubscriptionList());

    // Assert
    expect(result.current.isLoading).toBe(true);
    expect(result.current.subscriptions).toEqual([]);
  });
});
```

**このテストで守れるもの**:
- Next.js のバージョンアップで `useRouter` の挙動が変わった → テストで検知
- CRUD操作ロジックの誤った変更 → テストで検知

---

### 2. Query Keysのテスト

**目的**: キャッシュキーが正しく生成されるか検証

**特徴**:
- 純粋関数のテスト
- モック不要
- 超高速

**テスト対象**: `subscription.query-keys.ts`

```typescript
// features/subscription/queries/subscription.query-keys.ts
export const subscriptionKeys = {
  all: ['subscriptions'] as const,
  lists: () => [...subscriptionKeys.all, 'list'] as const,
  details: () => [...subscriptionKeys.all, 'detail'] as const,
  detail: (id: string) => [...subscriptionKeys.details(), id] as const,
}
```

**テストコード**:

```typescript
// features/subscription/queries/subscription.query-keys.test.ts
import { describe, it, expect } from 'vitest';
import { subscriptionKeys } from './subscription.query-keys';

describe('subscriptionKeys', () => {
  it('all は ["subscriptions"] を返す', () => {
    expect(subscriptionKeys.all).toEqual(['subscriptions']);
  });

  it('lists は ["subscriptions", "list"] を返す', () => {
    expect(subscriptionKeys.lists()).toEqual(['subscriptions', 'list']);
  });

  it('details は ["subscriptions", "detail"] を返す', () => {
    expect(subscriptionKeys.details()).toEqual(['subscriptions', 'detail']);
  });

  it('detail は IDを含むキーを返す', () => {
    expect(subscriptionKeys.detail('sub-123')).toEqual([
      'subscriptions',
      'detail',
      'sub-123'
    ]);
  });
});
```

**このテストで守れるもの**:
- キーの誤った変更によるキャッシュ問題 → テストで検知
- TanStack Query のバージョンアップ → テストで検知

---

## E2Eテスト（Playwright + MSW）

### なぜMSWを使うのか？

| 方式 | メリット | デメリット |
|------|----------|------------|
| **実API（Docker）** | 完全なE2E | CI時間が長い、環境構築が複雑 |
| **MSW** | 高速、環境不要 | モックと実APIの乖離リスク |

**CIではMSWを使用し、高速にテストを回す戦略を採用**

---

### E2Eテスト例

```typescript
// e2e/subscription-list.spec.ts
import { test, expect } from '@playwright/test';

test.describe('サブスクリプション一覧ページ', () => {
  test.beforeEach(async ({ page }) => {
    // MSWでAPIをモック
    await page.route('**/api/subscriptions*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          subscriptions: [
            {
              id: 'sub-1',
              userId: 'user-1',
              serviceName: 'Netflix',
              amount: 1200,
              billingCycle: 'monthly',
              baseDate: '2024-01-01T00:00:00Z',
              paymentMethod: { id: 'pm-1', name: 'クレジットカード' },
              memo: '',
              createdAt: '2024-01-01T00:00:00Z',
              updatedAt: '2024-01-01T00:00:00Z',
            },
          ],
          totals: {
            monthlyTotal: 1200,
            yearlyTotal: 0,
          }
        }),
      });
    });
  });

  test('サブスクリプション一覧が表示される', async ({ page }) => {
    await page.goto('/subscriptions');

    // サブスクリプションカードが表示されることを確認
    await expect(page.getByText('Netflix')).toBeVisible();
    await expect(page.getByText('¥1,200')).toBeVisible();
  });

  test('サブスクリプションがない場合は空状態が表示される', async ({ page }) => {
    // 空のレスポンスを返すようにモック
    await page.route('**/api/subscriptions*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          subscriptions: [],
          totals: { monthlyTotal: 0, yearlyTotal: 0 }
        }),
      });
    });

    await page.goto('/subscriptions');

    await expect(page.getByText('サブスクリプションがありません')).toBeVisible();
  });

  test('サブスクリプション詳細ページに遷移できる', async ({ page }) => {
    await page.goto('/subscriptions');

    // サブスクリプションカードをクリック
    await page.getByText('Netflix').click();

    // 詳細ページに遷移
    await expect(page).toHaveURL(/\/subscriptions\/sub-1/);
  });
});
```

**E2Eテストでカバーするもの**:
- 主要なユーザーフロー（一覧表示、詳細遷移、作成・編集・削除）
- 画面間の遷移
- エラー表示

---

## テストファイルの配置

### コロケーション（同じディレクトリに配置）

```
src/
├── features/
│   └── subscription/
│       ├── components/
│       │   └── client/
│       │       └── SubscriptionList/
│       │           ├── useSubscriptionList.ts
│       │           └── useSubscriptionList.test.ts    # ← コロケーション
│       ├── hooks/
│       │   ├── useSubscriptionListQuery.ts
│       │   ├── useSubscriptionListQuery.test.ts       # ← コロケーション
│       │   ├── useDeleteSubscriptionMutation.ts
│       │   └── useDeleteSubscriptionMutation.test.ts  # ← コロケーション
│       └── queries/
│           ├── subscription.query-keys.ts
│           └── subscription.query-keys.test.ts        # ← コロケーション
├── shared/
│   └── lib/
│       ├── utils.ts
│       └── utils.test.ts                              # ← コロケーション
└── e2e/                                               # E2Eは別ディレクトリ
    ├── subscription-list.spec.ts
    └── subscription-detail.spec.ts
```

> 📝 **Note**: external層のテストファイル配置は [BFFテスト戦略](./10_bff_testing_strategy.md) を参照

---

## TanStack Queryのテスト方法

TanStack Queryを使用するHookをテストする場合は、QueryClientProviderでラップする必要があります。

```typescript
// useSubscriptionListQuery をテストする場合
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });
  return ({ children }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

test('サブスクリプション一覧を取得する', async () => {
  const { result } = renderHook(
    () => useSubscriptionListQuery(),
    { wrapper: createWrapper() }
  );

  await waitFor(() => expect(result.current.isSuccess).toBe(true));
  expect(result.current.data?.subscriptions).toHaveLength(2);
});
```

---

## 実行コマンド

```bash
# Unit テスト
pnpm test           # 全テスト実行
pnpm test:watch     # ウォッチモード
pnpm test:coverage  # カバレッジ付き

# E2Eテスト
pnpm e2e            # Playwrightテスト実行
pnpm e2e:ui         # UIモードで実行
```

---

## まとめ

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  ✅ テストする                                              │
│  ├── カスタムHook → デグレ防止、ライブラリ更新の安全網     │
│  ├── Query Keys → キャッシュ管理の要                       │
│  ├── Utils → ユーティリティ関数                            │
│  └── E2E (Playwright) → UIの動作保証                       │
│                                                             │
│  ❌ テストしない                                            │
│  ├── Presenter → Server Actions問題、コスパ悪い            │
│  └── Container → Hookテストでカバー                        │
│                                                             │
│  ※ external層のテストは BFFテスト戦略 を参照              │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 参考リソース

- [Vitest 公式ドキュメント](https://vitest.dev/)
- [Testing Library](https://testing-library.com/)
- [MSW (Mock Service Worker)](https://mswjs.io/)
- [Playwright](https://playwright.dev/)
