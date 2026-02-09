import { paymentMethodRepository } from '../../repository/payment-method.repository'
import { subscriptionRepository } from '../../repository/subscription.repository'
import { userRepository } from '../../repository/user.repository'
import { PaymentMethodUsageChecker } from './payment-method-usage-checker'
import { SubscriptionTotalCalculator } from './subscription-total-calculator'
import { UserAccountDeleter } from './user-account-deleter'

// 型のエクスポート
export type { UsageCheckResult } from './payment-method-usage-checker'
// クラスのエクスポート
export { PaymentMethodUsageChecker } from './payment-method-usage-checker'
export type { TotalAmounts } from './subscription-total-calculator'
export { SubscriptionTotalCalculator } from './subscription-total-calculator'
export { UserAccountDeleter } from './user-account-deleter'

// シングルトンインスタンスのエクスポート
export const paymentMethodUsageChecker = new PaymentMethodUsageChecker()
export const subscriptionTotalCalculator = new SubscriptionTotalCalculator()
export const userAccountDeleter = new UserAccountDeleter(
  subscriptionRepository,
  paymentMethodRepository,
  userRepository,
)
