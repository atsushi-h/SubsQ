import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { ISubscriptionRepository } from '../../domain/repositories/subscription.repository.interface'
import type { ITransactionManager } from '../../domain/repositories/transaction-manager.interface'
import type { DbClient } from '../../repository/transaction-manager'

// =============================================================================
// モックデータ
// =============================================================================
const VALID_SUBSCRIPTION_ID = '123e4567-e89b-12d3-a456-426614174000'
const ANOTHER_SUBSCRIPTION_ID = '123e4567-e89b-12d3-a456-426614174001'
const VALID_USER_ID = '123e4567-e89b-12d3-a456-426614174002'
const OTHER_USER_ID = '123e4567-e89b-12d3-a456-426614174003'
const VALID_PAYMENT_METHOD_ID = '123e4567-e89b-12d3-a456-426614174004'
const NOT_FOUND_ID = '123e4567-e89b-12d3-a456-426614174099'

// =============================================================================
// モック関数
// =============================================================================
function createMockRepository(): ISubscriptionRepository {
  return {
    findById: vi.fn(),
    findByUserId: vi.fn(),
    findByPaymentMethodId: vi.fn(),
    findByIds: vi.fn(),
    save: vi.fn(),
    delete: vi.fn(),
    deleteMany: vi.fn(),
    getPaymentMethodForSubscription: vi.fn(),
  } as unknown as ISubscriptionRepository
}

function createMockTxManager(): ITransactionManager<DbClient> {
  return {
    execute: vi.fn(),
  } as unknown as ITransactionManager<DbClient>
}

// Subscription.createとSubscription.isServiceNameValidをモック
vi.mock('../../domain/entities/subscription', () => ({
  Subscription: {
    create: vi.fn((data) => ({
      id: 'sub-new',
      userId: data.userId,
      serviceName: data.serviceName,
    })),
    isServiceNameValid: vi.fn((name: string) => name.length > 0 && name.length <= 100),
  },
}))

// Value Objectsをモック
vi.mock('../../domain/value-objects', () => ({
  Amount: {
    fromValue: vi.fn((value: number) => ({ value })),
  },
  BillingCycle: {
    fromValue: vi.fn((value: string) => ({ value })),
  },
  BaseDate: {
    fromValue: vi.fn((value: number) => ({ value })),
  },
}))

import { Subscription } from '../../domain/entities/subscription'
import { Amount, BaseDate, BillingCycle } from '../../domain/value-objects'
import { SubscriptionService } from './subscription.service'

// =============================================================================
// SubscriptionService Tests
// =============================================================================
describe('SubscriptionService', () => {
  let mockRepository: ISubscriptionRepository
  let mockTxManager: ITransactionManager<DbClient>
  let service: SubscriptionService

  beforeEach(() => {
    vi.clearAllMocks()
    mockRepository = createMockRepository()
    mockTxManager = createMockTxManager()
    service = new SubscriptionService(mockRepository, mockTxManager)
  })

  // ---------------------------------------------------------------------------
  // getSubscriptionById
  // ---------------------------------------------------------------------------
  describe('getSubscriptionById', () => {
    it('[Success] サブスクリプションを取得する', async () => {
      const mockSubscription: Partial<Subscription> = {
        id: VALID_SUBSCRIPTION_ID,
        userId: VALID_USER_ID,
        serviceName: 'Netflix',
      }
      vi.mocked(mockRepository.findById).mockResolvedValue(mockSubscription as Subscription)

      const result = await service.getSubscriptionById(VALID_SUBSCRIPTION_ID)

      expect(mockRepository.findById).toHaveBeenCalledWith(VALID_SUBSCRIPTION_ID)
      expect(result).toEqual(mockSubscription)
    })

    it('[Success] サブスクリプションが見つからない場合はnullを返す', async () => {
      vi.mocked(mockRepository.findById).mockResolvedValue(null)

      const result = await service.getSubscriptionById(NOT_FOUND_ID)

      expect(result).toBeNull()
    })
  })

  // ---------------------------------------------------------------------------
  // getSubscriptionsByUserId
  // ---------------------------------------------------------------------------
  describe('getSubscriptionsByUserId', () => {
    it('[Success] ユーザーのサブスクリプション一覧を取得する', async () => {
      const mockSubscriptions: Array<Partial<Subscription>> = [
        { id: VALID_SUBSCRIPTION_ID, userId: VALID_USER_ID, serviceName: 'Netflix' },
        { id: ANOTHER_SUBSCRIPTION_ID, userId: VALID_USER_ID, serviceName: 'Spotify' },
      ]
      vi.mocked(mockRepository.findByUserId).mockResolvedValue(mockSubscriptions as Subscription[])

      const result = await service.getSubscriptionsByUserId(VALID_USER_ID)

      expect(mockRepository.findByUserId).toHaveBeenCalledWith(VALID_USER_ID)
      expect(result).toHaveLength(2)
    })

    it('[Success] サブスクリプションが存在しない場合は空配列を返す', async () => {
      vi.mocked(mockRepository.findByUserId).mockResolvedValue([])

      const result = await service.getSubscriptionsByUserId(VALID_USER_ID)

      expect(result).toEqual([])
    })
  })

  // ---------------------------------------------------------------------------
  // getSubscriptionsByPaymentMethodId
  // ---------------------------------------------------------------------------
  describe('getSubscriptionsByPaymentMethodId', () => {
    it('[Success] 支払い方法に紐づくサブスクリプション一覧を取得する', async () => {
      const mockSubscriptions: Array<Partial<Subscription>> = [
        { id: VALID_SUBSCRIPTION_ID, paymentMethodId: VALID_PAYMENT_METHOD_ID },
      ]
      vi.mocked(mockRepository.findByPaymentMethodId).mockResolvedValue(
        mockSubscriptions as Subscription[],
      )

      const result = await service.getSubscriptionsByPaymentMethodId(VALID_PAYMENT_METHOD_ID)

      expect(mockRepository.findByPaymentMethodId).toHaveBeenCalledWith(VALID_PAYMENT_METHOD_ID)
      expect(result).toHaveLength(1)
    })
  })

  // ---------------------------------------------------------------------------
  // create
  // ---------------------------------------------------------------------------
  describe('create', () => {
    it('[Success] サブスクリプションを作成する', async () => {
      const input = {
        userId: VALID_USER_ID,
        serviceName: 'Netflix',
        amount: 1200,
        billingCycle: 'monthly' as const,
        baseDate: 1704067200,
        paymentMethodId: VALID_PAYMENT_METHOD_ID,
        memo: 'スタンダードプラン',
      }

      vi.mocked(mockRepository.save).mockResolvedValue({
        id: 'sub-new',
        userId: VALID_USER_ID,
        serviceName: 'Netflix',
      } as Subscription)

      const result = await service.create(input)

      expect(Subscription.create).toHaveBeenCalled()
      expect(Amount.fromValue).toHaveBeenCalledWith(1200)
      expect(BillingCycle.fromValue).toHaveBeenCalledWith('monthly')
      expect(BaseDate.fromValue).toHaveBeenCalledWith(1704067200)
      expect(mockRepository.save).toHaveBeenCalled()
      expect(result.serviceName).toBe('Netflix')
    })

    it('[Fail] サービス名が不正な場合はエラーになる', async () => {
      const input = {
        userId: VALID_USER_ID,
        serviceName: '',
        amount: 1200,
        billingCycle: 'monthly' as const,
        baseDate: 1704067200,
      }

      await expect(service.create(input)).rejects.toThrow('Invalid service name')
    })
  })

  // ---------------------------------------------------------------------------
  // update
  // ---------------------------------------------------------------------------
  describe('update', () => {
    it('[Success] サブスクリプションを更新する', async () => {
      const updatedSubscription = {
        id: VALID_SUBSCRIPTION_ID,
        userId: VALID_USER_ID,
        serviceName: 'Netflix Premium',
        createdAt: new Date('2024-01-01T00:00:00.000Z'),
        updatedAt: new Date('2024-01-02T00:00:00.000Z'),
      } as Subscription

      const mockSubscription: Partial<Subscription> = {
        id: VALID_SUBSCRIPTION_ID,
        userId: VALID_USER_ID,
        serviceName: 'Netflix',
        belongsTo: vi.fn(() => true),
        withUpdate: vi.fn(() => updatedSubscription),
      }

      vi.mocked(mockRepository.findById).mockResolvedValue(mockSubscription as Subscription)
      vi.mocked(mockRepository.save).mockResolvedValue(updatedSubscription)

      const result = await service.update(VALID_SUBSCRIPTION_ID, VALID_USER_ID, {
        serviceName: 'Netflix Premium',
      })

      expect(mockSubscription.belongsTo).toHaveBeenCalledWith(VALID_USER_ID)
      expect(mockSubscription.withUpdate).toHaveBeenCalled()
      expect(result.serviceName).toBe('Netflix Premium')
    })

    it('[Fail] サブスクリプションが見つからない場合はエラーになる', async () => {
      vi.mocked(mockRepository.findById).mockResolvedValue(null)

      await expect(
        service.update(NOT_FOUND_ID, VALID_USER_ID, { serviceName: 'Updated' }),
      ).rejects.toThrow('Subscription not found')
    })

    it('[Fail] 認可チェック: 他のユーザーのサブスクリプションは更新できない', async () => {
      const mockSubscription: Partial<Subscription> = {
        id: VALID_SUBSCRIPTION_ID,
        userId: OTHER_USER_ID,
        belongsTo: vi.fn(() => false),
      }
      vi.mocked(mockRepository.findById).mockResolvedValue(mockSubscription as Subscription)

      await expect(
        service.update(VALID_SUBSCRIPTION_ID, VALID_USER_ID, { serviceName: 'Updated' }),
      ).rejects.toThrow('Unauthorized')
    })

    it('[Fail] サービス名が不正な場合はエラーになる', async () => {
      const mockSubscription: Partial<Subscription> = {
        id: VALID_SUBSCRIPTION_ID,
        userId: VALID_USER_ID,
        belongsTo: vi.fn(() => true),
      }
      vi.mocked(mockRepository.findById).mockResolvedValue(mockSubscription as Subscription)

      await expect(
        service.update(VALID_SUBSCRIPTION_ID, VALID_USER_ID, { serviceName: '' }),
      ).rejects.toThrow('Invalid service name')
    })
  })

  // ---------------------------------------------------------------------------
  // updatePaymentMethod
  // ---------------------------------------------------------------------------
  describe('updatePaymentMethod', () => {
    it('[Success] 支払い方法を更新する', async () => {
      const updatedSubscription = {
        id: VALID_SUBSCRIPTION_ID,
        paymentMethodId: VALID_PAYMENT_METHOD_ID,
      } as Subscription

      const mockSubscription: Partial<Subscription> = {
        id: VALID_SUBSCRIPTION_ID,
        userId: VALID_USER_ID,
        belongsTo: vi.fn(() => true),
        withPaymentMethod: vi.fn(() => updatedSubscription),
      }

      vi.mocked(mockRepository.findById).mockResolvedValue(mockSubscription as Subscription)
      vi.mocked(mockRepository.save).mockResolvedValue(updatedSubscription)

      const result = await service.updatePaymentMethod(
        VALID_SUBSCRIPTION_ID,
        VALID_USER_ID,
        VALID_PAYMENT_METHOD_ID,
      )

      expect(mockSubscription.belongsTo).toHaveBeenCalledWith(VALID_USER_ID)
      expect(mockSubscription.withPaymentMethod).toHaveBeenCalledWith(VALID_PAYMENT_METHOD_ID)
      expect(result.paymentMethodId).toBe(VALID_PAYMENT_METHOD_ID)
    })

    it('[Fail] サブスクリプションが見つからない場合はエラーになる', async () => {
      vi.mocked(mockRepository.findById).mockResolvedValue(null)

      await expect(
        service.updatePaymentMethod(NOT_FOUND_ID, VALID_USER_ID, VALID_PAYMENT_METHOD_ID),
      ).rejects.toThrow('Subscription not found')
    })

    it('[Fail] 認可チェック: 他のユーザーのサブスクリプションは更新できない', async () => {
      const mockSubscription: Partial<Subscription> = {
        id: VALID_SUBSCRIPTION_ID,
        userId: OTHER_USER_ID,
        belongsTo: vi.fn(() => false),
      }
      vi.mocked(mockRepository.findById).mockResolvedValue(mockSubscription as Subscription)

      await expect(
        service.updatePaymentMethod(VALID_SUBSCRIPTION_ID, VALID_USER_ID, VALID_PAYMENT_METHOD_ID),
      ).rejects.toThrow('Unauthorized')
    })
  })

  // ---------------------------------------------------------------------------
  // delete
  // ---------------------------------------------------------------------------
  describe('delete', () => {
    it('[Success] サブスクリプションを削除する', async () => {
      const mockSubscription: Partial<Subscription> = {
        id: VALID_SUBSCRIPTION_ID,
        userId: VALID_USER_ID,
        belongsTo: vi.fn(() => true),
      }

      vi.mocked(mockTxManager.execute).mockImplementation(async (callback) => {
        return callback({} as DbClient)
      })

      vi.mocked(mockRepository.findById).mockResolvedValue(mockSubscription as Subscription)
      vi.mocked(mockRepository.delete).mockResolvedValue(undefined)

      await service.delete(VALID_SUBSCRIPTION_ID, VALID_USER_ID)

      expect(mockRepository.delete).toHaveBeenCalledWith(VALID_SUBSCRIPTION_ID, {})
    })

    it('[Fail] サブスクリプションが見つからない場合はエラーになる', async () => {
      vi.mocked(mockTxManager.execute).mockImplementation(async (callback) => {
        return callback({} as DbClient)
      })

      vi.mocked(mockRepository.findById).mockResolvedValue(null)

      await expect(service.delete(NOT_FOUND_ID, VALID_USER_ID)).rejects.toThrow(
        'Subscription not found',
      )
    })

    it('[Fail] 認可チェック: 他のユーザーのサブスクリプションは削除できない', async () => {
      const mockSubscription: Partial<Subscription> = {
        id: VALID_SUBSCRIPTION_ID,
        userId: OTHER_USER_ID,
        belongsTo: vi.fn(() => false),
      }

      vi.mocked(mockTxManager.execute).mockImplementation(async (callback) => {
        return callback({} as DbClient)
      })

      vi.mocked(mockRepository.findById).mockResolvedValue(mockSubscription as Subscription)

      await expect(service.delete(VALID_SUBSCRIPTION_ID, VALID_USER_ID)).rejects.toThrow(
        'Unauthorized',
      )
    })
  })

  // ---------------------------------------------------------------------------
  // deleteMany
  // ---------------------------------------------------------------------------
  describe('deleteMany', () => {
    it('[Success] 空配列の場合は早期リターンする', async () => {
      await service.deleteMany([], VALID_USER_ID)

      expect(mockTxManager.execute).not.toHaveBeenCalled()
    })

    it('[Success] 複数のサブスクリプションを一括削除する', async () => {
      const ids = [VALID_SUBSCRIPTION_ID, ANOTHER_SUBSCRIPTION_ID]
      const mockSubscriptions: Array<Partial<Subscription>> = [
        {
          id: VALID_SUBSCRIPTION_ID,
          userId: VALID_USER_ID,
          belongsTo: vi.fn(() => true),
        },
        {
          id: ANOTHER_SUBSCRIPTION_ID,
          userId: VALID_USER_ID,
          belongsTo: vi.fn(() => true),
        },
      ]

      vi.mocked(mockTxManager.execute).mockImplementation(async (callback) => {
        return callback({} as DbClient)
      })

      vi.mocked(mockRepository.findByIds).mockResolvedValue(mockSubscriptions as Subscription[])
      vi.mocked(mockRepository.deleteMany).mockResolvedValue(undefined)

      await service.deleteMany(ids, VALID_USER_ID)

      expect(mockRepository.findByIds).toHaveBeenCalledWith(ids, {})
      expect(mockRepository.deleteMany).toHaveBeenCalledWith(ids, {})
    })

    it('[Fail] 存在しないサブスクリプションがある場合はエラーになる', async () => {
      const ids = [VALID_SUBSCRIPTION_ID, NOT_FOUND_ID]
      const mockSubscriptions: Array<Partial<Subscription>> = [
        {
          id: VALID_SUBSCRIPTION_ID,
          userId: VALID_USER_ID,
          belongsTo: vi.fn(() => true),
        },
      ]

      vi.mocked(mockTxManager.execute).mockImplementation(async (callback) => {
        return callback({} as DbClient)
      })

      vi.mocked(mockRepository.findByIds).mockResolvedValue(mockSubscriptions as Subscription[])

      await expect(service.deleteMany(ids, VALID_USER_ID)).rejects.toThrow('Subscription not found')
    })

    it('[Fail] 認可チェック: 他のユーザーのサブスクリプションが含まれる場合はエラーになる', async () => {
      const ids = [VALID_SUBSCRIPTION_ID, ANOTHER_SUBSCRIPTION_ID]
      const mockSubscriptions: Array<Partial<Subscription>> = [
        {
          id: VALID_SUBSCRIPTION_ID,
          userId: VALID_USER_ID,
          belongsTo: vi.fn(() => true),
        },
        {
          id: ANOTHER_SUBSCRIPTION_ID,
          userId: OTHER_USER_ID,
          belongsTo: vi.fn(() => false),
        },
      ]

      vi.mocked(mockTxManager.execute).mockImplementation(async (callback) => {
        return callback({} as DbClient)
      })

      vi.mocked(mockRepository.findByIds).mockResolvedValue(mockSubscriptions as Subscription[])

      await expect(service.deleteMany(ids, VALID_USER_ID)).rejects.toThrow('Unauthorized')
    })
  })

  // ---------------------------------------------------------------------------
  // getPaymentMethodForSubscription
  // ---------------------------------------------------------------------------
  describe('getPaymentMethodForSubscription', () => {
    it('[Success] 支払い方法を取得する', async () => {
      const mockPaymentMethod = {
        id: VALID_PAYMENT_METHOD_ID,
        name: 'クレジットカード',
      }
      vi.mocked(mockRepository.getPaymentMethodForSubscription).mockResolvedValue(mockPaymentMethod)

      const result = await service.getPaymentMethodForSubscription(VALID_PAYMENT_METHOD_ID)

      expect(mockRepository.getPaymentMethodForSubscription).toHaveBeenCalledWith(
        VALID_PAYMENT_METHOD_ID,
      )
      expect(result).toEqual(mockPaymentMethod)
    })

    it('[Success] 支払い方法がnullの場合はnullを返す', async () => {
      vi.mocked(mockRepository.getPaymentMethodForSubscription).mockResolvedValue(null)

      const result = await service.getPaymentMethodForSubscription(null)

      expect(result).toBeNull()
    })
  })
})
