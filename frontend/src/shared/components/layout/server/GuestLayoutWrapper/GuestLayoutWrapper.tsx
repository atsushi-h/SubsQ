import { redirectIfAuthenticatedServer } from '@/features/auth/servers/redirect.server'

type Props = {
  children: React.ReactNode
}

export const GuestLayoutWrapper = async ({ children }: Props) => {
  await redirectIfAuthenticatedServer()

  return <>{children}</>
}
