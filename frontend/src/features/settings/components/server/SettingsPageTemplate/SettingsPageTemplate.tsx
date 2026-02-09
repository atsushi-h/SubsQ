import { getAuthenticatedSessionServer } from '@/features/auth/servers/redirect.server'
import { SettingsContent } from '@/features/settings/components/client/SettingsContent'

export async function SettingsPageTemplate() {
  const session = await getAuthenticatedSessionServer()

  return (
    <div className="container mx-auto py-8">
      <SettingsContent userEmail={session.user.email} />
    </div>
  )
}
