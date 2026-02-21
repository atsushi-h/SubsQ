import { toNextJsHandler } from 'better-auth/next-js'
import { auth } from '@/features/auth/lib/better-auth'

const { GET: originalGET, POST: originalPOST } = toNextJsHandler(auth)

export const GET = async (req: Request) => {
  return originalGET(req)
}

export const POST = originalPOST