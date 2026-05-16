import "@typespec/http";
import "@typespec/openapi3";

using TypeSpec.Http;

namespace SubsQ.Models;

/** Push購読レスポンス */
model PushSubscriptionResponse {
  /** 購読ID */
  id: uuid;

  /** プッシュサービスのエンドポイントURL */
  endpoint: string;

  /** 登録日時 */
  createdAt: utcDateTime;
}

/** Push購読一覧レスポンス */
model ListPushSubscriptionsResponse {
  /** 購読一覧 */
  subscriptions: PushSubscriptionResponse[];
}

/** Push購読登録リクエスト */
model SubscribePushRequest {
  /** プッシュサービスのエンドポイントURL */
  endpoint: string;

  /** 暗号化用公開鍵（Base64URL） */
  p256dh: string;

  /** 認証シークレット（Base64URL） */
  auth: string;

  /** ユーザーエージェント */
  userAgent?: string;
}

/** Push購読解除リクエスト */
model UnsubscribePushRequest {
  /** 解除するエンドポイントURL */
  endpoint: string;
}

/** 一斉配信リクエスト */
model BroadcastRequest {
  /** 通知タイトル */
  title: string;

  /** 通知本文 */
  body: string;
}
