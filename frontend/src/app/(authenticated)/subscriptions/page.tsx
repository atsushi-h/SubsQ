import { getSessionServer } from '@/features/auth/servers/auth.server'

export default async function SubscriptionsPage() {
  const session = await getSessionServer()

  return (
    <div>
      <h1>Subscriptions</h1>
      <p>Welcome, {session?.user?.name}!</p>
    </div>
  )
}
