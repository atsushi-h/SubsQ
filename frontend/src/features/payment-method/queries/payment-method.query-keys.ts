export const paymentMethodKeys = {
  all: ['paymentMethods'] as const,
  lists: () => [...paymentMethodKeys.all, 'list'] as const,
  details: () => [...paymentMethodKeys.all, 'detail'] as const,
  detail: (id: string) => [...paymentMethodKeys.details(), id] as const,
}
