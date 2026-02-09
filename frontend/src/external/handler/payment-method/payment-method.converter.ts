import type { PaymentMethod } from '../../domain/entities/payment-method'
import {
  type PaymentMethodResponse,
  PaymentMethodResponseSchema,
} from '../../dto/payment-method.dto'

/**
 * PaymentMethod ドメインエンティティを PaymentMethodResponse DTO に変換する
 */
export function toPaymentMethodResponse(paymentMethod: PaymentMethod): PaymentMethodResponse {
  const plainPaymentMethod = paymentMethod.toPlainObject()

  const response = {
    id: plainPaymentMethod.id,
    userId: plainPaymentMethod.userId,
    name: plainPaymentMethod.name,
    createdAt: plainPaymentMethod.createdAt.toISOString(),
    updatedAt: plainPaymentMethod.updatedAt.toISOString(),
  }

  return PaymentMethodResponseSchema.parse(response)
}
