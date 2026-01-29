import type { UseMutationResult, UseQueryResult } from '@tanstack/react-query'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type {
  Subscription,
  SubscriptionList,
} from '@/features/subscription/types/subscription.types'
import { act, renderHook } from '@/test/test-utils'
import { useSubscriptionList } from './useSubscriptionList'

vi.mock('@/features/subscription/hooks/useSubscriptionListQuery')
vi.mock('@/features/subscription/hooks/useDeleteSubscriptionMutation')

import { useDeleteSubscriptionMutation } from '@/features/subscription/hooks/useDeleteSubscriptionMutation'
import { useSubscriptionListQuery } from '@/features/subscription/hooks/useSubscriptionListQuery'

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

describe('useSubscriptionList', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('サブスクリプション一覧を取得する', () => {
    vi.mocked(useSubscriptionListQuery).mockReturnValue({
      data: {
        subscriptions: [mockSubscription],
        totals: { monthlyTotal: 1200, yearlyTotal: 0 },
      },
      isLoading: false,
      error: null,
    } as UseQueryResult<SubscriptionList, Error>)

    vi.mocked(useDeleteSubscriptionMutation).mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    } as unknown as UseMutationResult<void, Error, string, unknown>)

    const { result } = renderHook(() => useSubscriptionList())

    expect(result.current.subscriptions).toHaveLength(1)
    expect(result.current.subscriptions[0].serviceName).toBe('Netflix')
    expect(result.current.totals?.monthlyTotal).toBe(1200)
  })

  it('データがない場合は空配列を返す', () => {
    vi.mocked(useSubscriptionListQuery).mockReturnValue({
      data: undefined,
      isLoading: false,
      error: null,
    } as UseQueryResult<SubscriptionList, Error>)

    vi.mocked(useDeleteSubscriptionMutation).mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    } as unknown as UseMutationResult<void, Error, string, unknown>)

    const { result } = renderHook(() => useSubscriptionList())

    expect(result.current.subscriptions).toEqual([])
    expect(result.current.totals).toBeUndefined()
  })

  it('削除確認ダイアログを開く', () => {
    vi.mocked(useSubscriptionListQuery).mockReturnValue({
      data: undefined,
      isLoading: false,
      error: null,
    } as UseQueryResult<SubscriptionList, Error>)

    vi.mocked(useDeleteSubscriptionMutation).mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    } as unknown as UseMutationResult<void, Error, string, unknown>)

    const { result } = renderHook(() => useSubscriptionList())

    act(() => {
      result.current.handleDeleteRequest(mockSubscription)
    })

    expect(result.current.deleteTarget).toEqual(mockSubscription)
  })

  it('削除確認ダイアログをキャンセル', () => {
    vi.mocked(useSubscriptionListQuery).mockReturnValue({
      data: undefined,
      isLoading: false,
      error: null,
    } as UseQueryResult<SubscriptionList, Error>)

    vi.mocked(useDeleteSubscriptionMutation).mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    } as unknown as UseMutationResult<void, Error, string, unknown>)

    const { result } = renderHook(() => useSubscriptionList())

    act(() => {
      result.current.handleDeleteRequest(mockSubscription)
    })

    act(() => {
      result.current.handleDeleteCancel()
    })

    expect(result.current.deleteTarget).toBeNull()
  })

  it('削除確認で削除を実行', () => {
    const mutateMock = vi.fn()
    vi.mocked(useSubscriptionListQuery).mockReturnValue({
      data: undefined,
      isLoading: false,
      error: null,
    } as UseQueryResult<SubscriptionList, Error>)

    vi.mocked(useDeleteSubscriptionMutation).mockReturnValue({
      mutate: mutateMock,
      isPending: false,
    } as unknown as UseMutationResult<void, Error, string, unknown>)

    const { result } = renderHook(() => useSubscriptionList())

    act(() => {
      result.current.handleDeleteRequest(mockSubscription)
    })

    act(() => {
      result.current.handleDeleteConfirm()
    })

    expect(mutateMock).toHaveBeenCalledWith(
      'sub-1',
      expect.objectContaining({
        onSuccess: expect.any(Function),
      }),
    )
  })

  it('ローディング中はisLoadingがtrue', () => {
    vi.mocked(useSubscriptionListQuery).mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
    } as UseQueryResult<SubscriptionList, Error>)

    vi.mocked(useDeleteSubscriptionMutation).mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    } as unknown as UseMutationResult<void, Error, string, unknown>)

    const { result } = renderHook(() => useSubscriptionList())

    expect(result.current.isLoading).toBe(true)
    expect(result.current.subscriptions).toEqual([])
  })

  it('削除中はisDeletingがtrue', () => {
    vi.mocked(useSubscriptionListQuery).mockReturnValue({
      data: undefined,
      isLoading: false,
      error: null,
    } as UseQueryResult<SubscriptionList, Error>)

    vi.mocked(useDeleteSubscriptionMutation).mockReturnValue({
      mutate: vi.fn(),
      isPending: true,
    } as unknown as UseMutationResult<void, Error, string, unknown>)

    const { result } = renderHook(() => useSubscriptionList())

    expect(result.current.isDeleting).toBe(true)
  })
})
