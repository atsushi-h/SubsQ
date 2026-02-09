import type { Metadata } from 'next'
import { PaymentMethodListPageTemplate } from '@/features/payment-method/components/server/PaymentMethodListPageTemplate'
import { generatePageMetadata } from '@/shared/lib/metadata'

export const metadata: Metadata = generatePageMetadata('PAYMENT_METHODS', {
  path: '/payment-methods',
})

export default function PaymentMethodsPage() {
  return <PaymentMethodListPageTemplate />
}
