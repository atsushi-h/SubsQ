import { describe, expect, it } from 'vitest'
import {
  ListPushSubscriptionsResponseSchema,
  PushSubscriptionRequestSchema,
  PushSubscriptionResponseSchema,
} from './notification.dto'

const validSubscription = {
  id: '123e4567-e89b-12d3-a456-426614174000',
  endpoint: 'https://fcm.googleapis.com/fcm/send/example',
  createdAt: '2024-01-01T00:00:00.000Z',
}

describe('PushSubscriptionRequestSchema', () => {
  const validRequest = {
    endpoint: 'https://fcm.googleapis.com/fcm/send/example',
    keys: { p256dh: 'BAAAA', auth: 'BBBBB' },
  }

  it('有効なリクエストをパースできる', () => {
    expect(PushSubscriptionRequestSchema.safeParse(validRequest).success).toBe(true)
  })

  it('userAgentはオプショナル', () => {
    const result = PushSubscriptionRequestSchema.safeParse({
      ...validRequest,
      userAgent: 'Mozilla/5.0',
    })
    expect(result.success).toBe(true)
  })

  it('endpointがURLでない場合エラーになる', () => {
    const result = PushSubscriptionRequestSchema.safeParse({
      ...validRequest,
      endpoint: 'not-a-url',
    })
    expect(result.success).toBe(false)
  })

  it('keysが欠けている場合エラーになる', () => {
    const result = PushSubscriptionRequestSchema.safeParse({
      endpoint: validRequest.endpoint,
    })
    expect(result.success).toBe(false)
  })
})

describe('PushSubscriptionResponseSchema', () => {
  it('有効なレスポンスをパースできる', () => {
    expect(PushSubscriptionResponseSchema.safeParse(validSubscription).success).toBe(true)
  })

  it('idが不正なUUIDでエラーになる', () => {
    const result = PushSubscriptionResponseSchema.safeParse({
      ...validSubscription,
      id: 'not-a-uuid',
    })
    expect(result.success).toBe(false)
  })

  it('endpointがURLでない場合エラーになる', () => {
    const result = PushSubscriptionResponseSchema.safeParse({
      ...validSubscription,
      endpoint: 'not-a-url',
    })
    expect(result.success).toBe(false)
  })
})

describe('ListPushSubscriptionsResponseSchema', () => {
  it('有効なレスポンスをパースできる', () => {
    const input = { subscriptions: [validSubscription] }
    expect(ListPushSubscriptionsResponseSchema.safeParse(input).success).toBe(true)
  })

  it('空の配列を許容する', () => {
    const input = { subscriptions: [] }
    expect(ListPushSubscriptionsResponseSchema.safeParse(input).success).toBe(true)
  })
})
