import type { Metadata } from 'next'
import { SubscriptionListPageTemplate } from '@/features/subscription/components/server/SubscriptionListPageTemplate'
import { generatePageMetadata } from '@/shared/lib/metadata'

export const metadata: Metadata = generatePageMetadata('SUBSCRIPTIONS', {
  path: '/subscriptions',
})

export default function SubscriptionsPage() {
  return <SubscriptionListPageTemplate />
}
