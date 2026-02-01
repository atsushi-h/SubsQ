import { describe, expect, it } from 'vitest'
import { User } from '../../domain/entities/user'
import { toUserResponse } from './user.converter'

// テストデータ
const VALID_USER_ID = '123e4567-e89b-12d3-a456-426614174000'
const VALID_EMAIL = 'test@example.com'
const TEST_USER_NAME = 'Test User'
const PROVIDER = 'google'
const PROVIDER_ACCOUNT_ID = '123456789'

describe('toUserResponse', () => {
  it('UserエンティティをUserResponseに変換する', () => {
    const user = User.reconstruct({
      id: VALID_USER_ID,
      email: VALID_EMAIL,
      name: TEST_USER_NAME,
      provider: PROVIDER,
      providerAccountId: PROVIDER_ACCOUNT_ID,
      thumbnail: 'https://example.com/avatar.jpg',
      createdAt: new Date('2024-01-01T00:00:00.000Z'),
      updatedAt: new Date('2024-01-02T00:00:00.000Z'),
    })

    const result = toUserResponse(user)

    expect(result).toEqual({
      id: VALID_USER_ID,
      email: VALID_EMAIL,
      name: TEST_USER_NAME,
      thumbnail: 'https://example.com/avatar.jpg',
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-02T00:00:00.000Z',
    })
  })

  it('thumbnailがnullの場合も正しく変換する', () => {
    const user = User.reconstruct({
      id: VALID_USER_ID,
      email: VALID_EMAIL,
      name: TEST_USER_NAME,
      provider: PROVIDER,
      providerAccountId: PROVIDER_ACCOUNT_ID,
      thumbnail: null,
      createdAt: new Date('2024-01-01T00:00:00.000Z'),
      updatedAt: new Date('2024-01-01T00:00:00.000Z'),
    })

    const result = toUserResponse(user)

    expect(result.thumbnail).toBeNull()
  })

  it('DateオブジェクトをISO文字列に変換する', () => {
    const now = new Date('2024-01-15T12:30:45.123Z')
    const user = User.reconstruct({
      id: VALID_USER_ID,
      email: VALID_EMAIL,
      name: TEST_USER_NAME,
      provider: PROVIDER,
      providerAccountId: PROVIDER_ACCOUNT_ID,
      thumbnail: null,
      createdAt: now,
      updatedAt: now,
    })

    const result = toUserResponse(user)

    expect(result.createdAt).toBe('2024-01-15T12:30:45.123Z')
    expect(result.updatedAt).toBe('2024-01-15T12:30:45.123Z')
  })
})
