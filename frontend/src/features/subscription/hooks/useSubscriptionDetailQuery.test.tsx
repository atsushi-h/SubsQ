import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useSubscriptionDetailQuery } from './useSubscriptionDetailQuery'

// 依存関係をモック
vi.mock('@/external/handler/subscription/subscription.query.action', () => ({
  getSubscriptionByIdQueryAction: vi.fn(),
}))

import { getSubscriptionByIdQueryAction } from '@/external/handler/subscription/subscription.query.action'

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

describe('useSubscriptionDetailQuery', () => {
  const mockSubscription = {
    id: 'sub-1',
    serviceName: 'Netflix',
    amount: 1200,
    billingCycle: 'monthly' as const,
    userId: 'user-1',
    baseDate: '2024-01-01T00:00:00Z',
    paymentMethod: { id: 'pm-1', name: 'クレジットカード' },
    memo: 'テストメモ',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('サブスクリプション詳細を取得する', async () => {
    // Arrange
    vi.mocked(getSubscriptionByIdQueryAction).mockResolvedValue(mockSubscription)

    // Act
    const { result } = renderHook(() => useSubscriptionDetailQuery('sub-1'), {
      wrapper: createWrapper(),
    })

    // Assert
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual(mockSubscription)
  })

  it('IDがundefinedの場合はクエリを実行しない', () => {
    // Arrange
    vi.mocked(getSubscriptionByIdQueryAction).mockResolvedValue(mockSubscription)

    // Act
    const { result } = renderHook(() => useSubscriptionDetailQuery(undefined), {
      wrapper: createWrapper(),
    })

    // Assert
    expect(result.current.data).toBeUndefined()
    expect(result.current.isLoading).toBe(false)
    expect(getSubscriptionByIdQueryAction).not.toHaveBeenCalled()
  })

  it('IDが空文字列の場合はクエリを実行しない', () => {
    // Arrange
    vi.mocked(getSubscriptionByIdQueryAction).mockResolvedValue(mockSubscription)

    // Act
    const { result } = renderHook(() => useSubscriptionDetailQuery(''), {
      wrapper: createWrapper(),
    })

    // Assert
    expect(result.current.data).toBeUndefined()
    expect(result.current.isLoading).toBe(false)
    expect(getSubscriptionByIdQueryAction).not.toHaveBeenCalled()
  })

  it('エラー時はerrorが設定される', async () => {
    // Arrange
    const mockError = new Error('データの取得に失敗しました')
    vi.mocked(getSubscriptionByIdQueryAction).mockRejectedValue(mockError)

    // Act
    const { result } = renderHook(() => useSubscriptionDetailQuery('sub-1'), {
      wrapper: createWrapper(),
    })

    // Assert
    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(result.current.error).toEqual(mockError)
  })

  it('初期状態ではローディング中', () => {
    // Arrange
    vi.mocked(getSubscriptionByIdQueryAction).mockImplementation(() => new Promise(() => {}))

    // Act
    const { result } = renderHook(() => useSubscriptionDetailQuery('sub-1'), {
      wrapper: createWrapper(),
    })

    // Assert
    expect(result.current.isLoading).toBe(true)
    expect(result.current.data).toBeUndefined()
  })
})
