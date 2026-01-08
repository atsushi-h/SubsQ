import type { Subscription, SubscriptionId, UserId } from '../entities/subscription'

/**
 * Subscription リポジトリインターフェース
 *
 * ドメイン層で定義するポート（Port）
 * 実装はインフラ層（/external/repository/）で行う
 *
 * 責務:
 * - Subscriptionエンティティの永続化・取得・削除
 * - データベースやAPIとの通信の抽象化
 */
export interface ISubscriptionRepository {
  /**
   * IDでサブスクリプションを取得
   *
   * @param id サブスクリプションID
   * @returns サブスクリプション（存在しない場合はnull）
   */
  findById(id: SubscriptionId): Promise<Subscription | null>

  /**
   * ユーザーIDで全サブスクリプションを取得
   *
   * @param userId ユーザーID
   * @returns サブスクリプションの配列
   */
  findByUserId(userId: UserId): Promise<Subscription[]>

  /**
   * ユーザーIDでサブスクリプションIDの配列を取得
   * （削除処理などで使用）
   *
   * @param userId ユーザーID
   * @returns サブスクリプションIDの配列
   */
  findIdsByUserId(userId: UserId): Promise<SubscriptionId[]>

  /**
   * サブスクリプションを保存（作成または更新）
   *
   * @param subscription 保存するサブスクリプション
   * @returns 保存されたサブスクリプション
   */
  save(subscription: Subscription): Promise<Subscription>

  /**
   * サブスクリプションを削除
   *
   * @param id 削除するサブスクリプションID
   */
  delete(id: SubscriptionId): Promise<void>

  /**
   * 複数のサブスクリプションを一括削除
   *
   * @param ids 削除するサブスクリプションIDの配列
   */
  deleteMany(ids: SubscriptionId[]): Promise<void>

  /**
   * サブスクリプションの存在確認
   *
   * @param id サブスクリプションID
   * @returns 存在する場合true
   */
  exists(id: SubscriptionId): Promise<boolean>

  /**
   * 特定の支払い方法を使用しているサブスクリプションを取得
   *
   * @param paymentMethodId 支払い方法ID
   * @returns サブスクリプションの配列
   */
  findByPaymentMethodId(paymentMethodId: string): Promise<Subscription[]>
}
