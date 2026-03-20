import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  usersDeleteCurrentUser,
  usersGetCurrentUser,
  usersUpdateCurrentUser,
} from '@/external/client/api/generated/users/users'
import { deleteUser, getCurrentUser, updateUser } from './user.service'

vi.mock('@/external/client/api/generated/users/users')

const mockUser = {
  id: '123e4567-e89b-12d3-a456-426614174000',
  email: 'test@example.com',
  name: '山田 太郎',
  provider: 'google',
  providerAccountId: 'google-123',
  thumbnail: 'https://example.com/avatar.png',
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('getCurrentUser', () => {
  it('ユーザー情報を正常に取得できる', async () => {
    vi.mocked(usersGetCurrentUser).mockResolvedValue({ status: 200, data: mockUser } as any)

    const result = await getCurrentUser()
    expect(result).toEqual(mockUser)
  })

  it('200以外のステータスでnullを返す', async () => {
    vi.mocked(usersGetCurrentUser).mockResolvedValue({ status: 401, data: null } as any)

    const result = await getCurrentUser()
    expect(result).toBeNull()
  })

  it('例外が発生した場合nullを返す', async () => {
    vi.mocked(usersGetCurrentUser).mockRejectedValue(new Error('network error'))

    const result = await getCurrentUser()
    expect(result).toBeNull()
  })
})

describe('updateUser', () => {
  it('ユーザー情報を正常に更新できる', async () => {
    const updated = { ...mockUser, name: '新しい名前' }
    vi.mocked(usersUpdateCurrentUser).mockResolvedValue({ status: 200, data: updated } as any)

    const result = await updateUser({ name: '新しい名前' })
    expect(result.name).toBe('新しい名前')
  })

  it('200以外のステータスでエラーをスローする', async () => {
    vi.mocked(usersUpdateCurrentUser).mockResolvedValue({ status: 400, data: null } as any)

    await expect(updateUser({ name: '名前' })).rejects.toThrow('ユーザー情報の更新に失敗しました')
  })
})

describe('deleteUser', () => {
  it('アカウントを正常に削除できる', async () => {
    vi.mocked(usersDeleteCurrentUser).mockResolvedValue({ status: 204, data: null } as any)

    await expect(deleteUser()).resolves.toBeUndefined()
  })

  it('204以外のステータスでエラーをスローする', async () => {
    vi.mocked(usersDeleteCurrentUser).mockResolvedValue({ status: 500, data: null } as any)

    await expect(deleteUser()).rejects.toThrow('アカウントの削除に失敗しました')
  })
})
