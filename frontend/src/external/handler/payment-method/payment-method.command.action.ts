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

export async function createPaymentMethodCommandAction(data: CreatePaymentMethodRequest) {
  return withAuth(() => createPaymentMethodCommand(data))
}

export async function updatePaymentMethodCommandAction(request: UpdatePaymentMethodRequest) {
  return withAuth(() => updatePaymentMethodCommand(request))
}

export async function deletePaymentMethodCommandAction(paymentMethodId: string) {
  return withAuth(() => deletePaymentMethodCommand(paymentMethodId))
}

export async function deletePaymentMethodsCommandAction(paymentMethodIds: string[]) {
  return withAuth(() => deletePaymentMethodsCommand(paymentMethodIds))
}
