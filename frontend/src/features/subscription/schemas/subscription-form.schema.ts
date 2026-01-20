import { z } from 'zod'

// バリデーション定数
const MAX_SUBSCRIPTION_AMOUNT = 1_000_000
const MAX_SERVICE_NAME_LENGTH = 100

export const subscriptionFormSchema = z.object({
  serviceName: z
    .string()
    .min(1, 'サービス名を入力してください')
    .max(
      MAX_SERVICE_NAME_LENGTH,
      `サービス名は${MAX_SERVICE_NAME_LENGTH}文字以内で入力してください`,
    ),
  amount: z
    .string()
    .min(1, '金額を入力してください')
    .refine(
      (val) => !Number.isNaN(Number(val)) && Number(val) >= 0,
      '金額は0以上の数値で入力してください',
    )
    .refine((val) => Number.isInteger(Number(val)), '金額は整数で入力してください')
    .refine(
      (val) => Number(val) <= MAX_SUBSCRIPTION_AMOUNT,
      `金額は${MAX_SUBSCRIPTION_AMOUNT.toLocaleString()}以下で入力してください`,
    ),
  billingCycle: z.enum(['monthly', 'yearly'], {
    message: '請求サイクルを選択してください',
  }),
  baseDate: z
    .string()
    .min(1, '基準日を入力してください')
    .refine((val) => !Number.isNaN(new Date(val).getTime()), '有効な日付を入力してください'),
  memo: z.string().optional(),
})

export type SubscriptionFormData = z.infer<typeof subscriptionFormSchema>

export const validateSubscriptionForm = (data: unknown) => {
  return subscriptionFormSchema.safeParse(data)
}
