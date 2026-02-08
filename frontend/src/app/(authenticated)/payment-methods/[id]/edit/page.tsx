import type { Metadata } from 'next'
import { getPaymentMethodByIdQuery } from '@/external/handler/payment-method/payment-method.query.server'
import { getAuthenticatedSessionServer } from '@/features/auth/servers/redirect.server'
import { PaymentMethodEditPageTemplate } from '@/features/payment-method/components/server/PaymentMethodEditPageTemplate'
import { generateMetadata as generateMetadataUtil } from '@/shared/lib/metadata'

type Props = {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params

  try {
    const session = await getAuthenticatedSessionServer()
    const paymentMethod = await getPaymentMethodByIdQuery({ id }, session.user.id)

    if (!paymentMethod) {
      return { title: '支払い方法が見つかりません' }
    }

    return generateMetadataUtil({
      title: `${paymentMethod.name} を編集`,
      description: `${paymentMethod.name} の情報を編集`,
      path: `/payment-methods/${id}/edit`,
    })
  } catch (_error) {
    return { title: '支払い方法を編集' }
  }
}

export default async function PaymentMethodEditPage({ params }: Props) {
  const { id } = await params
  return <PaymentMethodEditPageTemplate paymentMethodId={id} />
}
