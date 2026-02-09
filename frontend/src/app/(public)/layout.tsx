import { Footer } from '@/shared/components/layout/server/Footer'
import { PublicHeader } from '@/shared/components/layout/server/PublicHeader'

export default function PublicLayout({ children }: LayoutProps<'/'>) {
  return (
    <div className="flex min-h-screen flex-col">
      <PublicHeader />
      <main className="flex-1 bg-zinc-50 dark:bg-zinc-900">{children}</main>
      <Footer />
    </div>
  )
}
