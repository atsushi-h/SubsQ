import { Suspense } from 'react'
import { AuthRetryFallback } from '@/features/auth/components/client/AuthRetryFallback'
import { getSessionServer } from '@/features/auth/servers/auth.server'
import { Header } from '@/shared/components/layout/client/Header'
import { Footer } from '@/shared/components/layout/server/Footer'
import { Toaster } from '@/shared/components/ui/sonner'

type Props = {
  children: React.ReactNode
}

export async function AuthenticatedLayoutWrapper({ children }: Props) {
  const session = await getSessionServer()

  const layout = (
    <div className="flex h-screen flex-col bg-background">
      <Suspense fallback={<div className="h-14 border-b" />}>
        <Header />
      </Suspense>
      <main className="flex-1 overflow-y-auto bg-muted/10 p-6">
        <div className="mx-auto max-w-7xl">{children}</div>
      </main>
      <Footer />
      <Toaster />
    </div>
  )

  // SSRでセッションが取得できない場合、クライアント側でリトライする
  if (!session?.user?.id) {
    return <AuthRetryFallback>{layout}</AuthRetryFallback>
  }

  return layout
}
