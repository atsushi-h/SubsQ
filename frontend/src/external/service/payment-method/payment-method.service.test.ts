import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { Subscription } from '../../domain/entities/subscription'
import type { IPaymentMethodRepository } from '../../domain/repositories/payment-method.repository.interface'
import type { ITransactionManager } from '../../domain/repositories/transaction-manager.interface'
import type { DbClient } from '../../repository/transaction-manager'

// =============================================================================
// モックデータ
// =============================================================================
const VALID_PAYMENT_METHOD_ID = '123e4567-e89b-12d3-a456-426614174000'
const ANOTHER_PAYMENT_METHOD_ID = '123e4567-e89b-12d3-a456-426614174001'
const VALID_USER_ID = '123e4567-e89b-12d3-a456-426614174002'
const OTHER_USER_ID = '123e4567-e89b-12d3-a456-426614174003'
const NOT_FOUND_ID = '123e4567-e89b-12d3-a456-426614174099'

// =============================================================================
// モック関数
// =============================================================================
function createMockRepository(): IPaymentMethodRepository {
  return {
    findById: vi.fn(),
    findByUserId: vi.fn(),
    findByUserIdAndName: vi.fn(),
    findByIds: vi.fn(),
    save: vi.fn(),
    delete: vi.fn(),
    deleteMany: vi.fn(),
    getSubscriptionsForPaymentMethod: vi.fn(),
    getSubscriptionsForPaymentMethods: vi.fn(),
  } as unknown as IPaymentMethodRepository
}

function createMockTxManager(): ITransactionManager<DbClient> {
  return {
    execute: vi.fn(),
  } as unknown as ITransactionManager<DbClient>
}

// Domain Serviceをモック
vi.mock('../../domain/services', () => ({
  paymentMethodUsageChecker: {
    validateDeletion: vi.fn(),
  },
}))

// PaymentMethod.createとPaymentMethod.isNameValidをモック
vi.mock('../../domain/entities/payment-method', () => ({
  PaymentMethod: {
    create: vi.fn((data) => ({
      id: 'pm-new',
      userId: data.userId,
      name: data.name,
    })),
    isNameValid: vi.fn((name: string) => name.length > 0 && name.length <= 100),
  },
}))

import { PaymentMethod } from '../../domain/entities/payment-method'
import { paymentMethodUsageChecker } from '../../domain/services'
import { PaymentMethodService } from './payment-method.service'

// =============================================================================
// PaymentMethodService Tests
// =============================================================================
describe('PaymentMethodService', () => {
  let mockRepository: IPaymentMethodRepository
  let mockTxManager: ITransactionManager<DbClient>
  let service: PaymentMethodService

  beforeEach(() => {
    vi.clearAllMocks()
    mockRepository = createMockRepository()
    mockTxManager = createMockTxManager()
    service = new PaymentMethodService(mockRepository, mockTxManager)
  })

  // ---------------------------------------------------------------------------
  // getPaymentMethodById
  // ---------------------------------------------------------------------------
  describe('getPaymentMethodById', () => {
    it('[Success] 支払い方法を取得する', async () => {
      const mockPaymentMethod: Partial<PaymentMethod> = {
        id: VALID_PAYMENT_METHOD_ID,
        userId: VALID_USER_ID,
        name: 'クレジットカード',
      }
      vi.mocked(mockRepository.findById).mockResolvedValue(mockPaymentMethod as PaymentMethod)

      const result = await service.getPaymentMethodById(VALID_PAYMENT_METHOD_ID)

      expect(mockRepository.findById).toHaveBeenCalledWith(VALID_PAYMENT_METHOD_ID)
      expect(result).toEqual(mockPaymentMethod)
    })

    it('[Success] 支払い方法が見つからない場合はnullを返す', async () => {
      vi.mocked(mockRepository.findById).mockResolvedValue(null)

      const result = await service.getPaymentMethodById(NOT_FOUND_ID)

      expect(result).toBeNull()
    })
  })

  // ---------------------------------------------------------------------------
  // getPaymentMethodsByUserId
  // ---------------------------------------------------------------------------
  describe('getPaymentMethodsByUserId', () => {
    it('[Success] ユーザーの支払い方法一覧を取得する', async () => {
      const mockPaymentMethods: Array<Partial<PaymentMethod>> = [
        { id: VALID_PAYMENT_METHOD_ID, userId: VALID_USER_ID, name: 'クレジットカード' },
        { id: ANOTHER_PAYMENT_METHOD_ID, userId: VALID_USER_ID, name: '銀行引き落とし' },
      ]
      vi.mocked(mockRepository.findByUserId).mockResolvedValue(
        mockPaymentMethods as PaymentMethod[],
      )

      const result = await service.getPaymentMethodsByUserId(VALID_USER_ID)

      expect(mockRepository.findByUserId).toHaveBeenCalledWith(VALID_USER_ID)
      expect(result).toHaveLength(2)
    })

    it('[Success] 支払い方法が存在しない場合は空配列を返す', async () => {
      vi.mocked(mockRepository.findByUserId).mockResolvedValue([])

      const result = await service.getPaymentMethodsByUserId(VALID_USER_ID)

      expect(result).toEqual([])
    })
  })

  // ---------------------------------------------------------------------------
  // getPaymentMethodByUserIdAndName
  // ---------------------------------------------------------------------------
  describe('getPaymentMethodByUserIdAndName', () => {
    it('[Success] ユーザーIDと名前で支払い方法を取得する', async () => {
      const mockPaymentMethod: Partial<PaymentMethod> = {
        id: VALID_PAYMENT_METHOD_ID,
        userId: VALID_USER_ID,
        name: 'クレジットカード',
      }
      vi.mocked(mockRepository.findByUserIdAndName).mockResolvedValue(
        mockPaymentMethod as PaymentMethod,
      )

      const result = await service.getPaymentMethodByUserIdAndName(
        VALID_USER_ID,
        'クレジットカード',
      )

      expect(mockRepository.findByUserIdAndName).toHaveBeenCalledWith(
        VALID_USER_ID,
        'クレジットカード',
      )
      expect(result).toEqual(mockPaymentMethod)
    })
  })

  // ---------------------------------------------------------------------------
  // create
  // ---------------------------------------------------------------------------
  describe('create', () => {
    it('[Success] 支払い方法を作成する', async () => {
      const input = {
        userId: VALID_USER_ID,
        name: 'クレジットカード',
      }

      vi.mocked(mockRepository.findByUserIdAndName).mockResolvedValue(null)
      vi.mocked(mockRepository.save).mockResolvedValue({
        id: 'pm-new',
        userId: VALID_USER_ID,
        name: 'クレジットカード',
      } as PaymentMethod)

      const result = await service.create(input)

      expect(PaymentMethod.create).toHaveBeenCalledWith(input)
      expect(mockRepository.save).toHaveBeenCalled()
      expect(result.name).toBe('クレジットカード')
    })

    it('[Fail] 名前が不正な場合はエラーになる', async () => {
      const input = {
        userId: VALID_USER_ID,
        name: '',
      }

      await expect(service.create(input)).rejects.toThrow('Invalid payment method name')
    })

    it('[Fail] 同名の支払い方法が既に存在する場合はエラーになる', async () => {
      const input = {
        userId: VALID_USER_ID,
        name: 'クレジットカード',
      }

      const existingPaymentMethod: Partial<PaymentMethod> = {
        id: VALID_PAYMENT_METHOD_ID,
        userId: VALID_USER_ID,
        name: 'クレジットカード',
      }
      vi.mocked(mockRepository.findByUserIdAndName).mockResolvedValue(
        existingPaymentMethod as PaymentMethod,
      )

      await expect(service.create(input)).rejects.toThrow(
        'Payment method with this name already exists',
      )
    })
  })

  // ---------------------------------------------------------------------------
  // update
  // ---------------------------------------------------------------------------
  describe('update', () => {
    it('[Success] 支払い方法を更新する', async () => {
      const updatedPaymentMethod = {
        id: VALID_PAYMENT_METHOD_ID,
        userId: VALID_USER_ID,
        name: '銀行引き落とし',
        createdAt: new Date('2024-01-01T00:00:00.000Z'),
        updatedAt: new Date('2024-01-02T00:00:00.000Z'),
      } as PaymentMethod

      const mockPaymentMethod: Partial<PaymentMethod> = {
        id: VALID_PAYMENT_METHOD_ID,
        userId: VALID_USER_ID,
        name: 'クレジットカード',
        belongsTo: vi.fn(() => true),
        withUpdate: vi.fn(() => updatedPaymentMethod),
      }

      vi.mocked(mockRepository.findById).mockResolvedValue(mockPaymentMethod as PaymentMethod)
      vi.mocked(mockRepository.findByUserIdAndName).mockResolvedValue(null)
      vi.mocked(mockRepository.save).mockResolvedValue(updatedPaymentMethod)

      const result = await service.update(VALID_PAYMENT_METHOD_ID, VALID_USER_ID, {
        name: '銀行引き落とし',
      })

      expect(mockPaymentMethod.belongsTo).toHaveBeenCalledWith(VALID_USER_ID)
      expect(mockPaymentMethod.withUpdate).toHaveBeenCalledWith({ name: '銀行引き落とし' })
      expect(result.name).toBe('銀行引き落とし')
    })

    it('[Fail] 支払い方法が見つからない場合はエラーになる', async () => {
      vi.mocked(mockRepository.findById).mockResolvedValue(null)

      await expect(
        service.update(NOT_FOUND_ID, VALID_USER_ID, { name: '銀行引き落とし' }),
      ).rejects.toThrow('Payment method not found')
    })

    it('[Fail] 認可チェック: 他のユーザーの支払い方法は更新できない', async () => {
      const mockPaymentMethod: Partial<PaymentMethod> = {
        id: VALID_PAYMENT_METHOD_ID,
        userId: OTHER_USER_ID,
        name: 'クレジットカード',
        belongsTo: vi.fn(() => false),
      }

      vi.mocked(mockRepository.findById).mockResolvedValue(mockPaymentMethod as PaymentMethod)

      await expect(
        service.update(VALID_PAYMENT_METHOD_ID, VALID_USER_ID, { name: '銀行引き落とし' }),
      ).rejects.toThrow('Unauthorized')

      expect(mockPaymentMethod.belongsTo).toHaveBeenCalledWith(VALID_USER_ID)
    })

    it('[Fail] 名前が不正な場合はエラーになる', async () => {
      const mockPaymentMethod: Partial<PaymentMethod> = {
        id: VALID_PAYMENT_METHOD_ID,
        userId: VALID_USER_ID,
        name: 'クレジットカード',
        belongsTo: vi.fn(() => true),
      }

      vi.mocked(mockRepository.findById).mockResolvedValue(mockPaymentMethod as PaymentMethod)

      await expect(
        service.update(VALID_PAYMENT_METHOD_ID, VALID_USER_ID, { name: '' }),
      ).rejects.toThrow('Invalid payment method name')
    })

    it('[Fail] 同名の支払い方法が既に存在する場合はエラーになる', async () => {
      const mockPaymentMethod: Partial<PaymentMethod> = {
        id: VALID_PAYMENT_METHOD_ID,
        userId: VALID_USER_ID,
        name: 'クレジットカード',
        belongsTo: vi.fn(() => true),
      }

      const existingPaymentMethod: Partial<PaymentMethod> = {
        id: ANOTHER_PAYMENT_METHOD_ID,
        userId: VALID_USER_ID,
        name: '銀行引き落とし',
      }

      vi.mocked(mockRepository.findById).mockResolvedValue(mockPaymentMethod as PaymentMethod)
      vi.mocked(mockRepository.findByUserIdAndName).mockResolvedValue(
        existingPaymentMethod as PaymentMethod,
      )

      await expect(
        service.update(VALID_PAYMENT_METHOD_ID, VALID_USER_ID, { name: '銀行引き落とし' }),
      ).rejects.toThrow('Payment method with this name already exists')
    })
  })

  // ---------------------------------------------------------------------------
  // delete
  // ---------------------------------------------------------------------------
  describe('delete', () => {
    it('[Success] 支払い方法を削除する', async () => {
      const mockPaymentMethod: Partial<PaymentMethod> = {
        id: VALID_PAYMENT_METHOD_ID,
        userId: VALID_USER_ID,
        name: 'クレジットカード',
        belongsTo: vi.fn(() => true),
      }

      vi.mocked(mockTxManager.execute).mockImplementation(async (callback) => {
        return callback({} as DbClient)
      })

      vi.mocked(mockRepository.findById).mockResolvedValue(mockPaymentMethod as PaymentMethod)
      vi.mocked(mockRepository.getSubscriptionsForPaymentMethod).mockResolvedValue([])
      vi.mocked(mockRepository.delete).mockResolvedValue(undefined)

      await service.delete(VALID_PAYMENT_METHOD_ID, VALID_USER_ID)

      expect(mockPaymentMethod.belongsTo).toHaveBeenCalledWith(VALID_USER_ID)
      expect(paymentMethodUsageChecker.validateDeletion).toHaveBeenCalledWith(
        VALID_PAYMENT_METHOD_ID,
        [],
      )
      expect(mockRepository.delete).toHaveBeenCalled()
    })

    it('[Fail] 支払い方法が見つからない場合はエラーになる', async () => {
      vi.mocked(mockTxManager.execute).mockImplementation(async (callback) => {
        return callback({} as DbClient)
      })

      vi.mocked(mockRepository.findById).mockResolvedValue(null)

      await expect(service.delete(NOT_FOUND_ID, VALID_USER_ID)).rejects.toThrow(
        'Payment method not found',
      )
    })

    it('[Fail] 認可チェック: 他のユーザーの支払い方法は削除できない', async () => {
      const mockPaymentMethod: Partial<PaymentMethod> = {
        id: VALID_PAYMENT_METHOD_ID,
        userId: OTHER_USER_ID,
        name: 'クレジットカード',
        belongsTo: vi.fn(() => false),
      }

      vi.mocked(mockTxManager.execute).mockImplementation(async (callback) => {
        return callback({} as DbClient)
      })

      vi.mocked(mockRepository.findById).mockResolvedValue(mockPaymentMethod as PaymentMethod)

      await expect(service.delete(VALID_PAYMENT_METHOD_ID, VALID_USER_ID)).rejects.toThrow(
        'Unauthorized',
      )

      expect(mockPaymentMethod.belongsTo).toHaveBeenCalledWith(VALID_USER_ID)
    })

    it('[Fail] 使用中チェックでエラーが発生した場合は伝播する', async () => {
      const mockPaymentMethod: Partial<PaymentMethod> = {
        id: VALID_PAYMENT_METHOD_ID,
        userId: VALID_USER_ID,
        name: 'クレジットカード',
        belongsTo: vi.fn(() => true),
      }

      vi.mocked(mockTxManager.execute).mockImplementation(async (callback) => {
        return callback({} as DbClient)
      })

      vi.mocked(mockRepository.findById).mockResolvedValue(mockPaymentMethod as PaymentMethod)
      vi.mocked(mockRepository.getSubscriptionsForPaymentMethod).mockResolvedValue([
        { id: 'sub-1' },
      ] as unknown as Subscription[])
      vi.mocked(paymentMethodUsageChecker.validateDeletion).mockImplementation(() => {
        throw new Error('Payment method is in use')
      })

      await expect(service.delete(VALID_PAYMENT_METHOD_ID, VALID_USER_ID)).rejects.toThrow(
        'Payment method is in use',
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

    it('[Success] 複数の支払い方法を一括削除する', async () => {
      const ids = [VALID_PAYMENT_METHOD_ID, ANOTHER_PAYMENT_METHOD_ID]
      const mockPaymentMethods: Array<Partial<PaymentMethod>> = [
        {
          id: VALID_PAYMENT_METHOD_ID,
          userId: VALID_USER_ID,
          name: 'クレジットカード',
          belongsTo: vi.fn(() => true),
        },
        {
          id: ANOTHER_PAYMENT_METHOD_ID,
          userId: VALID_USER_ID,
          name: '銀行引き落とし',
          belongsTo: vi.fn(() => true),
        },
      ]

      vi.mocked(mockTxManager.execute).mockImplementation(async (callback) => {
        return callback({} as DbClient)
      })

      vi.mocked(mockRepository.findByIds).mockResolvedValue(mockPaymentMethods as PaymentMethod[])
      vi.mocked(mockRepository.getSubscriptionsForPaymentMethods).mockResolvedValue([])
      vi.mocked(paymentMethodUsageChecker.validateDeletion).mockReturnValue(undefined)
      vi.mocked(mockRepository.deleteMany).mockResolvedValue(undefined)

      await service.deleteMany(ids, VALID_USER_ID)

      expect(mockRepository.findByIds).toHaveBeenCalledWith(ids, {})
      expect(mockRepository.deleteMany).toHaveBeenCalledWith(ids, {})
    })

    it('[Fail] 存在しない支払い方法がある場合はエラーになる', async () => {
      const ids = [VALID_PAYMENT_METHOD_ID, NOT_FOUND_ID]
      const mockPaymentMethods: Array<Partial<PaymentMethod>> = [
        {
          id: VALID_PAYMENT_METHOD_ID,
          userId: VALID_USER_ID,
          name: 'クレジットカード',
          belongsTo: vi.fn(() => true),
        },
      ]

      vi.mocked(mockTxManager.execute).mockImplementation(async (callback) => {
        return callback({} as DbClient)
      })

      vi.mocked(mockRepository.findByIds).mockResolvedValue(mockPaymentMethods as PaymentMethod[])

      await expect(service.deleteMany(ids, VALID_USER_ID)).rejects.toThrow(
        'Payment method not found',
      )
    })

    it('[Fail] 認可チェック: 他のユーザーの支払い方法が含まれる場合はエラーになる', async () => {
      const ids = [VALID_PAYMENT_METHOD_ID, ANOTHER_PAYMENT_METHOD_ID]
      const mockPaymentMethods: Array<Partial<PaymentMethod>> = [
        {
          id: VALID_PAYMENT_METHOD_ID,
          userId: VALID_USER_ID,
          name: 'クレジットカード',
          belongsTo: vi.fn(() => true),
        },
        {
          id: ANOTHER_PAYMENT_METHOD_ID,
          userId: OTHER_USER_ID,
          name: '銀行引き落とし',
          belongsTo: vi.fn(() => false),
        },
      ]

      vi.mocked(mockTxManager.execute).mockImplementation(async (callback) => {
        return callback({} as DbClient)
      })

      vi.mocked(mockRepository.findByIds).mockResolvedValue(mockPaymentMethods as PaymentMethod[])

      await expect(service.deleteMany(ids, VALID_USER_ID)).rejects.toThrow('Unauthorized')
    })

    it('[Fail] 使用中チェックでエラーが発生した場合は伝播する', async () => {
      const ids = [VALID_PAYMENT_METHOD_ID]
      const mockPaymentMethods: Array<Partial<PaymentMethod>> = [
        {
          id: VALID_PAYMENT_METHOD_ID,
          userId: VALID_USER_ID,
          name: 'クレジットカード',
          belongsTo: vi.fn(() => true),
        },
      ]

      vi.mocked(mockTxManager.execute).mockImplementation(async (callback) => {
        return callback({} as DbClient)
      })

      vi.mocked(mockRepository.findByIds).mockResolvedValue(mockPaymentMethods as PaymentMethod[])
      vi.mocked(mockRepository.getSubscriptionsForPaymentMethods).mockResolvedValue([
        { id: 'sub-1', paymentMethodId: VALID_PAYMENT_METHOD_ID },
      ] as unknown as Subscription[])
      vi.mocked(paymentMethodUsageChecker.validateDeletion).mockImplementation(() => {
        throw new Error('Payment method is in use')
      })

      await expect(service.deleteMany(ids, VALID_USER_ID)).rejects.toThrow(
        'Payment method is in use',
      )
    })
  })
})
