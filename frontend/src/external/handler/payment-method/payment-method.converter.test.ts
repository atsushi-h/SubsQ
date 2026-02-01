import { describe, expect, it } from 'vitest'
import { PaymentMethod } from '../../domain/entities/payment-method'
import { toPaymentMethodResponse } from './payment-method.converter'

// テストデータ
const VALID_PAYMENT_METHOD_ID = '123e4567-e89b-12d3-a456-426614174000'
const VALID_USER_ID = '123e4567-e89b-12d3-a456-426614174001'

describe('toPaymentMethodResponse', () => {
  it('PaymentMethodエンティティをPaymentMethodResponseに変換する', () => {
    const paymentMethod = PaymentMethod.reconstruct({
      id: VALID_PAYMENT_METHOD_ID,
      userId: VALID_USER_ID,
      name: 'クレジットカード',
      createdAt: new Date('2024-01-01T00:00:00.000Z'),
      updatedAt: new Date('2024-01-02T00:00:00.000Z'),
    })

    const result = toPaymentMethodResponse(paymentMethod)

    expect(result).toEqual({
      id: VALID_PAYMENT_METHOD_ID,
      userId: VALID_USER_ID,
      name: 'クレジットカード',
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-02T00:00:00.000Z',
    })
  })

  it('DateオブジェクトをISO文字列に変換する', () => {
    const now = new Date('2024-01-15T12:30:45.123Z')
    const paymentMethod = PaymentMethod.reconstruct({
      id: VALID_PAYMENT_METHOD_ID,
      userId: VALID_USER_ID,
      name: '銀行引き落とし',
      createdAt: now,
      updatedAt: now,
    })

    const result = toPaymentMethodResponse(paymentMethod)

    expect(result.createdAt).toBe('2024-01-15T12:30:45.123Z')
    expect(result.updatedAt).toBe('2024-01-15T12:30:45.123Z')
  })

  it('PaymentMethodResponseSchemaでバリデーションされる', () => {
    // スキーマ検証は内部で行われているので、無効なデータは例外をスローする
    const paymentMethod = PaymentMethod.reconstruct({
      id: VALID_PAYMENT_METHOD_ID,
      userId: VALID_USER_ID,
      name: 'クレジットカード',
      createdAt: new Date('2024-01-01T00:00:00.000Z'),
      updatedAt: new Date('2024-01-01T00:00:00.000Z'),
    })

    // 変換が成功することを確認（スキーマ検証を通過）
    expect(() => toPaymentMethodResponse(paymentMethod)).not.toThrow()
  })
})
