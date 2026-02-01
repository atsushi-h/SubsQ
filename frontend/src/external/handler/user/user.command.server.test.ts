import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { User } from '../../domain/entities/user'
import { Email } from '../../domain/value-objects'

// Serviceをモック
vi.mock('../../service/user/user.service', () => ({
  userService: {
    createOrGet: vi.fn(),
    update: vi.fn(),
    deleteAccount: vi.fn(),
  },
}))

import { userService } from '../../service/user/user.service'
import {
  createOrGetUserCommand,
  deleteUserAccountCommand,
  updateUserCommand,
} from './user.command.server'

// テストデータ
const INVALID_UUID = 'invalid-uuid'
const INVALID_EMAIL = 'invalid-email'
const VALID_USER_ID = '123e4567-e89b-12d3-a456-426614174000'
const ANOTHER_USER_ID = '123e4567-e89b-12d3-a456-426614174001'
const VALID_EMAIL = 'test@example.com'
const TEST_USER_NAME = 'Test User'
const PROVIDER = 'google'
const PROVIDER_ACCOUNT_ID = '123456789'
const NEW_THUMBNAIL_URL = 'https://example.com/new-avatar.jpg'

describe('createOrGetUserCommand', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('不正なメールアドレスでエラーになる', async () => {
    await expect(
      createOrGetUserCommand({
        email: INVALID_EMAIL,
        name: TEST_USER_NAME,
        provider: PROVIDER,
        providerAccountId: PROVIDER_ACCOUNT_ID,
      }),
    ).rejects.toThrow()
  })

  it('nameが空文字でエラーになる', async () => {
    await expect(
      createOrGetUserCommand({
        email: VALID_EMAIL,
        name: '',
        provider: PROVIDER,
        providerAccountId: PROVIDER_ACCOUNT_ID,
      }),
    ).rejects.toThrow()
  })

  it('ユーザーを作成または取得する', async () => {
    const mockUser: Partial<User> = {
      id: VALID_USER_ID,
      email: Email.fromValue(VALID_EMAIL),
      name: TEST_USER_NAME,
      provider: PROVIDER,
      providerAccountId: PROVIDER_ACCOUNT_ID,
      thumbnail: 'https://example.com/avatar.jpg',
      toPlainObject: vi.fn(() => ({
        id: VALID_USER_ID,
        email: VALID_EMAIL,
        name: TEST_USER_NAME,
        provider: PROVIDER,
        providerAccountId: PROVIDER_ACCOUNT_ID,
        thumbnail: 'https://example.com/avatar.jpg',
        createdAt: new Date('2024-01-01T00:00:00.000Z'),
        updatedAt: new Date('2024-01-01T00:00:00.000Z'),
      })),
    }

    vi.mocked(userService.createOrGet).mockResolvedValue(mockUser as User)

    const result = await createOrGetUserCommand({
      email: VALID_EMAIL,
      name: TEST_USER_NAME,
      provider: PROVIDER,
      providerAccountId: PROVIDER_ACCOUNT_ID,
      thumbnail: 'https://example.com/avatar.jpg',
    })

    expect(result.id).toBe(VALID_USER_ID)
    expect(result.email).toBe(VALID_EMAIL)
    expect(userService.createOrGet).toHaveBeenCalledWith(
      PROVIDER,
      PROVIDER_ACCOUNT_ID,
      expect.objectContaining({
        email: VALID_EMAIL,
        name: TEST_USER_NAME,
      }),
    )
  })
})

describe('updateUserCommand', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('不正なUUIDでエラーになる', async () => {
    await expect(
      updateUserCommand({ id: INVALID_UUID, name: 'Updated Name' }, VALID_USER_ID),
    ).rejects.toThrow()
  })

  it('認可チェック: 他のユーザーのプロフィールは更新できない', async () => {
    await expect(
      updateUserCommand({ id: VALID_USER_ID, name: 'Updated Name' }, ANOTHER_USER_ID),
    ).rejects.toThrow('Forbidden')
  })

  it('ユーザープロフィールを更新する', async () => {
    const mockUser: Partial<User> = {
      id: VALID_USER_ID,
      email: Email.fromValue(VALID_EMAIL),
      name: 'Updated Name',
      provider: PROVIDER,
      providerAccountId: PROVIDER_ACCOUNT_ID,
      thumbnail: NEW_THUMBNAIL_URL,
      toPlainObject: vi.fn(() => ({
        id: VALID_USER_ID,
        email: VALID_EMAIL,
        name: 'Updated Name',
        provider: PROVIDER,
        providerAccountId: PROVIDER_ACCOUNT_ID,
        thumbnail: NEW_THUMBNAIL_URL,
        createdAt: new Date('2024-01-01T00:00:00.000Z'),
        updatedAt: new Date('2024-01-02T00:00:00.000Z'),
      })),
    }

    vi.mocked(userService.update).mockResolvedValue(mockUser as User)

    const result = await updateUserCommand(
      {
        id: VALID_USER_ID,
        name: 'Updated Name',
        thumbnail: NEW_THUMBNAIL_URL,
      },
      VALID_USER_ID,
    )

    expect(result.id).toBe(VALID_USER_ID)
    expect(result.name).toBe('Updated Name')
    expect(userService.update).toHaveBeenCalledWith(
      VALID_USER_ID,
      expect.objectContaining({
        id: VALID_USER_ID,
        name: 'Updated Name',
      }),
    )
  })

  it('thumbnailをnullに更新できる', async () => {
    const mockUser: Partial<User> = {
      id: VALID_USER_ID,
      email: Email.fromValue(VALID_EMAIL),
      name: TEST_USER_NAME,
      provider: PROVIDER,
      providerAccountId: PROVIDER_ACCOUNT_ID,
      thumbnail: null,
      toPlainObject: vi.fn(() => ({
        id: VALID_USER_ID,
        email: VALID_EMAIL,
        name: TEST_USER_NAME,
        provider: PROVIDER,
        providerAccountId: PROVIDER_ACCOUNT_ID,
        thumbnail: null,
        createdAt: new Date('2024-01-01T00:00:00.000Z'),
        updatedAt: new Date('2024-01-02T00:00:00.000Z'),
      })),
    }

    vi.mocked(userService.update).mockResolvedValue(mockUser as User)

    const result = await updateUserCommand(
      {
        id: VALID_USER_ID,
        thumbnail: null,
      },
      VALID_USER_ID,
    )

    expect(result.thumbnail).toBeNull()
  })
})

describe('deleteUserAccountCommand', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('ユーザーアカウントを削除する', async () => {
    vi.mocked(userService.deleteAccount).mockResolvedValue()

    await deleteUserAccountCommand(VALID_USER_ID)

    expect(userService.deleteAccount).toHaveBeenCalledWith(VALID_USER_ID)
  })

  it('サービスが例外をスローした場合は伝播する', async () => {
    vi.mocked(userService.deleteAccount).mockRejectedValue(new Error('User not found'))

    await expect(deleteUserAccountCommand('not-exist')).rejects.toThrow('User not found')
  })
})
