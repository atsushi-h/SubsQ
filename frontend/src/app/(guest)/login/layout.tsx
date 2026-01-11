import type { Metadata } from 'next'
import { generatePageMetadata } from '@/shared/lib/metadata'

export const metadata: Metadata = generatePageMetadata('LOGIN', {
  path: '/login',
})

export default function LoginLayout({ children }: LayoutProps<'/login'>) {
  return <>{children}</>
}
