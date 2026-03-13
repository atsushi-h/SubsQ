import 'server-only'

import { requireAuthServer } from '@/features/auth/servers/redirect.server'
import {
  type CreatePaymentMethodRequest,
  CreatePaymentMethodRequestSchema,
  type CreatePaymentMethodResponse,
  type UpdatePaymentMethodRequest,
  UpdatePaymentMethodRequestSchema,
  type UpdatePaymentMethodResponse,
} from '../../dto/payment-method.dto'
import { paymentMethodService } from '../../service/payment-method/payment-method.service'
import { toPaymentMethodResponse } from './payment-method.converter'

export async function createPaymentMethodCommand(
  request: CreatePaymentMethodRequest,
): Promise<CreatePaymentMethodResponse> {
  await requireAuthServer()
  const validated = CreatePaymentMethodRequestSchema.parse(request)

  const data = await paymentMethodService.createPaymentMethod(validated)
  return toPaymentMethodResponse(data)
}

export async function updatePaymentMethodCommand(
  request: UpdatePaymentMethodRequest,
): Promise<UpdatePaymentMethodResponse> {
  await requireAuthServer()
  const { id, ...body } = UpdatePaymentMethodRequestSchema.parse(request)

  const data = await paymentMethodService.updatePaymentMethod(id, body)
  return toPaymentMethodResponse(data)
}

export async function deletePaymentMethodCommand(paymentMethodId: string): Promise<void> {
  await requireAuthServer()
  await paymentMethodService.deletePaymentMethod(paymentMethodId)
}

export async function deletePaymentMethodsCommand(paymentMethodIds: string[]): Promise<void> {
  await requireAuthServer()
  await paymentMethodService.deletePaymentMethods(paymentMethodIds)
}
