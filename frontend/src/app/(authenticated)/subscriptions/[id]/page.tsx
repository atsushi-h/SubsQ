import type { Metadata } from 'next'
import { getSubscriptionByIdQuery } from '@/external/handler/subscription/subscription.query.server'
import { getAuthenticatedSessionServer } from '@/features/auth/servers/redirect.server'
import { SubscriptionDetailPageTemplate } from '@/features/subscription/components/server/SubscriptionDetailPageTemplate'
import { generateMetadata as generateMetadataUtil } from '@/shared/lib/metadata'

type Props = {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params

  try {
    const session = await getAuthenticatedSessionServer()
    const subscription = await getSubscriptionByIdQuery({ id }, session.user.id)

    if (!subscription) {
      return { title: 'サブスクが見つかりません' }
    }

    return generateMetadataUtil({
      title: `${subscription.serviceName} の詳細`,
      description: `${subscription.serviceName} のサブスクリプション詳細を確認`,
      path: `/subscriptions/${id}`,
    })
  } catch (_error) {
    return { title: 'サブスク詳細' }
  }
}

export default async function SubscriptionDetailPage({ params }: Props) {
  const { id } = await params
  return <SubscriptionDetailPageTemplate subscriptionId={id} />
}
