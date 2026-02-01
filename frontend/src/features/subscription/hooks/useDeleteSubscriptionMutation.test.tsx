import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useDeleteSubscriptionMutation } from './useDeleteSubscriptionMutation'

// 依存関係をモック
vi.mock('@/external/handler/subscription/subscription.command.action', () => ({
  deleteSubscriptionCommandAction: vi.fn(),
}))

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}))

import { toast } from 'sonner'
import { deleteSubscriptionCommandAction } from '@/external/handler/subscription/subscription.command.action'

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

describe('useDeleteSubscriptionMutation', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('サブスクリプションを削除する', async () => {
    // Arrange
    vi.mocked(deleteSubscriptionCommandAction).mockResolvedValue(undefined)

    // Act
    const { result } = renderHook(() => useDeleteSubscriptionMutation(), {
      wrapper: createWrapper(),
    })

    result.current.mutate('sub-1')

    // Assert
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(deleteSubscriptionCommandAction).toHaveBeenCalledWith('sub-1')
  })

  it('削除成功時に成功トーストを表示する', async () => {
    // Arrange
    vi.mocked(deleteSubscriptionCommandAction).mockResolvedValue(undefined)

    // Act
    const { result } = renderHook(() => useDeleteSubscriptionMutation(), {
      wrapper: createWrapper(),
    })

    result.current.mutate('sub-1')

    // Assert
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(toast.success).toHaveBeenCalledWith('サブスクリプションを削除しました')
  })

  it('削除失敗時にエラートーストを表示する', async () => {
    // Arrange
    const mockError = new Error('サーバーエラーが発生しました')
    vi.mocked(deleteSubscriptionCommandAction).mockRejectedValue(mockError)

    // Act
    const { result } = renderHook(() => useDeleteSubscriptionMutation(), {
      wrapper: createWrapper(),
    })

    result.current.mutate('sub-1')

    // Assert
    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(toast.error).toHaveBeenCalledWith('サーバーエラーが発生しました')
  })

  it('エラーメッセージがない場合はデフォルトメッセージを表示する', async () => {
    // Arrange
    const mockError = new Error()
    vi.mocked(deleteSubscriptionCommandAction).mockRejectedValue(mockError)

    // Act
    const { result } = renderHook(() => useDeleteSubscriptionMutation(), {
      wrapper: createWrapper(),
    })

    result.current.mutate('sub-1')

    // Assert
    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(toast.error).toHaveBeenCalledWith('削除に失敗しました')
  })

  it('削除処理中はisPendingがtrueになる', async () => {
    // Arrange
    vi.mocked(deleteSubscriptionCommandAction).mockImplementation(() => new Promise(() => {}))

    // Act
    const { result } = renderHook(() => useDeleteSubscriptionMutation(), {
      wrapper: createWrapper(),
    })

    result.current.mutate('sub-1')

    // Assert
    await waitFor(() => expect(result.current.isPending).toBe(true))
  })
})
