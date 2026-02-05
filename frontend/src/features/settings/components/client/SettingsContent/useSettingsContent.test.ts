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

  it('初期状態ではisDeletingとisDialogOpenがfalse', () => {
    // Act
    const { result } = renderHook(() => useSettingsContent())

    // Assert
    expect(result.current.isDeleting).toBe(false)
    expect(result.current.isDialogOpen).toBe(false)
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

  it('handleDeleteConfirmを呼ぶとコンソールに出力され、ダイアログが閉じる', () => {
    // Arrange
    const { result } = renderHook(() => useSettingsContent())

    act(() => {
      result.current.handleDeleteRequest()
    })

    // Act
    act(() => {
      result.current.handleDeleteConfirm()
    })

    // Assert
    expect(console.log).toHaveBeenCalledWith('退会処理が呼び出されました')
    expect(result.current.isDialogOpen).toBe(false)
  })

  it('handleDeleteConfirm呼び出し中はisDeletingがtrue', () => {
    // Arrange
    const { result } = renderHook(() => useSettingsContent())

    // Act
    act(() => {
      result.current.handleDeleteConfirm()
    })

    // Assert
    expect(result.current.isDeleting).toBe(true)
  })

  it('500ms後にisDeletingがfalseに戻る', () => {
    // Arrange
    const { result } = renderHook(() => useSettingsContent())

    // Act
    act(() => {
      result.current.handleDeleteConfirm()
    })

    expect(result.current.isDeleting).toBe(true)

    act(() => {
      vi.advanceTimersByTime(500)
    })

    // Assert
    expect(result.current.isDeleting).toBe(false)
  })

  it('複数回確認しても正しく動作する', () => {
    // Arrange
    const { result } = renderHook(() => useSettingsContent())

    // Act - 1回目
    act(() => {
      result.current.handleDeleteRequest()
    })
    expect(result.current.isDialogOpen).toBe(true)

    act(() => {
      result.current.handleDeleteConfirm()
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

    act(() => {
      result.current.handleDeleteConfirm()
    })
    expect(result.current.isDeleting).toBe(true)

    act(() => {
      vi.advanceTimersByTime(500)
    })

    // Assert
    expect(result.current.isDeleting).toBe(false)
    expect(console.log).toHaveBeenCalledTimes(2)
  })
})
