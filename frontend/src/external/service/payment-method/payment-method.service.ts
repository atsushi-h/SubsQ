import type { PaymentMethodId, UserId } from '../../domain/entities/payment-method'
import { PaymentMethod } from '../../domain/entities/payment-method'
import type { IPaymentMethodRepository } from '../../domain/repositories/payment-method.repository.interface'
import { paymentMethodRepository } from '../../repository/payment-method.repository'

export interface CreatePaymentMethodInput {
  userId: UserId
  name: string
}

export interface UpdatePaymentMethodInput {
  name: string
}

export class PaymentMethodService {
  constructor(private paymentMethodRepository: IPaymentMethodRepository) {}

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
      throw new Error('Payment method not found')
    }

    // 認可チェック：このユーザーの支払い方法か確認
    if (!paymentMethod.belongsTo(userId)) {
      throw new Error('Unauthorized')
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
    const paymentMethod = await this.getPaymentMethodById(id)
    if (!paymentMethod) {
      throw new Error('Payment method not found')
    }

    // 認可チェック
    if (!paymentMethod.belongsTo(userId)) {
      throw new Error('Unauthorized')
    }

    // Note: データベース制約により、この支払い方法を使用している
    // サブスクリプションが存在する場合は削除が失敗します (onDelete: 'restrict')
    await this.paymentMethodRepository.delete(id)
  }

  async deleteMany(ids: PaymentMethodId[], userId: UserId): Promise<void> {
    // 全ての支払い方法がこのユーザーのものか確認
    const paymentMethods = await Promise.all(ids.map((id) => this.getPaymentMethodById(id)))

    for (const paymentMethod of paymentMethods) {
      if (!paymentMethod) {
        throw new Error('Payment method not found')
      }
      if (!paymentMethod.belongsTo(userId)) {
        throw new Error('Unauthorized')
      }
    }

    await this.paymentMethodRepository.deleteMany(ids)
  }
}

// シングルトンインスタンスをエクスポート
export const paymentMethodService = new PaymentMethodService(paymentMethodRepository)
