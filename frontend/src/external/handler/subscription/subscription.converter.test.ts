import { describe, expect, it } from 'vitest'
import { Subscription } from '../../domain/entities/subscription'
import { Amount } from '../../domain/value-objects/amount'
import { BaseDate } from '../../domain/value-objects/base-date'
import { BillingCycle } from '../../domain/value-objects/billing-cycle'
import { toSubscriptionResponse } from './subscription.converter'

// テストデータ
const VALID_SUBSCRIPTION_ID = '123e4567-e89b-12d3-a456-426614174000'
const VALID_USER_ID = '123e4567-e89b-12d3-a456-426614174001'
const VALID_PAYMENT_METHOD_ID = '123e4567-e89b-12d3-a456-426614174002'

describe('toSubscriptionResponse', () => {
  it('SubscriptionエンティティをSubscriptionResponseに変換する', () => {
    const subscription = Subscription.reconstruct({
      id: VALID_SUBSCRIPTION_ID,
      userId: VALID_USER_ID,
      serviceName: 'Netflix',
      amount: Amount.fromValue(1200),
      billingCycle: BillingCycle.fromValue('monthly'),
      baseDate: BaseDate.fromValue(1704067200), // 2024-01-01 00:00:00 UTC
      paymentMethodId: VALID_PAYMENT_METHOD_ID,
      memo: 'スタンダードプラン',
      createdAt: new Date('2024-01-01T00:00:00.000Z'),
      updatedAt: new Date('2024-01-02T00:00:00.000Z'),
    })

    const paymentMethod = {
      id: VALID_PAYMENT_METHOD_ID,
      name: 'クレジットカード',
    }

    const result = toSubscriptionResponse(subscription, paymentMethod)

    expect(result).toEqual({
      id: VALID_SUBSCRIPTION_ID,
      userId: VALID_USER_ID,
      serviceName: 'Netflix',
      amount: 1200,
      billingCycle: 'monthly',
      baseDate: '2024-01-01T00:00:00.000Z',
      paymentMethod: {
        id: VALID_PAYMENT_METHOD_ID,
        name: 'クレジットカード',
      },
      memo: 'スタンダードプラン',
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-02T00:00:00.000Z',
    })
  })

  it('paymentMethodがnullの場合も正しく変換する', () => {
    const subscription = Subscription.reconstruct({
      id: VALID_SUBSCRIPTION_ID,
      userId: VALID_USER_ID,
      serviceName: 'Spotify',
      amount: Amount.fromValue(980),
      billingCycle: BillingCycle.fromValue('monthly'),
      baseDate: BaseDate.fromValue(1704067200),
      paymentMethodId: null,
      memo: '',
      createdAt: new Date('2024-01-01T00:00:00.000Z'),
      updatedAt: new Date('2024-01-01T00:00:00.000Z'),
    })

    const result = toSubscriptionResponse(subscription, null)

    expect(result.paymentMethod).toBeNull()
  })

  it('Unix秒のbaseDateをISO文字列に変換する', () => {
    const subscription = Subscription.reconstruct({
      id: VALID_SUBSCRIPTION_ID,
      userId: VALID_USER_ID,
      serviceName: 'Netflix',
      amount: Amount.fromValue(1200),
      billingCycle: BillingCycle.fromValue('yearly'),
      baseDate: BaseDate.fromValue(1706745600), // 2024-02-01 00:00:00 UTC
      paymentMethodId: null,
      memo: '',
      createdAt: new Date('2024-01-01T00:00:00.000Z'),
      updatedAt: new Date('2024-01-01T00:00:00.000Z'),
    })

    const result = toSubscriptionResponse(subscription, null)

    expect(result.baseDate).toBe('2024-02-01T00:00:00.000Z')
  })
})
