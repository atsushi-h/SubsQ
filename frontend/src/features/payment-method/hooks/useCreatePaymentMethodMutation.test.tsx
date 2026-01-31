import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useCreatePaymentMethodMutation } from './useCreatePaymentMethodMutation'

// 依存関係をモック
vi.mock('@/external/handler/payment-method/payment-method.command.action', () => ({
  createPaymentMethodCommandAction: vi.fn(),
}))

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}))

import { toast } from 'sonner'
import { createPaymentMethodCommandAction } from '@/external/handler/payment-method/payment-method.command.action'

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      mutations: { retry: false },
    },
  })
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}

describe('useCreatePaymentMethodMutation', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('支払い方法を作成する', async () => {
    // Arrange
    const mockData = {
      name: 'クレジットカード',
    }

    const mockResponse = {
      id: 'pm-1',
      name: 'クレジットカード',
      userId: 'user-1',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    }

    vi.mocked(createPaymentMethodCommandAction).mockResolvedValue(mockResponse)

    // Act
    const { result } = renderHook(() => useCreatePaymentMethodMutation(), {
      wrapper: createWrapper(),
    })

    result.current.mutate(mockData)

    // Assert
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(createPaymentMethodCommandAction).toHaveBeenCalledWith(mockData)
  })

  it('作成成功時に成功トーストを表示する', async () => {
    // Arrange
    const mockData = {
      name: 'クレジットカード',
    }

    vi.mocked(createPaymentMethodCommandAction).mockResolvedValue({
      id: 'pm-1',
      name: 'クレジットカード',
      userId: 'user-1',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    })

    // Act
    const { result } = renderHook(() => useCreatePaymentMethodMutation(), {
      wrapper: createWrapper(),
    })

    result.current.mutate(mockData)

    // Assert
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(toast.success).toHaveBeenCalledWith('支払い方法を追加しました')
  })

  it('作成失敗時にエラートーストを表示する', async () => {
    // Arrange
    const mockData = {
      name: 'クレジットカード',
    }

    const mockError = new Error('サーバーエラーが発生しました')
    vi.mocked(createPaymentMethodCommandAction).mockRejectedValue(mockError)

    // Act
    const { result } = renderHook(() => useCreatePaymentMethodMutation(), {
      wrapper: createWrapper(),
    })

    result.current.mutate(mockData)

    // Assert
    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(toast.error).toHaveBeenCalledWith('サーバーエラーが発生しました')
  })

  it('エラーメッセージがない場合はデフォルトメッセージを表示する', async () => {
    // Arrange
    const mockData = {
      name: 'クレジットカード',
    }

    const mockError = new Error()
    vi.mocked(createPaymentMethodCommandAction).mockRejectedValue(mockError)

    // Act
    const { result } = renderHook(() => useCreatePaymentMethodMutation(), {
      wrapper: createWrapper(),
    })

    result.current.mutate(mockData)

    // Assert
    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(toast.error).toHaveBeenCalledWith('追加に失敗しました')
  })

  it('作成処理中はisPendingがtrueになる', async () => {
    // Arrange
    const mockData = {
      name: 'クレジットカード',
    }

    vi.mocked(createPaymentMethodCommandAction).mockImplementation(() => new Promise(() => {}))

    // Act
    const { result } = renderHook(() => useCreatePaymentMethodMutation(), {
      wrapper: createWrapper(),
    })

    result.current.mutate(mockData)

    // Assert
    await waitFor(() => expect(result.current.isPending).toBe(true))
  })
})
