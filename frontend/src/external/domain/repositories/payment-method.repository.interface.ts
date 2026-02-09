import type { DbClient } from '../../repository/transaction-manager'
import type { Subscription } from '../entities'
import type { PaymentMethod, PaymentMethodId, UserId } from '../entities/payment-method'

/**
 * PaymentMethod リポジトリインターフェース
 *
 * ドメイン層で定義するポート（Port）
 * 実装はインフラ層（/external/repository/）で行う
 *
 * 責務:
 * - PaymentMethodエンティティの永続化・取得・削除
 * - データベースやAPIとの通信の抽象化
 */
export interface IPaymentMethodRepository {
  /**
   * IDで支払い方法を取得
   *
   * @param id 支払い方法ID
   * @param client DBクライアントまたはトランザクション（オプション）
   * @returns 支払い方法（存在しない場合はnull）
   */
  findById(id: PaymentMethodId, client?: DbClient): Promise<PaymentMethod | null>

  /**
   * 複数のIDで支払い方法を一括取得
   *
   * @param ids 支払い方法IDの配列
   * @param client DBクライアントまたはトランザクション（オプション）
   * @returns 支払い方法の配列（存在しないIDは含まれない）
   */
  findByIds(ids: PaymentMethodId[], client?: DbClient): Promise<PaymentMethod[]>

  /**
   * ユーザーIDで全支払い方法を取得
   *
   * @param userId ユーザーID
   * @returns 支払い方法の配列
   */
  findByUserId(userId: UserId): Promise<PaymentMethod[]>

  /**
   * ユーザーIDで支払い方法IDの配列を取得
   * （削除処理などで使用）
   *
   * @param userId ユーザーID
   * @param client DBクライアントまたはトランザクション（オプション）
   * @returns 支払い方法IDの配列
   */
  findIdsByUserId(userId: UserId, client?: DbClient): Promise<PaymentMethodId[]>

  /**
   * 支払い方法を保存（作成または更新）
   *
   * @param paymentMethod 保存する支払い方法
   * @returns 保存された支払い方法
   */
  save(paymentMethod: PaymentMethod): Promise<PaymentMethod>

  /**
   * 支払い方法を削除
   *
   * @param id 削除する支払い方法ID
   * @param client DBクライアントまたはトランザクション（オプション）
   */
  delete(id: PaymentMethodId, client?: DbClient): Promise<void>

  /**
   * 複数の支払い方法を一括削除
   *
   * @param ids 削除する支払い方法IDの配列
   * @param client DBクライアントまたはトランザクション（オプション）
   */
  deleteMany(ids: PaymentMethodId[], client?: DbClient): Promise<void>

  /**
   * 支払い方法の存在確認
   *
   * @param id 支払い方法ID
   * @returns 存在する場合true
   */
  exists(id: PaymentMethodId): Promise<boolean>

  /**
   * 特定のユーザーが特定の名前の支払い方法を持っているか確認
   * （同名チェックなどで使用）
   *
   * @param userId ユーザーID
   * @param name 支払い方法名
   * @returns 存在する場合の支払い方法（存在しない場合はnull）
   */
  findByUserIdAndName(userId: UserId, name: string): Promise<PaymentMethod | null>

  /**
   * 支払い方法IDでサブスクリプションを取得
   *
   * @param paymentMethodId 支払い方法ID
   * @param client DBクライアントまたはトランザクション（オプション）
   * @returns サブスクリプションの配列
   */
  getSubscriptionsForPaymentMethod(
    paymentMethodId: PaymentMethodId,
    client?: DbClient,
  ): Promise<Subscription[]>

  /**
   * 複数の支払い方法IDでサブスクリプションを一括取得
   *
   * @param paymentMethodIds 支払い方法IDの配列
   * @param client DBクライアントまたはトランザクション（オプション）
   * @returns サブスクリプションの配列
   */
  getSubscriptionsForPaymentMethods(
    paymentMethodIds: PaymentMethodId[],
    client?: DbClient,
  ): Promise<Subscription[]>
}
