import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  subscriptionsCreateSubscription,
  subscriptionsDeleteSubscription,
  subscriptionsDeleteSubscriptions,
  subscriptionsGetSubscription,
  subscriptionsListSubscriptions,
  subscriptionsUpdateSubscription,
} from '@/external/client/api/generated/subscriptions/subscriptions'
import {
  createSubscription,
  deleteSubscription,
  deleteSubscriptions,
  getSubscriptionById,
  listSubscriptions,
  updateSubscription,
} from './subscription.service'

vi.mock('@/external/client/api/generated/subscriptions/subscriptions')

const mockSubscription = {
  id: '123e4567-e89b-12d3-a456-426614174000',
  userId: '123e4567-e89b-12d3-a456-426614174001',
  serviceName: 'Netflix',
  amount: 1490,
  billingCycle: 'monthly',
  baseDate: '2024-01-01T00:00:00.000Z',
  nextBillingDate: '2024-02-01',
  monthlyAmount: 1490,
  yearlyAmount: 17880,
  paymentMethodId: null,
  paymentMethod: null,
  memo: '',
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('listSubscriptions', () => {
  it('一覧を正常に取得できる', async () => {
    const mockResponse = {
      subscriptions: [mockSubscription],
      summary: { monthlyTotal: 1490, yearlyTotal: 17880, count: 1 },
    }
    vi.mocked(subscriptionsListSubscriptions).mockResolvedValue({ status: 200, data: mockResponse } as any)

    const result = await listSubscriptions()
    expect(result).toEqual(mockResponse)
  })

  it('200以外のステータスでエラーをスローする', async () => {
    vi.mocked(subscriptionsListSubscriptions).mockResolvedValue({ status: 500, data: null } as any)

    await expect(listSubscriptions()).rejects.toThrow('サブスクリプション一覧の取得に失敗しました')
  })
})

describe('getSubscriptionById', () => {
  it('サブスクリプションを正常に取得できる', async () => {
    vi.mocked(subscriptionsGetSubscription).mockResolvedValue({ status: 200, data: mockSubscription } as any)

    const result = await getSubscriptionById('123e4567-e89b-12d3-a456-426614174000')
    expect(result).toEqual(mockSubscription)
  })

  it('200以外のステータスでnullを返す', async () => {
    vi.mocked(subscriptionsGetSubscription).mockResolvedValue({ status: 404, data: null } as any)

    const result = await getSubscriptionById('not-found')
    expect(result).toBeNull()
  })

  it('例外が発生した場合nullを返す', async () => {
    vi.mocked(subscriptionsGetSubscription).mockRejectedValue(new Error('network error'))

    const result = await getSubscriptionById('error-id')
    expect(result).toBeNull()
  })
})

describe('createSubscription', () => {
  const request = {
    serviceName: 'Netflix',
    amount: 1490,
    billingCycle: 'monthly' as const,
    baseDate: '2024-01-01T00:00:00.000Z',
  }

  it('サブスクリプションを正常に作成できる', async () => {
    vi.mocked(subscriptionsCreateSubscription).mockResolvedValue({ status: 201, data: mockSubscription } as any)

    const result = await createSubscription(request)
    expect(result).toEqual(mockSubscription)
  })

  it('201以外のステータスでエラーをスローする', async () => {
    vi.mocked(subscriptionsCreateSubscription).mockResolvedValue({ status: 400, data: null } as any)

    await expect(createSubscription(request)).rejects.toThrow('サブスクリプションの作成に失敗しました')
  })
})

describe('updateSubscription', () => {
  it('サブスクリプションを正常に更新できる', async () => {
    const updated = { ...mockSubscription, serviceName: 'Netflix Premium' }
    vi.mocked(subscriptionsUpdateSubscription).mockResolvedValue({ status: 200, data: updated } as any)

    const result = await updateSubscription('123e4567-e89b-12d3-a456-426614174000', { serviceName: 'Netflix Premium' })
    expect(result.serviceName).toBe('Netflix Premium')
  })

  it('200以外のステータスでエラーをスローする', async () => {
    vi.mocked(subscriptionsUpdateSubscription).mockResolvedValue({ status: 404, data: null } as any)

    await expect(updateSubscription('id', {})).rejects.toThrow('サブスクリプションの更新に失敗しました')
  })
})

describe('deleteSubscription', () => {
  it('正常に削除できる', async () => {
    vi.mocked(subscriptionsDeleteSubscription).mockResolvedValue({ status: 204, data: null } as any)

    await expect(deleteSubscription('123e4567-e89b-12d3-a456-426614174000')).resolves.toBeUndefined()
  })

  it('204以外のステータスでエラーをスローする', async () => {
    vi.mocked(subscriptionsDeleteSubscription).mockResolvedValue({ status: 404, data: null } as any)

    await expect(deleteSubscription('id')).rejects.toThrow('サブスクリプションの削除に失敗しました')
  })
})

describe('deleteSubscriptions', () => {
  it('空配列の場合はAPIを呼び出さない', async () => {
    await deleteSubscriptions([])
    expect(subscriptionsDeleteSubscriptions).not.toHaveBeenCalled()
  })

  it('複数IDを正常に削除できる', async () => {
    vi.mocked(subscriptionsDeleteSubscriptions).mockResolvedValue({ status: 204, data: null } as any)

    await expect(deleteSubscriptions(['id-1', 'id-2'])).resolves.toBeUndefined()
    expect(subscriptionsDeleteSubscriptions).toHaveBeenCalledWith({ ids: ['id-1', 'id-2'] })
  })

  it('204以外のステータスでエラーをスローする', async () => {
    vi.mocked(subscriptionsDeleteSubscriptions).mockResolvedValue({ status: 500, data: null } as any)

    await expect(deleteSubscriptions(['id-1'])).rejects.toThrow('サブスクリプションの削除に失敗しました')
  })
})
