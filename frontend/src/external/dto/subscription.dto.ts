import { z } from 'zod'

// Request schemas
export const CreateSubscriptionRequestSchema = z.object({
  userId: z.uuid(),
  serviceName: z.string().min(1).max(100),
  amount: z.number().int().min(0).max(1000000),
  billingCycle: z.enum(['monthly', 'yearly']),
  baseDate: z.iso.datetime(),
  paymentMethodId: z.uuid().nullable().optional(),
  memo: z.string().optional(),
})

export const UpdateSubscriptionRequestSchema = z.object({
  id: z.uuid(),
  serviceName: z.string().min(1).max(100).optional(),
  amount: z.number().int().min(0).max(1000000).optional(),
  billingCycle: z.enum(['monthly', 'yearly']).optional(),
  baseDate: z.iso.datetime().optional(),
  paymentMethodId: z.uuid().nullable().optional(),
  memo: z.string().optional(),
})

export const GetSubscriptionByIdRequestSchema = z.object({
  id: z.uuid(),
})

export const GetSubscriptionsByUserIdRequestSchema = z.object({
  userId: z.uuid(),
})

// Response schemas
export const PaymentMethodInSubscriptionSchema = z.object({
  id: z.uuid(),
  name: z.string(),
})

export const SubscriptionResponseSchema = z.object({
  id: z.uuid(),
  userId: z.uuid(),
  serviceName: z.string(),
  amount: z.number(),
  billingCycle: z.enum(['monthly', 'yearly']),
  baseDate: z.iso.datetime(),
  paymentMethod: PaymentMethodInSubscriptionSchema.nullable(),
  memo: z.string(),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
})

export const ListSubscriptionsResponseSchema = z.object({
  subscriptions: z.array(SubscriptionResponseSchema),
  totals: z.object({
    monthlyTotal: z.number(),
    yearlyTotal: z.number(),
  }),
})

// Type exports
export type CreateSubscriptionRequest = z.infer<typeof CreateSubscriptionRequestSchema>
export type UpdateSubscriptionRequest = z.infer<typeof UpdateSubscriptionRequestSchema>
export type GetSubscriptionByIdRequest = z.infer<typeof GetSubscriptionByIdRequestSchema>
export type GetSubscriptionsByUserIdRequest = z.infer<typeof GetSubscriptionsByUserIdRequestSchema>
export type SubscriptionResponse = z.infer<typeof SubscriptionResponseSchema>
export type ListSubscriptionsResponse = z.infer<typeof ListSubscriptionsResponseSchema>
export type CreateSubscriptionResponse = SubscriptionResponse
export type UpdateSubscriptionResponse = SubscriptionResponse
