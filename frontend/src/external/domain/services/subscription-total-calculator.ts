import type { Subscription } from '../entities/subscription'

export type TotalAmounts = {
  monthlyTotal: number
  yearlyTotal: number
}

/**
 * SubscriptionTotalCalculator ドメインサービス
 *
 * 役割: 複数のサブスクから月額合計・年額合計を計算する
 *
 * 処理:
 * 1. 各 Subscription の月額換算を合計 → monthlyTotal
 * 2. 各 Subscription の年額換算を合計 → yearlyTotal
 * 3. 円未満は切り捨て
 *
 * 使用例:
 * - ダッシュボードでの合計金額表示
 * - 月額/年額の総支出の確認
 */
export class SubscriptionTotalCalculator {
  /**
   * サブスクリプションの合計金額を計算
   *
   * @param subscriptions 計算対象のサブスクリプション配列
   * @returns 月額合計と年額合計
   */
  calculate(subscriptions: Subscription[]): TotalAmounts {
    let monthlyTotal = 0
    let yearlyTotal = 0

    for (const subscription of subscriptions) {
      monthlyTotal += subscription.toMonthlyAmount().getValue()
      yearlyTotal += subscription.toYearlyAmount().getValue()
    }

    return {
      monthlyTotal: Math.floor(monthlyTotal),
      yearlyTotal: Math.floor(yearlyTotal),
    }
  }

  /**
   * 月額合計のみを計算
   *
   * @param subscriptions 計算対象のサブスクリプション配列
   * @returns 月額合計
   */
  calculateMonthlyTotal(subscriptions: Subscription[]): number {
    const total = subscriptions.reduce(
      (sum, subscription) => sum + subscription.toMonthlyAmount().getValue(),
      0,
    )
    return Math.floor(total)
  }

  /**
   * 年額合計のみを計算
   *
   * @param subscriptions 計算対象のサブスクリプション配列
   * @returns 年額合計
   */
  calculateYearlyTotal(subscriptions: Subscription[]): number {
    const total = subscriptions.reduce(
      (sum, subscription) => sum + subscription.toYearlyAmount().getValue(),
      0,
    )
    return Math.floor(total)
  }
}
