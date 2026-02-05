import type { Metadata } from 'next'
import { env } from '@/shared/lib/env'

export const metadata: Metadata = {
  title: 'プライバシーポリシー - SubsQ',
}

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <h1 className="mb-4 text-3xl font-bold text-zinc-900 dark:text-zinc-50">
        プライバシーポリシー
      </h1>
      <p className="mb-8 text-sm text-zinc-500 dark:text-zinc-400">
        <strong>最終更新日:</strong> 2026年2月9日
      </p>
      <div className="prose prose-zinc dark:prose-invert max-w-none">
        <p className="text-zinc-600 dark:text-zinc-400">
          SubsQ運営事務局（以下「運営者」といいます。）は、本サービス「SubsQ」（以下「本サービス」といいます。）における、ユーザーの個人情報の取扱いについて、以下のとおりプライバシーポリシー（以下「本ポリシー」といいます。）を定めます。
        </p>

        <section className="mt-8">
          <h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
            第1条（個人情報の定義）
          </h2>
          <p className="mt-4 text-zinc-600 dark:text-zinc-400">
            「個人情報」とは、個人情報保護法にいう「個人情報」を指すものとし、生存する個人に関する情報であって、当該情報に含まれる氏名、メールアドレス、その他の記述等により特定の個人を識別できる情報（個人識別情報）を指します。
          </p>
        </section>

        <section className="mt-8">
          <h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
            第2条（収集する情報）
          </h2>
          <p className="mt-4 text-zinc-600 dark:text-zinc-400">
            運営者は、本サービスの提供にあたり、以下の情報を収集する場合があります。
          </p>

          <h3 className="mt-6 text-xl font-semibold text-zinc-900 dark:text-zinc-50">
            2.1 Googleアカウント連携により取得する情報
          </h3>
          <p className="mt-2 text-zinc-600 dark:text-zinc-400">
            ユーザーがGoogleアカウントでログインする際、以下の情報を取得します。
          </p>
          <ul className="mt-2 list-disc space-y-1 pl-6 text-zinc-600 dark:text-zinc-400">
            <li>氏名（表示名）</li>
            <li>メールアドレス</li>
            <li>プロフィール画像（サムネイル）</li>
          </ul>

          <h3 className="mt-6 text-xl font-semibold text-zinc-900 dark:text-zinc-50">
            2.2 ユーザーが入力する情報
          </h3>
          <p className="mt-2 text-zinc-600 dark:text-zinc-400">
            ユーザーが本サービス内で登録する以下の情報を取得します。
          </p>
          <ul className="mt-2 list-disc space-y-1 pl-6 text-zinc-600 dark:text-zinc-400">
            <li>サブスクリプション情報（サービス名、金額、請求サイクル、基準日、メモ）</li>
            <li>支払い方法名（例：楽天カード、PayPal等）</li>
          </ul>

          <h3 className="mt-6 text-xl font-semibold text-zinc-900 dark:text-zinc-50">
            2.3 自動的に収集される情報
          </h3>
          <p className="mt-2 text-zinc-600 dark:text-zinc-400">
            本サービスの利用に伴い、以下の情報が自動的に収集される場合があります。
          </p>
          <ul className="mt-2 list-disc space-y-1 pl-6 text-zinc-600 dark:text-zinc-400">
            <li>アクセスログ（IPアドレス、ブラウザ情報、アクセス日時等）</li>
            <li>Cookie情報（認証セッションの維持に使用）</li>
          </ul>
        </section>

        <section className="mt-8">
          <h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
            第3条（個人情報の利用目的）
          </h2>
          <p className="mt-4 text-zinc-600 dark:text-zinc-400">
            運営者が個人情報を収集・利用する目的は、以下のとおりです。
          </p>
          <ol className="mt-4 list-decimal space-y-2 pl-6 text-zinc-600 dark:text-zinc-400">
            <li>本サービスの提供・運営のため</li>
            <li>ユーザー認証および本人確認のため</li>
            <li>ユーザーからのお問い合わせに対応するため</li>
            <li>サービスの新機能、更新情報、メンテナンス情報等をお知らせするため</li>
            <li>請求日前の通知メールを送信するため（将来機能として実装予定）</li>
            <li>
              利用規約に違反したユーザーや、不正・不当な目的でサービスを利用しようとするユーザーの特定および利用をお断りするため
            </li>
            <li>本サービスの改善および新機能の開発のため</li>
          </ol>
        </section>

        <section className="mt-8">
          <h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
            第4条（利用目的の変更）
          </h2>
          <p className="mt-4 text-zinc-600 dark:text-zinc-400">
            運営者は、利用目的が変更前と関連性を有すると合理的に認められる場合に限り、個人情報の利用目的を変更するものとします。利用目的の変更を行った場合には、変更後の目的について、本サービス上に公表するものとします。
          </p>
        </section>

        <section className="mt-8">
          <h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
            第5条（個人情報の第三者提供）
          </h2>
          <ol className="mt-4 list-decimal space-y-2 pl-6 text-zinc-600 dark:text-zinc-400">
            <li>
              運営者は、次に掲げる場合を除いて、あらかじめユーザーの同意を得ることなく、第三者に個人情報を提供することはありません。
              <ul className="mt-2 list-disc space-y-1 pl-6">
                <li>法令に基づく場合</li>
                <li>
                  人の生命、身体または財産の保護のために必要がある場合であって、本人の同意を得ることが困難であるとき
                </li>
                <li>
                  公衆衛生の向上または児童の健全な育成の推進のために特に必要がある場合であって、本人の同意を得ることが困難であるとき
                </li>
                <li>
                  国の機関もしくは地方公共団体またはその委託を受けた者が法令の定める事務を遂行することに対して協力する必要がある場合であって、本人の同意を得ることにより当該事務の遂行に支障を及ぼすおそれがあるとき
                </li>
              </ul>
            </li>
            <li>
              前項の定めにかかわらず、以下の場合には当該情報の提供先は第三者に該当しないものとします。
              <ul className="mt-2 list-disc space-y-1 pl-6">
                <li>
                  運営者が利用目的の達成に必要な範囲内において個人情報の取扱いの全部または一部を委託する場合
                </li>
                <li>合併その他の事由による事業の承継に伴って個人情報が提供される場合</li>
              </ul>
            </li>
          </ol>
        </section>

        <section className="mt-8">
          <h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
            第6条（アクセス解析ツールの使用）
          </h2>
          <p className="mt-4 text-zinc-600 dark:text-zinc-400">
            本サービスでは、サービス向上のため、Google
            Analytics等のアクセス解析ツールを使用する場合があります。これらのツールはCookieを使用して情報を収集しますが、個人を特定する情報は含まれません。
          </p>
          <p className="mt-4 text-zinc-600 dark:text-zinc-400">
            Google Analyticsの利用規約については、以下をご確認ください。
          </p>
          <ul className="mt-2 list-disc space-y-1 pl-6 text-zinc-600 dark:text-zinc-400">
            <li>
              <a
                href="https://marketingplatform.google.com/about/analytics/terms/jp/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
              >
                Google Analytics利用規約
              </a>
            </li>
            <li>
              <a
                href="https://policies.google.com/privacy?hl=ja"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
              >
                Googleのプライバシーポリシー
              </a>
            </li>
          </ul>
          <p className="mt-4 text-zinc-600 dark:text-zinc-400">
            ユーザーはブラウザの設定でCookieを無効にすることで、Google
            Analyticsによる情報収集を拒否することができます。
          </p>
        </section>

        <section className="mt-8">
          <h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
            第7条（Cookieの使用）
          </h2>
          <p className="mt-4 text-zinc-600 dark:text-zinc-400">
            本サービスでは、以下の目的でCookieを使用しています。
          </p>
          <ol className="mt-4 list-decimal space-y-2 pl-6 text-zinc-600 dark:text-zinc-400">
            <li>
              <strong>認証セッションの維持</strong>:
              ログイン状態を維持するために必要なCookieを使用します。このCookieを無効にした場合、本サービスにログインできなくなります。
            </li>
            <li>
              <strong>アクセス解析</strong>:
              サービス改善のため、アクセス解析用のCookieを使用する場合があります（第6条参照）。
            </li>
          </ol>
        </section>

        <section className="mt-8">
          <h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
            第8条（安全管理措置）
          </h2>
          <p className="mt-4 text-zinc-600 dark:text-zinc-400">
            運営者は、個人情報の漏えい、滅失またはき損の防止その他の個人情報の安全管理のために、以下の措置を講じます。
          </p>
          <ol className="mt-4 list-decimal space-y-2 pl-6 text-zinc-600 dark:text-zinc-400">
            <li>SSL/TLSによる通信の暗号化</li>
            <li>パスワード等の認証情報を保持しない設計（Google OAuth認証を使用）</li>
            <li>アクセス制御による不正アクセスの防止</li>
          </ol>
        </section>

        <section className="mt-8">
          <h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
            第9条（個人情報の開示・訂正・削除）
          </h2>
          <ol className="mt-4 list-decimal space-y-2 pl-6 text-zinc-600 dark:text-zinc-400">
            <li>ユーザーは、運営者に対して、自己の個人情報の開示を請求することができます。</li>
            <li>
              ユーザーは、本サービス内の機能を通じて、自己が登録した情報（サブスクリプション情報、支払い方法等）をいつでも訂正または削除することができます。
            </li>
            <li>
              ユーザーは、本サービスから退会することで、自己に関する全ての個人情報の削除を請求することができます。
            </li>
          </ol>
        </section>

        <section className="mt-8">
          <h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
            第10条（退会時のデータ削除）
          </h2>
          <ol className="mt-4 list-decimal space-y-2 pl-6 text-zinc-600 dark:text-zinc-400">
            <li>
              ユーザーが本サービスを退会した場合、運営者は当該ユーザーに関する以下の情報を速やかに削除します。
              <ul className="mt-2 list-disc space-y-1 pl-6">
                <li>ユーザーが登録した全てのサブスクリプション情報</li>
                <li>ユーザーが登録した全ての支払い方法</li>
                <li>ユーザーのアカウント情報（Googleアカウント連携情報を含む）</li>
              </ul>
            </li>
            <li>削除されたデータは復元することができません。</li>
          </ol>
        </section>

        <section className="mt-8">
          <h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
            第11条（プライバシーポリシーの変更）
          </h2>
          <ol className="mt-4 list-decimal space-y-2 pl-6 text-zinc-600 dark:text-zinc-400">
            <li>
              本ポリシーの内容は、法令その他本ポリシーに別段の定めのある事項を除いて、ユーザーに通知することなく変更することができるものとします。
            </li>
            <li>
              運営者が別途定める場合を除いて、変更後のプライバシーポリシーは、本サービス上に掲載した時点から効力を生じるものとします。
            </li>
          </ol>
        </section>

        <section className="mt-8">
          <h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
            第12条（お問い合わせ窓口）
          </h2>
          <p className="mt-4 text-zinc-600 dark:text-zinc-400">
            本ポリシーに関するお問い合わせは、下記のフォームよりお願いいたします。
          </p>
          <p className="mt-4">
            <a
              href={env.NEXT_PUBLIC_CONTACT_FORM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
            >
              お問い合わせフォーム
            </a>
          </p>
        </section>

        <p className="mt-8 text-sm text-zinc-500 dark:text-zinc-400">以上</p>
      </div>
    </div>
  )
}
