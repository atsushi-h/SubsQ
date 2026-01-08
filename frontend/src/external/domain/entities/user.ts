import { Email } from '../value-objects'

export type UserId = string

interface UserProfile {
  name: string
  thumbnail?: string | null
}

export class User {
  constructor(
    public readonly id: UserId,
    public readonly email: Email,
    public readonly name: string,
    public readonly provider: string,
    public readonly providerAccountId: string,
    public readonly thumbnail: string | null,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {
    if (!name.trim()) {
      throw new Error('User must have a name')
    }
  }

  /**
   * ユーザーIDを生成する
   */
  static generateId(): UserId {
    return crypto.randomUUID()
  }

  /**
   * メールアドレスからデフォルトの名前を生成する
   */
  static generateDefaultNameFromEmail(email: string): string {
    try {
      const emailVO = Email.fromValue(email)
      const localPart = emailVO.getValue().split('@')[0]
      return localPart
    } catch {
      return 'User'
    }
  }

  /**
   * ユーザー名が有効かチェックする
   */
  static isNameValid(name: string): boolean {
    const trimmedName = name.trim()
    return trimmedName.length > 0 && trimmedName.length <= 100
  }

  /**
   * 新規ユーザーを作成する
   */
  static create(params: {
    email: string
    name: string
    provider: string
    providerAccountId: string
    thumbnail?: string | null
  }): User {
    const now = new Date()

    return new User(
      User.generateId(),
      Email.fromValue(params.email),
      params.name,
      params.provider,
      params.providerAccountId,
      params.thumbnail ?? null,
      now,
      now,
    )
  }

  /**
   * DBから復元する
   */
  static reconstruct(params: {
    id: UserId
    email: string
    name: string
    provider: string
    providerAccountId: string
    thumbnail: string | null
    createdAt: Date
    updatedAt: Date
  }): User {
    return new User(
      params.id,
      Email.fromValue(params.email),
      params.name,
      params.provider,
      params.providerAccountId,
      params.thumbnail,
      params.createdAt,
      params.updatedAt,
    )
  }

  /**
   * 同一性を判定する
   */
  equals(other: User): boolean {
    return this.id === other.id
  }

  /**
   * 同じプロバイダーアカウントかチェックする
   */
  isSameProviderAccount(provider: string, providerAccountId: string): boolean {
    return this.provider === provider && this.providerAccountId === providerAccountId
  }

  /**
   * プロフィールを更新する（イミュータブル）
   */
  withProfile(profile: UserProfile): User {
    return new User(
      this.id,
      this.email,
      profile.name,
      this.provider,
      this.providerAccountId,
      profile.thumbnail ?? this.thumbnail,
      this.createdAt,
      new Date(),
    )
  }

  /**
   * プレーンオブジェクトに変換する
   */
  toPlainObject() {
    return {
      id: this.id,
      email: this.email.getValue(),
      name: this.name,
      provider: this.provider,
      providerAccountId: this.providerAccountId,
      thumbnail: this.thumbnail,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    }
  }
}
