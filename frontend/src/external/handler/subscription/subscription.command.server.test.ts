import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { Subscription } from '../../domain/entities/subscription'
import type { BillingCycleType } from '../../domain/value-objects/billing-cycle'

// Serviceをモック
vi.mock('../../service/subscription/subscription.service', () => ({
  subscriptionService: {
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    deleteMany: vi.fn(),
    getPaymentMethodForSubscription: vi.fn(),
  },
}))

import { subscriptionService } from '../../service/subscription/subscription.service'
import {
  createSubscriptionCommand,
  deleteSubscriptionCommand,
  deleteSubscriptionsCommand,
  updateSubscriptionCommand,
} from './subscription.command.server'

// テストデータ
const INVALID_UUID = 'invalid-uuid'
const VALID_SUBSCRIPTION_ID = '123e4567-e89b-12d3-a456-426614174000'
const ANOTHER_SUBSCRIPTION_ID = '123e4567-e89b-12d3-a456-426614174001'
const VALID_USER_ID = '123e4567-e89b-12d3-a456-426614174002'
const TEST_USER_ID = 'user-123'
const OTHER_USER_ID = 'user-456'
const VALID_PAYMENT_METHOD_ID = '123e4567-e89b-12d3-a456-426614174003'

describe('createSubscriptionCommand', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('不正なUUIDでエラーになる', async () => {
    await expect(
      createSubscriptionCommand(
        {
          userId: INVALID_UUID,
          serviceName: 'Netflix',
          amount: 1200,
          billingCycle: 'monthly',
          baseDate: '2024-01-01T00:00:00.000Z',
        },
        TEST_USER_ID,
      ),
    ).rejects.toThrow()
  })

  it('認可チェック: 他のユーザー用のサブスクリプションは作成できない', async () => {
    await expect(
      createSubscriptionCommand(
        {
          userId: VALID_SUBSCRIPTION_ID,
          serviceName: 'Netflix',
          amount: 1200,
          billingCycle: 'monthly',
          baseDate: '2024-01-01T00:00:00.000Z',
        },
        OTHER_USER_ID,
      ),
    ).rejects.toThrow('Forbidden')
  })

  it('サブスクリプションを作成する', async () => {
    const mockSubscription: Partial<Subscription> = {
      id: ANOTHER_SUBSCRIPTION_ID,
      userId: VALID_SUBSCRIPTION_ID,
      paymentMethodId: VALID_PAYMENT_METHOD_ID,
      toPlainObject: vi.fn(() => ({
        id: ANOTHER_SUBSCRIPTION_ID,
        userId: VALID_SUBSCRIPTION_ID,
        serviceName: 'Netflix',
        amount: 1200,
        billingCycle: 'monthly' as BillingCycleType,
        baseDate: 1704067200,
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

    vi.mocked(subscriptionService.create).mockResolvedValue(mockSubscription as Subscription)
    vi.mocked(subscriptionService.getPaymentMethodForSubscription).mockResolvedValue(
      mockPaymentMethod,
    )

    const result = await createSubscriptionCommand(
      {
        userId: VALID_SUBSCRIPTION_ID,
        serviceName: 'Netflix',
        amount: 1200,
        billingCycle: 'monthly',
        baseDate: '2024-01-01T00:00:00.000Z',
      },
      VALID_SUBSCRIPTION_ID,
    )

    expect(result.id).toBe(ANOTHER_SUBSCRIPTION_ID)
    expect(result.serviceName).toBe('Netflix')
    expect(subscriptionService.create).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: VALID_SUBSCRIPTION_ID,
        serviceName: 'Netflix',
        amount: 1200,
        billingCycle: 'monthly',
        baseDate: 1704067200, // Unix秒に変換されていることを確認
      }),
    )
  })
})

describe('updateSubscriptionCommand', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('不正なUUIDでエラーになる', async () => {
    await expect(
      updateSubscriptionCommand({ id: INVALID_UUID, serviceName: 'Spotify' }, TEST_USER_ID),
    ).rejects.toThrow()
  })

  it('認可チェック: Service層のエラーが正しく伝播する', async () => {
    vi.mocked(subscriptionService.update).mockRejectedValue(
      new Error('Unauthorized: User user-456 cannot access subscription sub-123'),
    )

    await expect(
      updateSubscriptionCommand(
        { id: VALID_SUBSCRIPTION_ID, serviceName: 'Updated' },
        OTHER_USER_ID,
      ),
    ).rejects.toThrow('Unauthorized')

    expect(subscriptionService.update).toHaveBeenCalledWith(
      VALID_SUBSCRIPTION_ID,
      OTHER_USER_ID,
      expect.any(Object),
    )
  })

  it('サブスクリプションを更新する', async () => {
    const mockSubscription: Partial<Subscription> = {
      id: VALID_SUBSCRIPTION_ID,
      userId: VALID_USER_ID,
      paymentMethodId: null,
      toPlainObject: vi.fn(() => ({
        id: VALID_SUBSCRIPTION_ID,
        userId: VALID_USER_ID,
        serviceName: 'Spotify',
        amount: 980,
        billingCycle: 'monthly' as BillingCycleType,
        baseDate: 1706745600,
        paymentMethodId: null,
        memo: '',
        createdAt: new Date('2024-01-01T00:00:00.000Z'),
        updatedAt: new Date('2024-02-01T00:00:00.000Z'),
      })),
    }

    vi.mocked(subscriptionService.update).mockResolvedValue(mockSubscription as Subscription)
    vi.mocked(subscriptionService.getPaymentMethodForSubscription).mockResolvedValue(null)

    const result = await updateSubscriptionCommand(
      { id: VALID_SUBSCRIPTION_ID, serviceName: 'Spotify' },
      VALID_USER_ID,
    )

    expect(result.id).toBe(VALID_SUBSCRIPTION_ID)
    expect(result.serviceName).toBe('Spotify')
    expect(subscriptionService.update).toHaveBeenCalledWith(
      VALID_SUBSCRIPTION_ID,
      VALID_USER_ID,
      expect.objectContaining({
        id: VALID_SUBSCRIPTION_ID,
        serviceName: 'Spotify',
      }),
    )
  })

  it('baseDateが指定された場合はUnix秒に変換する', async () => {
    const mockSubscription: Partial<Subscription> = {
      id: VALID_SUBSCRIPTION_ID,
      userId: VALID_USER_ID,
      paymentMethodId: null,
      toPlainObject: vi.fn(() => ({
        id: VALID_SUBSCRIPTION_ID,
        userId: VALID_USER_ID,
        serviceName: 'Netflix',
        amount: 1200,
        billingCycle: 'monthly' as BillingCycleType,
        baseDate: 1706745600,
        paymentMethodId: null,
        memo: '',
        createdAt: new Date('2024-01-01T00:00:00.000Z'),
        updatedAt: new Date('2024-02-01T00:00:00.000Z'),
      })),
    }

    vi.mocked(subscriptionService.update).mockResolvedValue(mockSubscription as Subscription)
    vi.mocked(subscriptionService.getPaymentMethodForSubscription).mockResolvedValue(null)

    await updateSubscriptionCommand(
      {
        id: VALID_SUBSCRIPTION_ID,
        baseDate: '2024-02-01T00:00:00.000Z',
      },
      VALID_USER_ID,
    )

    expect(subscriptionService.update).toHaveBeenCalledWith(
      VALID_SUBSCRIPTION_ID,
      VALID_USER_ID,
      expect.objectContaining({
        baseDate: 1706745600, // Unix秒に変換されていることを確認
      }),
    )
  })
})

describe('deleteSubscriptionCommand', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('サブスクリプションを削除する', async () => {
    vi.mocked(subscriptionService.delete).mockResolvedValue()

    await deleteSubscriptionCommand(VALID_SUBSCRIPTION_ID, TEST_USER_ID)

    expect(subscriptionService.delete).toHaveBeenCalledWith(VALID_SUBSCRIPTION_ID, TEST_USER_ID)
  })

  it('認可チェック: Service層のエラーが正しく伝播する', async () => {
    vi.mocked(subscriptionService.delete).mockRejectedValue(
      new Error('Unauthorized: User user-456 cannot access subscription sub-123'),
    )

    await expect(deleteSubscriptionCommand(VALID_SUBSCRIPTION_ID, OTHER_USER_ID)).rejects.toThrow(
      'Unauthorized',
    )

    expect(subscriptionService.delete).toHaveBeenCalledWith(VALID_SUBSCRIPTION_ID, OTHER_USER_ID)
  })
})

describe('deleteSubscriptionsCommand', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('複数のサブスクリプションを削除する', async () => {
    vi.mocked(subscriptionService.deleteMany).mockResolvedValue()

    const ids = [VALID_SUBSCRIPTION_ID, ANOTHER_SUBSCRIPTION_ID]
    await deleteSubscriptionsCommand(ids, TEST_USER_ID)

    expect(subscriptionService.deleteMany).toHaveBeenCalledWith(ids, TEST_USER_ID)
  })

  it('認可チェック: Service層のエラーが正しく伝播する', async () => {
    vi.mocked(subscriptionService.deleteMany).mockRejectedValue(
      new Error('Unauthorized: User user-456 cannot access subscription sub-123'),
    )

    const ids = [VALID_SUBSCRIPTION_ID, ANOTHER_SUBSCRIPTION_ID]
    await expect(deleteSubscriptionsCommand(ids, OTHER_USER_ID)).rejects.toThrow('Unauthorized')

    expect(subscriptionService.deleteMany).toHaveBeenCalledWith(ids, OTHER_USER_ID)
  })
})
