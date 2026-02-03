import { E2ELogin } from '@/features/auth/components/client/E2ELogin'
import { Login } from '@/features/auth/components/client/Login'
import { checkE2EAuthEnabledServer } from '@/features/auth/servers/e2e-auth.server'

export function LoginPageTemplate() {
  const isE2EAuthEnabled = checkE2EAuthEnabledServer()
  return isE2EAuthEnabled ? <E2ELogin /> : <Login />
}
