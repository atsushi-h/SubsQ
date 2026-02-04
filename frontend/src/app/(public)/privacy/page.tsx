import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'プライバシーポリシー - SubsQ',
}

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
        <h1 className="mb-8 text-3xl font-bold text-zinc-900 dark:text-zinc-50">
          プライバシーポリシー
        </h1>
        <div className="prose prose-zinc dark:prose-invert max-w-none">
          <p className="text-zinc-600 dark:text-zinc-400">
            SubsQ(以下、「当社」)は、本サービスにおけるユーザーの個人情報の取扱いについて、以下のとおりプライバシーポリシー(以下、「本ポリシー」)を定めます。
          </p>
          <section className="mt-8">
            <h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
              第1条(収集する情報)
            </h2>
            <p className="mt-4 text-zinc-600 dark:text-zinc-400">
              当社は、ユーザーから以下の情報を収集することがあります。
            </p>
            <ul className="mt-4 list-disc space-y-2 pl-6 text-zinc-600 dark:text-zinc-400">
              <li>氏名、メールアドレス、電話番号などの個人識別情報</li>
              <li>サブスクリプションサービスの利用履歴</li>
              <li>クッキーやその他の技術によって自動的に収集される情報</li>
            </ul>
          </section>
          <section className="mt-8">
            <h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
              第2条(利用目的)
            </h2>
            <p className="mt-4 text-zinc-600 dark:text-zinc-400">
              当社は、収集した個人情報を以下の目的で利用します。
            </p>
            <ul className="mt-4 list-disc space-y-2 pl-6 text-zinc-600 dark:text-zinc-400">
              <li>本サービスの提供・運営のため</li>
              <li>ユーザーからのお問い合わせに回答するため</li>
              <li>本サービスの改善・新サービス開発のため</li>
              <li>メンテナンス、重要なお知らせなど必要に応じたご連絡のため</li>
            </ul>
          </section>
          <section className="mt-8">
            <h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
              第3条(第三者提供)
            </h2>
            <p className="mt-4 text-zinc-600 dark:text-zinc-400">
              当社は、次に掲げる場合を除いて、あらかじめユーザーの同意を得ることなく、第三者に個人情報を提供することはありません。
            </p>
            <ul className="mt-4 list-disc space-y-2 pl-6 text-zinc-600 dark:text-zinc-400">
              <li>法令に基づく場合</li>
              <li>
                人の生命、身体または財産の保護のために必要がある場合であって、本人の同意を得ることが困難であるとき
              </li>
              <li>
                公衆衛生の向上または児童の健全な育成の推進のために特に必要がある場合であって、本人の同意を得ることが困難であるとき
              </li>
            </ul>
          </section>
          <section className="mt-8">
            <h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
              第4条(開示)
            </h2>
            <p className="mt-4 text-zinc-600 dark:text-zinc-400">
              当社は、本人から個人情報の開示を求められたときは、本人に対し、遅滞なくこれを開示します。
            </p>
          </section>
        </div>
      </div>
  )
}
