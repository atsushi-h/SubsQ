import type { ExtractTablesWithRelations } from 'drizzle-orm'
import type { NodePgQueryResultHKT } from 'drizzle-orm/node-postgres'
import type { PgTransaction } from 'drizzle-orm/pg-core'
import { db } from '../client/database/client'
import type * as schema from '../client/database/schema'
import type { ITransactionManager } from '../domain/repositories/transaction-manager.interface'

// Drizzleのトランザクション型を定義
export type DbTransaction = PgTransaction<
  NodePgQueryResultHKT,
  typeof schema,
  ExtractTablesWithRelations<typeof schema>
>

/**
 * DBクライアントまたはトランザクションの型（Repository内で使用）
 *
 * Union型 (typeof db | DbTransaction) にすることで、Repositoryメソッドが
 * トランザクション内でも外でも同じインターフェースで動作できるようになる。
 *
 * - トランザクション外: デフォルト引数 `client: DbClient = db` により通常のdbクライアントを使用
 * - トランザクション内: `tx`を明示的に渡すことでトランザクション専用クライアントを使用
 *
 * この設計により、既存のRepositoryメソッドを変更せずにトランザクション対応できる。
 */
export type DbClient = typeof db | DbTransaction

/**
 * TransactionManager
 * トランザクション管理の実装クラス
 * ITransactionManagerインターフェースを実装し、Service層に提供
 */
class TransactionManager implements ITransactionManager<DbClient> {
  /**
   * トランザクション内でコールバック関数を実行
   * @param callback トランザクション内で実行する処理
   * @returns コールバックの戻り値
   */
  async execute<T>(callback: (tx: DbClient) => Promise<T>): Promise<T> {
    return await db.transaction(async (tx) => {
      return await callback(tx)
    })
  }
}

export const transactionManager = new TransactionManager()
