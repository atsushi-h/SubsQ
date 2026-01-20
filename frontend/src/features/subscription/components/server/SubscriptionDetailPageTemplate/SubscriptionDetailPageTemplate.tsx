import { dehydrate, HydrationBoundary } from '@tanstack/react-query'
import { notFound } from 'next/navigation'
import { getSubscriptionByIdQuery } from '@/external/handler/subscription/subscription.query.server'
import { getAuthenticatedSessionServer } from '@/features/auth/servers/redirect.server'
import { SubscriptionDetailContainer } from '@/features/subscription/components/client/SubscriptionDetailClient'
import { subscriptionKeys } from '@/features/subscription/queries/subscription.query-keys'
import { getQueryClient } from '@/shared/lib/query-client'

type Props = {
  subscriptionId: string
}

export async function SubscriptionDetailPageTemplate({ subscriptionId }: Props) {
  const session = await getAuthenticatedSessionServer()
  const queryClient = getQueryClient()

  // データをプリフェッチ（存在チェックのため fetchQuery を使用）
  const subscription = await queryClient.fetchQuery({
    queryKey: subscriptionKeys.detail(subscriptionId),
    queryFn: () => getSubscriptionByIdQuery({ id: subscriptionId }, session.user.id),
  })

  // 存在チェック
  if (!subscription) {
    notFound()
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <SubscriptionDetailContainer subscriptionId={subscriptionId} />
    </HydrationBoundary>
  )
}
