import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useSettingsContent } from './useSettingsContent'

describe('useSettingsContent', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.spyOn(console, 'log').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.useRealTimers()
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

  it('handleDeleteConfirmを呼ぶとコンソールに出力され、ダイアログが閉じる', async () => {
    // Arrange
    const { result } = renderHook(() => useSettingsContent())

    act(() => {
      result.current.handleDeleteRequest()
    })

    // Act
    await act(async () => {
      await result.current.handleDeleteConfirm()
    })

    // Assert
    expect(console.log).toHaveBeenCalledWith('退会処理が呼び出されました')
    expect(result.current.isDialogOpen).toBe(false)
    expect(result.current.error).toBeNull()
  })

  it('handleDeleteConfirm呼び出し中はisDeletingがtrue', async () => {
    // Arrange
    const { result } = renderHook(() => useSettingsContent())

    // Act
    await act(async () => {
      await result.current.handleDeleteConfirm()
    })

    // Assert
    expect(result.current.isDeleting).toBe(true)
  })

  it('500ms後にisDeletingがfalseに戻る', async () => {
    // Arrange
    const { result } = renderHook(() => useSettingsContent())

    // Act
    await act(async () => {
      await result.current.handleDeleteConfirm()
    })

    expect(result.current.isDeleting).toBe(true)

    act(() => {
      vi.advanceTimersByTime(500)
    })

    // Assert
    expect(result.current.isDeleting).toBe(false)
    expect(result.current.error).toBeNull()
  })

  it('複数回確認しても正しく動作する', async () => {
    // Arrange
    const { result } = renderHook(() => useSettingsContent())

    // Act - 1回目
    act(() => {
      result.current.handleDeleteRequest()
    })
    expect(result.current.isDialogOpen).toBe(true)

    await act(async () => {
      await result.current.handleDeleteConfirm()
    })
    expect(result.current.isDeleting).toBe(true)
    expect(result.current.isDialogOpen).toBe(false)

    act(() => {
      vi.advanceTimersByTime(500)
    })
    expect(result.current.isDeleting).toBe(false)

    // Act - 2回目
    act(() => {
      result.current.handleDeleteRequest()
    })
    expect(result.current.isDialogOpen).toBe(true)

    await act(async () => {
      await result.current.handleDeleteConfirm()
    })
    expect(result.current.isDeleting).toBe(true)

    act(() => {
      vi.advanceTimersByTime(500)
    })

    // Assert
    expect(result.current.isDeleting).toBe(false)
    expect(result.current.error).toBeNull()
    expect(console.log).toHaveBeenCalledTimes(2)
  })
})
