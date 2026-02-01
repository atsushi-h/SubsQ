import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { usePaymentMethodListQuery } from './usePaymentMethodListQuery'

// 依存関係をモック
vi.mock('@/external/handler/payment-method/payment-method.query.action', () => ({
  listPaymentMethodsByUserIdQueryAction: vi.fn(),
}))

import { listPaymentMethodsByUserIdQueryAction } from '@/external/handler/payment-method/payment-method.query.action'

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

describe('usePaymentMethodListQuery', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('支払い方法一覧を取得する', async () => {
    // Arrange
    const mockData = [
      {
        id: 'pm-1',
        name: 'クレジットカード',
        userId: 'user-1',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      },
      {
        id: 'pm-2',
        name: '銀行振込',
        userId: 'user-1',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      },
    ]

    vi.mocked(listPaymentMethodsByUserIdQueryAction).mockResolvedValue(mockData)

    // Act
    const { result } = renderHook(() => usePaymentMethodListQuery(), {
      wrapper: createWrapper(),
    })

    // Assert
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toHaveLength(2)
    expect(result.current.data?.[0].name).toBe('クレジットカード')
  })

  it('エラー時はerrorが設定される', async () => {
    // Arrange
    const mockError = new Error('データの取得に失敗しました')
    vi.mocked(listPaymentMethodsByUserIdQueryAction).mockRejectedValue(mockError)

    // Act
    const { result } = renderHook(() => usePaymentMethodListQuery(), {
      wrapper: createWrapper(),
    })

    // Assert
    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(result.current.error).toEqual(mockError)
  })

  it('初期状態ではローディング中', () => {
    // Arrange
    vi.mocked(listPaymentMethodsByUserIdQueryAction).mockImplementation(() => new Promise(() => {}))

    // Act
    const { result } = renderHook(() => usePaymentMethodListQuery(), {
      wrapper: createWrapper(),
    })

    // Assert
    expect(result.current.isLoading).toBe(true)
    expect(result.current.data).toBeUndefined()
  })
})
