import Link from 'next/link'
import { ModeToggle } from '@/shared/components/common/client/ModeToggle'

export function PublicHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background shadow-sm">
      <div className="flex h-14 items-center justify-between px-6">
        <Link
          href="/subscriptions"
          className="text-lg font-bold text-zinc-500 transition-colors hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
        >
          SubsQ
        </Link>
        <ModeToggle />
      </div>
    </header>
  )
}
