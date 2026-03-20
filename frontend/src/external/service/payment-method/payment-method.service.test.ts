import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  paymentMethodsCreatePaymentMethod,
  paymentMethodsDeletePaymentMethod,
  paymentMethodsDeletePaymentMethods,
  paymentMethodsGetPaymentMethod,
  paymentMethodsListPaymentMethods,
  paymentMethodsUpdatePaymentMethod,
} from '@/external/client/api/generated/payment-methods/payment-methods'
import {
  createPaymentMethod,
  deletePaymentMethod,
  deletePaymentMethods,
  getPaymentMethodById,
  listPaymentMethods,
  updatePaymentMethod,
} from './payment-method.service'

vi.mock('@/external/client/api/generated/payment-methods/payment-methods')

const mockPaymentMethod = {
  id: '123e4567-e89b-12d3-a456-426614174000',
  userId: '123e4567-e89b-12d3-a456-426614174001',
  name: 'クレジットカード',
  usageCount: 0,
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('listPaymentMethods', () => {
  it('一覧を正常に取得できる', async () => {
    vi.mocked(paymentMethodsListPaymentMethods).mockResolvedValue({
      status: 200,
      data: [mockPaymentMethod],
    } as never)

    const result = await listPaymentMethods()
    expect(result).toEqual([mockPaymentMethod])
  })

  it('200以外のステータスでエラーをスローする', async () => {
    vi.mocked(paymentMethodsListPaymentMethods).mockResolvedValue({
      status: 500,
      data: null,
    } as never)

    await expect(listPaymentMethods()).rejects.toThrow('支払い方法一覧の取得に失敗しました')
  })
})

describe('getPaymentMethodById', () => {
  it('支払い方法を正常に取得できる', async () => {
    vi.mocked(paymentMethodsGetPaymentMethod).mockResolvedValue({
      status: 200,
      data: mockPaymentMethod,
    } as never)

    const result = await getPaymentMethodById('123e4567-e89b-12d3-a456-426614174000')
    expect(result).toEqual(mockPaymentMethod)
  })

  it('200以外のステータスでnullを返す', async () => {
    vi.mocked(paymentMethodsGetPaymentMethod).mockResolvedValue({
      status: 404,
      data: null,
    } as never)

    const result = await getPaymentMethodById('not-found')
    expect(result).toBeNull()
  })

  it('例外が発生した場合nullを返す', async () => {
    vi.mocked(paymentMethodsGetPaymentMethod).mockRejectedValue(new Error('network error'))

    const result = await getPaymentMethodById('error-id')
    expect(result).toBeNull()
  })
})

describe('createPaymentMethod', () => {
  it('支払い方法を正常に作成できる', async () => {
    vi.mocked(paymentMethodsCreatePaymentMethod).mockResolvedValue({
      status: 201,
      data: mockPaymentMethod,
    } as never)

    const result = await createPaymentMethod({ name: 'クレジットカード' })
    expect(result).toEqual(mockPaymentMethod)
  })

  it('201以外のステータスでエラーをスローする', async () => {
    vi.mocked(paymentMethodsCreatePaymentMethod).mockResolvedValue({
      status: 400,
      data: null,
    } as never)

    await expect(createPaymentMethod({ name: 'カード' })).rejects.toThrow(
      '支払い方法の作成に失敗しました',
    )
  })
})

describe('updatePaymentMethod', () => {
  it('支払い方法を正常に更新できる', async () => {
    const updated = { ...mockPaymentMethod, name: '新しいカード' }
    vi.mocked(paymentMethodsUpdatePaymentMethod).mockResolvedValue({
      status: 200,
      data: updated,
    } as never)

    const result = await updatePaymentMethod('123e4567-e89b-12d3-a456-426614174000', {
      name: '新しいカード',
    })
    expect(result.name).toBe('新しいカード')
  })

  it('200以外のステータスでエラーをスローする', async () => {
    vi.mocked(paymentMethodsUpdatePaymentMethod).mockResolvedValue({
      status: 404,
      data: null,
    } as never)

    await expect(updatePaymentMethod('id', { name: 'カード' })).rejects.toThrow(
      '支払い方法の更新に失敗しました',
    )
  })
})

describe('deletePaymentMethod', () => {
  it('正常に削除できる', async () => {
    vi.mocked(paymentMethodsDeletePaymentMethod).mockResolvedValue({
      status: 204,
      data: null,
    } as never)

    await expect(
      deletePaymentMethod('123e4567-e89b-12d3-a456-426614174000'),
    ).resolves.toBeUndefined()
  })

  it('204以外のステータスでエラーをスローする', async () => {
    vi.mocked(paymentMethodsDeletePaymentMethod).mockResolvedValue({
      status: 404,
      data: null,
    } as never)

    await expect(deletePaymentMethod('id')).rejects.toThrow('支払い方法の削除に失敗しました')
  })
})

describe('deletePaymentMethods', () => {
  it('空配列の場合はAPIを呼び出さない', async () => {
    await deletePaymentMethods([])
    expect(paymentMethodsDeletePaymentMethods).not.toHaveBeenCalled()
  })

  it('複数IDを正常に削除できる', async () => {
    vi.mocked(paymentMethodsDeletePaymentMethods).mockResolvedValue({
      status: 204,
      data: null,
    } as never)

    await expect(deletePaymentMethods(['id-1', 'id-2'])).resolves.toBeUndefined()
    expect(paymentMethodsDeletePaymentMethods).toHaveBeenCalledWith({ ids: ['id-1', 'id-2'] })
  })

  it('204以外のステータスでエラーをスローする', async () => {
    vi.mocked(paymentMethodsDeletePaymentMethods).mockResolvedValue({
      status: 500,
      data: null,
    } as never)

    await expect(deletePaymentMethods(['id-1'])).rejects.toThrow('支払い方法の削除に失敗しました')
  })
})
