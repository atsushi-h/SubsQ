import { act, renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useSubscriptionDetail } from './useSubscriptionDetail'

// 依存関係をモック
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(() => ({
    push: vi.fn(),
  })),
}))

vi.mock('@/features/subscription/hooks/useSubscriptionDetailQuery', () => ({
  useSubscriptionDetailQuery: vi.fn(),
}))

vi.mock('@/features/subscription/hooks/useDeleteSubscriptionMutation', () => ({
  useDeleteSubscriptionMutation: vi.fn(),
}))

import { useRouter } from 'next/navigation'
import { useDeleteSubscriptionMutation } from '@/features/subscription/hooks/useDeleteSubscriptionMutation'
import { useSubscriptionDetailQuery } from '@/features/subscription/hooks/useSubscriptionDetailQuery'

describe('useSubscriptionDetail', () => {
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

  it('サブスクリプション詳細を取得する', () => {
    // Arrange
    vi.mocked(useSubscriptionDetailQuery).mockReturnValue({
      data: mockSubscription,
      isLoading: false,
      error: null,
    } as unknown as ReturnType<typeof useSubscriptionDetailQuery>)

    vi.mocked(useDeleteSubscriptionMutation).mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    } as unknown as ReturnType<typeof useDeleteSubscriptionMutation>)

    // Act
    const { result } = renderHook(() => useSubscriptionDetail('sub-1'))

    // Assert
    expect(result.current.subscription).toEqual(mockSubscription)
    expect(result.current.isLoading).toBe(false)
    expect(result.current.error).toBeNull()
  })

  it('ローディング中はisLoadingがtrue、subscriptionはundefined', () => {
    // Arrange
    vi.mocked(useSubscriptionDetailQuery).mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
    } as unknown as ReturnType<typeof useSubscriptionDetailQuery>)

    vi.mocked(useDeleteSubscriptionMutation).mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    } as unknown as ReturnType<typeof useDeleteSubscriptionMutation>)

    // Act
    const { result } = renderHook(() => useSubscriptionDetail('sub-1'))

    // Assert
    expect(result.current.isLoading).toBe(true)
    expect(result.current.subscription).toBeUndefined()
  })

  it('エラー時はerrorが設定される', () => {
    // Arrange
    const mockError = new Error('データの取得に失敗しました')
    vi.mocked(useSubscriptionDetailQuery).mockReturnValue({
      data: undefined,
      isLoading: false,
      error: mockError,
    } as unknown as ReturnType<typeof useSubscriptionDetailQuery>)

    vi.mocked(useDeleteSubscriptionMutation).mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    } as unknown as ReturnType<typeof useDeleteSubscriptionMutation>)

    // Act
    const { result } = renderHook(() => useSubscriptionDetail('sub-1'))

    // Assert
    expect(result.current.error).toEqual(mockError)
  })

  it('戻るボタンクリック時にサブスクリプション一覧ページに遷移する', () => {
    // Arrange
    const pushMock = vi.fn()
    vi.mocked(useRouter).mockReturnValue({
      push: pushMock,
    } as unknown as ReturnType<typeof useRouter>)

    vi.mocked(useSubscriptionDetailQuery).mockReturnValue({
      data: mockSubscription,
      isLoading: false,
      error: null,
    } as unknown as ReturnType<typeof useSubscriptionDetailQuery>)

    vi.mocked(useDeleteSubscriptionMutation).mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    } as unknown as ReturnType<typeof useDeleteSubscriptionMutation>)

    const { result } = renderHook(() => useSubscriptionDetail('sub-1'))

    // Act
    act(() => {
      result.current.handleBack()
    })

    // Assert
    expect(pushMock).toHaveBeenCalledWith('/subscriptions')
  })

  it('編集ボタンクリック時に編集ページに遷移する', () => {
    // Arrange
    const pushMock = vi.fn()
    vi.mocked(useRouter).mockReturnValue({
      push: pushMock,
    } as unknown as ReturnType<typeof useRouter>)

    vi.mocked(useSubscriptionDetailQuery).mockReturnValue({
      data: mockSubscription,
      isLoading: false,
      error: null,
    } as unknown as ReturnType<typeof useSubscriptionDetailQuery>)

    vi.mocked(useDeleteSubscriptionMutation).mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    } as unknown as ReturnType<typeof useDeleteSubscriptionMutation>)

    const { result } = renderHook(() => useSubscriptionDetail('sub-1'))

    // Act
    act(() => {
      result.current.handleEdit()
    })

    // Assert
    expect(pushMock).toHaveBeenCalledWith('/subscriptions/sub-1/edit')
  })

  it('削除ボタンクリック時に削除確認ダイアログを表示する', () => {
    // Arrange
    vi.mocked(useSubscriptionDetailQuery).mockReturnValue({
      data: mockSubscription,
      isLoading: false,
      error: null,
    } as unknown as ReturnType<typeof useSubscriptionDetailQuery>)

    vi.mocked(useDeleteSubscriptionMutation).mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    } as unknown as ReturnType<typeof useDeleteSubscriptionMutation>)

    const { result } = renderHook(() => useSubscriptionDetail('sub-1'))

    // Act
    act(() => {
      result.current.handleDeleteRequest()
    })

    // Assert
    expect(result.current.showDeleteConfirm).toBe(true)
  })

  it('削除確認ダイアログでキャンセルを選択した場合、ダイアログを閉じる', () => {
    // Arrange
    vi.mocked(useSubscriptionDetailQuery).mockReturnValue({
      data: mockSubscription,
      isLoading: false,
      error: null,
    } as unknown as ReturnType<typeof useSubscriptionDetailQuery>)

    vi.mocked(useDeleteSubscriptionMutation).mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    } as unknown as ReturnType<typeof useDeleteSubscriptionMutation>)

    const { result } = renderHook(() => useSubscriptionDetail('sub-1'))

    // 削除確認ダイアログを表示
    act(() => {
      result.current.handleDeleteRequest()
    })

    expect(result.current.showDeleteConfirm).toBe(true)

    // Act
    act(() => {
      result.current.handleDeleteCancel()
    })

    // Assert
    expect(result.current.showDeleteConfirm).toBe(false)
  })

  it('削除確認ダイアログで確認を選択した場合、削除処理を実行する', () => {
    // Arrange
    const mutateMock = vi.fn()
    vi.mocked(useSubscriptionDetailQuery).mockReturnValue({
      data: mockSubscription,
      isLoading: false,
      error: null,
    } as unknown as ReturnType<typeof useSubscriptionDetailQuery>)

    vi.mocked(useDeleteSubscriptionMutation).mockReturnValue({
      mutate: mutateMock,
      isPending: false,
    } as unknown as ReturnType<typeof useDeleteSubscriptionMutation>)

    const { result } = renderHook(() => useSubscriptionDetail('sub-1'))

    // Act
    act(() => {
      result.current.handleDeleteConfirm()
    })

    // Assert
    expect(mutateMock).toHaveBeenCalledWith('sub-1', {
      onSuccess: expect.any(Function),
    })
  })

  it('削除成功時にサブスクリプション一覧ページに遷移する', () => {
    // Arrange
    const pushMock = vi.fn()
    vi.mocked(useRouter).mockReturnValue({
      push: pushMock,
    } as unknown as ReturnType<typeof useRouter>)

    const mutateMock = vi.fn((_id, options) => {
      options?.onSuccess?.()
    })

    vi.mocked(useSubscriptionDetailQuery).mockReturnValue({
      data: mockSubscription,
      isLoading: false,
      error: null,
    } as unknown as ReturnType<typeof useSubscriptionDetailQuery>)

    vi.mocked(useDeleteSubscriptionMutation).mockReturnValue({
      mutate: mutateMock,
      isPending: false,
    } as unknown as ReturnType<typeof useDeleteSubscriptionMutation>)

    const { result } = renderHook(() => useSubscriptionDetail('sub-1'))

    // Act
    act(() => {
      result.current.handleDeleteConfirm()
    })

    // Assert
    expect(pushMock).toHaveBeenCalledWith('/subscriptions')
  })

  it('削除処理中はisDeletingがtrueを返す', () => {
    // Arrange
    vi.mocked(useSubscriptionDetailQuery).mockReturnValue({
      data: mockSubscription,
      isLoading: false,
      error: null,
    } as unknown as ReturnType<typeof useSubscriptionDetailQuery>)

    vi.mocked(useDeleteSubscriptionMutation).mockReturnValue({
      mutate: vi.fn(),
      isPending: true,
    } as unknown as ReturnType<typeof useDeleteSubscriptionMutation>)

    // Act
    const { result } = renderHook(() => useSubscriptionDetail('sub-1'))

    // Assert
    expect(result.current.isDeleting).toBe(true)
  })

  it('削除確認ダイアログの初期状態はfalse', () => {
    // Arrange
    vi.mocked(useSubscriptionDetailQuery).mockReturnValue({
      data: mockSubscription,
      isLoading: false,
      error: null,
    } as unknown as ReturnType<typeof useSubscriptionDetailQuery>)

    vi.mocked(useDeleteSubscriptionMutation).mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    } as unknown as ReturnType<typeof useDeleteSubscriptionMutation>)

    // Act
    const { result } = renderHook(() => useSubscriptionDetail('sub-1'))

    // Assert
    expect(result.current.showDeleteConfirm).toBe(false)
  })
})
