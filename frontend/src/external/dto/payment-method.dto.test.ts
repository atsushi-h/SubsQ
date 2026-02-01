import { describe, expect, it } from 'vitest'
import {
  CreatePaymentMethodRequestSchema,
  GetPaymentMethodByIdRequestSchema,
  GetPaymentMethodsByUserIdRequestSchema,
  PaymentMethodResponseSchema,
  UpdatePaymentMethodRequestSchema,
} from './payment-method.dto'

// テストデータ
const INVALID_UUID = 'not-a-uuid'
const VALID_PAYMENT_METHOD_ID = '123e4567-e89b-12d3-a456-426614174000'

describe('CreatePaymentMethodRequestSchema', () => {
  const validRequest = {
    userId: VALID_PAYMENT_METHOD_ID,
    name: 'クレジットカード',
  }

  it('有効なリクエストをパースできる', () => {
    const result = CreatePaymentMethodRequestSchema.safeParse(validRequest)
    expect(result.success).toBe(true)
  })

  it('userIdが不正なUUID形式でエラーになる', () => {
    const invalid = { ...validRequest, userId: INVALID_UUID }
    const result = CreatePaymentMethodRequestSchema.safeParse(invalid)
    expect(result.success).toBe(false)
  })

  it('nameが空文字でエラーになる', () => {
    const invalid = { ...validRequest, name: '' }
    const result = CreatePaymentMethodRequestSchema.safeParse(invalid)
    expect(result.success).toBe(false)
  })

  it('nameが100文字を超えるとエラーになる', () => {
    const invalid = { ...validRequest, name: 'a'.repeat(101) }
    const result = CreatePaymentMethodRequestSchema.safeParse(invalid)
    expect(result.success).toBe(false)
  })

  it('nameが100文字ちょうどの場合はパースできる', () => {
    const request = { ...validRequest, name: 'a'.repeat(100) }
    const result = CreatePaymentMethodRequestSchema.safeParse(request)
    expect(result.success).toBe(true)
  })
})

describe('UpdatePaymentMethodRequestSchema', () => {
  const validRequest = {
    id: VALID_PAYMENT_METHOD_ID,
    name: '銀行引き落とし',
  }

  it('有効なリクエストをパースできる', () => {
    const result = UpdatePaymentMethodRequestSchema.safeParse(validRequest)
    expect(result.success).toBe(true)
  })

  it('idが不正なUUID形式でエラーになる', () => {
    const invalid = { ...validRequest, id: INVALID_UUID }
    const result = UpdatePaymentMethodRequestSchema.safeParse(invalid)
    expect(result.success).toBe(false)
  })

  it('nameが空文字でエラーになる', () => {
    const invalid = { ...validRequest, name: '' }
    const result = UpdatePaymentMethodRequestSchema.safeParse(invalid)
    expect(result.success).toBe(false)
  })

  it('nameが100文字を超えるとエラーになる', () => {
    const invalid = { ...validRequest, name: 'a'.repeat(101) }
    const result = UpdatePaymentMethodRequestSchema.safeParse(invalid)
    expect(result.success).toBe(false)
  })
})

describe('GetPaymentMethodByIdRequestSchema', () => {
  it('有効なUUIDをパースできる', () => {
    const request = {
      id: VALID_PAYMENT_METHOD_ID,
    }
    const result = GetPaymentMethodByIdRequestSchema.safeParse(request)
    expect(result.success).toBe(true)
  })

  it('不正なUUID形式でエラーになる', () => {
    const request = { id: INVALID_UUID }
    const result = GetPaymentMethodByIdRequestSchema.safeParse(request)
    expect(result.success).toBe(false)
  })
})

describe('GetPaymentMethodsByUserIdRequestSchema', () => {
  it('有効なUUIDをパースできる', () => {
    const request = {
      userId: VALID_PAYMENT_METHOD_ID,
    }
    const result = GetPaymentMethodsByUserIdRequestSchema.safeParse(request)
    expect(result.success).toBe(true)
  })

  it('不正なUUID形式でエラーになる', () => {
    const request = { userId: INVALID_UUID }
    const result = GetPaymentMethodsByUserIdRequestSchema.safeParse(request)
    expect(result.success).toBe(false)
  })
})

describe('PaymentMethodResponseSchema', () => {
  const validResponse = {
    id: VALID_PAYMENT_METHOD_ID,
    userId: '123e4567-e89b-12d3-a456-426614174001',
    name: 'クレジットカード',
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  }

  it('有効なレスポンスをパースできる', () => {
    const result = PaymentMethodResponseSchema.safeParse(validResponse)
    expect(result.success).toBe(true)
  })

  it('idが不正なUUID形式でエラーになる', () => {
    const invalid = { ...validResponse, id: INVALID_UUID }
    const result = PaymentMethodResponseSchema.safeParse(invalid)
    expect(result.success).toBe(false)
  })

  it('userIdが不正なUUID形式でエラーになる', () => {
    const invalid = { ...validResponse, userId: INVALID_UUID }
    const result = PaymentMethodResponseSchema.safeParse(invalid)
    expect(result.success).toBe(false)
  })

  it('createdAtが不正なISO形式でエラーになる', () => {
    const invalid = { ...validResponse, createdAt: 'not-a-date' }
    const result = PaymentMethodResponseSchema.safeParse(invalid)
    expect(result.success).toBe(false)
  })

  it('updatedAtが不正なISO形式でエラーになる', () => {
    const invalid = { ...validResponse, updatedAt: 'not-a-date' }
    const result = PaymentMethodResponseSchema.safeParse(invalid)
    expect(result.success).toBe(false)
  })
})
