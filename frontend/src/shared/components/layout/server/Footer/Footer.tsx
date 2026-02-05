import Link from 'next/link'

export function Footer() {
  return (
    <footer className="flex h-16 items-center justify-center gap-2 border-t bg-background px-6">
      <div className="flex items-center gap-4">
        <Link
          href="/terms"
          className="text-sm text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
        >
          利用規約
        </Link>
        <span className="text-sm text-zinc-300 dark:text-zinc-700">|</span>
        <Link
          href="/privacy"
          className="text-sm text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
        >
          プライバシーポリシー
        </Link>
      </div>
    </footer>
  )
}
