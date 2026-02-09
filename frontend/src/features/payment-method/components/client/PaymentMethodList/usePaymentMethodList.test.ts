import type { UseMutationResult, UseQueryResult } from '@tanstack/react-query'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type {
  PaymentMethod,
  PaymentMethodWithUsage,
} from '@/features/payment-method/types/payment-method.types'
import type {
  Subscription,
  SubscriptionList,
} from '@/features/subscription/types/subscription.types'
import { act, renderHook } from '@/test/test-utils'
import { usePaymentMethodList } from './usePaymentMethodList'

vi.mock('next/navigation', () => ({
  useRouter: vi.fn(() => ({
    push: vi.fn(),
  })),
}))

vi.mock('@/features/payment-method/hooks/usePaymentMethodListQuery')
vi.mock('@/features/subscription/hooks/useSubscriptionListQuery')
vi.mock('@/features/payment-method/hooks/useDeletePaymentMethodMutation')

import { useRouter } from 'next/navigation'
import { useDeletePaymentMethodMutation } from '@/features/payment-method/hooks/useDeletePaymentMethodMutation'
import { usePaymentMethodListQuery } from '@/features/payment-method/hooks/usePaymentMethodListQuery'
import { useSubscriptionListQuery } from '@/features/subscription/hooks/useSubscriptionListQuery'

const mockPaymentMethod: PaymentMethod = {
  id: 'pm-1',
  name: 'クレジットカード',
  userId: 'user-1',
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
}

const mockPaymentMethod2: PaymentMethod = {
  id: 'pm-2',
  name: '銀行振込',
  userId: 'user-1',
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
}

const mockSubscription: Subscription = {
  id: 'sub-1',
  serviceName: 'Netflix',
  amount: 1200,
  billingCycle: 'monthly',
  userId: 'user-1',
  baseDate: '2024-01-01T00:00:00Z',
  paymentMethod: { id: 'pm-1', name: 'クレジットカード' },
  memo: '',
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
}

const mockSubscription2: Subscription = {
  id: 'sub-2',
  serviceName: 'Spotify',
  amount: 980,
  billingCycle: 'monthly',
  userId: 'user-1',
  baseDate: '2024-01-01T00:00:00Z',
  paymentMethod: { id: 'pm-1', name: 'クレジットカード' },
  memo: '',
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
}

describe('usePaymentMethodList', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('支払い方法一覧を取得する', () => {
    // Arrange
    vi.mocked(usePaymentMethodListQuery).mockReturnValue({
      data: [mockPaymentMethod],
      isLoading: false,
      error: null,
    } as unknown as UseQueryResult<PaymentMethod[], Error>)

    vi.mocked(useSubscriptionListQuery).mockReturnValue({
      data: {
        subscriptions: [mockSubscription],
        totals: { monthlyTotal: 1200, yearlyTotal: 0 },
      },
      isLoading: false,
      error: null,
    } as unknown as UseQueryResult<SubscriptionList, Error>)

    vi.mocked(useDeletePaymentMethodMutation).mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    } as unknown as UseMutationResult<void, Error, string, unknown>)

    // Act
    const { result } = renderHook(() => usePaymentMethodList())

    // Assert
    expect(result.current.paymentMethods).toHaveLength(1)
    expect(result.current.paymentMethods[0].name).toBe('クレジットカード')
    expect(result.current.paymentMethods[0].usageCount).toBe(1)
  })

  it('データがない場合は空配列を返す', () => {
    // Arrange
    vi.mocked(usePaymentMethodListQuery).mockReturnValue({
      data: undefined,
      isLoading: false,
      error: null,
    } as unknown as UseQueryResult<PaymentMethod[], Error>)

    vi.mocked(useSubscriptionListQuery).mockReturnValue({
      data: undefined,
      isLoading: false,
      error: null,
    } as unknown as UseQueryResult<SubscriptionList, Error>)

    vi.mocked(useDeletePaymentMethodMutation).mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    } as unknown as UseMutationResult<void, Error, string, unknown>)

    // Act
    const { result } = renderHook(() => usePaymentMethodList())

    // Assert
    expect(result.current.paymentMethods).toEqual([])
  })

  it('使用中件数を計算する', () => {
    // Arrange
    vi.mocked(usePaymentMethodListQuery).mockReturnValue({
      data: [mockPaymentMethod],
      isLoading: false,
      error: null,
    } as unknown as UseQueryResult<PaymentMethod[], Error>)

    vi.mocked(useSubscriptionListQuery).mockReturnValue({
      data: {
        subscriptions: [mockSubscription, mockSubscription2],
        totals: { monthlyTotal: 2180, yearlyTotal: 0 },
      },
      isLoading: false,
      error: null,
    } as unknown as UseQueryResult<SubscriptionList, Error>)

    vi.mocked(useDeletePaymentMethodMutation).mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    } as unknown as UseMutationResult<void, Error, string, unknown>)

    // Act
    const { result } = renderHook(() => usePaymentMethodList())

    // Assert
    expect(result.current.paymentMethods[0].usageCount).toBe(2)
  })

  it('複数の支払い方法それぞれの使用中件数を正しく計算する', () => {
    // Arrange
    vi.mocked(usePaymentMethodListQuery).mockReturnValue({
      data: [mockPaymentMethod, mockPaymentMethod2],
      isLoading: false,
      error: null,
    } as unknown as UseQueryResult<PaymentMethod[], Error>)

    const subscription3: Subscription = {
      id: 'sub-3',
      serviceName: 'Amazon Prime',
      amount: 500,
      billingCycle: 'monthly',
      userId: 'user-1',
      baseDate: '2024-01-01T00:00:00Z',
      paymentMethod: { id: 'pm-2', name: '銀行振込' },
      memo: '',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    }

    vi.mocked(useSubscriptionListQuery).mockReturnValue({
      data: {
        subscriptions: [mockSubscription, mockSubscription2, subscription3],
        totals: { monthlyTotal: 2680, yearlyTotal: 0 },
      },
      isLoading: false,
      error: null,
    } as unknown as UseQueryResult<SubscriptionList, Error>)

    vi.mocked(useDeletePaymentMethodMutation).mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    } as unknown as UseMutationResult<void, Error, string, unknown>)

    // Act
    const { result } = renderHook(() => usePaymentMethodList())

    // Assert
    expect(result.current.paymentMethods).toHaveLength(2)
    expect(result.current.paymentMethods[0].usageCount).toBe(2) // pm-1
    expect(result.current.paymentMethods[1].usageCount).toBe(1) // pm-2
  })

  it('subscriptionDataがundefinedの場合は空配列を返す', () => {
    // Arrange
    vi.mocked(usePaymentMethodListQuery).mockReturnValue({
      data: [mockPaymentMethod],
      isLoading: false,
      error: null,
    } as unknown as UseQueryResult<PaymentMethod[], Error>)

    vi.mocked(useSubscriptionListQuery).mockReturnValue({
      data: undefined,
      isLoading: false,
      error: null,
    } as unknown as UseQueryResult<SubscriptionList, Error>)

    vi.mocked(useDeletePaymentMethodMutation).mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    } as unknown as UseMutationResult<void, Error, string, unknown>)

    // Act
    const { result } = renderHook(() => usePaymentMethodList())

    // Assert
    expect(result.current.paymentMethods).toEqual([])
  })

  it('paymentMethodsがundefinedの場合は空配列を返す', () => {
    // Arrange
    vi.mocked(usePaymentMethodListQuery).mockReturnValue({
      data: undefined,
      isLoading: false,
      error: null,
    } as unknown as UseQueryResult<PaymentMethod[], Error>)

    vi.mocked(useSubscriptionListQuery).mockReturnValue({
      data: {
        subscriptions: [mockSubscription],
        totals: { monthlyTotal: 1200, yearlyTotal: 0 },
      },
      isLoading: false,
      error: null,
    } as unknown as UseQueryResult<SubscriptionList, Error>)

    vi.mocked(useDeletePaymentMethodMutation).mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    } as unknown as UseMutationResult<void, Error, string, unknown>)

    // Act
    const { result } = renderHook(() => usePaymentMethodList())

    // Assert
    expect(result.current.paymentMethods).toEqual([])
  })

  it('作成ボタンクリック時に作成ページに遷移', () => {
    // Arrange
    const pushMock = vi.fn()
    vi.mocked(useRouter).mockReturnValue({
      push: pushMock,
    } as unknown as ReturnType<typeof useRouter>)

    vi.mocked(usePaymentMethodListQuery).mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
    } as unknown as UseQueryResult<PaymentMethod[], Error>)

    vi.mocked(useSubscriptionListQuery).mockReturnValue({
      data: {
        subscriptions: [],
        totals: { monthlyTotal: 0, yearlyTotal: 0 },
      },
      isLoading: false,
      error: null,
    } as unknown as UseQueryResult<SubscriptionList, Error>)

    vi.mocked(useDeletePaymentMethodMutation).mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    } as unknown as UseMutationResult<void, Error, string, unknown>)

    const { result } = renderHook(() => usePaymentMethodList())

    // Act
    act(() => {
      result.current.handleCreate()
    })

    // Assert
    expect(pushMock).toHaveBeenCalledWith('/payment-methods/new')
  })

  it('編集ボタンクリック時に編集ページに遷移', () => {
    // Arrange
    const pushMock = vi.fn()
    vi.mocked(useRouter).mockReturnValue({
      push: pushMock,
    } as unknown as ReturnType<typeof useRouter>)

    vi.mocked(usePaymentMethodListQuery).mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
    } as unknown as UseQueryResult<PaymentMethod[], Error>)

    vi.mocked(useSubscriptionListQuery).mockReturnValue({
      data: {
        subscriptions: [],
        totals: { monthlyTotal: 0, yearlyTotal: 0 },
      },
      isLoading: false,
      error: null,
    } as unknown as UseQueryResult<SubscriptionList, Error>)

    vi.mocked(useDeletePaymentMethodMutation).mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    } as unknown as UseMutationResult<void, Error, string, unknown>)

    const { result } = renderHook(() => usePaymentMethodList())

    // Act
    act(() => {
      result.current.handleEdit('pm-1')
    })

    // Assert
    expect(pushMock).toHaveBeenCalledWith('/payment-methods/pm-1/edit')
  })

  it('削除リクエスト時に削除ターゲットを設定する', () => {
    // Arrange
    vi.mocked(usePaymentMethodListQuery).mockReturnValue({
      data: [mockPaymentMethod],
      isLoading: false,
      error: null,
    } as unknown as UseQueryResult<PaymentMethod[], Error>)

    vi.mocked(useSubscriptionListQuery).mockReturnValue({
      data: {
        subscriptions: [mockSubscription, mockSubscription2],
        totals: { monthlyTotal: 2180, yearlyTotal: 0 },
      },
      isLoading: false,
      error: null,
    } as unknown as UseQueryResult<SubscriptionList, Error>)

    vi.mocked(useDeletePaymentMethodMutation).mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    } as unknown as UseMutationResult<void, Error, string, unknown>)

    const { result } = renderHook(() => usePaymentMethodList())

    const paymentMethodWithUsage: PaymentMethodWithUsage = {
      ...mockPaymentMethod,
      usageCount: 2,
    }

    // Act
    act(() => {
      result.current.handleDeleteRequest(paymentMethodWithUsage)
    })

    // Assert
    expect(result.current.deleteTarget).toEqual({
      ...mockPaymentMethod,
      usageCount: 2,
    })
  })

  it('削除確認でキャンセル', () => {
    // Arrange
    vi.mocked(usePaymentMethodListQuery).mockReturnValue({
      data: [mockPaymentMethod],
      isLoading: false,
      error: null,
    } as unknown as UseQueryResult<PaymentMethod[], Error>)

    vi.mocked(useSubscriptionListQuery).mockReturnValue({
      data: {
        subscriptions: [],
        totals: { monthlyTotal: 0, yearlyTotal: 0 },
      },
      isLoading: false,
      error: null,
    } as unknown as UseQueryResult<SubscriptionList, Error>)

    vi.mocked(useDeletePaymentMethodMutation).mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    } as unknown as UseMutationResult<void, Error, string, unknown>)

    const { result } = renderHook(() => usePaymentMethodList())

    const paymentMethodWithUsage: PaymentMethodWithUsage = {
      ...mockPaymentMethod,
      usageCount: 0,
    }

    act(() => {
      result.current.handleDeleteRequest(paymentMethodWithUsage)
    })

    // Act
    act(() => {
      result.current.handleDeleteCancel()
    })

    // Assert
    expect(result.current.deleteTarget).toBeNull()
  })

  it('削除確認で削除実行', () => {
    // Arrange
    const mutateMock = vi.fn()
    vi.mocked(usePaymentMethodListQuery).mockReturnValue({
      data: [mockPaymentMethod],
      isLoading: false,
      error: null,
    } as unknown as UseQueryResult<PaymentMethod[], Error>)

    vi.mocked(useSubscriptionListQuery).mockReturnValue({
      data: {
        subscriptions: [],
        totals: { monthlyTotal: 0, yearlyTotal: 0 },
      },
      isLoading: false,
      error: null,
    } as unknown as UseQueryResult<SubscriptionList, Error>)

    vi.mocked(useDeletePaymentMethodMutation).mockReturnValue({
      mutate: mutateMock,
      isPending: false,
    } as unknown as UseMutationResult<void, Error, string, unknown>)

    const { result } = renderHook(() => usePaymentMethodList())

    const paymentMethodWithUsage: PaymentMethodWithUsage = {
      ...mockPaymentMethod,
      usageCount: 0,
    }

    act(() => {
      result.current.handleDeleteRequest(paymentMethodWithUsage)
    })

    // Act
    act(() => {
      result.current.handleDeleteConfirm()
    })

    // Assert
    expect(mutateMock).toHaveBeenCalledWith(
      'pm-1',
      expect.objectContaining({
        onSuccess: expect.any(Function),
      }),
    )
  })

  it('削除成功時にdeleteTargetをクリア', () => {
    // Arrange
    const mutateMock = vi.fn((_, options) => {
      options?.onSuccess?.()
    })
    vi.mocked(usePaymentMethodListQuery).mockReturnValue({
      data: [mockPaymentMethod],
      isLoading: false,
      error: null,
    } as unknown as UseQueryResult<PaymentMethod[], Error>)

    vi.mocked(useSubscriptionListQuery).mockReturnValue({
      data: {
        subscriptions: [],
        totals: { monthlyTotal: 0, yearlyTotal: 0 },
      },
      isLoading: false,
      error: null,
    } as unknown as UseQueryResult<SubscriptionList, Error>)

    vi.mocked(useDeletePaymentMethodMutation).mockReturnValue({
      mutate: mutateMock,
      isPending: false,
    } as unknown as UseMutationResult<void, Error, string, unknown>)

    const { result } = renderHook(() => usePaymentMethodList())

    const paymentMethodWithUsage: PaymentMethodWithUsage = {
      ...mockPaymentMethod,
      usageCount: 0,
    }

    act(() => {
      result.current.handleDeleteRequest(paymentMethodWithUsage)
    })

    // Act
    act(() => {
      result.current.handleDeleteConfirm()
    })

    // Assert
    expect(result.current.deleteTarget).toBeNull()
  })

  it('ローディング中はisLoadingがtrue', () => {
    // Arrange
    vi.mocked(usePaymentMethodListQuery).mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
    } as unknown as UseQueryResult<PaymentMethod[], Error>)

    vi.mocked(useSubscriptionListQuery).mockReturnValue({
      data: undefined,
      isLoading: false,
      error: null,
    } as unknown as UseQueryResult<SubscriptionList, Error>)

    vi.mocked(useDeletePaymentMethodMutation).mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    } as unknown as UseMutationResult<void, Error, string, unknown>)

    // Act
    const { result } = renderHook(() => usePaymentMethodList())

    // Assert
    expect(result.current.isLoading).toBe(true)
    expect(result.current.paymentMethods).toEqual([])
  })

  it('削除中はisDeletingがtrue', () => {
    // Arrange
    vi.mocked(usePaymentMethodListQuery).mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
    } as unknown as UseQueryResult<PaymentMethod[], Error>)

    vi.mocked(useSubscriptionListQuery).mockReturnValue({
      data: {
        subscriptions: [],
        totals: { monthlyTotal: 0, yearlyTotal: 0 },
      },
      isLoading: false,
      error: null,
    } as unknown as UseQueryResult<SubscriptionList, Error>)

    vi.mocked(useDeletePaymentMethodMutation).mockReturnValue({
      mutate: vi.fn(),
      isPending: true,
    } as unknown as UseMutationResult<void, Error, string, unknown>)

    // Act
    const { result } = renderHook(() => usePaymentMethodList())

    // Assert
    expect(result.current.isDeleting).toBe(true)
  })

  it('削除ターゲットの初期状態はnull', () => {
    // Arrange
    vi.mocked(usePaymentMethodListQuery).mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
    } as unknown as UseQueryResult<PaymentMethod[], Error>)

    vi.mocked(useSubscriptionListQuery).mockReturnValue({
      data: {
        subscriptions: [],
        totals: { monthlyTotal: 0, yearlyTotal: 0 },
      },
      isLoading: false,
      error: null,
    } as unknown as UseQueryResult<SubscriptionList, Error>)

    vi.mocked(useDeletePaymentMethodMutation).mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    } as unknown as UseMutationResult<void, Error, string, unknown>)

    // Act
    const { result } = renderHook(() => usePaymentMethodList())

    // Assert
    expect(result.current.deleteTarget).toBeNull()
  })
})
