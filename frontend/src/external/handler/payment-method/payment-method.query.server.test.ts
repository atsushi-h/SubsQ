import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { PaymentMethod } from '../../domain/entities/payment-method'

// Serviceをモック
vi.mock('../../service/payment-method/payment-method.service', () => ({
  paymentMethodService: {
    getPaymentMethodById: vi.fn(),
    getPaymentMethodsByUserId: vi.fn(),
  },
}))

import { paymentMethodService } from '../../service/payment-method/payment-method.service'
import {
  getPaymentMethodByIdQuery,
  listPaymentMethodsByUserIdQuery,
} from './payment-method.query.server'

// テストデータ
const INVALID_UUID = 'invalid-uuid'
const VALID_PAYMENT_METHOD_ID = '123e4567-e89b-12d3-a456-426614174000'
const ANOTHER_PAYMENT_METHOD_ID = '123e4567-e89b-12d3-a456-426614174001'
const VALID_USER_ID = '123e4567-e89b-12d3-a456-426614174002'
const TEST_USER_ID = 'user-123'
const OTHER_USER_ID = 'user-456'

describe('getPaymentMethodByIdQuery', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('不正なUUIDでエラーになる', async () => {
    await expect(getPaymentMethodByIdQuery({ id: INVALID_UUID }, TEST_USER_ID)).rejects.toThrow()
  })

  it('支払い方法が見つからない場合はnullを返す', async () => {
    vi.mocked(paymentMethodService.getPaymentMethodById).mockResolvedValue(null)

    const result = await getPaymentMethodByIdQuery({ id: VALID_PAYMENT_METHOD_ID }, TEST_USER_ID)

    expect(result).toBeNull()
  })

  it('認可チェック: 他のユーザーの支払い方法は取得できない', async () => {
    const mockPaymentMethod: Partial<PaymentMethod> = {
      id: VALID_PAYMENT_METHOD_ID,
      userId: OTHER_USER_ID,
      name: 'クレジットカード',
      belongsTo: vi.fn(() => false),
      toPlainObject: vi.fn(() => ({
        id: VALID_PAYMENT_METHOD_ID,
        userId: OTHER_USER_ID,
        name: 'クレジットカード',
        createdAt: new Date('2024-01-01T00:00:00.000Z'),
        updatedAt: new Date('2024-01-01T00:00:00.000Z'),
      })),
    }
    vi.mocked(paymentMethodService.getPaymentMethodById).mockResolvedValue(
      mockPaymentMethod as PaymentMethod,
    )

    await expect(
      getPaymentMethodByIdQuery({ id: VALID_PAYMENT_METHOD_ID }, TEST_USER_ID),
    ).rejects.toThrow('Forbidden')
  })

  it('支払い方法を正しく返す', async () => {
    const mockPaymentMethod: Partial<PaymentMethod> = {
      id: VALID_PAYMENT_METHOD_ID,
      userId: VALID_USER_ID,
      name: 'クレジットカード',
      belongsTo: vi.fn(() => true),
      toPlainObject: vi.fn(() => ({
        id: VALID_PAYMENT_METHOD_ID,
        userId: VALID_USER_ID,
        name: 'クレジットカード',
        createdAt: new Date('2024-01-01T00:00:00.000Z'),
        updatedAt: new Date('2024-01-01T00:00:00.000Z'),
      })),
    }
    vi.mocked(paymentMethodService.getPaymentMethodById).mockResolvedValue(
      mockPaymentMethod as PaymentMethod,
    )

    const result = await getPaymentMethodByIdQuery({ id: VALID_PAYMENT_METHOD_ID }, VALID_USER_ID)

    expect(result).toBeDefined()
    expect(result?.id).toBe(VALID_PAYMENT_METHOD_ID)
    expect(result?.name).toBe('クレジットカード')
    expect(mockPaymentMethod.belongsTo).toHaveBeenCalledWith(VALID_USER_ID)
  })
})

describe('listPaymentMethodsByUserIdQuery', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('ユーザーの支払い方法一覧を取得する', async () => {
    const mockPaymentMethods: Array<Partial<PaymentMethod>> = [
      {
        id: VALID_PAYMENT_METHOD_ID,
        userId: VALID_USER_ID,
        name: 'クレジットカード',
        toPlainObject: vi.fn(() => ({
          id: VALID_PAYMENT_METHOD_ID,
          userId: VALID_USER_ID,
          name: 'クレジットカード',
          createdAt: new Date('2024-01-01T00:00:00.000Z'),
          updatedAt: new Date('2024-01-01T00:00:00.000Z'),
        })),
      },
      {
        id: ANOTHER_PAYMENT_METHOD_ID,
        userId: VALID_USER_ID,
        name: '銀行引き落とし',
        toPlainObject: vi.fn(() => ({
          id: ANOTHER_PAYMENT_METHOD_ID,
          userId: VALID_USER_ID,
          name: '銀行引き落とし',
          createdAt: new Date('2024-01-02T00:00:00.000Z'),
          updatedAt: new Date('2024-01-02T00:00:00.000Z'),
        })),
      },
    ]
    vi.mocked(paymentMethodService.getPaymentMethodsByUserId).mockResolvedValue(
      mockPaymentMethods as PaymentMethod[],
    )

    const result = await listPaymentMethodsByUserIdQuery(VALID_USER_ID)

    expect(result).toHaveLength(2)
    expect(result[0].name).toBe('クレジットカード')
    expect(result[1].name).toBe('銀行引き落とし')
    expect(paymentMethodService.getPaymentMethodsByUserId).toHaveBeenCalledWith(VALID_USER_ID)
  })

  it('支払い方法が存在しない場合は空配列を返す', async () => {
    vi.mocked(paymentMethodService.getPaymentMethodsByUserId).mockResolvedValue([])

    const result = await listPaymentMethodsByUserIdQuery(TEST_USER_ID)

    expect(result).toEqual([])
  })
})
