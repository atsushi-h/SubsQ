import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useCreateSubscriptionMutation } from './useCreateSubscriptionMutation'

// 依存関係をモック
vi.mock('@/external/handler/subscription/subscription.command.action', () => ({
  createSubscriptionCommandAction: vi.fn(),
}))

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}))

import { toast } from 'sonner'
import { createSubscriptionCommandAction } from '@/external/handler/subscription/subscription.command.action'

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

describe('useCreateSubscriptionMutation', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('サブスクリプションを作成する', async () => {
    // Arrange
    const mockData = {
      serviceName: 'Netflix',
      amount: 1200,
      billingCycle: 'monthly' as const,
      baseDate: '2024-01-01T00:00:00.000Z',
      paymentMethodId: 'pm-1',
      memo: 'テストメモ',
    }

    const mockResponse = {
      id: 'sub-1',
      ...mockData,
      userId: 'user-1',
      paymentMethod: { id: 'pm-1', name: 'クレジットカード' },
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    }

    vi.mocked(createSubscriptionCommandAction).mockResolvedValue(mockResponse)

    // Act
    const { result } = renderHook(() => useCreateSubscriptionMutation(), {
      wrapper: createWrapper(),
    })

    result.current.mutate(mockData)

    // Assert
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(createSubscriptionCommandAction).toHaveBeenCalledWith(mockData)
  })

  it('作成成功時に成功トーストを表示する', async () => {
    // Arrange
    const mockData = {
      serviceName: 'Netflix',
      amount: 1200,
      billingCycle: 'monthly' as const,
      baseDate: '2024-01-01T00:00:00.000Z',
      paymentMethodId: null,
    }

    vi.mocked(createSubscriptionCommandAction).mockResolvedValue({
      id: 'sub-1',
      ...mockData,
      userId: 'user-1',
      paymentMethod: null,
      memo: '',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    })

    // Act
    const { result } = renderHook(() => useCreateSubscriptionMutation(), {
      wrapper: createWrapper(),
    })

    result.current.mutate(mockData)

    // Assert
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(toast.success).toHaveBeenCalledWith('サブスクリプションを作成しました')
  })

  it('作成失敗時にエラートーストを表示する', async () => {
    // Arrange
    const mockData = {
      serviceName: 'Netflix',
      amount: 1200,
      billingCycle: 'monthly' as const,
      baseDate: '2024-01-01T00:00:00.000Z',
      paymentMethodId: null,
    }

    const mockError = new Error('サーバーエラーが発生しました')
    vi.mocked(createSubscriptionCommandAction).mockRejectedValue(mockError)

    // Act
    const { result } = renderHook(() => useCreateSubscriptionMutation(), {
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
      serviceName: 'Netflix',
      amount: 1200,
      billingCycle: 'monthly' as const,
      baseDate: '2024-01-01T00:00:00.000Z',
      paymentMethodId: null,
    }

    const mockError = new Error()
    vi.mocked(createSubscriptionCommandAction).mockRejectedValue(mockError)

    // Act
    const { result } = renderHook(() => useCreateSubscriptionMutation(), {
      wrapper: createWrapper(),
    })

    result.current.mutate(mockData)

    // Assert
    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(toast.error).toHaveBeenCalledWith('作成に失敗しました')
  })

  it('作成処理中はisPendingがtrueになる', async () => {
    // Arrange
    const mockData = {
      serviceName: 'Netflix',
      amount: 1200,
      billingCycle: 'monthly' as const,
      baseDate: '2024-01-01T00:00:00.000Z',
      paymentMethodId: null,
    }

    vi.mocked(createSubscriptionCommandAction).mockImplementation(() => new Promise(() => {}))

    // Act
    const { result } = renderHook(() => useCreateSubscriptionMutation(), {
      wrapper: createWrapper(),
    })

    result.current.mutate(mockData)

    // Assert
    await waitFor(() => expect(result.current.isPending).toBe(true))
  })
})
