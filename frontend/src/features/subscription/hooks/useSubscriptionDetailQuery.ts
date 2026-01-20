'use client'

import { useQuery } from '@tanstack/react-query'
import { getSubscriptionByIdQueryAction } from '@/external/handler/subscription/subscription.query.action'
import { subscriptionKeys } from '@/features/subscription/queries/subscription.query-keys'

export function useSubscriptionDetailQuery(id: string | undefined) {
  return useQuery({
    queryKey: subscriptionKeys.detail(id ?? ''),
    // enabled: !!id により、queryFnはidが存在する場合のみ実行される
    queryFn: () => getSubscriptionByIdQueryAction({ id: id as string }),
    enabled: !!id,
  })
}
