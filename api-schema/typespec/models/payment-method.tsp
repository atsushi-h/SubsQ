import "@typespec/http";
import "@typespec/openapi3";

using TypeSpec.Http;

namespace SubsQ.Models;

/** 支払い方法レスポンス */
model PaymentMethodResponse {
  /** 支払い方法ID */
  id: uuid;

  /** ユーザーID */
  userId: uuid;

  /** 支払い方法名 */
  name: string;

  /** 使用中のサブスクリプション数 */
  usageCount: int32;

  /** 作成日時 */
  createdAt: utcDateTime;

  /** 更新日時 */
  updatedAt: utcDateTime;
}

/** 支払い方法作成リクエスト */
model CreatePaymentMethodRequest {
  /** 支払い方法名 */
  @minLength(1)
  name: string;
}

/** 支払い方法更新リクエスト */
model UpdatePaymentMethodRequest extends CreatePaymentMethodRequest {}
