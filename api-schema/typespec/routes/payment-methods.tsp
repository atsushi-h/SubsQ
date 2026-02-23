import "@typespec/http";
import "@typespec/openapi3";
import "../models/payment-method.tsp";
import "../models/common.tsp";

using TypeSpec.Http;
using SubsQ.Models;

namespace SubsQ.Routes;

@route("/api/v1/payment-methods")
@tag("PaymentMethods")
interface PaymentMethods {
  /** 支払い方法一覧を取得 */
  @get
  @summary("List payment methods")
  listPaymentMethods(): PaymentMethodResponse[] | UnauthorizedError;

  /** 支払い方法詳細を取得 */
  @get
  @route("/{id}")
  @summary("Get payment method by ID")
  getPaymentMethod(
    @path id: string
  ): PaymentMethodResponse | NotFoundError | UnauthorizedError;

  /** 支払い方法を作成 */
  @post
  @summary("Create payment method")
  createPaymentMethod(
    @body request: CreatePaymentMethodRequest
  ): PaymentMethodResponse | BadRequestError | UnauthorizedError;

  /** 支払い方法を更新 */
  @put
  @route("/{id}")
  @summary("Update payment method")
  updatePaymentMethod(
    @path id: string,
    @body request: UpdatePaymentMethodRequest
  ): PaymentMethodResponse | BadRequestError | NotFoundError | UnauthorizedError;

  /** 支払い方法を削除 */
  @delete
  @route("/{id}")
  @summary("Delete payment method")
  deletePaymentMethod(
    @path id: string
  ): void | ConflictError | NotFoundError | UnauthorizedError;
}
