import { describe, expect, it } from 'vitest'
import {
  CreateOrGetUserRequestSchema,
  CreateUserRequestSchema,
  GetUserByEmailRequestSchema,
  GetUserByIdRequestSchema,
  UpdateUserRequestSchema,
  UserResponseSchema,
} from './user.dto'

// テストデータ
const INVALID_UUID = 'not-a-uuid'
const INVALID_EMAIL = 'not-an-email'
const VALID_USER_ID = '123e4567-e89b-12d3-a456-426614174000'
const VALID_EMAIL = 'test@example.com'
const TEST_USER_NAME = 'Test User'
const PROVIDER = 'google'
const PROVIDER_ACCOUNT_ID = '123456789'
const THUMBNAIL_URL = 'https://example.com/avatar.jpg'
const NEW_THUMBNAIL_URL = 'https://example.com/new-avatar.jpg'

describe('CreateUserRequestSchema', () => {
  const validRequest = {
    email: VALID_EMAIL,
    name: TEST_USER_NAME,
    provider: PROVIDER,
    providerAccountId: PROVIDER_ACCOUNT_ID,
    thumbnail: THUMBNAIL_URL,
  }

  it('有効なリクエストをパースできる', () => {
    const result = CreateUserRequestSchema.safeParse(validRequest)
    expect(result.success).toBe(true)
  })

  it('thumbnailは省略可能', () => {
    const { thumbnail, ...withoutThumbnail } = validRequest
    const result = CreateUserRequestSchema.safeParse(withoutThumbnail)
    expect(result.success).toBe(true)
  })

  it('emailが不正な形式でエラーになる', () => {
    const invalid = { ...validRequest, email: INVALID_EMAIL }
    const result = CreateUserRequestSchema.safeParse(invalid)
    expect(result.success).toBe(false)
  })

  it('nameが空文字でエラーになる', () => {
    const invalid = { ...validRequest, name: '' }
    const result = CreateUserRequestSchema.safeParse(invalid)
    expect(result.success).toBe(false)
  })

  it('providerが欠落している場合エラーになる', () => {
    const { provider, ...withoutProvider } = validRequest
    const result = CreateUserRequestSchema.safeParse(withoutProvider)
    expect(result.success).toBe(false)
  })
})

describe('CreateOrGetUserRequestSchema', () => {
  it('CreateUserRequestSchemaと同じスキーマである', () => {
    const request = {
      email: VALID_EMAIL,
      name: TEST_USER_NAME,
      provider: PROVIDER,
      providerAccountId: PROVIDER_ACCOUNT_ID,
    }
    const result = CreateOrGetUserRequestSchema.safeParse(request)
    expect(result.success).toBe(true)
  })
})

describe('UpdateUserRequestSchema', () => {
  it('有効なリクエストをパースできる', () => {
    const request = {
      id: VALID_USER_ID,
      name: 'Updated Name',
      thumbnail: NEW_THUMBNAIL_URL,
    }
    const result = UpdateUserRequestSchema.safeParse(request)
    expect(result.success).toBe(true)
  })

  it('nameとthumbnailは省略可能', () => {
    const request = {
      id: VALID_USER_ID,
    }
    const result = UpdateUserRequestSchema.safeParse(request)
    expect(result.success).toBe(true)
  })

  it('thumbnailにnullを指定できる', () => {
    const request = {
      id: VALID_USER_ID,
      thumbnail: null,
    }
    const result = UpdateUserRequestSchema.safeParse(request)
    expect(result.success).toBe(true)
  })

  it('idが不正なUUID形式でエラーになる', () => {
    const request = {
      id: INVALID_UUID,
      name: 'Updated Name',
    }
    const result = UpdateUserRequestSchema.safeParse(request)
    expect(result.success).toBe(false)
  })

  it('nameが空文字でエラーになる', () => {
    const request = {
      id: VALID_USER_ID,
      name: '',
    }
    const result = UpdateUserRequestSchema.safeParse(request)
    expect(result.success).toBe(false)
  })
})

describe('GetUserByIdRequestSchema', () => {
  it('有効なUUIDをパースできる', () => {
    const request = {
      id: VALID_USER_ID,
    }
    const result = GetUserByIdRequestSchema.safeParse(request)
    expect(result.success).toBe(true)
  })

  it('不正なUUID形式でエラーになる', () => {
    const request = { id: INVALID_UUID }
    const result = GetUserByIdRequestSchema.safeParse(request)
    expect(result.success).toBe(false)
  })
})

describe('GetUserByEmailRequestSchema', () => {
  it('有効なメールアドレスをパースできる', () => {
    const request = {
      email: VALID_EMAIL,
    }
    const result = GetUserByEmailRequestSchema.safeParse(request)
    expect(result.success).toBe(true)
  })

  it('不正なメール形式でエラーになる', () => {
    const request = { email: INVALID_EMAIL }
    const result = GetUserByEmailRequestSchema.safeParse(request)
    expect(result.success).toBe(false)
  })
})

describe('UserResponseSchema', () => {
  const validResponse = {
    id: VALID_USER_ID,
    email: VALID_EMAIL,
    name: TEST_USER_NAME,
    thumbnail: THUMBNAIL_URL,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  }

  it('有効なレスポンスをパースできる', () => {
    const result = UserResponseSchema.safeParse(validResponse)
    expect(result.success).toBe(true)
  })

  it('thumbnailがnullの場合もパースできる', () => {
    const response = { ...validResponse, thumbnail: null }
    const result = UserResponseSchema.safeParse(response)
    expect(result.success).toBe(true)
  })

  it('idが不正なUUID形式でエラーになる', () => {
    const invalid = { ...validResponse, id: INVALID_UUID }
    const result = UserResponseSchema.safeParse(invalid)
    expect(result.success).toBe(false)
  })

  it('emailが不正な形式でエラーになる', () => {
    const invalid = { ...validResponse, email: INVALID_EMAIL }
    const result = UserResponseSchema.safeParse(invalid)
    expect(result.success).toBe(false)
  })

  it('createdAtが不正なISO形式でエラーになる', () => {
    const invalid = { ...validResponse, createdAt: 'not-a-date' }
    const result = UserResponseSchema.safeParse(invalid)
    expect(result.success).toBe(false)
  })
})
