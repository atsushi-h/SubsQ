import { describe, expect, it } from 'vitest'
import {
  CreateSubscriptionRequestSchema,
  GetSubscriptionByIdRequestSchema,
  GetSubscriptionsByUserIdRequestSchema,
  ListSubscriptionsResponseSchema,
  PaymentMethodInSubscriptionSchema,
  SubscriptionResponseSchema,
  UpdateSubscriptionRequestSchema,
} from './subscription.dto'

// テストデータ
const INVALID_UUID = 'not-a-uuid'
const VALID_SUBSCRIPTION_ID = '123e4567-e89b-12d3-a456-426614174000'
const VALID_USER_ID = '123e4567-e89b-12d3-a456-426614174001'
const VALID_PAYMENT_METHOD_ID = '123e4567-e89b-12d3-a456-426614174002'

describe('CreateSubscriptionRequestSchema', () => {
  const validRequest = {
    userId: VALID_SUBSCRIPTION_ID,
    serviceName: 'Netflix',
    amount: 1200,
    billingCycle: 'monthly' as const,
    baseDate: '2024-01-01T00:00:00.000Z',
    paymentMethodId: VALID_USER_ID,
    memo: 'スタンダードプラン',
  }

  it('有効なリクエストをパースできる', () => {
    const result = CreateSubscriptionRequestSchema.safeParse(validRequest)
    expect(result.success).toBe(true)
  })

  it('paymentMethodIdとmemoは省略可能', () => {
    const { paymentMethodId, memo, ...withoutOptional } = validRequest
    const result = CreateSubscriptionRequestSchema.safeParse(withoutOptional)
    expect(result.success).toBe(true)
  })

  it('paymentMethodIdにnullを指定できる', () => {
    const request = { ...validRequest, paymentMethodId: null }
    const result = CreateSubscriptionRequestSchema.safeParse(request)
    expect(result.success).toBe(true)
  })

  it('userIdが不正なUUID形式でエラーになる', () => {
    const invalid = { ...validRequest, userId: INVALID_UUID }
    const result = CreateSubscriptionRequestSchema.safeParse(invalid)
    expect(result.success).toBe(false)
  })

  it('serviceNameが空文字でエラーになる', () => {
    const invalid = { ...validRequest, serviceName: '' }
    const result = CreateSubscriptionRequestSchema.safeParse(invalid)
    expect(result.success).toBe(false)
  })

  it('serviceNameが100文字を超えるとエラーになる', () => {
    const invalid = { ...validRequest, serviceName: 'a'.repeat(101) }
    const result = CreateSubscriptionRequestSchema.safeParse(invalid)
    expect(result.success).toBe(false)
  })

  it('amountが負の数でエラーになる', () => {
    const invalid = { ...validRequest, amount: -100 }
    const result = CreateSubscriptionRequestSchema.safeParse(invalid)
    expect(result.success).toBe(false)
  })

  it('amountが0の場合はパースできる', () => {
    const request = { ...validRequest, amount: 0 }
    const result = CreateSubscriptionRequestSchema.safeParse(request)
    expect(result.success).toBe(true)
  })

  it('amountが1000000を超えるとエラーになる', () => {
    const invalid = { ...validRequest, amount: 1000001 }
    const result = CreateSubscriptionRequestSchema.safeParse(invalid)
    expect(result.success).toBe(false)
  })

  it('amountが小数でエラーになる', () => {
    const invalid = { ...validRequest, amount: 1200.5 }
    const result = CreateSubscriptionRequestSchema.safeParse(invalid)
    expect(result.success).toBe(false)
  })

  it('billingCycleが不正な値でエラーになる', () => {
    const invalid = { ...validRequest, billingCycle: 'weekly' }
    const result = CreateSubscriptionRequestSchema.safeParse(invalid)
    expect(result.success).toBe(false)
  })

  it('baseDateが不正なISO形式でエラーになる', () => {
    const invalid = { ...validRequest, baseDate: 'not-a-date' }
    const result = CreateSubscriptionRequestSchema.safeParse(invalid)
    expect(result.success).toBe(false)
  })
})

describe('UpdateSubscriptionRequestSchema', () => {
  it('有効なリクエストをパースできる', () => {
    const request = {
      id: VALID_SUBSCRIPTION_ID,
      serviceName: 'Spotify',
      amount: 980,
      billingCycle: 'monthly' as const,
      baseDate: '2024-02-01T00:00:00.000Z',
      paymentMethodId: VALID_USER_ID,
      memo: 'プレミアムプラン',
    }
    const result = UpdateSubscriptionRequestSchema.safeParse(request)
    expect(result.success).toBe(true)
  })

  it('idのみ必須で他のフィールドは省略可能', () => {
    const request = {
      id: VALID_SUBSCRIPTION_ID,
    }
    const result = UpdateSubscriptionRequestSchema.safeParse(request)
    expect(result.success).toBe(true)
  })

  it('paymentMethodIdにnullを指定できる', () => {
    const request = {
      id: VALID_SUBSCRIPTION_ID,
      paymentMethodId: null,
    }
    const result = UpdateSubscriptionRequestSchema.safeParse(request)
    expect(result.success).toBe(true)
  })

  it('idが不正なUUID形式でエラーになる', () => {
    const request = {
      id: INVALID_UUID,
      serviceName: 'Spotify',
    }
    const result = UpdateSubscriptionRequestSchema.safeParse(request)
    expect(result.success).toBe(false)
  })

  it('serviceNameが空文字でエラーになる', () => {
    const request = {
      id: VALID_SUBSCRIPTION_ID,
      serviceName: '',
    }
    const result = UpdateSubscriptionRequestSchema.safeParse(request)
    expect(result.success).toBe(false)
  })

  it('amountが負の数でエラーになる', () => {
    const request = {
      id: VALID_SUBSCRIPTION_ID,
      amount: -100,
    }
    const result = UpdateSubscriptionRequestSchema.safeParse(request)
    expect(result.success).toBe(false)
  })
})

describe('GetSubscriptionByIdRequestSchema', () => {
  it('有効なUUIDをパースできる', () => {
    const request = {
      id: VALID_SUBSCRIPTION_ID,
    }
    const result = GetSubscriptionByIdRequestSchema.safeParse(request)
    expect(result.success).toBe(true)
  })

  it('不正なUUID形式でエラーになる', () => {
    const request = { id: INVALID_UUID }
    const result = GetSubscriptionByIdRequestSchema.safeParse(request)
    expect(result.success).toBe(false)
  })
})

describe('GetSubscriptionsByUserIdRequestSchema', () => {
  it('有効なUUIDをパースできる', () => {
    const request = {
      userId: VALID_SUBSCRIPTION_ID,
    }
    const result = GetSubscriptionsByUserIdRequestSchema.safeParse(request)
    expect(result.success).toBe(true)
  })

  it('不正なUUID形式でエラーになる', () => {
    const request = { userId: INVALID_UUID }
    const result = GetSubscriptionsByUserIdRequestSchema.safeParse(request)
    expect(result.success).toBe(false)
  })
})

describe('PaymentMethodInSubscriptionSchema', () => {
  it('有効なデータをパースできる', () => {
    const data = {
      id: VALID_SUBSCRIPTION_ID,
      name: 'クレジットカード',
    }
    const result = PaymentMethodInSubscriptionSchema.safeParse(data)
    expect(result.success).toBe(true)
  })

  it('idが不正なUUID形式でエラーになる', () => {
    const invalid = { id: INVALID_UUID, name: 'クレジットカード' }
    const result = PaymentMethodInSubscriptionSchema.safeParse(invalid)
    expect(result.success).toBe(false)
  })
})

describe('SubscriptionResponseSchema', () => {
  const validResponse = {
    id: VALID_SUBSCRIPTION_ID,
    userId: VALID_USER_ID,
    serviceName: 'Netflix',
    amount: 1200,
    billingCycle: 'monthly' as const,
    baseDate: '2024-01-01T00:00:00.000Z',
    paymentMethod: { id: VALID_PAYMENT_METHOD_ID, name: 'クレジットカード' },
    memo: 'スタンダードプラン',
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  }

  it('有効なレスポンスをパースできる', () => {
    const result = SubscriptionResponseSchema.safeParse(validResponse)
    expect(result.success).toBe(true)
  })

  it('paymentMethodがnullの場合もパースできる', () => {
    const response = { ...validResponse, paymentMethod: null }
    const result = SubscriptionResponseSchema.safeParse(response)
    expect(result.success).toBe(true)
  })

  it('idが不正なUUID形式でエラーになる', () => {
    const invalid = { ...validResponse, id: INVALID_UUID }
    const result = SubscriptionResponseSchema.safeParse(invalid)
    expect(result.success).toBe(false)
  })

  it('billingCycleが不正な値でエラーになる', () => {
    const invalid = { ...validResponse, billingCycle: 'weekly' }
    const result = SubscriptionResponseSchema.safeParse(invalid)
    expect(result.success).toBe(false)
  })

  it('baseDateが不正なISO形式でエラーになる', () => {
    const invalid = { ...validResponse, baseDate: 'not-a-date' }
    const result = SubscriptionResponseSchema.safeParse(invalid)
    expect(result.success).toBe(false)
  })
})

describe('ListSubscriptionsResponseSchema', () => {
  const validResponse = {
    subscriptions: [
      {
        id: VALID_SUBSCRIPTION_ID,
        userId: VALID_USER_ID,
        serviceName: 'Netflix',
        amount: 1200,
        billingCycle: 'monthly' as const,
        baseDate: '2024-01-01T00:00:00.000Z',
        paymentMethod: { id: VALID_PAYMENT_METHOD_ID, name: 'クレジットカード' },
        memo: '',
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
      },
    ],
    totals: {
      monthlyTotal: 1200,
      yearlyTotal: 14400,
    },
  }

  it('有効なレスポンスをパースできる', () => {
    const result = ListSubscriptionsResponseSchema.safeParse(validResponse)
    expect(result.success).toBe(true)
  })

  it('subscriptionsが空配列でもパースできる', () => {
    const response = {
      subscriptions: [],
      totals: { monthlyTotal: 0, yearlyTotal: 0 },
    }
    const result = ListSubscriptionsResponseSchema.safeParse(response)
    expect(result.success).toBe(true)
  })

  it('totalsフィールドが欠落している場合エラーになる', () => {
    const { totals, ...withoutTotals } = validResponse
    const result = ListSubscriptionsResponseSchema.safeParse(withoutTotals)
    expect(result.success).toBe(false)
  })

  it('monthlyTotalが負の数でもパースできる', () => {
    const response = {
      ...validResponse,
      totals: { monthlyTotal: -100, yearlyTotal: 0 },
    }
    const result = ListSubscriptionsResponseSchema.safeParse(response)
    expect(result.success).toBe(true)
  })
})
