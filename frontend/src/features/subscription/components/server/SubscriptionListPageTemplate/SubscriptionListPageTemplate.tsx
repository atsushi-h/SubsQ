import { dehydrate, HydrationBoundary } from '@tanstack/react-query'
import { listSubscriptionsByUserIdQuery } from '@/external/handler/subscription/subscription.query.server'
import { SubscriptionList } from '@/features/subscription/components/client/SubscriptionList'
import { subscriptionKeys } from '@/features/subscription/queries/subscription.query-keys'
import { getQueryClient } from '@/shared/lib/query-client'

export async function SubscriptionListPageTemplate() {
  const queryClient = getQueryClient()

  await queryClient.prefetchQuery({
    queryKey: subscriptionKeys.lists(),
    queryFn: () => listSubscriptionsByUserIdQuery(),
  })

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <SubscriptionList />
    </HydrationBoundary>
  )
}
