import type { Amount, BaseDate, BillingCycle } from '../value-objects'

export type SubscriptionId = string
export type UserId = string
export type PaymentMethodId = string

interface SubscriptionUpdate {
  serviceName?: string
  amount?: Amount
  billingCycle?: BillingCycle
  baseDate?: BaseDate
  paymentMethodId?: PaymentMethodId | null
  memo?: string
}

export class Subscription {
  constructor(
    public readonly id: SubscriptionId,
    public readonly userId: UserId,
    public readonly serviceName: string,
    public readonly amount: Amount,
    public readonly billingCycle: BillingCycle,
    public readonly baseDate: BaseDate,
    public readonly paymentMethodId: PaymentMethodId | null,
    public readonly memo: string,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {
    if (!serviceName || serviceName.trim().length === 0) {
      throw new Error('サービス名は必須です')
    }
  }

  /**
   * サブスクリプションIDを生成する
   */
  static generateId(): SubscriptionId {
    return crypto.randomUUID()
  }

  /**
   * サービス名が有効かチェックする
   */
  static isServiceNameValid(serviceName: string): boolean {
    return !!serviceName && serviceName.trim().length > 0 && serviceName.trim().length <= 100
  }

  /**
   * 新規サブスクリプションを作成する
   */
  static create(params: {
    userId: UserId
    serviceName: string
    amount: Amount
    billingCycle: BillingCycle
    baseDate: BaseDate
    paymentMethodId?: PaymentMethodId | null
    memo?: string
  }): Subscription {
    const now = new Date()

    return new Subscription(
      Subscription.generateId(),
      params.userId,
      params.serviceName,
      params.amount,
      params.billingCycle,
      params.baseDate,
      params.paymentMethodId ?? null,
      params.memo ?? '',
      now,
      now,
    )
  }

  /**
   * DBから復元する
   */
  static reconstruct(params: {
    id: SubscriptionId
    userId: UserId
    serviceName: string
    amount: Amount
    billingCycle: BillingCycle
    baseDate: BaseDate
    paymentMethodId: PaymentMethodId | null
    memo: string
    createdAt: Date
    updatedAt: Date
  }): Subscription {
    return new Subscription(
      params.id,
      params.userId,
      params.serviceName,
      params.amount,
      params.billingCycle,
      params.baseDate,
      params.paymentMethodId,
      params.memo,
      params.createdAt,
      params.updatedAt,
    )
  }

  /**
   * 同一性を判定する
   */
  equals(other: Subscription): boolean {
    return this.id === other.id
  }

  /**
   * このユーザーのサブスクリプションかチェックする
   */
  belongsTo(userId: UserId): boolean {
    return this.userId === userId
  }

  /**
   * 支払い方法が設定されているかチェックする
   */
  hasPaymentMethod(): boolean {
    return this.paymentMethodId !== null
  }

  /**
   * 次回の請求日を計算する
   */
  calculateNextBillingDate(): Date {
    return this.baseDate.calculateNextBillingDate(this.billingCycle.getValue())
  }

  /**
   * 月額換算の金額を計算する
   */
  toMonthlyAmount(): Amount {
    return this.amount.toMonthlyEquivalent(this.billingCycle.getValue())
  }

  /**
   * 年額換算の金額を計算する
   */
  toYearlyAmount(): Amount {
    return this.amount.toYearlyEquivalent(this.billingCycle.getValue())
  }

  /**
   * サブスクリプションを更新する（イミュータブル）
   */
  withUpdate(update: SubscriptionUpdate): Subscription {
    return new Subscription(
      this.id,
      this.userId,
      update.serviceName ?? this.serviceName,
      update.amount ?? this.amount,
      update.billingCycle ?? this.billingCycle,
      update.baseDate ?? this.baseDate,
      update.paymentMethodId !== undefined ? update.paymentMethodId : this.paymentMethodId,
      update.memo !== undefined ? update.memo : this.memo,
      this.createdAt,
      new Date(),
    )
  }

  /**
   * 支払い方法を変更する（イミュータブル）
   */
  withPaymentMethod(paymentMethodId: PaymentMethodId | null): Subscription {
    return new Subscription(
      this.id,
      this.userId,
      this.serviceName,
      this.amount,
      this.billingCycle,
      this.baseDate,
      paymentMethodId,
      this.memo,
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
      userId: this.userId,
      serviceName: this.serviceName,
      amount: this.amount.getValue(),
      billingCycle: this.billingCycle.getValue(),
      baseDate: this.baseDate.getValue(),
      paymentMethodId: this.paymentMethodId,
      memo: this.memo,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    }
  }
}
