import { SubscriptionDetailPageTemplate } from '@/features/subscription/components/server/SubscriptionDetailPageTemplate'

type Props = {
  params: Promise<{ id: string }>
}

export default async function SubscriptionDetailPage({ params }: Props) {
  const { id } = await params
  return <SubscriptionDetailPageTemplate subscriptionId={id} />
}
