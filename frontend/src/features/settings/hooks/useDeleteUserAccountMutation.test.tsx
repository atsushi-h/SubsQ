import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook } from '@testing-library/react'
import { useRouter } from 'next/navigation'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { deleteUserAccountCommandAction } from '@/external/handler/user/user.command.action'
import { signOut } from '@/features/auth/lib/better-auth-client'
import { useDeleteUserAccountMutation } from './useDeleteUserAccountMutation'

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

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}

describe('useDeleteUserAccountMutation', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('削除成功後、ログアウトしてログインページに遷移する', async () => {
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

    const { result } = renderHook(() => useDeleteUserAccountMutation(), {
      wrapper: createWrapper(),
    })

    // Act
    await act(async () => {
      await result.current.mutateAsync()
    })

    // Assert
    expect(deleteUserAccountCommandAction).toHaveBeenCalledTimes(1)
    expect(signOut).toHaveBeenCalledTimes(1)
    expect(pushMock).toHaveBeenCalledWith('/login')
  })

  it('削除成功後、signOutが失敗してもログインページに遷移する', async () => {
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

    const { result } = renderHook(() => useDeleteUserAccountMutation(), {
      wrapper: createWrapper(),
    })

    // Act
    await act(async () => {
      await result.current.mutateAsync()
    })

    // Assert
    expect(deleteUserAccountCommandAction).toHaveBeenCalledTimes(1)
    expect(signOut).toHaveBeenCalledTimes(1)
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'ログアウト処理に失敗しましたが、アカウントは削除されました',
      expect.any(Error),
    )
    expect(pushMock).toHaveBeenCalledWith('/login')

    consoleErrorSpy.mockRestore()
  })

  it('削除が失敗した場合、エラーがスローされる', async () => {
    // Arrange
    const errorMessage = 'アカウント削除に失敗しました'
    vi.mocked(deleteUserAccountCommandAction).mockRejectedValue(new Error(errorMessage))

    const { result } = renderHook(() => useDeleteUserAccountMutation(), {
      wrapper: createWrapper(),
    })

    // Act & Assert
    await expect(
      act(async () => {
        await result.current.mutateAsync()
      }),
    ).rejects.toThrow(errorMessage)

    expect(deleteUserAccountCommandAction).toHaveBeenCalledTimes(1)
    expect(signOut).not.toHaveBeenCalled()
  })
})
