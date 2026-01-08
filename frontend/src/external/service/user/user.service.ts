import { User } from '../../domain/entities/user'
import { Email } from '../../domain/value-objects/email'
import { UserRepository } from '../../repository/user.repository'

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
  private userRepository: UserRepository

  constructor() {
    this.userRepository = new UserRepository()
  }

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
}

// シングルトンインスタンスをエクスポート
export const userService = new UserService()
