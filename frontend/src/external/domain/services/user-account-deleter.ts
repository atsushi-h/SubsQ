import type { UserId } from '../entities'
import type {
  IPaymentMethodRepository,
  ISubscriptionRepository,
  IUserRepository,
} from '../repositories'

/**
 * UserAccountDeleter ドメインサービス
 *
 * 役割: 退会処理。関連データを正しい順序で削除する
 *
 * 処理:
 * 1. userId に紐づく Subscription を全削除
 * 2. userId に紐づく PaymentMethod を全削除
 * 3. User を削除
 * ※ トランザクション内で実行（呼び出し側で制御）
 *
 * 使用例:
 * - ユーザーの退会処理
 * - アカウント削除リクエスト
 */
export class UserAccountDeleter {
  constructor(
    private readonly subscriptionRepository: ISubscriptionRepository,
    private readonly paymentMethodRepository: IPaymentMethodRepository,
    private readonly userRepository: IUserRepository,
  ) {}

  /**
   * ユーザーアカウントと関連データを全て削除
   *
   * @param userId 削除対象のユーザーID
   *
   * 注意:
   * - この処理は呼び出し側でトランザクション管理が必要
   * - 途中で失敗した場合はロールバックされるべき
   */
  async delete(userId: UserId): Promise<void> {
    // 1. ユーザーの全サブスクリプションを削除
    const subscriptionIds = await this.subscriptionRepository.findIdsByUserId(userId)
    if (subscriptionIds.length > 0) {
      await this.subscriptionRepository.deleteMany(subscriptionIds)
    }

    // 2. ユーザーの全支払い方法を削除
    const paymentMethodIds = await this.paymentMethodRepository.findIdsByUserId(userId)
    if (paymentMethodIds.length > 0) {
      await this.paymentMethodRepository.deleteMany(paymentMethodIds)
    }

    // 3. ユーザーを削除
    await this.userRepository.delete(userId)
  }

  /**
   * 削除前の確認情報を取得
   *
   * @param userId 確認対象のユーザーID
   * @returns 削除される件数の情報
   */
  async getDeletionInfo(userId: UserId): Promise<{
    subscriptionCount: number
    paymentMethodCount: number
  }> {
    const [subscriptionIds, paymentMethodIds] = await Promise.all([
      this.subscriptionRepository.findIdsByUserId(userId),
      this.paymentMethodRepository.findIdsByUserId(userId),
    ])

    return {
      subscriptionCount: subscriptionIds.length,
      paymentMethodCount: paymentMethodIds.length,
    }
  }
}
