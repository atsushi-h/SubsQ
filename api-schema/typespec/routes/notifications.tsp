import "@typespec/http";
import "@typespec/openapi3";
import "../models/notification.tsp";
import "../models/common.tsp";

using TypeSpec.Http;
using SubsQ.Models;

namespace SubsQ.Routes;

@route("/api/v1/notifications")
@tag("Notifications")
@useAuth(SubsQAuth)
interface Notifications {
  /** Push購読を登録する */
  @post
  @route("/subscriptions")
  @summary("Subscribe to push notifications")
  subscribe(
    @body request: SubscribePushRequest
  ): PushSubscriptionResponse | BadRequestError | UnauthorizedError;

  /** Push購読を解除する */
  @delete
  @route("/subscriptions")
  @summary("Unsubscribe from push notifications")
  unsubscribe(
    @body request: UnsubscribePushRequest
  ): void | BadRequestError | UnauthorizedError;

  /** 自分のPush購読一覧を取得する */
  @get
  @route("/subscriptions/me")
  @summary("List my push subscriptions")
  listMySubscriptions(): ListPushSubscriptionsResponse | UnauthorizedError;

  /** 自分宛にテスト通知を送信する */
  @post
  @route("/test")
  @summary("Send test notification")
  sendTest(): void | UnauthorizedError;
}

@route("/api/v1/admin/notifications")
@tag("AdminNotifications")
@useAuth(AdminAuth)
interface AdminNotifications {
  /** 全ユーザーにPush通知を一斉配信する */
  @post
  @route("/broadcast")
  @summary("Broadcast push notification to all users")
  broadcast(
    @body request: BroadcastRequest
  ): void | BadRequestError | UnauthorizedError;
}
