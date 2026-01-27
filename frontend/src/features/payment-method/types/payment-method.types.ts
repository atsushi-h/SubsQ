import type { PaymentMethodResponse } from '@/external/dto/payment-method.dto'

export type PaymentMethod = PaymentMethodResponse

// 使用中件数を含む拡張型
export type PaymentMethodWithUsage = PaymentMethod & {
  usageCount: number
}
