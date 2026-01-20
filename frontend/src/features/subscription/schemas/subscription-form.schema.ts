import { z } from 'zod'

export const subscriptionFormSchema = z.object({
  serviceName: z
    .string()
    .min(1, 'サービス名を入力してください')
    .max(100, 'サービス名は100文字以内で入力してください'),
  amount: z
    .string()
    .min(1, '金額を入力してください')
    .refine((val) => !Number.isNaN(Number(val)), '金額は数値で入力してください')
    .refine((val) => Number(val) >= 0, '金額は0以上で入力してください')
    .refine((val) => Number(val) <= 1000000, '金額は1,000,000以下で入力してください')
    .refine((val) => Number.isInteger(Number(val)), '金額は整数で入力してください'),
  billingCycle: z.enum(['monthly', 'yearly'], {
    message: '請求サイクルを選択してください',
  }),
  baseDate: z.string().min(1, '基準日を入力してください'),
  memo: z.string().optional(),
})

export type SubscriptionFormData = z.infer<typeof subscriptionFormSchema>

export const validateSubscriptionForm = (data: unknown) => {
  return subscriptionFormSchema.safeParse(data)
}
