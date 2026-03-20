import { env } from '@/shared/lib/env'

export function getSignInUrl(): string {
  return `${env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8080'}/api/v1/auth/google`
}

export async function signOut(): Promise<void> {
  await fetch(`${env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8080'}/api/v1/auth/logout`, {
    method: 'POST',
    credentials: 'include',
  })
}
