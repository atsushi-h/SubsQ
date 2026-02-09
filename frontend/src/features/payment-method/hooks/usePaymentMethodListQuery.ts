'use client'

import { useQuery } from '@tanstack/react-query'
import { listPaymentMethodsByUserIdQueryAction } from '@/external/handler/payment-method/payment-method.query.action'
import { paymentMethodKeys } from '@/features/payment-method/queries/payment-method.query-keys'

export function usePaymentMethodListQuery() {
  return useQuery({
    queryKey: paymentMethodKeys.lists(),
    queryFn: () => listPaymentMethodsByUserIdQueryAction(),
  })
}
