import { z } from 'zod'

// バリデーション定数
const MAX_SUBSCRIPTION_AMOUNT = 1_000_000
const MAX_SERVICE_NAME_LENGTH = 100
const MIN_YEAR = 2000
const MAX_YEAR = 2100

// YYYY-MM-DD形式の正規表現
const DATE_FORMAT_REGEX = /^\d{4}-\d{2}-\d{2}$/

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
    .regex(DATE_FORMAT_REGEX, 'YYYY-MM-DD形式で入力してください')
    .refine((val) => {
      const date = new Date(val)
      if (Number.isNaN(date.getTime())) {
        return false
      }
      const year = date.getFullYear()
      return year >= MIN_YEAR && year <= MAX_YEAR
    }, `有効な日付を入力してください（${MIN_YEAR}年〜${MAX_YEAR}年）`),
  paymentMethodId: z.string().optional(),
  memo: z.string().optional(),
})

export type SubscriptionFormData = z.infer<typeof subscriptionFormSchema>

export const validateSubscriptionForm = (data: unknown) => {
  return subscriptionFormSchema.safeParse(data)
}
