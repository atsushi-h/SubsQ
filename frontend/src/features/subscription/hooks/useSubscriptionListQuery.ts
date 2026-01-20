'use client'

import { useQuery } from '@tanstack/react-query'
import { listSubscriptionsByUserIdQueryAction } from '@/external/handler/subscription/subscription.query.action'
import { subscriptionKeys } from '@/features/subscription/queries/subscription.query-keys'

export function useSubscriptionListQuery() {
  return useQuery({
    queryKey: subscriptionKeys.lists(),
    queryFn: () => listSubscriptionsByUserIdQueryAction(),
  })
}
