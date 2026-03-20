import { describe, expect, it } from 'vitest'
import {
  CreatePaymentMethodRequestSchema,
  GetPaymentMethodByIdRequestSchema,
  PaymentMethodResponseSchema,
  UpdatePaymentMethodRequestSchema,
} from './payment-method.dto'

const validPaymentMethod = {
  id: '123e4567-e89b-12d3-a456-426614174000',
  userId: '123e4567-e89b-12d3-a456-426614174001',
  name: 'クレジットカード',
  usageCount: 3,
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
}

describe('PaymentMethodResponseSchema', () => {
  it('有効なレスポンスをパースできる', () => {
    expect(PaymentMethodResponseSchema.safeParse(validPaymentMethod).success).toBe(true)
  })

  it('usageCountが小数でエラーになる', () => {
    const result = PaymentMethodResponseSchema.safeParse({ ...validPaymentMethod, usageCount: 1.5 })
    expect(result.success).toBe(false)
  })

  it('idが不正なUUIDでエラーになる', () => {
    const result = PaymentMethodResponseSchema.safeParse({ ...validPaymentMethod, id: 'not-a-uuid' })
    expect(result.success).toBe(false)
  })
})

describe('CreatePaymentMethodRequestSchema', () => {
  it('有効なリクエストをパースできる', () => {
    const result = CreatePaymentMethodRequestSchema.safeParse({ name: 'クレジットカード' })
    expect(result.success).toBe(true)
  })

  it('nameが空文字でエラーになる', () => {
    const result = CreatePaymentMethodRequestSchema.safeParse({ name: '' })
    expect(result.success).toBe(false)
  })

  it('nameが100文字を超えるとエラーになる', () => {
    const result = CreatePaymentMethodRequestSchema.safeParse({ name: 'a'.repeat(101) })
    expect(result.success).toBe(false)
  })
})

describe('UpdatePaymentMethodRequestSchema', () => {
  it('有効なリクエストをパースできる', () => {
    const result = UpdatePaymentMethodRequestSchema.safeParse({
      id: '123e4567-e89b-12d3-a456-426614174000',
      name: '新しいカード',
    })
    expect(result.success).toBe(true)
  })

  it('idが不正なUUIDでエラーになる', () => {
    const result = UpdatePaymentMethodRequestSchema.safeParse({ id: 'invalid', name: 'カード' })
    expect(result.success).toBe(false)
  })

  it('nameが空文字でエラーになる', () => {
    const result = UpdatePaymentMethodRequestSchema.safeParse({
      id: '123e4567-e89b-12d3-a456-426614174000',
      name: '',
    })
    expect(result.success).toBe(false)
  })
})

describe('GetPaymentMethodByIdRequestSchema', () => {
  it('有効なUUIDをパースできる', () => {
    const result = GetPaymentMethodByIdRequestSchema.safeParse({ id: '123e4567-e89b-12d3-a456-426614174000' })
    expect(result.success).toBe(true)
  })

  it('不正なUUIDでエラーになる', () => {
    const result = GetPaymentMethodByIdRequestSchema.safeParse({ id: 'invalid' })
    expect(result.success).toBe(false)
  })
})
