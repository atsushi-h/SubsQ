export type PaymentMethodId = string
export type UserId = string

interface PaymentMethodUpdate {
  name: string
}

export class PaymentMethod {
  constructor(
    public readonly id: PaymentMethodId,
    public readonly userId: UserId,
    public readonly name: string,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {
    if (!name || name.trim().length === 0) {
      throw new Error('支払い方法名は必須です')
    }
  }

  /**
   * 支払い方法IDを生成する
   */
  static generateId(): PaymentMethodId {
    return crypto.randomUUID()
  }

  /**
   * 支払い方法名が有効かチェックする
   */
  static isNameValid(name: string): boolean {
    return !!name && name.trim().length > 0 && name.trim().length <= 100
  }

  /**
   * 新規支払い方法を作成する
   */
  static create(params: { userId: UserId; name: string }): PaymentMethod {
    const now = new Date()

    return new PaymentMethod(PaymentMethod.generateId(), params.userId, params.name, now, now)
  }

  /**
   * DBから復元する
   */
  static reconstruct(params: {
    id: PaymentMethodId
    userId: UserId
    name: string
    createdAt: Date
    updatedAt: Date
  }): PaymentMethod {
    return new PaymentMethod(
      params.id,
      params.userId,
      params.name,
      params.createdAt,
      params.updatedAt,
    )
  }

  /**
   * 同一性を判定する
   */
  equals(other: PaymentMethod): boolean {
    return this.id === other.id
  }

  /**
   * このユーザーの支払い方法かチェックする
   */
  belongsTo(userId: UserId): boolean {
    return this.userId === userId
  }

  /**
   * 支払い方法を更新する（イミュータブル）
   */
  withUpdate(update: PaymentMethodUpdate): PaymentMethod {
    return new PaymentMethod(this.id, this.userId, update.name, this.createdAt, new Date())
  }

  /**
   * プレーンオブジェクトに変換する
   */
  toPlainObject() {
    return {
      id: this.id,
      userId: this.userId,
      name: this.name,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    }
  }
}
