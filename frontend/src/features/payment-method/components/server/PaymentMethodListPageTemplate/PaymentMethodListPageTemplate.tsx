import { dehydrate, HydrationBoundary } from '@tanstack/react-query'
import { listPaymentMethodsByUserIdQuery } from '@/external/handler/payment-method/payment-method.query.server'
import { PaymentMethodList } from '@/features/payment-method/components/client/PaymentMethodList'
import { paymentMethodKeys } from '@/features/payment-method/queries/payment-method.query-keys'
import { getQueryClient } from '@/shared/lib/query-client'

export async function PaymentMethodListPageTemplate() {
  const queryClient = getQueryClient()

  await queryClient.prefetchQuery({
    queryKey: paymentMethodKeys.lists(),
    queryFn: () => listPaymentMethodsByUserIdQuery(),
  })

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <PaymentMethodList />
    </HydrationBoundary>
  )
}
