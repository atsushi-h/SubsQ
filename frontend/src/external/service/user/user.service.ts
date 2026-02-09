import { User } from '../../domain/entities/user'
import type { ITransactionManager } from '../../domain/repositories/transaction-manager.interface'
import type { IUserRepository } from '../../domain/repositories/user.repository.interface'
import { userAccountDeleter } from '../../domain/services'
import { Email } from '../../domain/value-objects/email'
import { type DbClient, transactionManager } from '../../repository/transaction-manager'
import { userRepository } from '../../repository/user.repository'

export interface CreateUserInput {
  email: string
  name: string
  provider: string
  providerAccountId: string
  thumbnail?: string
}

export interface UpdateUserInput {
  name?: string
  thumbnail?: string | null
}

export class UserService {
  constructor(
    private userRepository: IUserRepository,
    private transactionManager: ITransactionManager<DbClient>,
  ) {}

  async findByProvider(provider: string, providerAccountId: string): Promise<User | null> {
    return this.userRepository.findByProviderAccount(provider, providerAccountId)
  }

  async getUserById(id: string): Promise<User | null> {
    return this.userRepository.findById(id)
  }

  async getUserByEmail(email: string): Promise<User | null> {
    const emailVO = Email.fromValue(email)
    return this.userRepository.findByEmail(emailVO)
  }

  async create(input: CreateUserInput): Promise<User> {
    // 名前のバリデーション
    if (!User.isNameValid(input.name)) {
      throw new Error('Invalid user name')
    }

    const user = User.create({
      email: input.email,
      name: input.name,
      provider: input.provider,
      providerAccountId: input.providerAccountId,
      thumbnail: input.thumbnail,
    })

    return this.userRepository.save(user)
  }

  async createOrGet(
    provider: string,
    providerAccountId: string,
    createInput: CreateUserInput,
  ): Promise<User> {
    const existingUser = await this.findByProvider(provider, providerAccountId)

    if (existingUser) {
      // OAuthプロバイダーから取得した最新情報でプロフィールを更新
      const updatedUser = existingUser.withProfile({
        name: createInput.name,
        thumbnail: createInput.thumbnail ?? existingUser.thumbnail,
      })

      return this.userRepository.save(updatedUser)
    }

    return this.create(createInput)
  }

  /**
   * OAuthログインを処理する - 新規ユーザーは作成、既存ユーザーは返す
   * メールアドレスが検証済みであると信頼できるOAuthプロバイダー専用
   */
  async handleOAuthLogin(authData: {
    email: string
    name: string
    provider: string
    providerAccountId: string
    thumbnail?: string
  }): Promise<User> {
    return this.createOrGet(authData.provider, authData.providerAccountId, authData)
  }

  /**
   * ユーザープロフィール情報を更新する
   */
  async update(id: string, input: UpdateUserInput): Promise<User> {
    const user = await this.getUserById(id)
    if (!user) {
      throw new Error('User not found')
    }

    // 名前が指定されている場合はバリデーション
    if (input.name !== undefined && !User.isNameValid(input.name)) {
      throw new Error('Invalid user name')
    }

    // エンティティのメソッドを使用して更新を適用
    const updatedUser = user.withProfile({
      name: input.name ?? user.name,
      thumbnail: input.thumbnail === undefined ? user.thumbnail : input.thumbnail,
    })

    // 更新されたユーザーを保存
    return this.userRepository.save(updatedUser)
  }

  /**
   * ユーザーアカウントと関連データを全て削除
   *
   * 処理内容:
   * 1. ユーザーの存在確認
   * 2. UserAccountDeleterを使用してトランザクション内で削除
   *    - Subscriptions削除
   *    - PaymentMethods削除
   *    - User削除
   *
   * @param userId 削除対象のユーザーID
   * @throws Error ユーザーが存在しない場合
   */
  async deleteAccount(userId: string): Promise<void> {
    return this.transactionManager.execute(async (tx) => {
      // ユーザーの存在確認
      const user = await this.userRepository.findById(userId)
      if (!user) {
        throw new Error(`User not found: ${userId}`)
      }

      // UserAccountDeleterを使用してアカウント削除
      await userAccountDeleter.delete(userId, tx)
    })
  }
}

// シングルトンインスタンスをエクスポート
export const userService = new UserService(userRepository, transactionManager)
