'use server'

import type { GetPaymentMethodByIdRequest } from '@/external/dto/payment-method.dto'
import {
  getPaymentMethodByIdQuery,
  listPaymentMethodsByUserIdQuery,
} from '@/external/handler/payment-method/payment-method.query.server'
import { withAuth } from '@/features/auth/servers/auth.guard'

export async function getPaymentMethodByIdQueryAction(request: GetPaymentMethodByIdRequest) {
  return withAuth(({ userId }) => getPaymentMethodByIdQuery(request, userId))
}

export async function listPaymentMethodsByUserIdQueryAction() {
  return withAuth(({ userId }) => listPaymentMethodsByUserIdQuery(userId))
}
