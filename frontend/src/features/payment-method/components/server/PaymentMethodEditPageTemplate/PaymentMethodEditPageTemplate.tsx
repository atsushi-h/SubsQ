import { dehydrate, HydrationBoundary } from '@tanstack/react-query'
import { notFound } from 'next/navigation'
import { getPaymentMethodByIdQuery } from '@/external/handler/payment-method/payment-method.query.server'
import { getAuthenticatedSessionServer } from '@/features/auth/servers/redirect.server'
import { PaymentMethodForm } from '@/features/payment-method/components/client/PaymentMethodForm'
import { paymentMethodKeys } from '@/features/payment-method/queries/payment-method.query-keys'
import { getQueryClient } from '@/shared/lib/query-client'

type Props = {
  paymentMethodId: string
}

export async function PaymentMethodEditPageTemplate({ paymentMethodId }: Props) {
  const session = await getAuthenticatedSessionServer()
  const queryClient = getQueryClient()

  // データをプリフェッチ（存在チェックのため fetchQuery を使用）
  const paymentMethod = await queryClient.fetchQuery({
    queryKey: paymentMethodKeys.detail(paymentMethodId),
    queryFn: () => getPaymentMethodByIdQuery({ id: paymentMethodId }, session.user.id),
  })

  // 存在チェック
  if (!paymentMethod) {
    notFound()
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <PaymentMethodForm mode="edit" paymentMethodId={paymentMethodId} />
    </HydrationBoundary>
  )
}
