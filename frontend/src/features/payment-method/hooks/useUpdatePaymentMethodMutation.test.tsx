import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useUpdatePaymentMethodMutation } from './useUpdatePaymentMethodMutation'

// 依存関係をモック
vi.mock('@/external/handler/payment-method/payment-method.command.action', () => ({
  updatePaymentMethodCommandAction: vi.fn(),
}))

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}))

import { toast } from 'sonner'
import { updatePaymentMethodCommandAction } from '@/external/handler/payment-method/payment-method.command.action'

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

describe('useUpdatePaymentMethodMutation', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('支払い方法を更新する', async () => {
    // Arrange
    const mockData = {
      id: 'pm-1',
      name: 'デビットカード',
    }

    const mockResponse = {
      id: 'pm-1',
      name: 'デビットカード',
      userId: 'user-1',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-10T00:00:00Z',
    }

    vi.mocked(updatePaymentMethodCommandAction).mockResolvedValue(mockResponse)

    // Act
    const { result } = renderHook(() => useUpdatePaymentMethodMutation(), {
      wrapper: createWrapper(),
    })

    result.current.mutate(mockData)

    // Assert
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(updatePaymentMethodCommandAction).toHaveBeenCalledWith(mockData)
  })

  it('更新成功時に成功トーストを表示する', async () => {
    // Arrange
    const mockData = {
      id: 'pm-1',
      name: 'デビットカード',
    }

    vi.mocked(updatePaymentMethodCommandAction).mockResolvedValue({
      id: 'pm-1',
      name: 'デビットカード',
      userId: 'user-1',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-10T00:00:00Z',
    })

    // Act
    const { result } = renderHook(() => useUpdatePaymentMethodMutation(), {
      wrapper: createWrapper(),
    })

    result.current.mutate(mockData)

    // Assert
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(toast.success).toHaveBeenCalledWith('支払い方法を更新しました')
  })

  it('更新失敗時にエラートーストを表示する', async () => {
    // Arrange
    const mockData = {
      id: 'pm-1',
      name: 'デビットカード',
    }

    const mockError = new Error('サーバーエラーが発生しました')
    vi.mocked(updatePaymentMethodCommandAction).mockRejectedValue(mockError)

    // Act
    const { result } = renderHook(() => useUpdatePaymentMethodMutation(), {
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
      id: 'pm-1',
      name: 'デビットカード',
    }

    const mockError = new Error()
    vi.mocked(updatePaymentMethodCommandAction).mockRejectedValue(mockError)

    // Act
    const { result } = renderHook(() => useUpdatePaymentMethodMutation(), {
      wrapper: createWrapper(),
    })

    result.current.mutate(mockData)

    // Assert
    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(toast.error).toHaveBeenCalledWith('更新に失敗しました')
  })

  it('更新処理中はisPendingがtrueになる', async () => {
    // Arrange
    const mockData = {
      id: 'pm-1',
      name: 'デビットカード',
    }

    vi.mocked(updatePaymentMethodCommandAction).mockImplementation(() => new Promise(() => {}))

    // Act
    const { result } = renderHook(() => useUpdatePaymentMethodMutation(), {
      wrapper: createWrapper(),
    })

    result.current.mutate(mockData)

    // Assert
    await waitFor(() => expect(result.current.isPending).toBe(true))
  })
})
