import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useSubscriptionListQuery } from './useSubscriptionListQuery'

// 依存関係をモック
vi.mock('@/external/handler/subscription/subscription.query.action', () => ({
  listSubscriptionsByUserIdQueryAction: vi.fn(),
}))

import { listSubscriptionsByUserIdQueryAction } from '@/external/handler/subscription/subscription.query.action'

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  })
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}

describe('useSubscriptionListQuery', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('サブスクリプション一覧を取得する', async () => {
    // Arrange
    const mockData = {
      subscriptions: [
        {
          id: 'sub-1',
          serviceName: 'Netflix',
          amount: 1200,
          billingCycle: 'monthly' as const,
          userId: 'user-1',
          baseDate: '2024-01-01T00:00:00Z',
          paymentMethod: null,
          memo: '',
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
        },
        {
          id: 'sub-2',
          serviceName: 'Spotify',
          amount: 980,
          billingCycle: 'monthly' as const,
          userId: 'user-1',
          baseDate: '2024-01-01T00:00:00Z',
          paymentMethod: null,
          memo: '',
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
        },
      ],
      totals: { monthlyTotal: 2180, yearlyTotal: 0 },
    }

    vi.mocked(listSubscriptionsByUserIdQueryAction).mockResolvedValue(mockData)

    // Act
    const { result } = renderHook(() => useSubscriptionListQuery(), {
      wrapper: createWrapper(),
    })

    // Assert
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data?.subscriptions).toHaveLength(2)
    expect(result.current.data?.totals.monthlyTotal).toBe(2180)
  })

  it('エラー時はerrorが設定される', async () => {
    // Arrange
    const mockError = new Error('データの取得に失敗しました')
    vi.mocked(listSubscriptionsByUserIdQueryAction).mockRejectedValue(mockError)

    // Act
    const { result } = renderHook(() => useSubscriptionListQuery(), {
      wrapper: createWrapper(),
    })

    // Assert
    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(result.current.error).toEqual(mockError)
  })

  it('初期状態ではローディング中', () => {
    // Arrange
    vi.mocked(listSubscriptionsByUserIdQueryAction).mockImplementation(() => new Promise(() => {}))

    // Act
    const { result } = renderHook(() => useSubscriptionListQuery(), {
      wrapper: createWrapper(),
    })

    // Assert
    expect(result.current.isLoading).toBe(true)
    expect(result.current.data).toBeUndefined()
  })
})
