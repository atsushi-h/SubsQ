import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '利用規約 - SubsQ',
}

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <h1 className="mb-8 text-3xl font-bold text-zinc-900 dark:text-zinc-50">利用規約</h1>
      <div className="prose prose-zinc dark:prose-invert max-w-none">
        <p className="text-zinc-600 dark:text-zinc-400">利用規約の内容がここに表示されます。</p>
        <section className="mt-8">
          <h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">第1条(適用)</h2>
          <p className="mt-4 text-zinc-600 dark:text-zinc-400">
            本規約は、本サービスの利用に関する条件を定めるものです。
          </p>
        </section>
        <section className="mt-8">
          <h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
            第2条(利用登録)
          </h2>
          <p className="mt-4 text-zinc-600 dark:text-zinc-400">
            本サービスの利用を希望する方は、本規約に同意の上、当社の定める方法によって利用登録を申請し、当社がこれを承認することによって利用登録が完了するものとします。
          </p>
        </section>
        <section className="mt-8">
          <h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
            第3条(禁止事項)
          </h2>
          <p className="mt-4 text-zinc-600 dark:text-zinc-400">
            ユーザーは、本サービスの利用にあたり、以下の行為をしてはなりません。
          </p>
          <ul className="mt-4 list-disc space-y-2 pl-6 text-zinc-600 dark:text-zinc-400">
            <li>法令または公序良俗に違反する行為</li>
            <li>犯罪行為に関連する行為</li>
            <li>
              本サービスの内容等、本サービスに含まれる著作権、商標権ほか知的財産権を侵害する行為
            </li>
            <li>
              当社、ほかのユーザー、またはその他第三者のサーバーまたはネットワークの機能を破壊したり、妨害したりする行為
            </li>
            <li>不正アクセスをし、またはこれを試みる行為</li>
            <li>他のユーザーに関する個人情報等を収集または蓄積する行為</li>
          </ul>
        </section>
      </div>
    </div>
  )
}
