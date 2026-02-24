import "@typespec/http";
import "@typespec/openapi3";
import "../models/subscription.tsp";
import "../models/common.tsp";

using TypeSpec.Http;
using SubsQ.Models;

namespace SubsQ.Routes;

@route("/api/v1/subscriptions")
@tag("Subscriptions")
interface Subscriptions {
  /** サブスクリプション一覧を取得 */
  @get
  @summary("List subscriptions")
  listSubscriptions(): ListSubscriptionsResponse | UnauthorizedError;

  /** サブスクリプション詳細を取得 */
  @get
  @route("/{id}")
  @summary("Get subscription by ID")
  getSubscription(
    @path id: string
  ): SubscriptionResponse | NotFoundError | UnauthorizedError;

  /** サブスクリプションを作成 */
  @post
  @summary("Create subscription")
  createSubscription(
    @body request: CreateSubscriptionRequest
  ): SubscriptionResponse | BadRequestError | UnauthorizedError;

  /** サブスクリプションを更新 */
  @patch
  @route("/{id}")
  @summary("Update subscription")
  updateSubscription(
    @path id: string,
    @body request: UpdateSubscriptionRequest
  ): SubscriptionResponse | BadRequestError | NotFoundError | UnauthorizedError;

  /** サブスクリプションを削除 */
  @delete
  @route("/{id}")
  @summary("Delete subscription")
  deleteSubscription(
    @path id: string
  ): void | NotFoundError | UnauthorizedError;
}
