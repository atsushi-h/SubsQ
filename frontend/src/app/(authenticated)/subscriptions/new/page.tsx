import type { Metadata } from 'next'
import { SubscriptionNewPageTemplate } from '@/features/subscription/components/server/SubscriptionNewPageTemplate'
import { generatePageMetadata } from '@/shared/lib/metadata'

export const metadata: Metadata = generatePageMetadata('SUBSCRIPTION_NEW', {
  path: '/subscriptions/new',
})

export default function SubscriptionNewPage() {
  return <SubscriptionNewPageTemplate />
}
