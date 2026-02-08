import type { Metadata } from 'next'
import { getSubscriptionByIdQuery } from '@/external/handler/subscription/subscription.query.server'
import { getAuthenticatedSessionServer } from '@/features/auth/servers/redirect.server'
import { SubscriptionEditPageTemplate } from '@/features/subscription/components/server/SubscriptionEditPageTemplate'
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
      title: `${subscription.serviceName} を編集`,
      description: `${subscription.serviceName} のサブスクリプション情報を編集`,
      path: `/subscriptions/${id}/edit`,
    })
  } catch (_error) {
    return { title: 'サブスク編集' }
  }
}

export default async function SubscriptionEditPage({ params }: Props) {
  const { id } = await params
  return <SubscriptionEditPageTemplate subscriptionId={id} />
}
