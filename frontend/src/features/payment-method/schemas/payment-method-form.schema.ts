import { z } from 'zod'

const MAX_NAME_LENGTH = 100

export const paymentMethodFormSchema = z.object({
  name: z
    .string()
    .min(1, '支払い方法名を入力してください')
    .max(MAX_NAME_LENGTH, `支払い方法名は${MAX_NAME_LENGTH}文字以内で入力してください`),
})

export type PaymentMethodFormData = z.infer<typeof paymentMethodFormSchema>

export const validatePaymentMethodForm = (data: unknown) => {
  return paymentMethodFormSchema.safeParse(data)
}
