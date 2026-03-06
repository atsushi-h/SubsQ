import { env } from '@/shared/lib/env'

export const customFetch = async <T>(url: string, options: RequestInit): Promise<T> => {
  const baseUrl = env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8080'
  const res = await fetch(`${baseUrl}${url}`, {
    ...options,
    credentials: 'include',
  })

  const body = [204, 205, 304].includes(res.status) ? null : await res.text()
  const data = body ? JSON.parse(body) : {}
  return { data, status: res.status, headers: res.headers } as T
}
