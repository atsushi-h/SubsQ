import 'server-only'

import { requireAuthServer } from '@/features/auth/servers/redirect.server'
import {
  type GetPaymentMethodByIdRequest,
  GetPaymentMethodByIdRequestSchema,
  type PaymentMethodResponse,
} from '../../dto/payment-method.dto'
import { paymentMethodService } from '../../service/payment-method/payment-method.service'
import { toPaymentMethodResponse } from './payment-method.converter'

export async function getPaymentMethodByIdQuery(
  request: GetPaymentMethodByIdRequest,
): Promise<PaymentMethodResponse | null> {
  await requireAuthServer()
  const validated = GetPaymentMethodByIdRequestSchema.parse(request)

  const data = await paymentMethodService.getPaymentMethodById(validated.id)
  if (!data) return null

  return toPaymentMethodResponse(data)
}

export async function listPaymentMethodsByUserIdQuery(): Promise<PaymentMethodResponse[]> {
  await requireAuthServer()
  const data = await paymentMethodService.listPaymentMethods()
  return data.map((item) => toPaymentMethodResponse(item))
}
