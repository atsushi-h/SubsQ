import type { ModelsPaymentMethodResponse } from '@/external/client/api/generated/model'
import {
  type PaymentMethodResponse,
  PaymentMethodResponseSchema,
} from '../../dto/payment-method.dto'

export function toPaymentMethodResponse(model: ModelsPaymentMethodResponse): PaymentMethodResponse {
  return PaymentMethodResponseSchema.parse(model)
}
