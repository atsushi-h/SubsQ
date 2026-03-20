import { describe, expect, it } from 'vitest'
import {
  CreateSubscriptionRequestSchema,
  GetSubscriptionByIdRequestSchema,
  ListSubscriptionsResponseSchema,
  SubscriptionResponseSchema,
  UpdateSubscriptionRequestSchema,
} from './subscription.dto'

const validSubscription = {
  id: '123e4567-e89b-12d3-a456-426614174000',
  userId: '123e4567-e89b-12d3-a456-426614174001',
  serviceName: 'Netflix',
  amount: 1490,
  billingCycle: 'monthly' as const,
  baseDate: '2024-01-01T00:00:00.000Z',
  nextBillingDate: '2024-02-01',
  paymentMethodId: '123e4567-e89b-12d3-a456-426614174002',
  paymentMethod: { id: '123e4567-e89b-12d3-a456-426614174002', name: 'カード' },
  memo: 'メモ',
  monthlyAmount: 1490,
  yearlyAmount: 17880,
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
}

describe('SubscriptionResponseSchema', () => {
  it('有効なレスポンスをパースできる', () => {
    expect(SubscriptionResponseSchema.safeParse(validSubscription).success).toBe(true)
  })

  it('billingCycleが不正な値でエラーになる', () => {
    const result = SubscriptionResponseSchema.safeParse({ ...validSubscription, billingCycle: 'weekly' })
    expect(result.success).toBe(false)
  })

  it('paymentMethodはnullを許容する', () => {
    const result = SubscriptionResponseSchema.safeParse({
      ...validSubscription,
      paymentMethod: null,
      paymentMethodId: undefined,
    })
    expect(result.success).toBe(true)
  })
})

describe('ListSubscriptionsResponseSchema', () => {
  it('有効なレスポンスをパースできる', () => {
    const input = {
      subscriptions: [validSubscription],
      summary: { monthlyTotal: 1490, yearlyTotal: 17880, count: 1 },
    }
    expect(ListSubscriptionsResponseSchema.safeParse(input).success).toBe(true)
  })

  it('空の配列を許容する', () => {
    const input = {
      subscriptions: [],
      summary: { monthlyTotal: 0, yearlyTotal: 0, count: 0 },
    }
    expect(ListSubscriptionsResponseSchema.safeParse(input).success).toBe(true)
  })
})

describe('CreateSubscriptionRequestSchema', () => {
  const validRequest = {
    serviceName: 'Netflix',
    amount: 1490,
    billingCycle: 'monthly' as const,
    baseDate: '2024-01-01T00:00:00.000Z',
  }

  it('有効なリクエストをパースできる', () => {
    expect(CreateSubscriptionRequestSchema.safeParse(validRequest).success).toBe(true)
  })

  it('serviceNameが空文字でエラーになる', () => {
    const result = CreateSubscriptionRequestSchema.safeParse({ ...validRequest, serviceName: '' })
    expect(result.success).toBe(false)
  })

  it('serviceNameが100文字を超えるとエラーになる', () => {
    const result = CreateSubscriptionRequestSchema.safeParse({ ...validRequest, serviceName: 'a'.repeat(101) })
    expect(result.success).toBe(false)
  })

  it('amountが負の数でエラーになる', () => {
    const result = CreateSubscriptionRequestSchema.safeParse({ ...validRequest, amount: -1 })
    expect(result.success).toBe(false)
  })

  it('amountが1000000を超えるとエラーになる', () => {
    const result = CreateSubscriptionRequestSchema.safeParse({ ...validRequest, amount: 1000001 })
    expect(result.success).toBe(false)
  })

  it('amountが小数でエラーになる', () => {
    const result = CreateSubscriptionRequestSchema.safeParse({ ...validRequest, amount: 1.5 })
    expect(result.success).toBe(false)
  })

  it('paymentMethodIdはnullを許容する', () => {
    const result = CreateSubscriptionRequestSchema.safeParse({ ...validRequest, paymentMethodId: null })
    expect(result.success).toBe(true)
  })
})

describe('UpdateSubscriptionRequestSchema', () => {
  it('idのみ必須で他はオプショナル', () => {
    const result = UpdateSubscriptionRequestSchema.safeParse({ id: '123e4567-e89b-12d3-a456-426614174000' })
    expect(result.success).toBe(true)
  })

  it('idが不正なUUIDでエラーになる', () => {
    const result = UpdateSubscriptionRequestSchema.safeParse({ id: 'not-a-uuid' })
    expect(result.success).toBe(false)
  })
})

describe('GetSubscriptionByIdRequestSchema', () => {
  it('有効なUUIDをパースできる', () => {
    const result = GetSubscriptionByIdRequestSchema.safeParse({ id: '123e4567-e89b-12d3-a456-426614174000' })
    expect(result.success).toBe(true)
  })

  it('不正なUUIDでエラーになる', () => {
    const result = GetSubscriptionByIdRequestSchema.safeParse({ id: 'invalid' })
    expect(result.success).toBe(false)
  })
})
