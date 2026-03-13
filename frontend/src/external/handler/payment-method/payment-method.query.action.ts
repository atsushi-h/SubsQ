'use server'

import type { GetPaymentMethodByIdRequest } from '@/external/dto/payment-method.dto'
import {
  getPaymentMethodByIdQuery,
  listPaymentMethodsByUserIdQuery,
} from '@/external/handler/payment-method/payment-method.query.server'
import { withAuth } from '@/features/auth/servers/auth.guard'

export async function getPaymentMethodByIdQueryAction(request: GetPaymentMethodByIdRequest) {
  return withAuth(() => getPaymentMethodByIdQuery(request))
}

export async function listPaymentMethodsByUserIdQueryAction() {
  return withAuth(() => listPaymentMethodsByUserIdQuery())
}
