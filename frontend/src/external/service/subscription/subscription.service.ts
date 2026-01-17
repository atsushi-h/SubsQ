import type { PaymentMethodId, SubscriptionId, UserId } from '../../domain/entities/subscription'
import { Subscription } from '../../domain/entities/subscription'
import type { ISubscriptionRepository } from '../../domain/repositories/subscription.repository.interface'
import type { ITransactionRepository } from '../../domain/repositories/transaction-manager.interface'
import { Amount, BaseDate, BillingCycle, type BillingCycleType } from '../../domain/value-objects'
import { subscriptionRepository } from '../../repository/subscription.repository'
import { type DbClient, transactionRepository } from '../../repository/transaction.repository'

export interface CreateSubscriptionInput {
  userId: UserId
  serviceName: string
  amount: number
  billingCycle: BillingCycleType
  baseDate: number
  paymentMethodId?: PaymentMethodId | null
  memo?: string
}

export interface UpdateSubscriptionInput {
  serviceName?: string
  amount?: number
  billingCycle?: BillingCycleType
  baseDate?: number
  paymentMethodId?: PaymentMethodId | null
  memo?: string
}

export class SubscriptionService {
  constructor(
    private subscriptionRepository: ISubscriptionRepository,
    private transactionManager: ITransactionRepository<DbClient>,
  ) {}

  async getSubscriptionById(id: SubscriptionId): Promise<Subscription | null> {
    return this.subscriptionRepository.findById(id)
  }

  async getSubscriptionsByUserId(userId: UserId): Promise<Subscription[]> {
    return this.subscriptionRepository.findByUserId(userId)
  }

  async getSubscriptionsByPaymentMethodId(
    paymentMethodId: PaymentMethodId,
  ): Promise<Subscription[]> {
    return this.subscriptionRepository.findByPaymentMethodId(paymentMethodId)
  }

  async create(input: CreateSubscriptionInput): Promise<Subscription> {
    // サービス名のバリデーション
    if (!Subscription.isServiceNameValid(input.serviceName)) {
      throw new Error('Invalid service name')
    }

    // Value Objectsを作成
    const amount = Amount.fromValue(input.amount)
    const billingCycle = BillingCycle.fromValue(input.billingCycle)
    const baseDate = BaseDate.fromValue(input.baseDate)

    const subscription = Subscription.create({
      userId: input.userId,
      serviceName: input.serviceName,
      amount,
      billingCycle,
      baseDate,
      paymentMethodId: input.paymentMethodId,
      memo: input.memo,
    })

    return this.subscriptionRepository.save(subscription)
  }

  async update(
    id: SubscriptionId,
    userId: UserId,
    input: UpdateSubscriptionInput,
  ): Promise<Subscription> {
    const subscription = await this.getSubscriptionById(id)
    if (!subscription) {
      throw new Error(`Subscription not found: ${id}`)
    }

    // 認可チェック：このユーザーのサブスクリプションか確認
    if (!subscription.belongsTo(userId)) {
      throw new Error(`Unauthorized: User ${userId} cannot access subscription ${id}`)
    }

    // サービス名が指定されている場合はバリデーション
    if (input.serviceName !== undefined && !Subscription.isServiceNameValid(input.serviceName)) {
      throw new Error('Invalid service name')
    }

    // Value Objectsを作成（指定されている場合のみ）
    const updateData: {
      serviceName?: string
      amount?: Amount
      billingCycle?: BillingCycle
      baseDate?: BaseDate
      paymentMethodId?: PaymentMethodId | null
      memo?: string
    } = {}

    if (input.serviceName !== undefined) {
      updateData.serviceName = input.serviceName
    }
    if (input.amount !== undefined) {
      updateData.amount = Amount.fromValue(input.amount)
    }
    if (input.billingCycle !== undefined) {
      updateData.billingCycle = BillingCycle.fromValue(input.billingCycle)
    }
    if (input.baseDate !== undefined) {
      updateData.baseDate = BaseDate.fromValue(input.baseDate)
    }
    if (input.paymentMethodId !== undefined) {
      updateData.paymentMethodId = input.paymentMethodId
    }
    if (input.memo !== undefined) {
      updateData.memo = input.memo
    }

    // エンティティのメソッドを使用して更新を適用
    const updatedSubscription = subscription.withUpdate(updateData)

    // 更新されたサブスクリプションを保存
    return this.subscriptionRepository.save(updatedSubscription)
  }

  async updatePaymentMethod(
    id: SubscriptionId,
    userId: UserId,
    paymentMethodId: PaymentMethodId | null,
  ): Promise<Subscription> {
    const subscription = await this.getSubscriptionById(id)
    if (!subscription) {
      throw new Error(`Subscription not found: ${id}`)
    }

    // 認可チェック
    if (!subscription.belongsTo(userId)) {
      throw new Error(`Unauthorized: User ${userId} cannot access subscription ${id}`)
    }

    // 支払い方法を変更
    const updatedSubscription = subscription.withPaymentMethod(paymentMethodId)

    return this.subscriptionRepository.save(updatedSubscription)
  }

  async delete(id: SubscriptionId, userId: UserId): Promise<void> {
    const subscription = await this.getSubscriptionById(id)
    if (!subscription) {
      throw new Error(`Subscription not found: ${id}`)
    }

    // 認可チェック
    if (!subscription.belongsTo(userId)) {
      throw new Error(`Unauthorized: User ${userId} cannot access subscription ${id}`)
    }

    await this.subscriptionRepository.delete(id)
  }

  async deleteMany(ids: SubscriptionId[], userId: UserId): Promise<void> {
    return this.transactionManager.execute(async (tx) => {
      // 全てのサブスクリプションがこのユーザーのものか確認
      const subscriptions = await Promise.all(
        ids.map((id) => this.subscriptionRepository.findById(id, tx)),
      )

      for (let i = 0; i < subscriptions.length; i++) {
        const subscription = subscriptions[i]
        const id = ids[i]
        if (!subscription) {
          throw new Error(`Subscription not found: ${id}`)
        }
        if (!subscription.belongsTo(userId)) {
          throw new Error(`Unauthorized: User ${userId} cannot access subscription ${id}`)
        }
      }

      await this.subscriptionRepository.deleteMany(ids, tx)
    })
  }

  async getPaymentMethodForSubscription(
    paymentMethodId: PaymentMethodId | null,
  ): Promise<{ id: string; name: string } | null> {
    return this.subscriptionRepository.getPaymentMethodForSubscription(paymentMethodId)
  }
}

// シングルトンインスタンスをエクスポート
export const subscriptionService = new SubscriptionService(
  subscriptionRepository,
  transactionRepository,
)
