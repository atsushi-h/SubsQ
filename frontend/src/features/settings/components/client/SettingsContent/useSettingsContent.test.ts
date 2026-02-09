import type { UseMutationResult } from '@tanstack/react-query'
import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useDeleteUserAccountMutation } from '@/features/settings/hooks/useDeleteUserAccountMutation'
import { useSettingsContent } from './useSettingsContent'

vi.mock('@/features/settings/hooks/useDeleteUserAccountMutation')

describe('useSettingsContent', () => {
  const mockMutate = vi.fn()
  const mockMutation: Partial<UseMutationResult<void, Error, void, unknown>> = {
    mutate: mockMutate,
    isPending: false,
    error: null,
  }

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useDeleteUserAccountMutation).mockReturnValue(
      mockMutation as UseMutationResult<void, Error, void, unknown>,
    )
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('初期状態ではisDeletingとisDialogOpenがfalse、errorがnull', () => {
    // Act
    const { result } = renderHook(() => useSettingsContent())

    // Assert
    expect(result.current.isDeleting).toBe(false)
    expect(result.current.isDialogOpen).toBe(false)
    expect(result.current.error).toBeNull()
  })

  it('handleDeleteRequestを呼ぶとダイアログが開く', () => {
    // Arrange
    const { result } = renderHook(() => useSettingsContent())

    // Act
    act(() => {
      result.current.handleDeleteRequest()
    })

    // Assert
    expect(result.current.isDialogOpen).toBe(true)
  })

  it('handleDeleteCancelを呼ぶとダイアログが閉じる', () => {
    // Arrange
    const { result } = renderHook(() => useSettingsContent())

    act(() => {
      result.current.handleDeleteRequest()
    })
    expect(result.current.isDialogOpen).toBe(true)

    // Act
    act(() => {
      result.current.handleDeleteCancel()
    })

    // Assert
    expect(result.current.isDialogOpen).toBe(false)
  })

  it('handleDeleteConfirmを呼ぶとmutateが実行され、ダイアログが閉じる', () => {
    // Arrange
    const { result } = renderHook(() => useSettingsContent())

    act(() => {
      result.current.handleDeleteRequest()
    })
    expect(result.current.isDialogOpen).toBe(true)

    // Act
    act(() => {
      result.current.handleDeleteConfirm()
    })

    // Assert
    expect(mockMutate).toHaveBeenCalledTimes(1)
    expect(result.current.isDialogOpen).toBe(false)
  })

  it('isPendingがtrueの場合、isDeletingがtrueになる', () => {
    // Arrange
    vi.mocked(useDeleteUserAccountMutation).mockReturnValue({
      ...mockMutation,
      isPending: true,
    } as unknown as UseMutationResult<void, Error, void, unknown>)

    // Act
    const { result } = renderHook(() => useSettingsContent())

    // Assert
    expect(result.current.isDeleting).toBe(true)
  })

  it('mutationにエラーがある場合、errorメッセージが返される', () => {
    // Arrange
    const errorMessage = '削除に失敗しました'
    vi.mocked(useDeleteUserAccountMutation).mockReturnValue({
      ...mockMutation,
      error: new Error(errorMessage),
    } as unknown as UseMutationResult<void, Error, void, unknown>)

    // Act
    const { result } = renderHook(() => useSettingsContent())

    // Assert
    expect(result.current.error).toBe(errorMessage)
  })

  it('mutationのerrorがnullの場合、errorはnull', () => {
    // Arrange
    vi.mocked(useDeleteUserAccountMutation).mockReturnValue({
      ...mockMutation,
      error: null,
    } as unknown as UseMutationResult<void, Error, void, unknown>)

    // Act
    const { result } = renderHook(() => useSettingsContent())

    // Assert
    expect(result.current.error).toBeNull()
  })
})
