import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useUpdateSubscriptionMutation } from './useUpdateSubscriptionMutation'

// 依存関係をモック
vi.mock('@/external/handler/subscription/subscription.command.action', () => ({
  updateSubscriptionCommandAction: vi.fn(),
}))

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}))

import { toast } from 'sonner'
import { updateSubscriptionCommandAction } from '@/external/handler/subscription/subscription.command.action'

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

describe('useUpdateSubscriptionMutation', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('サブスクリプションを更新する', async () => {
    // Arrange
    const mockData = {
      id: 'sub-1',
      serviceName: 'Netflix Premium',
      amount: 1500,
      billingCycle: 'monthly' as const,
      baseDate: '2024-01-01T00:00:00.000Z',
      paymentMethodId: 'pm-2',
      memo: '更新後のメモ',
    }

    const mockResponse = {
      ...mockData,
      userId: 'user-1',
      paymentMethod: { id: 'pm-2', name: '銀行振込' },
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-10T00:00:00Z',
    }

    vi.mocked(updateSubscriptionCommandAction).mockResolvedValue(mockResponse)

    // Act
    const { result } = renderHook(() => useUpdateSubscriptionMutation(), {
      wrapper: createWrapper(),
    })

    result.current.mutate(mockData)

    // Assert
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(updateSubscriptionCommandAction).toHaveBeenCalledWith(mockData)
  })

  it('更新成功時に成功トーストを表示する', async () => {
    // Arrange
    const mockData = {
      id: 'sub-1',
      serviceName: 'Netflix',
      amount: 1200,
      billingCycle: 'monthly' as const,
      baseDate: '2024-01-01T00:00:00.000Z',
      paymentMethodId: null,
    }

    vi.mocked(updateSubscriptionCommandAction).mockResolvedValue({
      ...mockData,
      userId: 'user-1',
      paymentMethod: null,
      memo: '',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-10T00:00:00Z',
    })

    // Act
    const { result } = renderHook(() => useUpdateSubscriptionMutation(), {
      wrapper: createWrapper(),
    })

    result.current.mutate(mockData)

    // Assert
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(toast.success).toHaveBeenCalledWith('サブスクリプションを更新しました')
  })

  it('更新失敗時にエラートーストを表示する', async () => {
    // Arrange
    const mockData = {
      id: 'sub-1',
      serviceName: 'Netflix',
      amount: 1200,
      billingCycle: 'monthly' as const,
      baseDate: '2024-01-01T00:00:00.000Z',
      paymentMethodId: null,
    }

    const mockError = new Error('サーバーエラーが発生しました')
    vi.mocked(updateSubscriptionCommandAction).mockRejectedValue(mockError)

    // Act
    const { result } = renderHook(() => useUpdateSubscriptionMutation(), {
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
      id: 'sub-1',
      serviceName: 'Netflix',
      amount: 1200,
      billingCycle: 'monthly' as const,
      baseDate: '2024-01-01T00:00:00.000Z',
      paymentMethodId: null,
    }

    const mockError = new Error()
    vi.mocked(updateSubscriptionCommandAction).mockRejectedValue(mockError)

    // Act
    const { result } = renderHook(() => useUpdateSubscriptionMutation(), {
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
      id: 'sub-1',
      serviceName: 'Netflix',
      amount: 1200,
      billingCycle: 'monthly' as const,
      baseDate: '2024-01-01T00:00:00.000Z',
      paymentMethodId: null,
    }

    vi.mocked(updateSubscriptionCommandAction).mockImplementation(() => new Promise(() => {}))

    // Act
    const { result } = renderHook(() => useUpdateSubscriptionMutation(), {
      wrapper: createWrapper(),
    })

    result.current.mutate(mockData)

    // Assert
    await waitFor(() => expect(result.current.isPending).toBe(true))
  })
})
