import { z } from 'zod'

export const PushSubscriptionRequestSchema = z.object({
  endpoint: z.url(),
  keys: z.object({ p256dh: z.string(), auth: z.string() }),
  userAgent: z.string().optional(),
})

export const PushSubscriptionResponseSchema = z.object({
  id: z.uuid(),
  endpoint: z.url(),
  createdAt: z.string(),
})

export const ListPushSubscriptionsResponseSchema = z.object({
  subscriptions: z.array(PushSubscriptionResponseSchema),
})

export type PushSubscriptionRequest = z.infer<typeof PushSubscriptionRequestSchema>
export type PushSubscriptionResponse = z.infer<typeof PushSubscriptionResponseSchema>
export type ListPushSubscriptionsResponse = z.infer<typeof ListPushSubscriptionsResponseSchema>
