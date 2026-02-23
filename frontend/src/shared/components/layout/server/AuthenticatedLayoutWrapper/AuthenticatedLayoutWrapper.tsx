import { Suspense } from 'react'
import { requireAuthServer } from '@/features/auth/servers/redirect.server'
import { PullToRefresh } from '@/shared/components/common/client/PullToRefresh'
import { Header } from '@/shared/components/layout/client/Header'
import { Footer } from '@/shared/components/layout/server/Footer'
import { Toaster } from '@/shared/components/ui/sonner'

type Props = {
  children: React.ReactNode
}

export async function AuthenticatedLayoutWrapper({ children }: Props) {
  await requireAuthServer()

  return (
    <div className="flex h-screen flex-col bg-background">
      <Suspense fallback={<div className="h-14 border-b" />}>
        <Header />
      </Suspense>
      <main className="flex-1 bg-muted/10">
        <PullToRefresh>
          <div className="p-6">
            <div className="mx-auto max-w-7xl">{children}</div>
          </div>
        </PullToRefresh>
      </main>
      <Footer />
      <Toaster />
    </div>
  )
}
