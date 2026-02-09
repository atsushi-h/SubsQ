import { HttpResponse, http } from 'msw'
import { mockSubscription, mockSubscriptionList } from './data/subscription'

export const handlers = [
  http.get('/api/subscriptions', () => {
    return HttpResponse.json(mockSubscriptionList)
  }),

  http.get('/api/subscriptions/:id', ({ params }) => {
    return HttpResponse.json({
      ...mockSubscription,
      id: params.id,
    })
  }),

  http.post('/api/subscriptions', async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>
    return HttpResponse.json(
      {
        ...mockSubscription,
        ...body,
        id: 'sub-new-001',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      { status: 201 },
    )
  }),

  http.put('/api/subscriptions/:id', async ({ params, request }) => {
    const body = (await request.json()) as Record<string, unknown>
    return HttpResponse.json({
      ...mockSubscription,
      ...body,
      id: params.id,
      updatedAt: new Date().toISOString(),
    })
  }),

  http.delete('/api/subscriptions/:id', () => {
    return HttpResponse.json({ success: true }, { status: 204 })
  }),
]
