import type {
  ListSubscriptionsResponse,
  SubscriptionResponse,
} from '@/external/dto/subscription.dto'

export const mockSubscription: SubscriptionResponse = {
  id: 'sub-test-001',
  userId: 'user-test-001',
  serviceName: 'Netflix',
  amount: 1200,
  billingCycle: 'monthly',
  baseDate: '2024-01-01T00:00:00Z',
  paymentMethod: {
    id: 'pm-test-001',
    name: 'クレジットカード',
  },
  memo: 'テスト用サブスクリプション',
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
}

export const mockSubscriptionList: ListSubscriptionsResponse = {
  subscriptions: [
    mockSubscription,
    {
      ...mockSubscription,
      id: 'sub-test-002',
      serviceName: 'Spotify',
      amount: 980,
    },
  ],
  totals: {
    monthlyTotal: 2180,
    yearlyTotal: 0,
  },
}

export const emptySubscriptionList: ListSubscriptionsResponse = {
  subscriptions: [],
  totals: {
    monthlyTotal: 0,
    yearlyTotal: 0,
  },
}
