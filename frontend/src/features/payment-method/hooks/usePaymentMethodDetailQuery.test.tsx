import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { usePaymentMethodDetailQuery } from './usePaymentMethodDetailQuery'

// 依存関係をモック
vi.mock('@/external/handler/payment-method/payment-method.query.action', () => ({
  getPaymentMethodByIdQueryAction: vi.fn(),
}))

import { getPaymentMethodByIdQueryAction } from '@/external/handler/payment-method/payment-method.query.action'

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

describe('usePaymentMethodDetailQuery', () => {
  const mockPaymentMethod = {
    id: 'pm-1',
    name: 'クレジットカード',
    userId: 'user-1',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('支払い方法詳細を取得する', async () => {
    // Arrange
    vi.mocked(getPaymentMethodByIdQueryAction).mockResolvedValue(mockPaymentMethod)

    // Act
    const { result } = renderHook(() => usePaymentMethodDetailQuery('pm-1'), {
      wrapper: createWrapper(),
    })

    // Assert
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual(mockPaymentMethod)
  })

  it('IDがundefinedの場合はクエリを実行しない', () => {
    // Arrange
    vi.mocked(getPaymentMethodByIdQueryAction).mockResolvedValue(mockPaymentMethod)

    // Act
    const { result } = renderHook(() => usePaymentMethodDetailQuery(undefined), {
      wrapper: createWrapper(),
    })

    // Assert
    expect(result.current.data).toBeUndefined()
    expect(result.current.isLoading).toBe(false)
    expect(getPaymentMethodByIdQueryAction).not.toHaveBeenCalled()
  })

  it('IDが空文字列の場合はクエリを実行しない', () => {
    // Arrange
    vi.mocked(getPaymentMethodByIdQueryAction).mockResolvedValue(mockPaymentMethod)

    // Act
    const { result } = renderHook(() => usePaymentMethodDetailQuery(''), {
      wrapper: createWrapper(),
    })

    // Assert
    expect(result.current.data).toBeUndefined()
    expect(result.current.isLoading).toBe(false)
    expect(getPaymentMethodByIdQueryAction).not.toHaveBeenCalled()
  })

  it('エラー時はerrorが設定される', async () => {
    // Arrange
    const mockError = new Error('データの取得に失敗しました')
    vi.mocked(getPaymentMethodByIdQueryAction).mockRejectedValue(mockError)

    // Act
    const { result } = renderHook(() => usePaymentMethodDetailQuery('pm-1'), {
      wrapper: createWrapper(),
    })

    // Assert
    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(result.current.error).toEqual(mockError)
  })

  it('初期状態ではローディング中', () => {
    // Arrange
    vi.mocked(getPaymentMethodByIdQueryAction).mockImplementation(() => new Promise(() => {}))

    // Act
    const { result } = renderHook(() => usePaymentMethodDetailQuery('pm-1'), {
      wrapper: createWrapper(),
    })

    // Assert
    expect(result.current.isLoading).toBe(true)
    expect(result.current.data).toBeUndefined()
  })
})
