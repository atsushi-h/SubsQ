import 'server-only'

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
  userId: string,
): Promise<CreatePaymentMethodResponse> {
  const validated = CreatePaymentMethodRequestSchema.parse(request)

  if (userId !== validated.userId) {
    throw new Error('Forbidden: Can only create payment methods for yourself')
  }

  const paymentMethod = await paymentMethodService.create(validated)

  return toPaymentMethodResponse(paymentMethod)
}

export async function updatePaymentMethodCommand(
  request: UpdatePaymentMethodRequest,
  userId: string,
): Promise<UpdatePaymentMethodResponse> {
  const validated = UpdatePaymentMethodRequestSchema.parse(request)

  const updatedPaymentMethod = await paymentMethodService.update(validated.id, userId, validated)

  return toPaymentMethodResponse(updatedPaymentMethod)
}

export async function deletePaymentMethodCommand(
  paymentMethodId: string,
  userId: string,
): Promise<void> {
  await paymentMethodService.delete(paymentMethodId, userId)
}

export async function deletePaymentMethodsCommand(
  paymentMethodIds: string[],
  userId: string,
): Promise<void> {
  await paymentMethodService.deleteMany(paymentMethodIds, userId)
}
