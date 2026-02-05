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

  it('初期状態ではisDeletingがfalse', () => {
    // Act
    const { result } = renderHook(() => useSettingsContent())

    // Assert
    expect(result.current.isDeleting).toBe(false)
  })

  it('handleDeleteAccountを呼ぶとコンソールに出力される', () => {
    // Arrange
    const { result } = renderHook(() => useSettingsContent())

    // Act
    act(() => {
      result.current.handleDeleteAccount()
    })

    // Assert
    expect(console.log).toHaveBeenCalledWith('退会処理が呼び出されました')
  })

  it('handleDeleteAccount呼び出し中はisDeletingがtrue', () => {
    // Arrange
    const { result } = renderHook(() => useSettingsContent())

    // Act
    act(() => {
      result.current.handleDeleteAccount()
    })

    // Assert
    expect(result.current.isDeleting).toBe(true)
  })

  it('500ms後にisDeletingがfalseに戻る', () => {
    // Arrange
    const { result } = renderHook(() => useSettingsContent())

    // Act
    act(() => {
      result.current.handleDeleteAccount()
    })

    expect(result.current.isDeleting).toBe(true)

    act(() => {
      vi.advanceTimersByTime(500)
    })

    // Assert
    expect(result.current.isDeleting).toBe(false)
  })

  it('複数回呼び出しても正しく動作する', () => {
    // Arrange
    const { result } = renderHook(() => useSettingsContent())

    // Act - 1回目
    act(() => {
      result.current.handleDeleteAccount()
    })
    expect(result.current.isDeleting).toBe(true)

    act(() => {
      vi.advanceTimersByTime(500)
    })
    expect(result.current.isDeleting).toBe(false)

    // Act - 2回目
    act(() => {
      result.current.handleDeleteAccount()
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
