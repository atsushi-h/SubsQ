import { PaymentMethodEditPageTemplate } from '@/features/payment-method/components/server/PaymentMethodEditPageTemplate'

type Props = {
  params: Promise<{ id: string }>
}

export default async function PaymentMethodEditPage({ params }: Props) {
  const { id } = await params
  return <PaymentMethodEditPageTemplate paymentMethodId={id} />
}
