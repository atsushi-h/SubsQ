import { describe, expect, it } from 'vitest'
import { UpdateUserRequestSchema, UserResponseSchema } from './user.dto'

const validUser = {
  id: '123e4567-e89b-12d3-a456-426614174000',
  email: 'test@example.com',
  name: '山田 太郎',
  provider: 'google',
  providerAccountId: 'google-account-id',
  thumbnail: 'https://example.com/avatar.png',
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
}

describe('UserResponseSchema', () => {
  it('有効なレスポンスをパースできる', () => {
    expect(UserResponseSchema.safeParse(validUser).success).toBe(true)
  })

  it('thumbnailはnullを許容する', () => {
    const result = UserResponseSchema.safeParse({ ...validUser, thumbnail: null })
    expect(result.success).toBe(true)
  })

  it('thumbnailはundefinedを許容する', () => {
    const { thumbnail: _, ...withoutThumbnail } = validUser
    const result = UserResponseSchema.safeParse(withoutThumbnail)
    expect(result.success).toBe(true)
  })

  it('不正なemailでエラーになる', () => {
    const result = UserResponseSchema.safeParse({ ...validUser, email: 'not-an-email' })
    expect(result.success).toBe(false)
  })

  it('idが不正なUUIDでエラーになる', () => {
    const result = UserResponseSchema.safeParse({ ...validUser, id: 'not-a-uuid' })
    expect(result.success).toBe(false)
  })
})

describe('UpdateUserRequestSchema', () => {
  it('nameのみ指定できる', () => {
    const result = UpdateUserRequestSchema.safeParse({ name: '新しい名前' })
    expect(result.success).toBe(true)
  })

  it('thumbnailのみ指定できる', () => {
    const result = UpdateUserRequestSchema.safeParse({ thumbnail: 'https://example.com/new.png' })
    expect(result.success).toBe(true)
  })

  it('全フィールドがオプショナルで空オブジェクトを許容する', () => {
    const result = UpdateUserRequestSchema.safeParse({})
    expect(result.success).toBe(true)
  })

  it('nameが空文字でエラーになる', () => {
    const result = UpdateUserRequestSchema.safeParse({ name: '' })
    expect(result.success).toBe(false)
  })

  it('thumbnailはnullを許容する', () => {
    const result = UpdateUserRequestSchema.safeParse({ thumbnail: null })
    expect(result.success).toBe(true)
  })
})
