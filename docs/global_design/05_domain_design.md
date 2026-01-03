# ドメイン設計書

## エンティティ

| エンティティ | 説明 | 主な属性（プロパティ） |
|------------|------|---------------------|
| User | ログインしているユーザー。サブスクと支払い方法の所有者 | id, email, name, provider, providerAccountId, thumbnail, createdAt, updatedAt |
| Subscription | ユーザーが契約しているサブスクリプション1件 | id, userId, serviceName, amount, billingCycle, baseDate, paymentMethodId, memo, createdAt, updatedAt |
| PaymentMethod | サブスクの支払いに使用するカードや決済手段 | id, userId, name, createdAt, updatedAt |

## VO（Value Object）

| 名前 | 使う場所 | 守るルール | 例 | 備考 |
|-----|---------|-----------|-----|------|
| Email | User.email | 「@」が必ずある／空NG／前後の空白トリム | user@example.com | OAuth認証で取得するメールアドレス |
| BillingCycle | Subscription.billingCycle | Monthly または Yearly だけOK | Monthly / Yearly | 請求の周期を表す |
| Amount | Subscription.amount | 0以上1,000,000以下の整数 | 1490 | 円単位の金額。上限100万円 |
| BaseDate | Subscription.baseDate | 有効な日付（過去日も許可） | 2024-03-15 | 請求日計算の基準となる日付 |

## 集約

| **集約名** | **集約ルート** | **中にいるメンバー** | **外との関係** | **役割** |
|-----------|--------------|-------------------|---------------|---------|
| 🟦 **Subscriptionチーム** | **Subscription** | - Amount（VO）<br>- BillingCycle（VO）<br>- BaseDate（VO） | - Userに属する（Owner）<br>- PaymentMethodを参照 | サブスク1件を管理するチーム。金額計算や次回請求日計算を担当 |
| 🟩 **PaymentMethodチーム** | **PaymentMethod** | なし（単一エンティティ） | - Userに属する（Owner）<br>- Subscriptionから参照される | 支払い方法を管理するチーム。名前のみを保持 |
| 🟨 **Userチーム** | **User** | - Email（VO）<br>- プロバイダー情報 | - Subscription／PaymentMethodを所有する | OAuthでログインしたユーザーを表すチーム |

### 関係図
```
[User]──owns──>[Subscription]──references──>[PaymentMethod]
   │                                              ▲
   │                                              │
   └──────────────────owns────────────────────────┘
```

## ドメインロジック

### 🟦 Subscriptionチーム

| **ルール** | **説明** |
|-----------|---------|
| 次回請求日を計算する | baseDate と billingCycle から「今日以降の最も近い請求日」を算出する |
| 月額換算を計算する | yearly の場合は amount ÷ 12（円未満切り捨て）、monthly はそのまま |
| 年額換算を計算する | monthly の場合は amount × 12、yearly はそのまま |
| サービス名は必須 | 空文字・nullは許可しない |
| 金額は0〜100万円 | 負の値や上限超えは許可しない |
| 支払い方法は任意 | paymentMethodId は null 許可 |
| サブスク削除は即時反映 | 物理削除。関連データへの影響なし |

### 🟩 PaymentMethodチーム

| **ルール** | **説明** |
|-----------|---------|
| 支払い方法名は必須 | 空文字・nullは許可しない |
| 使用中の支払い方法は削除不可 | 1件以上のサブスクで使用されている場合は削除できない |
| 同名の支払い方法を許可 | 同じユーザーが同じ名前の支払い方法を複数登録可能 |

### 🟨 Userチーム

| **ルール** | **説明** |
|-----------|---------|
| provider + providerAccountId は一意 | 同じOAuthプロバイダーで同じアカウントIDは1つだけ |
| ユーザーは自分のデータのみ操作可能 | Subscription／PaymentMethodは所有者のみ閲覧・編集・削除できる |
| 退会時は関連データを全削除 | Subscription → PaymentMethod → User の順で削除 |
| ログイン時にプロフィール情報を更新 | OAuthログイン時に最新の情報（name, thumbnail）で更新 |

### ⚪ 共通ルール

| **ルール** | **説明** |
|-----------|---------|
| 集約をまたぐ直接操作は禁止 | 他の集約のデータは参照のみ。更新は各集約のルートを通す |
| 参照整合性はアプリケーション層で担保 | PaymentMethod削除前の使用中チェック等 |

## ドメインサービス

| **サービス名** | **役割** | **関わる集約** |
|--------------|---------|--------------|
| PaymentMethodUsageChecker | 支払い方法がサブスクで使用中かをチェックする。使用中なら削除不可 | PaymentMethod + Subscription |
| SubscriptionTotalCalculator | 複数のサブスクから月額合計・年額合計を計算する | Subscription（複数） |
| UserAccountDeleter | 退会処理。関連データを正しい順序で削除する | User + Subscription + PaymentMethod |

### ドメインサービス詳細

#### PaymentMethodUsageChecker
```
入力: paymentMethodId
出力: { isUsed: boolean, usageCount: number }

処理:
1. paymentMethodId を参照している Subscription を検索
2. 件数が1以上なら isUsed = true
```

#### SubscriptionTotalCalculator
```
入力: Subscription[]
出力: { monthlyTotal: number, yearlyTotal: number }

処理:
1. 各 Subscription の月額換算を合計 → monthlyTotal
2. 各 Subscription の年額換算を合計 → yearlyTotal
3. 円未満は切り捨て
```

#### UserAccountDeleter
```
入力: userId
出力: void

処理:
1. userId に紐づく Subscription を全削除
2. userId に紐づく PaymentMethod を全削除
3. User を削除
※ トランザクション内で実行
```

## 集約境界とトランザクション境界

### 集約とトランザクションの関係

このシステムでは、**集約（Aggregate）の境界 = トランザクション境界** を基本とします。

| 集約 | トランザクション対象 | 理由 |
|------|-------------------|------|
| Subscription | subscription のみ | 単一エンティティで完結 |
| PaymentMethod | payment_method のみ | 単一エンティティで完結 |
| User | user のみ | 単一エンティティで完結 |

### トランザクションが必要な操作

以下の操作では、複数集約をまたぐためトランザクションが必要です：

| 操作 | 対象 | 理由 |
|------|------|------|
| **退会処理** | Subscription + PaymentMethod + User | 3つの集約を順番に削除。途中で失敗した場合にロールバックが必要 |
| **PaymentMethod削除** | PaymentMethod + Subscription（参照のみ） | 使用中チェック後に削除。チェックと削除の間に不整合が起きないようにする |

### トランザクション不要な操作

以下の操作ではトランザクションは不要です：

| 操作 | 理由 |
|------|------|
| Subscription 作成/更新/削除 | 単一集約内で完結 |
| PaymentMethod 作成/更新 | 単一集約内で完結 |
| 一覧取得（読み取り） | 参照のみ |
| 合計金額計算 | 参照のみ |

## 計算ロジック詳細

### 次回請求日の計算
```typescript
function calculateNextBillingDate(baseDate: Date, billingCycle: BillingCycle): Date {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  let nextDate = new Date(baseDate);
  
  while (nextDate < today) {
    if (billingCycle === 'monthly') {
      nextDate.setMonth(nextDate.getMonth() + 1);
    } else {
      nextDate.setFullYear(nextDate.getFullYear() + 1);
    }
  }
  
  return nextDate;
}
```

### 月額換算・年額換算
```typescript
function toMonthlyAmount(amount: number, billingCycle: BillingCycle): number {
  if (billingCycle === 'monthly') {
    return amount;
  }
  return Math.floor(amount / 12);
}

function toYearlyAmount(amount: number, billingCycle: BillingCycle): number {
  if (billingCycle === 'yearly') {
    return amount;
  }
  return amount * 12;
}
```

### 合計金額の計算
```typescript
function calculateTotals(subscriptions: Subscription[]): {
  monthlyTotal: number;
  yearlyTotal: number;
} {
  let monthlyTotal = 0;
  let yearlyTotal = 0;
  
  for (const sub of subscriptions) {
    monthlyTotal += sub.toMonthlyAmount();
    yearlyTotal += sub.toYearlyAmount();
  }
  
  return {
    monthlyTotal: Math.floor(monthlyTotal),
    yearlyTotal: Math.floor(yearlyTotal),
  };
}
```