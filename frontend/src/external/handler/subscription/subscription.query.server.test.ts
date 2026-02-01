import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { Subscription } from '../../domain/entities/subscription'
import type { BillingCycleType } from '../../domain/value-objects/billing-cycle'

// Serviceをモック
vi.mock('../../service/subscription/subscription.service', () => ({
  subscriptionService: {
    getSubscriptionById: vi.fn(),
    getSubscriptionsByUserId: vi.fn(),
    getPaymentMethodForSubscription: vi.fn(),
  },
}))

// Domain Serviceをモック
vi.mock('../../domain/services', () => ({
  subscriptionTotalCalculator: {
    calculate: vi.fn(),
  },
}))

import { subscriptionTotalCalculator } from '../../domain/services'
import { subscriptionService } from '../../service/subscription/subscription.service'
import {
  getSubscriptionByIdQuery,
  listSubscriptionsByUserIdQuery,
} from './subscription.query.server'

// テストデータ
const INVALID_UUID = 'invalid-uuid'
const VALID_SUBSCRIPTION_ID = '123e4567-e89b-12d3-a456-426614174000'
const ANOTHER_SUBSCRIPTION_ID = '123e4567-e89b-12d3-a456-426614174001'
const VALID_USER_ID = '123e4567-e89b-12d3-a456-426614174002'
const ANOTHER_USER_ID = '123e4567-e89b-12d3-a456-426614174001'
const VALID_PAYMENT_METHOD_ID = '123e4567-e89b-12d3-a456-426614174003'
const TEST_USER_ID = 'user-123'

describe('getSubscriptionByIdQuery', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('不正なUUIDでエラーになる', async () => {
    await expect(getSubscriptionByIdQuery({ id: INVALID_UUID }, TEST_USER_ID)).rejects.toThrow()
  })

  it('サブスクリプションが見つからない場合はnullを返す', async () => {
    vi.mocked(subscriptionService.getSubscriptionById).mockResolvedValue(null)

    const result = await getSubscriptionByIdQuery({ id: VALID_SUBSCRIPTION_ID }, TEST_USER_ID)

    expect(result).toBeNull()
  })

  it('認可チェック: 他のユーザーのサブスクリプションは取得できない', async () => {
    const mockSubscription: Partial<Subscription> = {
      id: VALID_SUBSCRIPTION_ID,
      userId: ANOTHER_USER_ID,
      belongsTo: vi.fn(() => false),
    }
    vi.mocked(subscriptionService.getSubscriptionById).mockResolvedValue(
      mockSubscription as Subscription,
    )

    await expect(
      getSubscriptionByIdQuery({ id: VALID_SUBSCRIPTION_ID }, TEST_USER_ID),
    ).rejects.toThrow('Forbidden')
  })

  it('サブスクリプションを正しく返す', async () => {
    const mockSubscription: Partial<Subscription> = {
      id: VALID_SUBSCRIPTION_ID,
      userId: VALID_USER_ID,
      belongsTo: vi.fn(() => true),
      paymentMethodId: VALID_PAYMENT_METHOD_ID,
      toPlainObject: vi.fn(() => ({
        id: VALID_SUBSCRIPTION_ID,
        userId: VALID_USER_ID,
        serviceName: 'Netflix',
        amount: 1200,
        billingCycle: 'monthly' as BillingCycleType,
        baseDate: 1704067200, // 2024-01-01 00:00:00 UTC in Unix seconds
        paymentMethodId: VALID_PAYMENT_METHOD_ID,
        memo: '',
        createdAt: new Date('2024-01-01T00:00:00.000Z'),
        updatedAt: new Date('2024-01-01T00:00:00.000Z'),
      })),
    }
    const mockPaymentMethod = {
      id: VALID_PAYMENT_METHOD_ID,
      name: 'クレジットカード',
    }

    vi.mocked(subscriptionService.getSubscriptionById).mockResolvedValue(
      mockSubscription as Subscription,
    )
    vi.mocked(subscriptionService.getPaymentMethodForSubscription).mockResolvedValue(
      mockPaymentMethod,
    )

    const result = await getSubscriptionByIdQuery({ id: VALID_SUBSCRIPTION_ID }, VALID_USER_ID)

    expect(result).toBeDefined()
    expect(result?.id).toBe(VALID_SUBSCRIPTION_ID)
    expect(result?.serviceName).toBe('Netflix')
    expect(result?.paymentMethod?.name).toBe('クレジットカード')
    expect(mockSubscription.belongsTo).toHaveBeenCalledWith(VALID_USER_ID)
  })

  it('paymentMethodがnullの場合も正しく返す', async () => {
    const mockSubscription: Partial<Subscription> = {
      id: VALID_SUBSCRIPTION_ID,
      userId: VALID_USER_ID,
      belongsTo: vi.fn(() => true),
      paymentMethodId: null,
      toPlainObject: vi.fn(() => ({
        id: VALID_SUBSCRIPTION_ID,
        userId: VALID_USER_ID,
        serviceName: 'Spotify',
        amount: 980,
        billingCycle: 'monthly' as BillingCycleType,
        baseDate: 1704067200,
        paymentMethodId: null,
        memo: '',
        createdAt: new Date('2024-01-01T00:00:00.000Z'),
        updatedAt: new Date('2024-01-01T00:00:00.000Z'),
      })),
    }

    vi.mocked(subscriptionService.getSubscriptionById).mockResolvedValue(
      mockSubscription as Subscription,
    )
    vi.mocked(subscriptionService.getPaymentMethodForSubscription).mockResolvedValue(null)

    const result = await getSubscriptionByIdQuery({ id: VALID_SUBSCRIPTION_ID }, VALID_USER_ID)

    expect(result).toBeDefined()
    expect(result?.paymentMethod).toBeNull()
  })
})

describe('listSubscriptionsByUserIdQuery', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('ユーザーのサブスクリプション一覧を取得する', async () => {
    const mockSubscriptions: Array<Partial<Subscription>> = [
      {
        id: VALID_SUBSCRIPTION_ID,
        userId: VALID_USER_ID,
        paymentMethodId: VALID_PAYMENT_METHOD_ID,
        toPlainObject: vi.fn(() => ({
          id: VALID_SUBSCRIPTION_ID,
          userId: VALID_USER_ID,
          serviceName: 'Netflix',
          amount: 1200,
          billingCycle: 'monthly' as BillingCycleType,
          baseDate: 1704067200,
          paymentMethodId: VALID_PAYMENT_METHOD_ID,
          memo: '',
          createdAt: new Date('2024-01-01T00:00:00.000Z'),
          updatedAt: new Date('2024-01-01T00:00:00.000Z'),
        })),
      },
      {
        id: ANOTHER_SUBSCRIPTION_ID,
        userId: VALID_USER_ID,
        paymentMethodId: null,
        toPlainObject: vi.fn(() => ({
          id: ANOTHER_SUBSCRIPTION_ID,
          userId: VALID_USER_ID,
          serviceName: 'Spotify',
          amount: 980,
          billingCycle: 'monthly' as BillingCycleType,
          baseDate: 1704067200,
          paymentMethodId: null,
          memo: '',
          createdAt: new Date('2024-01-02T00:00:00.000Z'),
          updatedAt: new Date('2024-01-02T00:00:00.000Z'),
        })),
      },
    ]

    vi.mocked(subscriptionService.getSubscriptionsByUserId).mockResolvedValue(
      mockSubscriptions as Subscription[],
    )
    vi.mocked(subscriptionService.getPaymentMethodForSubscription)
      .mockResolvedValueOnce({
        id: VALID_PAYMENT_METHOD_ID,
        name: 'クレジットカード',
      })
      .mockResolvedValueOnce(null)

    vi.mocked(subscriptionTotalCalculator.calculate).mockReturnValue({
      monthlyTotal: 2180,
      yearlyTotal: 26160,
    })

    const result = await listSubscriptionsByUserIdQuery(VALID_USER_ID)

    expect(result.subscriptions).toHaveLength(2)
    expect(result.subscriptions[0].serviceName).toBe('Netflix')
    expect(result.subscriptions[1].serviceName).toBe('Spotify')
    expect(result.totals.monthlyTotal).toBe(2180)
    expect(result.totals.yearlyTotal).toBe(26160)
    expect(subscriptionService.getSubscriptionsByUserId).toHaveBeenCalledWith(VALID_USER_ID)
  })

  it('サブスクリプションが存在しない場合は空配列を返す', async () => {
    vi.mocked(subscriptionService.getSubscriptionsByUserId).mockResolvedValue([])
    vi.mocked(subscriptionTotalCalculator.calculate).mockReturnValue({
      monthlyTotal: 0,
      yearlyTotal: 0,
    })

    const result = await listSubscriptionsByUserIdQuery(VALID_USER_ID)

    expect(result.subscriptions).toEqual([])
    expect(result.totals.monthlyTotal).toBe(0)
    expect(result.totals.yearlyTotal).toBe(0)
  })
})
