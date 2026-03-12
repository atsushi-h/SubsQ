import "@typespec/http";
import "@typespec/openapi3";
import "../models/payment-method.tsp";
import "../models/common.tsp";

using TypeSpec.Http;
using SubsQ.Models;

namespace SubsQ.Routes;

@route("/api/v1/payment-methods")
@tag("PaymentMethods")
@useAuth(SubsQAuth)
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
    @path id: uuid
  ): PaymentMethodResponse | NotFoundError | UnauthorizedError;

  /** 支払い方法を作成 */
  @post
  @summary("Create payment method")
  createPaymentMethod(
    @body request: CreatePaymentMethodRequest
  ): CreatedResponse & PaymentMethodResponse | BadRequestError | UnauthorizedError;

  /** 支払い方法を更新 */
  @patch
  @route("/{id}")
  @summary("Update payment method")
  updatePaymentMethod(
    @path id: uuid,
    @body request: UpdatePaymentMethodRequest
  ): PaymentMethodResponse | BadRequestError | NotFoundError | UnauthorizedError;

  /** 支払い方法を削除 */
  @delete
  @route("/{id}")
  @summary("Delete payment method")
  deletePaymentMethod(
    @path id: uuid
  ): void | ConflictError | NotFoundError | UnauthorizedError;

  /** 複数の支払い方法を削除 */
  @delete
  @summary("Delete multiple payment methods")
  deletePaymentMethods(
    @body request: DeletePaymentMethodsRequest
  ): void | BadRequestError | ConflictError | UnauthorizedError;
}

model DeletePaymentMethodsRequest {
  ids: uuid[];
}
