/**
 * ITransactionManager
 * トランザクション管理のインターフェース
 * Service層がDB実装に依存しないようにするための抽象化
 */
export interface ITransactionManager<TxType = unknown> {
  /**
   * トランザクション内でコールバック関数を実行
   * @param callback トランザクション内で実行する処理
   * @returns コールバックの戻り値
   */
  execute<T>(callback: (tx: TxType) => Promise<T>): Promise<T>
}
