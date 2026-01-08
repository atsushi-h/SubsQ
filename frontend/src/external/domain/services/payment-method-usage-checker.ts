import type { PaymentMethodId, Subscription } from '../entities'

export type UsageCheckResult = {
  isUsed: boolean
  usageCount: number
}

/**
 * PaymentMethodUsageChecker ドメインサービス
 *
 * 役割: 支払い方法がサブスクで使用中かをチェックする
 *
 * 処理:
 * 1. paymentMethodId を参照している Subscription を検索
 * 2. 件数が1以上なら isUsed = true
 *
 * 使用例:
 * - PaymentMethod削除前の使用中チェック
 * - 使用中なら削除不可のエラーを返す
 */
export class PaymentMethodUsageChecker {
  /**
   * 支払い方法の使用状況をチェック
   *
   * @param paymentMethodId チェック対象の支払い方法ID
   * @param subscriptions ユーザーの全サブスクリプション
   * @returns 使用状況（isUsed: 使用中か, usageCount: 使用件数）
   */
  check(paymentMethodId: PaymentMethodId, subscriptions: Subscription[]): UsageCheckResult {
    const usedSubscriptions = subscriptions.filter(
      (subscription) => subscription.paymentMethodId === paymentMethodId,
    )

    const usageCount = usedSubscriptions.length

    return {
      isUsed: usageCount > 0,
      usageCount,
    }
  }

  /**
   * 支払い方法が削除可能かチェック
   *
   * @param paymentMethodId チェック対象の支払い方法ID
   * @param subscriptions ユーザーの全サブスクリプション
   * @returns 削除可能ならtrue
   */
  canDelete(paymentMethodId: PaymentMethodId, subscriptions: Subscription[]): boolean {
    const result = this.check(paymentMethodId, subscriptions)
    return !result.isUsed
  }

  /**
   * 使用中の支払い方法を削除しようとした場合のエラーをthrow
   *
   * @param paymentMethodId チェック対象の支払い方法ID
   * @param subscriptions ユーザーの全サブスクリプション
   * @throws 使用中の場合はエラー
   */
  validateDeletion(paymentMethodId: PaymentMethodId, subscriptions: Subscription[]): void {
    const result = this.check(paymentMethodId, subscriptions)
    if (result.isUsed) {
      throw new Error(
        `この支払い方法は${result.usageCount}件のサブスクで使用中のため削除できません`,
      )
    }
  }
}
