'use client'

import { useQuery } from '@tanstack/react-query'
import { getSubscriptionByIdQueryAction } from '@/external/handler/subscription/subscription.query.action'
import { subscriptionKeys } from '@/features/subscription/queries/subscription.query-keys'

export function useSubscriptionDetailQuery(id: string) {
  return useQuery({
    queryKey: subscriptionKeys.detail(id),
    queryFn: () => getSubscriptionByIdQueryAction({ id }),
    enabled: !!id,
    staleTime: 0,
  })
}
