import type { Metadata } from 'next'
import { PaymentMethodNewPageTemplate } from '@/features/payment-method/components/server/PaymentMethodNewPageTemplate'
import { generatePageMetadata } from '@/shared/lib/metadata'

export const metadata: Metadata = generatePageMetadata('PAYMENT_METHOD_NEW', {
  path: '/payment-methods/new',
})

export default function PaymentMethodNewPage() {
  return <PaymentMethodNewPageTemplate />
}
