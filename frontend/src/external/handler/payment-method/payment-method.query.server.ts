import 'server-only'

import {
  type GetPaymentMethodByIdRequest,
  GetPaymentMethodByIdRequestSchema,
  type PaymentMethodResponse,
} from '../../dto/payment-method.dto'
import { paymentMethodService } from '../../service/payment-method/payment-method.service'
import { toPaymentMethodResponse } from './payment-method.converter'

export async function getPaymentMethodByIdQuery(
  request: GetPaymentMethodByIdRequest,
  userId: string,
): Promise<PaymentMethodResponse | null> {
  const validated = GetPaymentMethodByIdRequestSchema.parse(request)

  const paymentMethod = await paymentMethodService.getPaymentMethodById(validated.id)
  if (!paymentMethod) return null

  // 認可チェック：自分の支払い方法のみ取得可能
  if (!paymentMethod.belongsTo(userId)) {
    throw new Error('Forbidden: You can only access your own payment methods')
  }

  return toPaymentMethodResponse(paymentMethod)
}

export async function listPaymentMethodsByUserIdQuery(
  userId: string,
): Promise<PaymentMethodResponse[]> {
  const paymentMethods = await paymentMethodService.getPaymentMethodsByUserId(userId)

  return paymentMethods.map((paymentMethod) => toPaymentMethodResponse(paymentMethod))
}
