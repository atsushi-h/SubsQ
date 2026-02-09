'use client'

import { useQuery } from '@tanstack/react-query'
import { getPaymentMethodByIdQueryAction } from '@/external/handler/payment-method/payment-method.query.action'
import { paymentMethodKeys } from '@/features/payment-method/queries/payment-method.query-keys'

export function usePaymentMethodDetailQuery(id: string | undefined) {
  return useQuery({
    queryKey: id ? paymentMethodKeys.detail(id) : [],
    queryFn: () => {
      if (!id) throw new Error('ID is required')
      return getPaymentMethodByIdQueryAction({ id })
    },
    enabled: !!id,
  })
}
