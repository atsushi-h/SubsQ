import { act, renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { usePaymentMethodForm } from './usePaymentMethodForm'

// 依存関係をモック
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(() => ({
    push: vi.fn(),
  })),
}))

vi.mock('@/features/payment-method/hooks/usePaymentMethodDetailQuery', () => ({
  usePaymentMethodDetailQuery: vi.fn(),
}))

vi.mock('@/features/subscription/hooks/useSubscriptionListQuery', () => ({
  useSubscriptionListQuery: vi.fn(),
}))

vi.mock('@/features/payment-method/hooks/useCreatePaymentMethodMutation', () => ({
  useCreatePaymentMethodMutation: vi.fn(),
}))

vi.mock('@/features/payment-method/hooks/useUpdatePaymentMethodMutation', () => ({
  useUpdatePaymentMethodMutation: vi.fn(),
}))

vi.mock('@/features/payment-method/hooks/useDeletePaymentMethodMutation', () => ({
  useDeletePaymentMethodMutation: vi.fn(),
}))

vi.mock('@/features/payment-method/schemas/payment-method-form.schema', () => ({
  validatePaymentMethodForm: vi.fn(),
}))

import { useRouter } from 'next/navigation'
import { useCreatePaymentMethodMutation } from '@/features/payment-method/hooks/useCreatePaymentMethodMutation'
import { useDeletePaymentMethodMutation } from '@/features/payment-method/hooks/useDeletePaymentMethodMutation'
import { usePaymentMethodDetailQuery } from '@/features/payment-method/hooks/usePaymentMethodDetailQuery'
import { useUpdatePaymentMethodMutation } from '@/features/payment-method/hooks/useUpdatePaymentMethodMutation'
import { validatePaymentMethodForm } from '@/features/payment-method/schemas/payment-method-form.schema'
import { useSubscriptionListQuery } from '@/features/subscription/hooks/useSubscriptionListQuery'

const mockPaymentMethod = {
  id: 'pm-1',
  name: 'クレジットカード',
  userId: 'user-1',
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
}

const mockSubscription = {
  id: 'sub-1',
  serviceName: 'Netflix',
  amount: 1200,
  billingCycle: 'monthly' as const,
  userId: 'user-1',
  baseDate: '2024-01-01T00:00:00Z',
  paymentMethod: { id: 'pm-1', name: 'クレジットカード' },
  memo: '',
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
}

describe('usePaymentMethodForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('createモード', () => {
    beforeEach(() => {
      vi.mocked(usePaymentMethodDetailQuery).mockReturnValue({
        data: undefined,
        isLoading: false,
      } as unknown as ReturnType<typeof usePaymentMethodDetailQuery>)

      vi.mocked(useSubscriptionListQuery).mockReturnValue({
        data: {
          subscriptions: [],
          totals: { monthlyTotal: 0, yearlyTotal: 0 },
        },
        isLoading: false,
      } as unknown as ReturnType<typeof useSubscriptionListQuery>)

      vi.mocked(useCreatePaymentMethodMutation).mockReturnValue({
        mutate: vi.fn(),
        isPending: false,
      } as unknown as ReturnType<typeof useCreatePaymentMethodMutation>)

      vi.mocked(useUpdatePaymentMethodMutation).mockReturnValue({
        mutate: vi.fn(),
        isPending: false,
      } as unknown as ReturnType<typeof useUpdatePaymentMethodMutation>)

      vi.mocked(useDeletePaymentMethodMutation).mockReturnValue({
        mutate: vi.fn(),
        isPending: false,
      } as unknown as ReturnType<typeof useDeletePaymentMethodMutation>)
    })

    it('初期状態で空のフォームデータを持つ', () => {
      // Arrange & Act
      const { result } = renderHook(() => usePaymentMethodForm({ mode: 'create' }))

      // Assert
      expect(result.current.formData).toEqual({
        name: '',
      })
      expect(result.current.errors).toEqual({})
    })

    it('フォームフィールドの変更を処理する', () => {
      // Arrange
      const { result } = renderHook(() => usePaymentMethodForm({ mode: 'create' }))

      // Act
      act(() => {
        result.current.handleChange('name', 'クレジットカード')
      })

      // Assert
      expect(result.current.formData.name).toBe('クレジットカード')
    })

    it('フォームフィールド変更時にエラーをクリアする', () => {
      // Arrange
      const { result } = renderHook(() => usePaymentMethodForm({ mode: 'create' }))

      // 先にエラーを設定
      act(() => {
        result.current.errors.name = '支払い方法名を入力してください'
      })

      // Act
      act(() => {
        result.current.handleChange('name', 'クレジットカード')
      })

      // Assert
      expect(result.current.errors.name).toBeUndefined()
    })

    it('バリデーションエラーがある場合は送信しない', async () => {
      // Arrange
      const mutateMock = vi.fn()
      vi.mocked(useCreatePaymentMethodMutation).mockReturnValue({
        mutate: mutateMock,
        isPending: false,
      } as unknown as ReturnType<typeof useCreatePaymentMethodMutation>)

      vi.mocked(validatePaymentMethodForm).mockReturnValue({
        success: false,
        error: {
          issues: [{ path: ['name'], message: '支払い方法名を入力してください' }],
        },
      } as unknown as ReturnType<typeof validatePaymentMethodForm>)

      const { result } = renderHook(() => usePaymentMethodForm({ mode: 'create' }))
      const mockEvent = { preventDefault: vi.fn() } as unknown as React.FormEvent

      // Act
      await act(async () => {
        await result.current.handleSubmit(mockEvent)
      })

      // Assert
      expect(mutateMock).not.toHaveBeenCalled()
      expect(result.current.errors).toEqual({
        name: '支払い方法名を入力してください',
      })
    })

    it('バリデーション成功時に作成リクエストを送信する', async () => {
      // Arrange
      const mutateMock = vi.fn()
      vi.mocked(useCreatePaymentMethodMutation).mockReturnValue({
        mutate: mutateMock,
        isPending: false,
      } as unknown as ReturnType<typeof useCreatePaymentMethodMutation>)

      vi.mocked(validatePaymentMethodForm).mockReturnValue({
        success: true,
        data: {
          name: 'クレジットカード',
        },
      } as unknown as ReturnType<typeof validatePaymentMethodForm>)

      const { result } = renderHook(() => usePaymentMethodForm({ mode: 'create' }))

      // フォームデータを設定
      act(() => {
        result.current.handleChange('name', 'クレジットカード')
      })

      const mockEvent = { preventDefault: vi.fn() } as unknown as React.FormEvent

      // Act
      await act(async () => {
        await result.current.handleSubmit(mockEvent)
      })

      // Assert
      expect(mutateMock).toHaveBeenCalledWith(
        {
          name: 'クレジットカード',
        },
        expect.objectContaining({
          onSuccess: expect.any(Function),
        }),
      )
    })

    it('作成成功時に一覧ページに遷移する', async () => {
      // Arrange
      const pushMock = vi.fn()
      vi.mocked(useRouter).mockReturnValue({
        push: pushMock,
      } as unknown as ReturnType<typeof useRouter>)

      const mutateMock = vi.fn((_, options) => {
        options?.onSuccess?.()
      })
      vi.mocked(useCreatePaymentMethodMutation).mockReturnValue({
        mutate: mutateMock,
        isPending: false,
      } as unknown as ReturnType<typeof useCreatePaymentMethodMutation>)

      vi.mocked(validatePaymentMethodForm).mockReturnValue({
        success: true,
        data: {
          name: 'クレジットカード',
        },
      } as unknown as ReturnType<typeof validatePaymentMethodForm>)

      const { result } = renderHook(() => usePaymentMethodForm({ mode: 'create' }))

      act(() => {
        result.current.handleChange('name', 'クレジットカード')
      })

      const mockEvent = { preventDefault: vi.fn() } as unknown as React.FormEvent

      // Act
      await act(async () => {
        await result.current.handleSubmit(mockEvent)
      })

      // Assert
      expect(pushMock).toHaveBeenCalledWith('/payment-methods')
    })

    it('キャンセル時に一覧ページに遷移する', () => {
      // Arrange
      const pushMock = vi.fn()
      vi.mocked(useRouter).mockReturnValue({
        push: pushMock,
      } as unknown as ReturnType<typeof useRouter>)

      const { result } = renderHook(() => usePaymentMethodForm({ mode: 'create' }))

      // Act
      act(() => {
        result.current.handleCancel()
      })

      // Assert
      expect(pushMock).toHaveBeenCalledWith('/payment-methods')
    })

    it('作成処理中はisSubmittingがtrue', () => {
      // Arrange
      vi.mocked(useCreatePaymentMethodMutation).mockReturnValue({
        mutate: vi.fn(),
        isPending: true,
      } as unknown as ReturnType<typeof useCreatePaymentMethodMutation>)

      // Act
      const { result } = renderHook(() => usePaymentMethodForm({ mode: 'create' }))

      // Assert
      expect(result.current.isSubmitting).toBe(true)
    })

    it('preventDefaultが呼ばれる', async () => {
      // Arrange
      vi.mocked(validatePaymentMethodForm).mockReturnValue({
        success: true,
        data: {
          name: 'クレジットカード',
        },
      } as unknown as ReturnType<typeof validatePaymentMethodForm>)

      const { result } = renderHook(() => usePaymentMethodForm({ mode: 'create' }))
      const mockEvent = { preventDefault: vi.fn() } as unknown as React.FormEvent

      // Act
      await act(async () => {
        await result.current.handleSubmit(mockEvent)
      })

      // Assert
      expect(mockEvent.preventDefault).toHaveBeenCalled()
    })
  })

  describe('editモード', () => {
    beforeEach(() => {
      vi.mocked(usePaymentMethodDetailQuery).mockReturnValue({
        data: mockPaymentMethod,
        isLoading: false,
      } as unknown as ReturnType<typeof usePaymentMethodDetailQuery>)

      vi.mocked(useSubscriptionListQuery).mockReturnValue({
        data: {
          subscriptions: [mockSubscription],
          totals: { monthlyTotal: 1200, yearlyTotal: 0 },
        },
        isLoading: false,
      } as unknown as ReturnType<typeof useSubscriptionListQuery>)

      vi.mocked(useCreatePaymentMethodMutation).mockReturnValue({
        mutate: vi.fn(),
        isPending: false,
      } as unknown as ReturnType<typeof useCreatePaymentMethodMutation>)

      vi.mocked(useUpdatePaymentMethodMutation).mockReturnValue({
        mutate: vi.fn(),
        isPending: false,
      } as unknown as ReturnType<typeof useUpdatePaymentMethodMutation>)

      vi.mocked(useDeletePaymentMethodMutation).mockReturnValue({
        mutate: vi.fn(),
        isPending: false,
      } as unknown as ReturnType<typeof useDeletePaymentMethodMutation>)
    })

    it('既存データをフォームにロードする', () => {
      // Arrange & Act
      const { result } = renderHook(() =>
        usePaymentMethodForm({ mode: 'edit', paymentMethodId: 'pm-1' }),
      )

      // Assert
      expect(result.current.formData).toEqual({
        name: 'クレジットカード',
      })
    })

    it('サブスクリプション一覧から使用中件数を計算する', () => {
      // Arrange & Act
      const { result } = renderHook(() =>
        usePaymentMethodForm({ mode: 'edit', paymentMethodId: 'pm-1' }),
      )

      // Assert
      expect(result.current.usageCount).toBe(1)
    })

    it('使用中件数が0の場合', () => {
      // Arrange
      vi.mocked(useSubscriptionListQuery).mockReturnValue({
        data: {
          subscriptions: [],
          totals: { monthlyTotal: 0, yearlyTotal: 0 },
        },
        isLoading: false,
      } as unknown as ReturnType<typeof useSubscriptionListQuery>)

      // Act
      const { result } = renderHook(() =>
        usePaymentMethodForm({ mode: 'edit', paymentMethodId: 'pm-1' }),
      )

      // Assert
      expect(result.current.usageCount).toBe(0)
    })

    it('subscriptionDataがundefinedの場合はusageCountが0', () => {
      // Arrange
      vi.mocked(useSubscriptionListQuery).mockReturnValue({
        data: undefined,
        isLoading: false,
      } as unknown as ReturnType<typeof useSubscriptionListQuery>)

      // Act
      const { result } = renderHook(() =>
        usePaymentMethodForm({ mode: 'edit', paymentMethodId: 'pm-1' }),
      )

      // Assert
      expect(result.current.usageCount).toBe(0)
    })

    it('バリデーション成功時に更新リクエストを送信する', async () => {
      // Arrange
      const mutateMock = vi.fn()
      vi.mocked(useUpdatePaymentMethodMutation).mockReturnValue({
        mutate: mutateMock,
        isPending: false,
      } as unknown as ReturnType<typeof useUpdatePaymentMethodMutation>)

      vi.mocked(validatePaymentMethodForm).mockReturnValue({
        success: true,
        data: {
          name: 'デビットカード',
        },
      } as unknown as ReturnType<typeof validatePaymentMethodForm>)

      const { result } = renderHook(() =>
        usePaymentMethodForm({ mode: 'edit', paymentMethodId: 'pm-1' }),
      )

      act(() => {
        result.current.handleChange('name', 'デビットカード')
      })

      const mockEvent = { preventDefault: vi.fn() } as unknown as React.FormEvent

      // Act
      await act(async () => {
        await result.current.handleSubmit(mockEvent)
      })

      // Assert
      expect(mutateMock).toHaveBeenCalledWith(
        {
          id: 'pm-1',
          name: 'デビットカード',
        },
        expect.objectContaining({
          onSuccess: expect.any(Function),
        }),
      )
    })

    it('更新成功時に一覧ページに遷移する', async () => {
      // Arrange
      const pushMock = vi.fn()
      vi.mocked(useRouter).mockReturnValue({
        push: pushMock,
      } as unknown as ReturnType<typeof useRouter>)

      const mutateMock = vi.fn((_, options) => {
        options?.onSuccess?.()
      })
      vi.mocked(useUpdatePaymentMethodMutation).mockReturnValue({
        mutate: mutateMock,
        isPending: false,
      } as unknown as ReturnType<typeof useUpdatePaymentMethodMutation>)

      vi.mocked(validatePaymentMethodForm).mockReturnValue({
        success: true,
        data: {
          name: 'デビットカード',
        },
      } as unknown as ReturnType<typeof validatePaymentMethodForm>)

      const { result } = renderHook(() =>
        usePaymentMethodForm({ mode: 'edit', paymentMethodId: 'pm-1' }),
      )

      const mockEvent = { preventDefault: vi.fn() } as unknown as React.FormEvent

      // Act
      await act(async () => {
        await result.current.handleSubmit(mockEvent)
      })

      // Assert
      expect(pushMock).toHaveBeenCalledWith('/payment-methods')
    })

    it('削除リクエスト時に削除ターゲットを設定する', () => {
      // Arrange
      const { result } = renderHook(() =>
        usePaymentMethodForm({ mode: 'edit', paymentMethodId: 'pm-1' }),
      )

      // Act
      act(() => {
        result.current.handleDeleteRequest()
      })

      // Assert
      expect(result.current.deleteTarget).toEqual({
        ...mockPaymentMethod,
        usageCount: 1,
      })
    })

    it('削除確認でキャンセル', () => {
      // Arrange
      const { result } = renderHook(() =>
        usePaymentMethodForm({ mode: 'edit', paymentMethodId: 'pm-1' }),
      )

      act(() => {
        result.current.handleDeleteRequest()
      })

      // Act
      act(() => {
        result.current.handleDeleteCancel()
      })

      // Assert
      expect(result.current.deleteTarget).toBeNull()
    })

    it('削除確認で削除実行', () => {
      // Arrange
      const mutateMock = vi.fn()
      vi.mocked(useDeletePaymentMethodMutation).mockReturnValue({
        mutate: mutateMock,
        isPending: false,
      } as unknown as ReturnType<typeof useDeletePaymentMethodMutation>)

      const { result } = renderHook(() =>
        usePaymentMethodForm({ mode: 'edit', paymentMethodId: 'pm-1' }),
      )

      act(() => {
        result.current.handleDeleteRequest()
      })

      // Act
      act(() => {
        result.current.handleDeleteConfirm()
      })

      // Assert
      expect(mutateMock).toHaveBeenCalledWith(
        'pm-1',
        expect.objectContaining({
          onSuccess: expect.any(Function),
        }),
      )
    })

    it('削除成功時に一覧ページに遷移する', () => {
      // Arrange
      const pushMock = vi.fn()
      vi.mocked(useRouter).mockReturnValue({
        push: pushMock,
      } as unknown as ReturnType<typeof useRouter>)

      const mutateMock = vi.fn((_, options) => {
        options?.onSuccess?.()
      })
      vi.mocked(useDeletePaymentMethodMutation).mockReturnValue({
        mutate: mutateMock,
        isPending: false,
      } as unknown as ReturnType<typeof useDeletePaymentMethodMutation>)

      const { result } = renderHook(() =>
        usePaymentMethodForm({ mode: 'edit', paymentMethodId: 'pm-1' }),
      )

      act(() => {
        result.current.handleDeleteRequest()
      })

      // Act
      act(() => {
        result.current.handleDeleteConfirm()
      })

      // Assert
      expect(pushMock).toHaveBeenCalledWith('/payment-methods')
    })

    it('更新処理中はisSubmittingがtrue', () => {
      // Arrange
      vi.mocked(useUpdatePaymentMethodMutation).mockReturnValue({
        mutate: vi.fn(),
        isPending: true,
      } as unknown as ReturnType<typeof useUpdatePaymentMethodMutation>)

      // Act
      const { result } = renderHook(() =>
        usePaymentMethodForm({ mode: 'edit', paymentMethodId: 'pm-1' }),
      )

      // Assert
      expect(result.current.isSubmitting).toBe(true)
    })

    it('削除処理中はisDeletingがtrue', () => {
      // Arrange
      vi.mocked(useDeletePaymentMethodMutation).mockReturnValue({
        mutate: vi.fn(),
        isPending: true,
      } as unknown as ReturnType<typeof useDeletePaymentMethodMutation>)

      // Act
      const { result } = renderHook(() =>
        usePaymentMethodForm({ mode: 'edit', paymentMethodId: 'pm-1' }),
      )

      // Assert
      expect(result.current.isDeleting).toBe(true)
    })
  })

  describe('共通機能', () => {
    beforeEach(() => {
      vi.mocked(usePaymentMethodDetailQuery).mockReturnValue({
        data: undefined,
        isLoading: false,
      } as unknown as ReturnType<typeof usePaymentMethodDetailQuery>)

      vi.mocked(useSubscriptionListQuery).mockReturnValue({
        data: {
          subscriptions: [],
          totals: { monthlyTotal: 0, yearlyTotal: 0 },
        },
        isLoading: false,
      } as unknown as ReturnType<typeof useSubscriptionListQuery>)

      vi.mocked(useCreatePaymentMethodMutation).mockReturnValue({
        mutate: vi.fn(),
        isPending: false,
      } as unknown as ReturnType<typeof useCreatePaymentMethodMutation>)

      vi.mocked(useUpdatePaymentMethodMutation).mockReturnValue({
        mutate: vi.fn(),
        isPending: false,
      } as unknown as ReturnType<typeof useUpdatePaymentMethodMutation>)

      vi.mocked(useDeletePaymentMethodMutation).mockReturnValue({
        mutate: vi.fn(),
        isPending: false,
      } as unknown as ReturnType<typeof useDeletePaymentMethodMutation>)
    })

    it('詳細取得中はisLoadingがtrue (editモードのみ)', () => {
      // Arrange
      vi.mocked(usePaymentMethodDetailQuery).mockReturnValue({
        data: undefined,
        isLoading: true,
      } as unknown as ReturnType<typeof usePaymentMethodDetailQuery>)

      // Act
      const { result } = renderHook(() =>
        usePaymentMethodForm({ mode: 'edit', paymentMethodId: 'pm-1' }),
      )

      // Assert
      expect(result.current.isLoading).toBe(true)
    })

    it('削除ターゲットがnullの場合は削除実行しない', () => {
      // Arrange
      const mutateMock = vi.fn()
      vi.mocked(useDeletePaymentMethodMutation).mockReturnValue({
        mutate: mutateMock,
        isPending: false,
      } as unknown as ReturnType<typeof useDeletePaymentMethodMutation>)

      const { result } = renderHook(() => usePaymentMethodForm({ mode: 'create' }))

      // Act
      act(() => {
        result.current.handleDeleteConfirm()
      })

      // Assert
      expect(mutateMock).not.toHaveBeenCalled()
    })

    it('editモードでexistingPaymentMethodがundefinedの場合は初期データロードしない', () => {
      // Arrange
      vi.mocked(usePaymentMethodDetailQuery).mockReturnValue({
        data: undefined,
        isLoading: false,
      } as unknown as ReturnType<typeof usePaymentMethodDetailQuery>)

      // Act
      const { result } = renderHook(() =>
        usePaymentMethodForm({ mode: 'edit', paymentMethodId: 'pm-1' }),
      )

      // Assert
      expect(result.current.formData).toEqual({
        name: '',
      })
    })
  })
})
