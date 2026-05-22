export const notificationKeys = {
  all: ['notifications'] as const,
  subscriptions: () => [...notificationKeys.all, 'subscriptions'] as const,
}
