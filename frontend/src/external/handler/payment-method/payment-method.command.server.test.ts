import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { PaymentMethod } from '../../domain/entities/payment-method'

// Serviceをモック
vi.mock('../../service/payment-method/payment-method.service', () => ({
  paymentMethodService: {
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    deleteMany: vi.fn(),
  },
}))

import { paymentMethodService } from '../../service/payment-method/payment-method.service'
import {
  createPaymentMethodCommand,
  deletePaymentMethodCommand,
  deletePaymentMethodsCommand,
  updatePaymentMethodCommand,
} from './payment-method.command.server'

// テストデータ
const INVALID_UUID = 'invalid-uuid'
const VALID_PAYMENT_METHOD_ID = '123e4567-e89b-12d3-a456-426614174000'
const ANOTHER_PAYMENT_METHOD_ID = '123e4567-e89b-12d3-a456-426614174001'
const VALID_USER_ID = '123e4567-e89b-12d3-a456-426614174002'
const TEST_USER_ID = 'user-123'
const OTHER_USER_ID = 'user-456'

describe('createPaymentMethodCommand', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('不正なUUIDでエラーになる', async () => {
    await expect(
      createPaymentMethodCommand({ userId: INVALID_UUID, name: 'クレジットカード' }, TEST_USER_ID),
    ).rejects.toThrow()
  })

  it('nameが空文字でエラーになる', async () => {
    await expect(
      createPaymentMethodCommand({ userId: VALID_PAYMENT_METHOD_ID, name: '' }, TEST_USER_ID),
    ).rejects.toThrow()
  })

  it('nameが100文字を超えるとエラーになる', async () => {
    await expect(
      createPaymentMethodCommand(
        { userId: VALID_PAYMENT_METHOD_ID, name: 'a'.repeat(101) },
        TEST_USER_ID,
      ),
    ).rejects.toThrow()
  })

  it('認可チェック: 他のユーザー用の支払い方法は作成できない', async () => {
    await expect(
      createPaymentMethodCommand(
        { userId: VALID_PAYMENT_METHOD_ID, name: 'クレジットカード' },
        OTHER_USER_ID,
      ),
    ).rejects.toThrow('Forbidden')
  })

  it('支払い方法を作成する', async () => {
    const mockPaymentMethod: Partial<PaymentMethod> = {
      id: ANOTHER_PAYMENT_METHOD_ID,
      userId: VALID_PAYMENT_METHOD_ID,
      name: 'クレジットカード',
      toPlainObject: vi.fn(() => ({
        id: ANOTHER_PAYMENT_METHOD_ID,
        userId: VALID_PAYMENT_METHOD_ID,
        name: 'クレジットカード',
        createdAt: new Date('2024-01-01T00:00:00.000Z'),
        updatedAt: new Date('2024-01-01T00:00:00.000Z'),
      })),
    }
    vi.mocked(paymentMethodService.create).mockResolvedValue(mockPaymentMethod as PaymentMethod)

    const result = await createPaymentMethodCommand(
      { userId: VALID_PAYMENT_METHOD_ID, name: 'クレジットカード' },
      VALID_PAYMENT_METHOD_ID,
    )

    expect(result.id).toBe(ANOTHER_PAYMENT_METHOD_ID)
    expect(result.name).toBe('クレジットカード')
    expect(paymentMethodService.create).toHaveBeenCalledWith({
      userId: VALID_PAYMENT_METHOD_ID,
      name: 'クレジットカード',
    })
  })
})

describe('updatePaymentMethodCommand', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('不正なUUIDでエラーになる', async () => {
    await expect(
      updatePaymentMethodCommand({ id: INVALID_UUID, name: '銀行引き落とし' }, TEST_USER_ID),
    ).rejects.toThrow()
  })

  it('認可チェック: Service層のエラーが正しく伝播する', async () => {
    vi.mocked(paymentMethodService.update).mockRejectedValue(
      new Error('Unauthorized: User user-456 cannot access payment method pm-123'),
    )

    await expect(
      updatePaymentMethodCommand({ id: VALID_PAYMENT_METHOD_ID, name: 'Updated' }, OTHER_USER_ID),
    ).rejects.toThrow('Unauthorized')

    expect(paymentMethodService.update).toHaveBeenCalledWith(
      VALID_PAYMENT_METHOD_ID,
      OTHER_USER_ID,
      expect.any(Object),
    )
  })

  it('nameが空文字でエラーになる', async () => {
    await expect(
      updatePaymentMethodCommand({ id: VALID_PAYMENT_METHOD_ID, name: '' }, TEST_USER_ID),
    ).rejects.toThrow()
  })

  it('nameが100文字を超えるとエラーになる', async () => {
    await expect(
      updatePaymentMethodCommand(
        { id: VALID_PAYMENT_METHOD_ID, name: 'a'.repeat(101) },
        TEST_USER_ID,
      ),
    ).rejects.toThrow()
  })

  it('支払い方法を更新する', async () => {
    const mockPaymentMethod: Partial<PaymentMethod> = {
      id: VALID_PAYMENT_METHOD_ID,
      userId: VALID_USER_ID,
      name: '銀行引き落とし',
      toPlainObject: vi.fn(() => ({
        id: VALID_PAYMENT_METHOD_ID,
        userId: VALID_USER_ID,
        name: '銀行引き落とし',
        createdAt: new Date('2024-01-01T00:00:00.000Z'),
        updatedAt: new Date('2024-01-02T00:00:00.000Z'),
      })),
    }
    vi.mocked(paymentMethodService.update).mockResolvedValue(mockPaymentMethod as PaymentMethod)

    const result = await updatePaymentMethodCommand(
      { id: VALID_PAYMENT_METHOD_ID, name: '銀行引き落とし' },
      VALID_USER_ID,
    )

    expect(result.id).toBe(VALID_PAYMENT_METHOD_ID)
    expect(result.name).toBe('銀行引き落とし')
    expect(paymentMethodService.update).toHaveBeenCalledWith(
      VALID_PAYMENT_METHOD_ID,
      VALID_USER_ID,
      { id: VALID_PAYMENT_METHOD_ID, name: '銀行引き落とし' },
    )
  })
})

describe('deletePaymentMethodCommand', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('支払い方法を削除する', async () => {
    vi.mocked(paymentMethodService.delete).mockResolvedValue()

    await deletePaymentMethodCommand(VALID_PAYMENT_METHOD_ID, TEST_USER_ID)

    expect(paymentMethodService.delete).toHaveBeenCalledWith(VALID_PAYMENT_METHOD_ID, TEST_USER_ID)
  })

  it('認可チェック: Service層のエラーが正しく伝播する', async () => {
    vi.mocked(paymentMethodService.delete).mockRejectedValue(
      new Error('Unauthorized: User user-456 cannot access payment method pm-123'),
    )

    await expect(
      deletePaymentMethodCommand(VALID_PAYMENT_METHOD_ID, OTHER_USER_ID),
    ).rejects.toThrow('Unauthorized')

    expect(paymentMethodService.delete).toHaveBeenCalledWith(VALID_PAYMENT_METHOD_ID, OTHER_USER_ID)
  })

  it('サービスが例外をスローした場合は伝播する', async () => {
    vi.mocked(paymentMethodService.delete).mockRejectedValue(new Error('Payment method not found'))

    await expect(deletePaymentMethodCommand('not-exist', TEST_USER_ID)).rejects.toThrow(
      'Payment method not found',
    )
  })
})

describe('deletePaymentMethodsCommand', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('複数の支払い方法を削除する', async () => {
    vi.mocked(paymentMethodService.deleteMany).mockResolvedValue()

    const ids = [VALID_PAYMENT_METHOD_ID, ANOTHER_PAYMENT_METHOD_ID]
    await deletePaymentMethodsCommand(ids, TEST_USER_ID)

    expect(paymentMethodService.deleteMany).toHaveBeenCalledWith(ids, TEST_USER_ID)
  })

  it('空配列を渡した場合もサービスが呼ばれる', async () => {
    vi.mocked(paymentMethodService.deleteMany).mockResolvedValue()

    await deletePaymentMethodsCommand([], TEST_USER_ID)

    expect(paymentMethodService.deleteMany).toHaveBeenCalledWith([], TEST_USER_ID)
  })

  it('認可チェック: Service層のエラーが正しく伝播する', async () => {
    vi.mocked(paymentMethodService.deleteMany).mockRejectedValue(
      new Error('Unauthorized: User user-456 cannot access payment method pm-123'),
    )

    const ids = [VALID_PAYMENT_METHOD_ID, ANOTHER_PAYMENT_METHOD_ID]
    await expect(deletePaymentMethodsCommand(ids, OTHER_USER_ID)).rejects.toThrow('Unauthorized')

    expect(paymentMethodService.deleteMany).toHaveBeenCalledWith(ids, OTHER_USER_ID)
  })

  it('サービスが例外をスローした場合は伝播する', async () => {
    vi.mocked(paymentMethodService.deleteMany).mockRejectedValue(
      new Error('Payment method not found'),
    )

    await expect(deletePaymentMethodsCommand(['not-exist'], TEST_USER_ID)).rejects.toThrow(
      'Payment method not found',
    )
  })
})
