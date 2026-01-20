import { SubscriptionEditPageTemplate } from '@/features/subscription/components/server/SubscriptionEditPageTemplate'

type Props = {
  params: Promise<{ id: string }>
}

export default async function SubscriptionEditPage({ params }: Props) {
  const { id } = await params
  return <SubscriptionEditPageTemplate subscriptionId={id} />
}
