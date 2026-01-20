import type {
  ListSubscriptionsResponse,
  SubscriptionResponse,
} from '@/external/dto/subscription.dto'

export type Subscription = SubscriptionResponse
export type SubscriptionList = ListSubscriptionsResponse
export type BillingCycle = 'monthly' | 'yearly'
