'use client'

import { useQuery } from '@tanstack/react-query'
import { listMyPushSubscriptionsQueryAction } from '@/external/handler/notification/notification.query.action'
import { notificationKeys } from '@/features/notification/queries/notification.query-keys'

export function usePushSubscriptionsQuery() {
  return useQuery({
    queryKey: notificationKeys.subscriptions(),
    queryFn: () => listMyPushSubscriptionsQueryAction(),
  })
}
