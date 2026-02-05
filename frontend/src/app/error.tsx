'use client'

import Link from 'next/link'
import { useEffect } from 'react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // エラーをログに記録
    console.error('Error:', error)
  }, [error])

  return (
    <div className="flex min-h-screen items-center justify-center px-6">
      <div className="max-w-md text-center">
        <div className="mb-6">
          <h1 className="mb-2 text-6xl font-bold text-zinc-900 dark:text-zinc-50">エラー</h1>
          <p className="text-xl text-zinc-600 dark:text-zinc-400">
            予期しないエラーが発生しました
          </p>
        </div>

        <p className="mb-8 text-sm text-zinc-500 dark:text-zinc-400">
          申し訳ございません。ページの読み込み中に問題が発生しました。
          <br />
          もう一度お試しいただくか、トップページに戻ってください。
        </p>

        <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
          <button
            onClick={reset}
            className="rounded-md bg-zinc-900 px-6 py-3 text-sm font-semibold text-white hover:bg-zinc-700 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            再試行
          </button>
          <Link
            href="/"
            className="rounded-md border border-zinc-300 px-6 py-3 text-sm font-semibold text-zinc-900 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-50 dark:hover:bg-zinc-800"
          >
            トップページに戻る
          </Link>
        </div>

        {process.env.NODE_ENV === 'development' && error.message && (
          <details className="mt-8 rounded-md border border-zinc-200 bg-zinc-50 p-4 text-left dark:border-zinc-700 dark:bg-zinc-800">
            <summary className="cursor-pointer text-sm font-semibold text-zinc-700 dark:text-zinc-300">
              エラー詳細（開発環境のみ）
            </summary>
            <pre className="mt-2 overflow-auto text-xs text-zinc-600 dark:text-zinc-400">
              {error.message}
            </pre>
          </details>
        )}
      </div>
    </div>
  )
}
