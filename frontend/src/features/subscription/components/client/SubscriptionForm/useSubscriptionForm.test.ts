import { act, renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useSubscriptionForm } from './useSubscriptionForm'

// 依存関係をモック
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(() => ({
    push: vi.fn(),
  })),
}))

vi.mock('@/features/payment-method/hooks/usePaymentMethodListQuery', () => ({
  usePaymentMethodListQuery: vi.fn(),
}))

vi.mock('@/features/subscription/hooks/useCreateSubscriptionMutation', () => ({
  useCreateSubscriptionMutation: vi.fn(),
}))

vi.mock('@/features/subscription/hooks/useSubscriptionDetailQuery', () => ({
  useSubscriptionDetailQuery: vi.fn(),
}))

vi.mock('@/features/subscription/hooks/useUpdateSubscriptionMutation', () => ({
  useUpdateSubscriptionMutation: vi.fn(),
}))

vi.mock('@/features/subscription/schemas/subscription-form.schema', () => ({
  validateSubscriptionForm: vi.fn(),
}))

vi.mock('@/shared/utils/date', () => ({
  DateUtil: {
    isoToDateString: vi.fn((_iso: string) => '2024-01-15'),
    dateStringToISO: vi.fn((_dateString: string) => '2024-01-15T00:00:00.000Z'),
  },
}))

import { useRouter } from 'next/navigation'
import { usePaymentMethodListQuery } from '@/features/payment-method/hooks/usePaymentMethodListQuery'
import { useCreateSubscriptionMutation } from '@/features/subscription/hooks/useCreateSubscriptionMutation'
import { useSubscriptionDetailQuery } from '@/features/subscription/hooks/useSubscriptionDetailQuery'
import { useUpdateSubscriptionMutation } from '@/features/subscription/hooks/useUpdateSubscriptionMutation'
import { validateSubscriptionForm } from '@/features/subscription/schemas/subscription-form.schema'

describe('useSubscriptionForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('createモード', () => {
    beforeEach(() => {
      vi.mocked(useSubscriptionDetailQuery).mockReturnValue({
        data: undefined,
        isLoading: false,
      } as unknown as ReturnType<typeof useSubscriptionDetailQuery>)

      vi.mocked(usePaymentMethodListQuery).mockReturnValue({
        data: [
          { id: 'pm-1', name: 'クレジットカード' },
          { id: 'pm-2', name: '銀行振込' },
        ],
        isLoading: false,
        isError: false,
        error: null,
      } as unknown as ReturnType<typeof usePaymentMethodListQuery>)

      vi.mocked(useCreateSubscriptionMutation).mockReturnValue({
        mutate: vi.fn(),
        isPending: false,
      } as unknown as ReturnType<typeof useCreateSubscriptionMutation>)

      vi.mocked(useUpdateSubscriptionMutation).mockReturnValue({
        mutate: vi.fn(),
        isPending: false,
      } as unknown as ReturnType<typeof useUpdateSubscriptionMutation>)
    })

    it('初期状態で空のフォームデータを持つ', () => {
      // Arrange & Act
      const { result } = renderHook(() => useSubscriptionForm({ mode: 'create' }))

      // Assert
      expect(result.current.formData).toEqual({
        serviceName: '',
        amount: '',
        billingCycle: 'monthly',
        baseDate: '',
        paymentMethodId: '',
        memo: '',
      })
      expect(result.current.errors).toEqual({})
    })

    it('支払い方法一覧を取得する', () => {
      // Arrange & Act
      const { result } = renderHook(() => useSubscriptionForm({ mode: 'create' }))

      // Assert
      expect(result.current.paymentMethods).toHaveLength(2)
      expect(result.current.paymentMethods?.[0].name).toBe('クレジットカード')
    })

    it('フォームフィールドの変更を処理する', () => {
      // Arrange
      const { result } = renderHook(() => useSubscriptionForm({ mode: 'create' }))

      // Act
      act(() => {
        result.current.handleChange('serviceName', 'Netflix')
      })

      // Assert
      expect(result.current.formData.serviceName).toBe('Netflix')
    })

    it('フォームフィールド変更時にエラーをクリアする', () => {
      // Arrange
      const { result } = renderHook(() => useSubscriptionForm({ mode: 'create' }))

      // 先にエラーを設定
      act(() => {
        result.current.errors.serviceName = 'サービス名を入力してください'
      })

      // Act
      act(() => {
        result.current.handleChange('serviceName', 'Netflix')
      })

      // Assert
      expect(result.current.errors.serviceName).toBeUndefined()
    })

    it('バリデーションエラーがある場合は送信しない', async () => {
      // Arrange
      const mutateMock = vi.fn()
      vi.mocked(useCreateSubscriptionMutation).mockReturnValue({
        mutate: mutateMock,
        isPending: false,
      } as unknown as ReturnType<typeof useCreateSubscriptionMutation>)

      vi.mocked(validateSubscriptionForm).mockReturnValue({
        success: false,
        error: {
          issues: [
            { path: ['serviceName'], message: 'サービス名を入力してください' },
            { path: ['amount'], message: '金額を入力してください' },
          ],
        },
      } as unknown as ReturnType<typeof validateSubscriptionForm>)

      const { result } = renderHook(() => useSubscriptionForm({ mode: 'create' }))
      const mockEvent = { preventDefault: vi.fn() } as unknown as React.FormEvent

      // Act
      await act(async () => {
        await result.current.handleSubmit(mockEvent)
      })

      // Assert
      expect(mutateMock).not.toHaveBeenCalled()
      expect(result.current.errors).toEqual({
        serviceName: 'サービス名を入力してください',
        amount: '金額を入力してください',
      })
    })

    it('バリデーション成功時に新規作成リクエストを送信する', async () => {
      // Arrange
      const mutateMock = vi.fn()
      vi.mocked(useCreateSubscriptionMutation).mockReturnValue({
        mutate: mutateMock,
        isPending: false,
      } as unknown as ReturnType<typeof useCreateSubscriptionMutation>)

      vi.mocked(validateSubscriptionForm).mockReturnValue({
        success: true,
        data: {
          serviceName: 'Netflix',
          amount: '1200',
          billingCycle: 'monthly',
          baseDate: '2024-01-15',
          paymentMethodId: 'pm-1',
          memo: 'テストメモ',
        },
      } as unknown as ReturnType<typeof validateSubscriptionForm>)

      const { result } = renderHook(() => useSubscriptionForm({ mode: 'create' }))

      // フォームデータを設定
      act(() => {
        result.current.handleChange('serviceName', 'Netflix')
        result.current.handleChange('amount', '1200')
        result.current.handleChange('baseDate', '2024-01-15')
        result.current.handleChange('paymentMethodId', 'pm-1')
        result.current.handleChange('memo', 'テストメモ')
      })

      const mockEvent = { preventDefault: vi.fn() } as unknown as React.FormEvent

      // Act
      await act(async () => {
        await result.current.handleSubmit(mockEvent)
      })

      // Assert
      expect(mutateMock).toHaveBeenCalledWith(
        {
          serviceName: 'Netflix',
          amount: 1200,
          billingCycle: 'monthly',
          baseDate: '2024-01-15T00:00:00.000Z',
          paymentMethodId: 'pm-1',
          memo: 'テストメモ',
        },
        expect.objectContaining({
          onSuccess: expect.any(Function),
        }),
      )
    })

    it('memoが空の場合はリクエストに含めない', async () => {
      // Arrange
      const mutateMock = vi.fn()
      vi.mocked(useCreateSubscriptionMutation).mockReturnValue({
        mutate: mutateMock,
        isPending: false,
      } as unknown as ReturnType<typeof useCreateSubscriptionMutation>)

      vi.mocked(validateSubscriptionForm).mockReturnValue({
        success: true,
        data: {
          serviceName: 'Netflix',
          amount: '1200',
          billingCycle: 'monthly',
          baseDate: '2024-01-15',
          paymentMethodId: 'pm-1',
          memo: '',
        },
      } as unknown as ReturnType<typeof validateSubscriptionForm>)

      const { result } = renderHook(() => useSubscriptionForm({ mode: 'create' }))

      act(() => {
        result.current.handleChange('serviceName', 'Netflix')
        result.current.handleChange('amount', '1200')
        result.current.handleChange('baseDate', '2024-01-15')
        result.current.handleChange('paymentMethodId', 'pm-1')
      })

      const mockEvent = { preventDefault: vi.fn() } as unknown as React.FormEvent

      // Act
      await act(async () => {
        await result.current.handleSubmit(mockEvent)
      })

      // Assert
      const callArgs = mutateMock.mock.calls[0][0]
      expect(callArgs.memo).toBeUndefined()
    })

    it('paymentMethodIdが空の場合はnullを設定する', async () => {
      // Arrange
      const mutateMock = vi.fn()
      vi.mocked(useCreateSubscriptionMutation).mockReturnValue({
        mutate: mutateMock,
        isPending: false,
      } as unknown as ReturnType<typeof useCreateSubscriptionMutation>)

      vi.mocked(validateSubscriptionForm).mockReturnValue({
        success: true,
        data: {
          serviceName: 'Netflix',
          amount: '1200',
          billingCycle: 'monthly',
          baseDate: '2024-01-15',
          paymentMethodId: '',
          memo: '',
        },
      } as unknown as ReturnType<typeof validateSubscriptionForm>)

      const { result } = renderHook(() => useSubscriptionForm({ mode: 'create' }))

      act(() => {
        result.current.handleChange('serviceName', 'Netflix')
        result.current.handleChange('amount', '1200')
        result.current.handleChange('baseDate', '2024-01-15')
      })

      const mockEvent = { preventDefault: vi.fn() } as unknown as React.FormEvent

      // Act
      await act(async () => {
        await result.current.handleSubmit(mockEvent)
      })

      // Assert
      expect(mutateMock).toHaveBeenCalledWith(
        expect.objectContaining({
          paymentMethodId: null,
        }),
        expect.any(Object),
      )
    })

    it('作成成功時にサブスクリプション一覧ページに遷移する', async () => {
      // Arrange
      const pushMock = vi.fn()
      vi.mocked(useRouter).mockReturnValue({
        push: pushMock,
      } as unknown as ReturnType<typeof useRouter>)

      const mutateMock = vi.fn((_, options) => {
        options?.onSuccess?.()
      })
      vi.mocked(useCreateSubscriptionMutation).mockReturnValue({
        mutate: mutateMock,
        isPending: false,
      } as unknown as ReturnType<typeof useCreateSubscriptionMutation>)

      vi.mocked(validateSubscriptionForm).mockReturnValue({
        success: true,
        data: {
          serviceName: 'Netflix',
          amount: '1200',
          billingCycle: 'monthly',
          baseDate: '2024-01-15',
          paymentMethodId: '',
          memo: '',
        },
      } as unknown as ReturnType<typeof validateSubscriptionForm>)

      const { result } = renderHook(() => useSubscriptionForm({ mode: 'create' }))

      act(() => {
        result.current.handleChange('serviceName', 'Netflix')
        result.current.handleChange('amount', '1200')
        result.current.handleChange('baseDate', '2024-01-15')
      })

      const mockEvent = { preventDefault: vi.fn() } as unknown as React.FormEvent

      // Act
      await act(async () => {
        await result.current.handleSubmit(mockEvent)
      })

      // Assert
      expect(pushMock).toHaveBeenCalledWith('/subscriptions')
    })

    it('キャンセル時にサブスクリプション一覧ページに遷移する', () => {
      // Arrange
      const pushMock = vi.fn()
      vi.mocked(useRouter).mockReturnValue({
        push: pushMock,
      } as unknown as ReturnType<typeof useRouter>)

      const { result } = renderHook(() => useSubscriptionForm({ mode: 'create' }))

      // Act
      act(() => {
        result.current.handleCancel()
      })

      // Assert
      expect(pushMock).toHaveBeenCalledWith('/subscriptions')
    })
  })

  describe('editモード', () => {
    beforeEach(() => {
      vi.mocked(useSubscriptionDetailQuery).mockReturnValue({
        data: {
          id: 'sub-1',
          serviceName: 'Netflix',
          amount: 1200,
          billingCycle: 'monthly',
          baseDate: '2024-01-15T00:00:00.000Z',
          paymentMethod: { id: 'pm-1', name: 'クレジットカード' },
          memo: '既存のメモ',
          userId: 'user-1',
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-10T00:00:00.000Z',
        },
        isLoading: false,
      } as unknown as ReturnType<typeof useSubscriptionDetailQuery>)

      vi.mocked(usePaymentMethodListQuery).mockReturnValue({
        data: [
          { id: 'pm-1', name: 'クレジットカード' },
          { id: 'pm-2', name: '銀行振込' },
        ],
        isLoading: false,
        isError: false,
        error: null,
      } as unknown as ReturnType<typeof usePaymentMethodListQuery>)

      vi.mocked(useCreateSubscriptionMutation).mockReturnValue({
        mutate: vi.fn(),
        isPending: false,
      } as unknown as ReturnType<typeof useCreateSubscriptionMutation>)

      vi.mocked(useUpdateSubscriptionMutation).mockReturnValue({
        mutate: vi.fn(),
        isPending: false,
      } as unknown as ReturnType<typeof useUpdateSubscriptionMutation>)
    })

    it('既存データをフォームにロードする', () => {
      // Arrange & Act
      const { result } = renderHook(() =>
        useSubscriptionForm({ mode: 'edit', subscriptionId: 'sub-1' }),
      )

      // Assert
      expect(result.current.formData).toEqual({
        serviceName: 'Netflix',
        amount: '1200',
        billingCycle: 'monthly',
        baseDate: '2024-01-15',
        paymentMethodId: 'pm-1',
        memo: '既存のメモ',
      })
    })

    it('バリデーション成功時に更新リクエストを送信する', async () => {
      // Arrange
      const mutateMock = vi.fn()
      vi.mocked(useUpdateSubscriptionMutation).mockReturnValue({
        mutate: mutateMock,
        isPending: false,
      } as unknown as ReturnType<typeof useUpdateSubscriptionMutation>)

      vi.mocked(validateSubscriptionForm).mockReturnValue({
        success: true,
        data: {
          serviceName: 'Netflix Premium',
          amount: '1500',
          billingCycle: 'monthly',
          baseDate: '2024-01-15',
          paymentMethodId: 'pm-2',
          memo: '更新後のメモ',
        },
      } as unknown as ReturnType<typeof validateSubscriptionForm>)

      const { result } = renderHook(() =>
        useSubscriptionForm({ mode: 'edit', subscriptionId: 'sub-1' }),
      )

      act(() => {
        result.current.handleChange('serviceName', 'Netflix Premium')
        result.current.handleChange('amount', '1500')
        result.current.handleChange('paymentMethodId', 'pm-2')
        result.current.handleChange('memo', '更新後のメモ')
      })

      const mockEvent = { preventDefault: vi.fn() } as unknown as React.FormEvent

      // Act
      await act(async () => {
        await result.current.handleSubmit(mockEvent)
      })

      // Assert
      expect(mutateMock).toHaveBeenCalledWith(
        {
          id: 'sub-1',
          serviceName: 'Netflix Premium',
          amount: 1500,
          billingCycle: 'monthly',
          baseDate: '2024-01-15T00:00:00.000Z',
          paymentMethodId: 'pm-2',
          memo: '更新後のメモ',
        },
        expect.objectContaining({
          onSuccess: expect.any(Function),
        }),
      )
    })

    it('更新成功時にサブスクリプション詳細ページに遷移する', async () => {
      // Arrange
      const pushMock = vi.fn()
      vi.mocked(useRouter).mockReturnValue({
        push: pushMock,
      } as unknown as ReturnType<typeof useRouter>)

      const mutateMock = vi.fn((_, options) => {
        options?.onSuccess?.()
      })
      vi.mocked(useUpdateSubscriptionMutation).mockReturnValue({
        mutate: mutateMock,
        isPending: false,
      } as unknown as ReturnType<typeof useUpdateSubscriptionMutation>)

      vi.mocked(validateSubscriptionForm).mockReturnValue({
        success: true,
        data: {
          serviceName: 'Netflix',
          amount: '1200',
          billingCycle: 'monthly',
          baseDate: '2024-01-15',
          paymentMethodId: 'pm-1',
          memo: '既存のメモ',
        },
      } as unknown as ReturnType<typeof validateSubscriptionForm>)

      const { result } = renderHook(() =>
        useSubscriptionForm({ mode: 'edit', subscriptionId: 'sub-1' }),
      )

      const mockEvent = { preventDefault: vi.fn() } as unknown as React.FormEvent

      // Act
      await act(async () => {
        await result.current.handleSubmit(mockEvent)
      })

      // Assert
      expect(pushMock).toHaveBeenCalledWith('/subscriptions/sub-1')
    })

    it('キャンセル時にサブスクリプション詳細ページに遷移する', () => {
      // Arrange
      const pushMock = vi.fn()
      vi.mocked(useRouter).mockReturnValue({
        push: pushMock,
      } as unknown as ReturnType<typeof useRouter>)

      const { result } = renderHook(() =>
        useSubscriptionForm({ mode: 'edit', subscriptionId: 'sub-1' }),
      )

      // Act
      act(() => {
        result.current.handleCancel()
      })

      // Assert
      expect(pushMock).toHaveBeenCalledWith('/subscriptions/sub-1')
    })

    it('paymentMethodがnullの場合は空文字列を設定する', () => {
      // Arrange
      vi.mocked(useSubscriptionDetailQuery).mockReturnValue({
        data: {
          id: 'sub-1',
          serviceName: 'Netflix',
          amount: 1200,
          billingCycle: 'monthly',
          baseDate: '2024-01-15T00:00:00.000Z',
          paymentMethod: null,
          memo: '',
          userId: 'user-1',
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-10T00:00:00.000Z',
        },
        isLoading: false,
      } as unknown as ReturnType<typeof useSubscriptionDetailQuery>)

      // Act
      const { result } = renderHook(() =>
        useSubscriptionForm({ mode: 'edit', subscriptionId: 'sub-1' }),
      )

      // Assert
      expect(result.current.formData.paymentMethodId).toBe('')
    })

    it('memoがnullの場合は空文字列を設定する', () => {
      // Arrange
      vi.mocked(useSubscriptionDetailQuery).mockReturnValue({
        data: {
          id: 'sub-1',
          serviceName: 'Netflix',
          amount: 1200,
          billingCycle: 'monthly',
          baseDate: '2024-01-15T00:00:00.000Z',
          paymentMethod: { id: 'pm-1', name: 'クレジットカード' },
          memo: null,
          userId: 'user-1',
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-10T00:00:00.000Z',
        },
        isLoading: false,
      } as unknown as ReturnType<typeof useSubscriptionDetailQuery>)

      // Act
      const { result } = renderHook(() =>
        useSubscriptionForm({ mode: 'edit', subscriptionId: 'sub-1' }),
      )

      // Assert
      expect(result.current.formData.memo).toBe('')
    })
  })

  describe('共通機能', () => {
    beforeEach(() => {
      vi.mocked(useSubscriptionDetailQuery).mockReturnValue({
        data: undefined,
        isLoading: false,
      } as unknown as ReturnType<typeof useSubscriptionDetailQuery>)

      vi.mocked(usePaymentMethodListQuery).mockReturnValue({
        data: [],
        isLoading: false,
        isError: false,
        error: null,
      } as unknown as ReturnType<typeof usePaymentMethodListQuery>)

      vi.mocked(useCreateSubscriptionMutation).mockReturnValue({
        mutate: vi.fn(),
        isPending: false,
      } as unknown as ReturnType<typeof useCreateSubscriptionMutation>)

      vi.mocked(useUpdateSubscriptionMutation).mockReturnValue({
        mutate: vi.fn(),
        isPending: false,
      } as unknown as ReturnType<typeof useUpdateSubscriptionMutation>)
    })

    it('支払い方法一覧がローディング中の場合、isLoadingPaymentMethodsがtrueを返す', () => {
      // Arrange
      vi.mocked(usePaymentMethodListQuery).mockReturnValue({
        data: undefined,
        isLoading: true,
        isError: false,
        error: null,
      } as unknown as ReturnType<typeof usePaymentMethodListQuery>)

      // Act
      const { result } = renderHook(() => useSubscriptionForm({ mode: 'create' }))

      // Assert
      expect(result.current.isLoadingPaymentMethods).toBe(true)
    })

    it('支払い方法一覧の取得がエラーの場合、isErrorPaymentMethodsがtrueを返す', () => {
      // Arrange
      vi.mocked(usePaymentMethodListQuery).mockReturnValue({
        data: undefined,
        isLoading: false,
        isError: true,
        error: new Error('Network error'),
      } as unknown as ReturnType<typeof usePaymentMethodListQuery>)

      // Act
      const { result } = renderHook(() => useSubscriptionForm({ mode: 'create' }))

      // Assert
      expect(result.current.isErrorPaymentMethods).toBe(true)
      expect(result.current.errorPaymentMethods).toEqual(new Error('Network error'))
    })

    it('createモードの場合、isSubmittingはcreateMutation.isPendingを返す', () => {
      // Arrange
      vi.mocked(useCreateSubscriptionMutation).mockReturnValue({
        mutate: vi.fn(),
        isPending: true,
      } as unknown as ReturnType<typeof useCreateSubscriptionMutation>)

      // Act
      const { result } = renderHook(() => useSubscriptionForm({ mode: 'create' }))

      // Assert
      expect(result.current.isSubmitting).toBe(true)
    })

    it('editモードの場合、isSubmittingはupdateMutation.isPendingを返す', () => {
      // Arrange
      vi.mocked(useSubscriptionDetailQuery).mockReturnValue({
        data: {
          id: 'sub-1',
          serviceName: 'Netflix',
          amount: 1200,
          billingCycle: 'monthly',
          baseDate: '2024-01-15T00:00:00.000Z',
          paymentMethod: null,
          memo: '',
          userId: 'user-1',
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-10T00:00:00.000Z',
        },
        isLoading: false,
      } as unknown as ReturnType<typeof useSubscriptionDetailQuery>)

      vi.mocked(useUpdateSubscriptionMutation).mockReturnValue({
        mutate: vi.fn(),
        isPending: true,
      } as unknown as ReturnType<typeof useUpdateSubscriptionMutation>)

      // Act
      const { result } = renderHook(() =>
        useSubscriptionForm({ mode: 'edit', subscriptionId: 'sub-1' }),
      )

      // Assert
      expect(result.current.isSubmitting).toBe(true)
    })

    it('サブスクリプション詳細がローディング中の場合、isLoadingがtrueを返す', () => {
      // Arrange
      vi.mocked(useSubscriptionDetailQuery).mockReturnValue({
        data: undefined,
        isLoading: true,
      } as unknown as ReturnType<typeof useSubscriptionDetailQuery>)

      // Act
      const { result } = renderHook(() =>
        useSubscriptionForm({ mode: 'edit', subscriptionId: 'sub-1' }),
      )

      // Assert
      expect(result.current.isLoading).toBe(true)
    })
  })
})
