import type { PaymentMethodId, UserId } from '../../domain/entities/payment-method'
import { PaymentMethod } from '../../domain/entities/payment-method'
import type { IPaymentMethodRepository } from '../../domain/repositories/payment-method.repository.interface'
import type { ITransactionManager } from '../../domain/repositories/transaction-manager.interface'
import { paymentMethodUsageChecker } from '../../domain/services'
import { paymentMethodRepository } from '../../repository/payment-method.repository'
import { type DbClient, transactionManager } from '../../repository/transaction-manager'

export interface CreatePaymentMethodInput {
  userId: UserId
  name: string
}

export interface UpdatePaymentMethodInput {
  name: string
}

export class PaymentMethodService {
  constructor(
    private paymentMethodRepository: IPaymentMethodRepository,
    private transactionManager: ITransactionManager<DbClient>,
  ) {}

  async getPaymentMethodById(id: PaymentMethodId): Promise<PaymentMethod | null> {
    return this.paymentMethodRepository.findById(id)
  }

  async getPaymentMethodsByUserId(userId: UserId): Promise<PaymentMethod[]> {
    return this.paymentMethodRepository.findByUserId(userId)
  }

  async getPaymentMethodByUserIdAndName(
    userId: UserId,
    name: string,
  ): Promise<PaymentMethod | null> {
    return this.paymentMethodRepository.findByUserIdAndName(userId, name)
  }

  async create(input: CreatePaymentMethodInput): Promise<PaymentMethod> {
    // 名前のバリデーション
    if (!PaymentMethod.isNameValid(input.name)) {
      throw new Error('Invalid payment method name')
    }

    // 同名の支払い方法が既に存在しないかチェック
    const existing = await this.getPaymentMethodByUserIdAndName(input.userId, input.name)
    if (existing) {
      throw new Error('Payment method with this name already exists')
    }

    const paymentMethod = PaymentMethod.create({
      userId: input.userId,
      name: input.name,
    })

    return this.paymentMethodRepository.save(paymentMethod)
  }

  async update(
    id: PaymentMethodId,
    userId: UserId,
    input: UpdatePaymentMethodInput,
  ): Promise<PaymentMethod> {
    const paymentMethod = await this.getPaymentMethodById(id)
    if (!paymentMethod) {
      throw new Error(`Payment method not found: ${id}`)
    }

    // 認可チェック：このユーザーの支払い方法か確認
    if (!paymentMethod.belongsTo(userId)) {
      throw new Error(`Unauthorized: User ${userId} cannot access payment method ${id}`)
    }

    // 名前のバリデーション
    if (!PaymentMethod.isNameValid(input.name)) {
      throw new Error('Invalid payment method name')
    }

    // 名前が変更される場合、同名の支払い方法が既に存在しないかチェック
    if (paymentMethod.name !== input.name) {
      const existing = await this.getPaymentMethodByUserIdAndName(userId, input.name)
      if (existing) {
        throw new Error('Payment method with this name already exists')
      }
    }

    // エンティティのメソッドを使用して更新を適用
    const updatedPaymentMethod = paymentMethod.withUpdate({
      name: input.name,
    })

    // 更新された支払い方法を保存
    return this.paymentMethodRepository.save(updatedPaymentMethod)
  }

  async delete(id: PaymentMethodId, userId: UserId): Promise<void> {
    return this.transactionManager.execute(async (tx) => {
      const paymentMethod = await this.paymentMethodRepository.findById(id, tx)
      if (!paymentMethod) {
        throw new Error(`Payment method not found: ${id}`)
      }

      // 認可チェック
      if (!paymentMethod.belongsTo(userId)) {
        throw new Error(`Unauthorized: User ${userId} cannot access payment method ${id}`)
      }

      // ドメインサービスで使用中チェック
      const subscriptions = await this.paymentMethodRepository.getSubscriptionsForPaymentMethod(
        id,
        tx,
      )
      paymentMethodUsageChecker.validateDeletion(id, subscriptions)

      await this.paymentMethodRepository.delete(id, tx)
    })
  }

  async deleteMany(ids: PaymentMethodId[], userId: UserId): Promise<void> {
    return this.transactionManager.execute(async (tx) => {
      // 全ての支払い方法がこのユーザーのものか確認
      const paymentMethods = await Promise.all(
        ids.map((id) => this.paymentMethodRepository.findById(id, tx)),
      )

      for (let i = 0; i < paymentMethods.length; i++) {
        const paymentMethod = paymentMethods[i]
        const id = ids[i]
        if (!paymentMethod) {
          throw new Error(`Payment method not found: ${id}`)
        }
        if (!paymentMethod.belongsTo(userId)) {
          throw new Error(`Unauthorized: User ${userId} cannot access payment method ${id}`)
        }
      }

      // ドメインサービスで使用中チェック
      for (const id of ids) {
        const subscriptions = await this.paymentMethodRepository.getSubscriptionsForPaymentMethod(
          id,
          tx,
        )
        paymentMethodUsageChecker.validateDeletion(id, subscriptions)
      }

      await this.paymentMethodRepository.deleteMany(ids, tx)
    })
  }
}

// シングルトンインスタンスをエクスポート
export const paymentMethodService = new PaymentMethodService(
  paymentMethodRepository,
  transactionManager,
)
