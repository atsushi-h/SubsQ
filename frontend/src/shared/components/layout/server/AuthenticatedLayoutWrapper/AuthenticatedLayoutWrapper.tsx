import { Suspense } from 'react'
import { requireAuthServer } from '@/features/auth/servers/redirect.server'
import { Header } from '@/shared/components/layout/client/Header'
import { Toaster } from '@/shared/components/ui/sonner'

type Props = {
  children: React.ReactNode
}

export async function AuthenticatedLayoutWrapper({ children }: Props) {
  await requireAuthServer()

  return (
    <div className="flex h-screen bg-background">
      <div className="flex flex-1 flex-col">
        <Suspense fallback={<div className="h-14 border-b" />}>
          <Header />
        </Suspense>
        <main className="flex-1 overflow-y-auto bg-muted/10 p-6">
          <div className="mx-auto max-w-7xl">{children}</div>
        </main>
      </div>
      <Toaster />
    </div>
  )
}
