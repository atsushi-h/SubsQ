import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { ITransactionManager } from '../../domain/repositories/transaction-manager.interface'
import type { IUserRepository } from '../../domain/repositories/user.repository.interface'
import type { DbClient } from '../../repository/transaction-manager'

// =============================================================================
// モックデータ
// =============================================================================
const VALID_USER_ID = '123e4567-e89b-12d3-a456-426614174000'
const NOT_FOUND_ID = '123e4567-e89b-12d3-a456-426614174099'
const VALID_EMAIL = 'test@example.com'
const PROVIDER = 'google'
const PROVIDER_ACCOUNT_ID = '123456789'

// =============================================================================
// モック関数
// =============================================================================
function createMockRepository(): IUserRepository {
  return {
    findById: vi.fn(),
    findByEmail: vi.fn(),
    findByProviderAccount: vi.fn(),
    save: vi.fn(),
  } as unknown as IUserRepository
}

function createMockTxManager(): ITransactionManager<DbClient> {
  return {
    execute: vi.fn(),
  } as unknown as ITransactionManager<DbClient>
}

// Domain Serviceをモック
vi.mock('../../domain/services', () => ({
  userAccountDeleter: {
    delete: vi.fn(),
  },
}))

// User.createとUser.isNameValidをモック
vi.mock('../../domain/entities/user', () => ({
  User: {
    create: vi.fn((data) => ({
      id: 'user-new',
      email: data.email,
      name: data.name,
      provider: data.provider,
      providerAccountId: data.providerAccountId,
      thumbnail: data.thumbnail,
    })),
    isNameValid: vi.fn((name: string) => name.length > 0 && name.length <= 100),
  },
}))

// Email Value Objectをモック
vi.mock('../../domain/value-objects/email', () => ({
  Email: {
    fromValue: vi.fn((value: string) => ({
      value,
      getValue: () => value,
    })),
  },
}))

import { User } from '../../domain/entities/user'
import { userAccountDeleter } from '../../domain/services'
import { Email } from '../../domain/value-objects/email'
import { UserService } from './user.service'

// =============================================================================
// UserService Tests
// =============================================================================
describe('UserService', () => {
  let mockRepository: IUserRepository
  let mockTxManager: ITransactionManager<DbClient>
  let service: UserService

  beforeEach(() => {
    vi.clearAllMocks()
    mockRepository = createMockRepository()
    mockTxManager = createMockTxManager()
    service = new UserService(mockRepository, mockTxManager)
  })

  // ---------------------------------------------------------------------------
  // findByProvider
  // ---------------------------------------------------------------------------
  describe('findByProvider', () => {
    it('[Success] プロバイダーアカウントでユーザーを取得する', async () => {
      const mockEmail = Email.fromValue(VALID_EMAIL)
      const mockUser: Partial<User> = {
        id: VALID_USER_ID,
        email: mockEmail,
        provider: PROVIDER,
        providerAccountId: PROVIDER_ACCOUNT_ID,
      }
      vi.mocked(mockRepository.findByProviderAccount).mockResolvedValue(mockUser as unknown as User)

      const result = await service.findByProvider(PROVIDER, PROVIDER_ACCOUNT_ID)

      expect(mockRepository.findByProviderAccount).toHaveBeenCalledWith(
        PROVIDER,
        PROVIDER_ACCOUNT_ID,
      )
      expect(result).toEqual(mockUser)
    })

    it('[Success] ユーザーが見つからない場合はnullを返す', async () => {
      vi.mocked(mockRepository.findByProviderAccount).mockResolvedValue(null)

      const result = await service.findByProvider(PROVIDER, 'not-found')

      expect(result).toBeNull()
    })
  })

  // ---------------------------------------------------------------------------
  // getUserById
  // ---------------------------------------------------------------------------
  describe('getUserById', () => {
    it('[Success] ユーザーを取得する', async () => {
      const mockEmail = Email.fromValue(VALID_EMAIL)
      const mockUser: Partial<User> = {
        id: VALID_USER_ID,
        email: mockEmail,
      }
      vi.mocked(mockRepository.findById).mockResolvedValue(mockUser as unknown as User)

      const result = await service.getUserById(VALID_USER_ID)

      expect(mockRepository.findById).toHaveBeenCalledWith(VALID_USER_ID)
      expect(result).toEqual(mockUser)
    })

    it('[Success] ユーザーが見つからない場合はnullを返す', async () => {
      vi.mocked(mockRepository.findById).mockResolvedValue(null)

      const result = await service.getUserById(NOT_FOUND_ID)

      expect(result).toBeNull()
    })
  })

  // ---------------------------------------------------------------------------
  // getUserByEmail
  // ---------------------------------------------------------------------------
  describe('getUserByEmail', () => {
    it('[Success] メールアドレスでユーザーを取得する', async () => {
      const mockEmail = Email.fromValue(VALID_EMAIL)
      const mockUser: Partial<User> = {
        id: VALID_USER_ID,
        email: mockEmail,
      }
      vi.mocked(mockRepository.findByEmail).mockResolvedValue(mockUser as unknown as User)

      const result = await service.getUserByEmail(VALID_EMAIL)

      expect(Email.fromValue).toHaveBeenCalledWith(VALID_EMAIL)
      expect(mockRepository.findByEmail).toHaveBeenCalled()
      expect(result).toEqual(mockUser)
    })

    it('[Success] ユーザーが見つからない場合はnullを返す', async () => {
      vi.mocked(mockRepository.findByEmail).mockResolvedValue(null)

      const result = await service.getUserByEmail('notfound@example.com')

      expect(result).toBeNull()
    })
  })

  // ---------------------------------------------------------------------------
  // create
  // ---------------------------------------------------------------------------
  describe('create', () => {
    it('[Success] ユーザーを作成する', async () => {
      const input = {
        email: VALID_EMAIL,
        name: 'Test User',
        provider: PROVIDER,
        providerAccountId: PROVIDER_ACCOUNT_ID,
        thumbnail: 'https://example.com/avatar.jpg',
      }

      const mockEmail = Email.fromValue(VALID_EMAIL)
      vi.mocked(mockRepository.save).mockResolvedValue({
        id: 'user-new',
        email: mockEmail,
        name: 'Test User',
      } as unknown as User)

      const result = await service.create(input)

      expect(User.create).toHaveBeenCalled()
      expect(mockRepository.save).toHaveBeenCalled()
      expect(result.email.getValue()).toBe(VALID_EMAIL)
    })

    it('[Fail] 名前が不正な場合はエラーになる', async () => {
      const input = {
        email: VALID_EMAIL,
        name: '',
        provider: PROVIDER,
        providerAccountId: PROVIDER_ACCOUNT_ID,
      }

      await expect(service.create(input)).rejects.toThrow('Invalid user name')
    })
  })

  // ---------------------------------------------------------------------------
  // createOrGet
  // ---------------------------------------------------------------------------
  describe('createOrGet', () => {
    it('[Success] 既存ユーザーが存在する場合はプロフィールを更新して返す', async () => {
      const mockEmail = Email.fromValue(VALID_EMAIL)
      const updatedUser = {
        id: VALID_USER_ID,
        email: mockEmail,
        name: 'New Name',
        thumbnail: 'https://example.com/new.jpg',
      } as unknown as User

      const existingUser: Partial<User> = {
        id: VALID_USER_ID,
        email: mockEmail,
        name: 'Old Name',
        thumbnail: 'https://example.com/old.jpg',
        withProfile: vi.fn(() => updatedUser),
      }

      vi.mocked(mockRepository.findByProviderAccount).mockResolvedValue(
        existingUser as unknown as User,
      )
      vi.mocked(mockRepository.save).mockResolvedValue(updatedUser)

      const result = await service.createOrGet(PROVIDER, PROVIDER_ACCOUNT_ID, {
        email: VALID_EMAIL,
        name: 'New Name',
        provider: PROVIDER,
        providerAccountId: PROVIDER_ACCOUNT_ID,
        thumbnail: 'https://example.com/new.jpg',
      })

      expect(existingUser.withProfile).toHaveBeenCalledWith({
        name: 'New Name',
        thumbnail: 'https://example.com/new.jpg',
      })
      expect(mockRepository.save).toHaveBeenCalled()
      expect(result.name).toBe('New Name')
    })

    it('[Success] 既存ユーザーが存在しない場合は新規作成する', async () => {
      vi.mocked(mockRepository.findByProviderAccount).mockResolvedValue(null)
      const mockEmail = Email.fromValue(VALID_EMAIL)
      vi.mocked(mockRepository.save).mockResolvedValue({
        id: 'user-new',
        email: mockEmail,
        name: 'Test User',
      } as unknown as User)

      const result = await service.createOrGet(PROVIDER, PROVIDER_ACCOUNT_ID, {
        email: VALID_EMAIL,
        name: 'Test User',
        provider: PROVIDER,
        providerAccountId: PROVIDER_ACCOUNT_ID,
      })

      expect(User.create).toHaveBeenCalled()
      expect(mockRepository.save).toHaveBeenCalled()
      expect(result.email.getValue()).toBe(VALID_EMAIL)
    })
  })

  // ---------------------------------------------------------------------------
  // handleOAuthLogin
  // ---------------------------------------------------------------------------
  describe('handleOAuthLogin', () => {
    it('[Success] OAuthログインを処理する', async () => {
      vi.mocked(mockRepository.findByProviderAccount).mockResolvedValue(null)
      const mockEmail = Email.fromValue(VALID_EMAIL)
      vi.mocked(mockRepository.save).mockResolvedValue({
        id: 'user-new',
        email: mockEmail,
        name: 'Test User',
      } as unknown as User)

      const result = await service.handleOAuthLogin({
        email: VALID_EMAIL,
        name: 'Test User',
        provider: PROVIDER,
        providerAccountId: PROVIDER_ACCOUNT_ID,
      })

      expect(result.email.getValue()).toBe(VALID_EMAIL)
    })
  })

  // ---------------------------------------------------------------------------
  // update
  // ---------------------------------------------------------------------------
  describe('update', () => {
    it('[Success] ユーザープロフィールを更新する', async () => {
      const mockEmail = Email.fromValue(VALID_EMAIL)
      const updatedUser = {
        id: VALID_USER_ID,
        email: mockEmail,
        name: 'Updated Name',
        thumbnail: 'https://example.com/new.jpg',
      } as unknown as User

      const mockUser: Partial<User> = {
        id: VALID_USER_ID,
        email: mockEmail,
        name: 'Old Name',
        thumbnail: null,
        withProfile: vi.fn(() => updatedUser),
      }

      vi.mocked(mockRepository.findById).mockResolvedValue(mockUser as unknown as User)
      vi.mocked(mockRepository.save).mockResolvedValue(updatedUser)

      const result = await service.update(VALID_USER_ID, {
        name: 'Updated Name',
        thumbnail: 'https://example.com/new.jpg',
      })

      expect(mockUser.withProfile).toHaveBeenCalled()
      expect(mockRepository.save).toHaveBeenCalled()
      expect(result.name).toBe('Updated Name')
    })

    it('[Fail] ユーザーが見つからない場合はエラーになる', async () => {
      vi.mocked(mockRepository.findById).mockResolvedValue(null)

      await expect(service.update(NOT_FOUND_ID, { name: 'Updated' })).rejects.toThrow(
        'User not found',
      )
    })

    it('[Fail] 名前が不正な場合はエラーになる', async () => {
      const mockEmail = Email.fromValue(VALID_EMAIL)
      const mockUser: Partial<User> = {
        id: VALID_USER_ID,
        email: mockEmail,
        name: 'Old Name',
      }
      vi.mocked(mockRepository.findById).mockResolvedValue(mockUser as unknown as User)

      await expect(service.update(VALID_USER_ID, { name: '' })).rejects.toThrow('Invalid user name')
    })
  })

  // ---------------------------------------------------------------------------
  // deleteAccount
  // ---------------------------------------------------------------------------
  describe('deleteAccount', () => {
    it('[Success] ユーザーアカウントを削除する', async () => {
      const mockEmail = Email.fromValue(VALID_EMAIL)
      const mockUser: Partial<User> = {
        id: VALID_USER_ID,
        email: mockEmail,
      }

      vi.mocked(mockTxManager.execute).mockImplementation(async (callback) => {
        return callback({} as DbClient)
      })

      vi.mocked(mockRepository.findById).mockResolvedValue(mockUser as unknown as User)
      vi.mocked(userAccountDeleter.delete).mockResolvedValue(undefined)

      await service.deleteAccount(VALID_USER_ID)

      expect(mockRepository.findById).toHaveBeenCalledWith(VALID_USER_ID)
      expect(userAccountDeleter.delete).toHaveBeenCalledWith(VALID_USER_ID, {})
    })

    it('[Fail] ユーザーが見つからない場合はエラーになる', async () => {
      vi.mocked(mockTxManager.execute).mockImplementation(async (callback) => {
        return callback({} as DbClient)
      })

      vi.mocked(mockRepository.findById).mockResolvedValue(null)

      await expect(service.deleteAccount(NOT_FOUND_ID)).rejects.toThrow('User not found')
    })
  })
})
