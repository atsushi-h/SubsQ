import { env } from '@/shared/lib/env'

export const customFetch = async <T>(url: string, options: RequestInit): Promise<T> => {
  const baseUrl = env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8080'

  const headers: Record<string, string> = {}

  // サーバー側では next/headers から Cookie を取得して付与する
  // credentials: 'include' はブラウザのみ有効で、サーバーサイドでは機能しない
  if (typeof window === 'undefined') {
    const { cookies } = await import('next/headers')
    const cookieStore = await cookies()
    const token = cookieStore.get('subsq_token')?.value
    if (token) {
      headers.Cookie = `subsq_token=${token}`
    }
  }

  const res = await fetch(`${baseUrl}${url}`, {
    ...options,
    credentials: 'include',
    headers: {
      ...headers,
      ...options.headers,
    },
  })

  const body = [204, 205, 304].includes(res.status) ? null : await res.text()

  let data: unknown
  try {
    data = body ? JSON.parse(body) : {}
  } catch {
    throw new Error(`${res.status} ${res.statusText}: invalid response body`)
  }

  if (!res.ok) {
    const errorData = data as { detail?: string; message?: string }
    throw new Error(errorData?.detail ?? errorData?.message ?? `${res.status} ${res.statusText}`)
  }

  return { data, status: res.status, headers: res.headers } as T
}
