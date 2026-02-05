import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center px-6">
      <div className="max-w-md text-center">
        <div className="mb-6">
          <h1 className="mb-2 text-6xl font-bold text-zinc-900 dark:text-zinc-50">404</h1>
          <p className="text-xl text-zinc-600 dark:text-zinc-400">
            ページが見つかりません
          </p>
        </div>

        <p className="mb-8 text-sm text-zinc-500 dark:text-zinc-400">
          お探しのページは存在しないか、移動または削除された可能性があります。
          <br />
          URLをご確認いただくか、トップページに戻ってください。
        </p>

        <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
          <Link
            href="/"
            className="rounded-md bg-zinc-900 px-6 py-3 text-sm font-semibold text-white hover:bg-zinc-700 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            トップページに戻る
          </Link>
          <Link
            href="/login"
            className="rounded-md border border-zinc-300 px-6 py-3 text-sm font-semibold text-zinc-900 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-50 dark:hover:bg-zinc-800"
          >
            ログインページへ
          </Link>
        </div>
      </div>
    </div>
  )
}
