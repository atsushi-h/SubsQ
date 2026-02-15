import { toNextJsHandler } from 'better-auth/next-js'
import { auth } from '@/features/auth/lib/better-auth'

const { GET: originalGET, POST: originalPOST } = toNextJsHandler(auth)

export const GET = async (req: Request) => {
  const url = new URL(req.url)
  console.log('[auth-route] GET:', url.pathname + url.search, new Date().toISOString())
  const response = await originalGET(req)
  console.log('[auth-route] GET response:', response.status, new Date().toISOString())
  return response
}

export const POST = async (req: Request) => {
  const url = new URL(req.url)
  console.log('[auth-route] POST:', url.pathname + url.search, new Date().toISOString())
  const response = await originalPOST(req)
  console.log('[auth-route] POST response:', response.status, new Date().toISOString())
  return response
}
