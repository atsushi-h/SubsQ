import { dehydrate, HydrationBoundary } from '@tanstack/react-query'
import { listSubscriptionsByUserIdQuery } from '@/external/handler/subscription/subscription.query.server'
import { getAuthenticatedSessionServer } from '@/features/auth/servers/redirect.server'
import { SubscriptionListContainer } from '@/features/subscription/components/client/SubscriptionListClient'
import { subscriptionKeys } from '@/features/subscription/queries/subscription.query-keys'
import { getQueryClient } from '@/shared/lib/query-client'

export async function SubscriptionListPageTemplate() {
  const session = await getAuthenticatedSessionServer()
  const queryClient = getQueryClient()

  await queryClient.prefetchQuery({
    queryKey: subscriptionKeys.lists(),
    queryFn: () => listSubscriptionsByUserIdQuery(session.user.id),
  })

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <SubscriptionListContainer />
    </HydrationBoundary>
  )
}
