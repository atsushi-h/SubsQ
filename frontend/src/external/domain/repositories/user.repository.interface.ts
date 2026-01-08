import type { User, UserId } from '../entities/user'
import type { Email } from '../value-objects/email'

/**
 * User リポジトリインターフェース
 *
 * ドメイン層で定義するポート（Port）
 * 実装はインフラ層（/external/repository/）で行う
 *
 * 責務:
 * - Userエンティティの永続化・取得・削除
 * - データベースやAPIとの通信の抽象化
 */
export interface IUserRepository {
  /**
   * IDでユーザーを取得
   *
   * @param id ユーザーID
   * @returns ユーザー（存在しない場合はnull）
   */
  findById(id: UserId): Promise<User | null>

  /**
   * メールアドレスでユーザーを取得
   *
   * @param email メールアドレス
   * @returns ユーザー（存在しない場合はnull）
   */
  findByEmail(email: Email): Promise<User | null>

  /**
   * プロバイダー情報でユーザーを取得
   * （OAuth認証時に使用）
   *
   * @param provider プロバイダー名（例: "google"）
   * @param providerAccountId プロバイダーのアカウントID
   * @returns ユーザー（存在しない場合はnull）
   */
  findByProviderAccount(provider: string, providerAccountId: string): Promise<User | null>

  /**
   * ユーザーを保存（作成または更新）
   *
   * @param user 保存するユーザー
   * @returns 保存されたユーザー
   */
  save(user: User): Promise<User>

  /**
   * ユーザーを削除
   *
   * @param id 削除するユーザーID
   */
  delete(id: UserId): Promise<void>

  /**
   * ユーザーの存在確認
   *
   * @param id ユーザーID
   * @returns 存在する場合true
   */
  exists(id: UserId): Promise<boolean>

  /**
   * プロバイダーアカウントの存在確認
   *
   * @param provider プロバイダー名
   * @param providerAccountId プロバイダーのアカウントID
   * @returns 存在する場合true
   */
  existsByProviderAccount(provider: string, providerAccountId: string): Promise<boolean>
}
