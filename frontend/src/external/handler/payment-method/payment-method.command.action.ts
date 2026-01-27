'use server'

import type {
  CreatePaymentMethodRequest,
  UpdatePaymentMethodRequest,
} from '@/external/dto/payment-method.dto'
import {
  createPaymentMethodCommand,
  deletePaymentMethodCommand,
  deletePaymentMethodsCommand,
  updatePaymentMethodCommand,
} from '@/external/handler/payment-method/payment-method.command.server'
import { withAuth } from '@/features/auth/servers/auth.guard'

export async function createPaymentMethodCommandAction(
  data: Omit<CreatePaymentMethodRequest, 'userId'>,
) {
  return withAuth(({ userId }) => createPaymentMethodCommand({ ...data, userId }, userId))
}

export async function updatePaymentMethodCommandAction(request: UpdatePaymentMethodRequest) {
  return withAuth(({ userId }) => updatePaymentMethodCommand(request, userId))
}

export async function deletePaymentMethodCommandAction(paymentMethodId: string) {
  return withAuth(({ userId }) => deletePaymentMethodCommand(paymentMethodId, userId))
}

export async function deletePaymentMethodsCommandAction(paymentMethodIds: string[]) {
  return withAuth(({ userId }) => deletePaymentMethodsCommand(paymentMethodIds, userId))
}
