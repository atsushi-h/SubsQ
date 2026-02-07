import { act, renderHook } from '@testing-library/react'
import { useRouter } from 'next/navigation'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { deleteUserAccountCommandAction } from '@/external/handler/user/user.command.action'
import { signOut } from '@/features/auth/lib/better-auth-client'
import { useSettingsContent } from './useSettingsContent'

vi.mock('next/navigation', () => ({
  useRouter: vi.fn(() => ({
    push: vi.fn(),
  })),
}))

vi.mock('@/features/auth/lib/better-auth-client', () => ({
  signOut: vi.fn(),
}))

vi.mock('@/external/handler/user/user.command.action', () => ({
  deleteUserAccountCommandAction: vi.fn(),
}))

describe('useSettingsContent', () => {
  beforeEach(() => {
    vi.clearAllMocks()
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

  it('handleDeleteRequestを呼ぶとダイアログが開き、エラーがクリアされる', () => {
    // Arrange
    const { result } = renderHook(() => useSettingsContent())

    // Act
    act(() => {
      result.current.handleDeleteRequest()
    })

    // Assert
    expect(result.current.isDialogOpen).toBe(true)
    expect(result.current.error).toBeNull()
  })

  it('handleDeleteCancelを呼ぶとダイアログが閉じ、エラーがクリアされる', () => {
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
    expect(result.current.error).toBeNull()
  })

  it('退会処理が成功した場合、ログアウトしてログインページに遷移する', async () => {
    // Arrange
    const pushMock = vi.fn()
    vi.mocked(useRouter).mockReturnValue({
      push: pushMock,
      replace: vi.fn(),
      prefetch: vi.fn(),
      back: vi.fn(),
      forward: vi.fn(),
      refresh: vi.fn(),
    })
    vi.mocked(deleteUserAccountCommandAction).mockResolvedValue(undefined)
    vi.mocked(signOut).mockResolvedValue(undefined)

    const { result } = renderHook(() => useSettingsContent())

    // Act
    await act(async () => {
      await result.current.handleDeleteConfirm()
    })

    // Assert
    expect(deleteUserAccountCommandAction).toHaveBeenCalledTimes(1)
    expect(signOut).toHaveBeenCalledTimes(1)
    expect(pushMock).toHaveBeenCalledWith('/login')
    expect(result.current.error).toBeNull()
  })

  it('退会処理が失敗した場合、エラーメッセージを表示する', async () => {
    // Arrange
    const errorMessage = '削除に失敗しました'
    vi.mocked(deleteUserAccountCommandAction).mockRejectedValue(new Error(errorMessage))

    const { result } = renderHook(() => useSettingsContent())

    // Act
    await act(async () => {
      await result.current.handleDeleteConfirm()
    })

    // Assert
    expect(deleteUserAccountCommandAction).toHaveBeenCalledTimes(1)
    expect(signOut).not.toHaveBeenCalled() // エラー時はログアウトしない
    expect(result.current.error).toBe(errorMessage)
    expect(result.current.isDeleting).toBe(false)
  })

  it('アカウント削除成功後、signOutが失敗してもログインページに遷移する', async () => {
    // Arrange
    const pushMock = vi.fn()
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    vi.mocked(useRouter).mockReturnValue({
      push: pushMock,
      replace: vi.fn(),
      prefetch: vi.fn(),
      back: vi.fn(),
      forward: vi.fn(),
      refresh: vi.fn(),
    })
    vi.mocked(deleteUserAccountCommandAction).mockResolvedValue(undefined)
    vi.mocked(signOut).mockRejectedValue(new Error('ログアウト失敗'))

    const { result } = renderHook(() => useSettingsContent())

    // Act
    await act(async () => {
      await result.current.handleDeleteConfirm()
    })

    // Assert
    expect(deleteUserAccountCommandAction).toHaveBeenCalledTimes(1)
    expect(signOut).toHaveBeenCalledTimes(1)
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'ログアウト処理に失敗しましたが、アカウントは削除されました',
      expect.any(Error),
    )
    expect(pushMock).toHaveBeenCalledWith('/login') // signOut失敗でもリダイレクト
    expect(result.current.error).toBeNull() // アカウント削除は成功しているのでエラーなし

    consoleErrorSpy.mockRestore()
  })

  it('退会処理中はisDeletingがtrue', async () => {
    // Arrange
    let resolveDelete: () => void
    const deletePromise = new Promise<void>((resolve) => {
      resolveDelete = resolve
    })
    vi.mocked(deleteUserAccountCommandAction).mockReturnValue(deletePromise)

    const { result } = renderHook(() => useSettingsContent())

    // Act - 削除処理を開始
    let handleDeletePromise: Promise<void>
    act(() => {
      handleDeletePromise = result.current.handleDeleteConfirm()
    })

    // Assert - 処理中はisDeletingがtrue
    expect(result.current.isDeleting).toBe(true)

    // Cleanup - Promise を解決
    await act(async () => {
      resolveDelete?.()
      await handleDeletePromise
    })
  })
})
