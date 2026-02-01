import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { User } from '../../domain/entities/user'
import { Email } from '../../domain/value-objects'

// Serviceをモック
vi.mock('../../service/user/user.service', () => ({
  userService: {
    getUserById: vi.fn(),
    getUserByEmail: vi.fn(),
  },
}))

import { userService } from '../../service/user/user.service'
import { getCurrentUserQuery, getUserByEmailQuery, getUserByIdQuery } from './user.query.server'

// テストデータ
const INVALID_UUID = 'invalid-uuid'
const INVALID_EMAIL = 'invalid-email'
const VALID_USER_ID = '123e4567-e89b-12d3-a456-426614174000'
const VALID_EMAIL = 'test@example.com'
const NOT_FOUND_EMAIL = 'notfound@example.com'
const CURRENT_EMAIL = 'current@example.com'
const TEST_USER_NAME = 'Test User'
const CURRENT_USER_NAME = 'Current User'
const PROVIDER = 'google'
const CURRENT_PROVIDER_ACCOUNT_ID = '987654321'
const NOT_EXIST_USER_ID = 'not-exist'

describe('getUserByIdQuery', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('不正なUUIDでエラーになる', async () => {
    await expect(getUserByIdQuery({ id: INVALID_UUID })).rejects.toThrow()
  })

  it('ユーザーが見つからない場合はnullを返す', async () => {
    vi.mocked(userService.getUserById).mockResolvedValue(null)

    const result = await getUserByIdQuery({ id: '123e4567-e89b-12d3-a456-426614174000' })

    expect(result).toBeNull()
  })

  it('ユーザーを正しく返す', async () => {
    const mockUser: Partial<User> = {
      id: VALID_USER_ID,
      email: Email.fromValue(VALID_EMAIL),
      name: TEST_USER_NAME,
      provider: PROVIDER,
      providerAccountId: '123456789',
      thumbnail: 'https://example.com/avatar.jpg',
      toPlainObject: vi.fn(() => ({
        id: VALID_USER_ID,
        email: VALID_EMAIL,
        name: TEST_USER_NAME,
        provider: PROVIDER,
        providerAccountId: '123456789',
        thumbnail: 'https://example.com/avatar.jpg',
        createdAt: new Date('2024-01-01T00:00:00.000Z'),
        updatedAt: new Date('2024-01-01T00:00:00.000Z'),
      })),
    }

    vi.mocked(userService.getUserById).mockResolvedValue(mockUser as User)

    const result = await getUserByIdQuery({ id: VALID_USER_ID })

    expect(result).toBeDefined()
    expect(result?.id).toBe(VALID_USER_ID)
    expect(result?.email).toBe(VALID_EMAIL)
    expect(result?.name).toBe(TEST_USER_NAME)
  })
})

describe('getUserByEmailQuery', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('不正なメールアドレスでエラーになる', async () => {
    await expect(getUserByEmailQuery({ email: INVALID_EMAIL })).rejects.toThrow()
  })

  it('ユーザーが見つからない場合はnullを返す', async () => {
    vi.mocked(userService.getUserByEmail).mockResolvedValue(null)

    const result = await getUserByEmailQuery({ email: NOT_FOUND_EMAIL })

    expect(result).toBeNull()
  })

  it('メールアドレスでユーザーを取得する', async () => {
    const mockUser: Partial<User> = {
      id: VALID_USER_ID,
      email: Email.fromValue(VALID_EMAIL),
      name: TEST_USER_NAME,
      provider: PROVIDER,
      providerAccountId: '123456789',
      thumbnail: null,
      toPlainObject: vi.fn(() => ({
        id: VALID_USER_ID,
        email: VALID_EMAIL,
        name: TEST_USER_NAME,
        provider: PROVIDER,
        providerAccountId: '123456789',
        thumbnail: null,
        createdAt: new Date('2024-01-01T00:00:00.000Z'),
        updatedAt: new Date('2024-01-01T00:00:00.000Z'),
      })),
    }

    vi.mocked(userService.getUserByEmail).mockResolvedValue(mockUser as User)

    const result = await getUserByEmailQuery({ email: VALID_EMAIL })

    expect(result).toBeDefined()
    expect(result?.email).toBe(VALID_EMAIL)
    expect(userService.getUserByEmail).toHaveBeenCalledWith(VALID_EMAIL)
  })
})

describe('getCurrentUserQuery', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('現在のユーザーを取得する', async () => {
    const mockUser: Partial<User> = {
      id: VALID_USER_ID,
      email: Email.fromValue(CURRENT_EMAIL),
      name: CURRENT_USER_NAME,
      provider: PROVIDER,
      providerAccountId: CURRENT_PROVIDER_ACCOUNT_ID,
      thumbnail: null,
      toPlainObject: vi.fn(() => ({
        id: VALID_USER_ID,
        email: CURRENT_EMAIL,
        name: CURRENT_USER_NAME,
        provider: PROVIDER,
        providerAccountId: CURRENT_PROVIDER_ACCOUNT_ID,
        thumbnail: null,
        createdAt: new Date('2024-01-01T00:00:00.000Z'),
        updatedAt: new Date('2024-01-01T00:00:00.000Z'),
      })),
    }

    vi.mocked(userService.getUserById).mockResolvedValue(mockUser as User)

    const result = await getCurrentUserQuery(VALID_USER_ID)

    expect(result).toBeDefined()
    expect(result?.id).toBe(VALID_USER_ID)
    expect(userService.getUserById).toHaveBeenCalledWith(VALID_USER_ID)
  })

  it('ユーザーが見つからない場合はnullを返す', async () => {
    vi.mocked(userService.getUserById).mockResolvedValue(null)

    const result = await getCurrentUserQuery(NOT_EXIST_USER_ID)

    expect(result).toBeNull()
  })
})
