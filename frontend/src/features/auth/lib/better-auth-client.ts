import { customSessionClient } from 'better-auth/client/plugins'
import { createAuthClient } from 'better-auth/react'
import type { auth } from '@/features/auth/lib/better-auth'
import { env } from '@/shared/lib/env'

export const authClient = createAuthClient({
  baseURL: env.NEXT_PUBLIC_APP_URL,
  plugins: [
    // カスタムセッションの型推論を有効化
    customSessionClient<typeof auth>(),
  ],
})

export const { signIn, signOut, useSession } = authClient
