import "@typespec/http";
import "@typespec/openapi3";

using TypeSpec.Http;

namespace SubsQ.Models;

/** 請求サイクル */
enum BillingCycle {
  monthly,
  yearly,
}

/** 支払い方法の簡易情報（サブスクに埋め込まれる） */
model PaymentMethodSummary {
  /** 支払い方法ID */
  id: uuid;

  /** 支払い方法名 */
  name: string;
}

/** サブスクリプションレスポンス */
model SubscriptionResponse {
  /** サブスクリプションID */
  id: uuid;

  /** ユーザーID */
  userId: uuid;

  /** サービス名 */
  serviceName: string;

  /** 金額（円） */
  amount: int64;

  /** 請求サイクル */
  billingCycle: BillingCycle;

  /** サブスクリプション開始日（ISO 8601 UTC） */
  baseDate: utcDateTime;

  /** 次回請求日（YYYY-MM-DD、時刻を持たない日付のみの値） */
  nextBillingDate: plainDate;

  /** 支払い方法ID */
  paymentMethodId?: uuid;

  /** 支払い方法情報 */
  paymentMethod?: PaymentMethodSummary;

  /** メモ */
  memo?: string;

  /** 月額換算金額（円） */
  monthlyAmount: int64;

  /** 年額換算金額（円） */
  yearlyAmount: int64;

  /** 作成日時 */
  createdAt: utcDateTime;

  /** 更新日時 */
  updatedAt: utcDateTime;
}

/** サブスクリプション一覧レスポンスのサマリー */
model SubscriptionListSummary {
  /** 月額合計（円） */
  monthlyTotal: int64;

  /** 年額合計（円） */
  yearlyTotal: int64;

  /** 件数 */
  count: int32;
}

/** サブスクリプション一覧レスポンス */
model ListSubscriptionsResponse {
  /** サブスクリプション一覧 */
  subscriptions: SubscriptionResponse[];

  /** 合計情報 */
  summary: SubscriptionListSummary;
}

/** サブスクリプション作成リクエスト */
model CreateSubscriptionRequest {
  /** サービス名 */
  @minLength(1)
  serviceName: string;

  /** 金額（円） */
  @minValue(0)
  @maxValue(1000000)
  amount: int64;

  /** 請求サイクル */
  billingCycle: BillingCycle;

  /** サブスクリプション開始日（ISO 8601 UTC） */
  baseDate: utcDateTime;

  /** 支払い方法ID */
  paymentMethodId?: uuid;

  /** メモ */
  memo?: string;
}

/**
 * サブスクリプション更新リクエスト
 * @note 未指定（undefined）と「nullに更新（解除）」の区別ができないため、
 *       paymentMethodId / memo の解除はバックエンド側で別途考慮が必要。
 */
model UpdateSubscriptionRequest {
  /** サービス名 */
  @minLength(1)
  serviceName?: string;

  /** 金額（円） */
  @minValue(0)
  @maxValue(1000000)
  amount?: int64;

  /** 請求サイクル */
  billingCycle?: BillingCycle;

  /** サブスクリプション開始日（ISO 8601 UTC） */
  baseDate?: utcDateTime;

  /** 支払い方法ID */
  paymentMethodId?: uuid;

  /** メモ */
  memo?: string;
}
