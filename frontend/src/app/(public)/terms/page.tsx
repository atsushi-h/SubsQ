import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '利用規約 - SubsQ',
}

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <h1 className="mb-4 text-3xl font-bold text-zinc-900 dark:text-zinc-50">利用規約</h1>
      <p className="mb-8 text-sm text-zinc-500 dark:text-zinc-400">
        <strong>最終更新日:</strong> 2026年2月9日
      </p>
      <div className="prose prose-zinc dark:prose-invert max-w-none">
        <p className="text-zinc-600 dark:text-zinc-400">
          本利用規約（以下「本規約」といいます。）は、SubsQ（以下「本サービス」といいます。）の利用条件を定めるものです。本サービスを利用する全てのユーザー（以下「ユーザー」といいます。）は、本規約に同意の上、本サービスを利用するものとします。
        </p>

        <section className="mt-8">
          <h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">第1条（適用）</h2>
          <ol className="mt-4 list-decimal space-y-2 pl-6 text-zinc-600 dark:text-zinc-400">
            <li>
              本規約は、ユーザーとSubsQ運営事務局（以下「運営者」といいます。）との間の本サービスの利用に関わる一切の関係に適用されるものとします。
            </li>
            <li>
              運営者は本サービスに関し、本規約のほか、ご利用にあたってのルール等、各種の定め（以下「個別規定」といいます。）をすることがあります。これら個別規定はその名称のいかんに関わらず、本規約の一部を構成するものとします。
            </li>
          </ol>
        </section>

        <section className="mt-8">
          <h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
            第2条（利用登録）
          </h2>
          <ol className="mt-4 list-decimal space-y-2 pl-6 text-zinc-600 dark:text-zinc-400">
            <li>
              本サービスの利用を希望する方は、本規約に同意の上、運営者の定める方法（Googleアカウント連携）によって利用登録を申請し、運営者がこれを承認することによって、利用登録が完了するものとします。
            </li>
            <li>
              運営者は、利用登録の申請者に以下の事由があると判断した場合、利用登録の申請を承認しないことがあり、その理由については一切の開示義務を負わないものとします。
              <ul className="mt-2 list-disc space-y-1 pl-6">
                <li>利用登録の申請に際して虚偽の事項を届け出た場合</li>
                <li>本規約に違反したことがある者からの申請である場合</li>
                <li>その他、運営者が利用登録を相当でないと判断した場合</li>
              </ul>
            </li>
          </ol>
        </section>

        <section className="mt-8">
          <h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
            第3条（Googleアカウントの管理）
          </h2>
          <ol className="mt-4 list-decimal space-y-2 pl-6 text-zinc-600 dark:text-zinc-400">
            <li>
              ユーザーは、自己の責任において、本サービスの利用に使用するGoogleアカウントを適切に管理するものとします。
            </li>
            <li>
              本サービスは、ログイン機能としてGoogleアカウント認証（Google
              OAuth）を利用しており、運営者がユーザーのGoogleアカウントのパスワード等の認証情報を取得・管理することはありません。
            </li>
            <li>
              ユーザーのGoogleアカウントが第三者によって不正に使用されたことによって生じた損害について、運営者は一切の責任を負わないものとします。
            </li>
          </ol>
        </section>

        <section className="mt-8">
          <h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
            第4条（サービスの内容）
          </h2>
          <ol className="mt-4 list-decimal space-y-2 pl-6 text-zinc-600 dark:text-zinc-400">
            <li>
              本サービスは、ユーザーが契約中のサブスクリプションサービスを登録・管理し、支払い総額を可視化するためのツールです。
            </li>
            <li>
              本サービスで表示される次回請求日や合計金額は、ユーザーが入力した情報に基づく参考値であり、実際の請求内容や請求日を保証するものではありません。
            </li>
            <li>
              ユーザーは、実際の請求内容については各サブスクリプションサービスの提供元に確認する責任を負うものとします。
            </li>
          </ol>
        </section>

        <section className="mt-8">
          <h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
            第5条（禁止事項）
          </h2>
          <p className="mt-4 text-zinc-600 dark:text-zinc-400">
            ユーザーは、本サービスの利用にあたり、以下の行為をしてはなりません。
          </p>
          <ol className="mt-4 list-decimal space-y-2 pl-6 text-zinc-600 dark:text-zinc-400">
            <li>法令または公序良俗に違反する行為</li>
            <li>犯罪行為に関連する行為</li>
            <li>本サービスのサーバーまたはネットワークの機能を破壊したり、妨害したりする行為</li>
            <li>本サービスの運営を妨害するおそれのある行為</li>
            <li>他のユーザーに関する個人情報等を収集または蓄積する行為</li>
            <li>不正アクセスをし、またはこれを試みる行為</li>
            <li>他のユーザーに成りすます行為</li>
            <li>本サービスに関連して、反社会的勢力に対して直接または間接に利益を供与する行為</li>
            <li>その他、運営者が不適切と判断する行為</li>
          </ol>
        </section>

        <section className="mt-8">
          <h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
            第6条（本サービスの提供の停止等）
          </h2>
          <p className="mt-4 text-zinc-600 dark:text-zinc-400">
            運営者は、以下のいずれかの事由があると判断した場合、ユーザーに事前に通知することなく本サービスの全部または一部の提供を停止または中断することができるものとします。
          </p>
          <ol className="mt-4 list-decimal space-y-2 pl-6 text-zinc-600 dark:text-zinc-400">
            <li>本サービスにかかるコンピュータシステムの保守点検または更新を行う場合</li>
            <li>
              地震、落雷、火災、停電または天災などの不可抗力により、本サービスの提供が困難となった場合
            </li>
            <li>コンピュータまたは通信回線等が事故により停止した場合</li>
            <li>その他、運営者が本サービスの提供が困難と判断した場合</li>
          </ol>
        </section>

        <section className="mt-8">
          <h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
            第7条（利用制限および登録抹消）
          </h2>
          <ol className="mt-4 list-decimal space-y-2 pl-6 text-zinc-600 dark:text-zinc-400">
            <li>
              運営者は、ユーザーが以下のいずれかに該当する場合には、事前の通知なく、ユーザーに対して本サービスの全部もしくは一部の利用を制限し、またはユーザーとしての登録を抹消することができるものとします。
              <ul className="mt-2 list-disc space-y-1 pl-6">
                <li>本規約のいずれかの条項に違反した場合</li>
                <li>登録事項に虚偽の事実があることが判明した場合</li>
                <li>運営者からの連絡に対し、一定期間返答がない場合</li>
                <li>本サービスについて、最終の利用から一定期間利用がない場合</li>
                <li>その他、運営者が本サービスの利用を適当でないと判断した場合</li>
              </ul>
            </li>
            <li>
              運営者は、本条に基づき運営者が行った行為によりユーザーに生じた損害について、一切の責任を負いません。
            </li>
          </ol>
        </section>

        <section className="mt-8">
          <h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">第8条（退会）</h2>
          <ol className="mt-4 list-decimal space-y-2 pl-6 text-zinc-600 dark:text-zinc-400">
            <li>
              ユーザーは、本サービス内の所定の退会手続（設定画面の「退会」ボタンから手続き可能）を経て、いつでも本サービスから退会することができます。
            </li>
            <li>
              退会手続が完了した場合、ユーザーが本サービス上で登録・保存した全てのデータ（サブスクリプション情報、支払い方法、アカウント情報等）は、本サービスから完全に削除され、復元することはできません。
            </li>
            <li>ユーザーは、退会前に必要なデータを自己の責任において控えておくものとします。</li>
          </ol>
        </section>

        <section className="mt-8">
          <h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
            第9条（保証の否認および免責事項）
          </h2>
          <ol className="mt-4 list-decimal space-y-2 pl-6 text-zinc-600 dark:text-zinc-400">
            <li>
              運営者は、本サービスに事実上または法律上の瑕疵（安全性、信頼性、正確性、完全性、有効性、特定の目的への適合性、セキュリティなどに関する欠陥、エラーやバグ、権利侵害などを含みます。）がないことを明示的にも黙示的にも保証しておりません。
            </li>
            <li>
              運営者は、本サービスに起因してユーザーに生じたあらゆる損害について、運営者の故意又は重過失による場合を除き、一切の責任を負いません。
            </li>
            <li>
              運営者は、本サービスに関して、ユーザーと他のユーザーまたは第三者との間において生じた取引、連絡または紛争等について一切責任を負いません。
            </li>
          </ol>
        </section>

        <section className="mt-8">
          <h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
            第10条（サービス内容の変更等）
          </h2>
          <p className="mt-4 text-zinc-600 dark:text-zinc-400">
            運営者は、ユーザーへの事前の通知なく、本サービスの内容を変更、追加または廃止することができるものとし、ユーザーはこれを承諾するものとします。
          </p>
        </section>

        <section className="mt-8">
          <h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
            第11条（利用規約の変更）
          </h2>
          <ol className="mt-4 list-decimal space-y-2 pl-6 text-zinc-600 dark:text-zinc-400">
            <li>
              運営者は、必要と判断した場合には、ユーザーに通知することなくいつでも本規約を変更することができるものとします。
            </li>
            <li>変更後の利用規約は、本サービス上に表示した時点より効力を生じるものとします。</li>
            <li>
              本規約の変更後、本サービスの利用を継続した場合には、当該ユーザーは変更後の規約に同意したものとみなします。
            </li>
          </ol>
        </section>

        <section className="mt-8">
          <h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
            第12条（個人情報の取扱い）
          </h2>
          <p className="mt-4 text-zinc-600 dark:text-zinc-400">
            運営者は、本サービスの利用によって取得する個人情報については、運営者が別途定める「プライバシーポリシー」に従い適切に取り扱うものとします。
          </p>
        </section>

        <section className="mt-8">
          <h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
            第13条（通知または連絡）
          </h2>
          <p className="mt-4 text-zinc-600 dark:text-zinc-400">
            ユーザーと運営者との間の通知または連絡は、運営者の定める方法によって行うものとします。運営者は、ユーザーから運営者が別途定める方式に従った届出がない限り、現在登録されているメールアドレスが有効なものとみなして当該メールアドレス宛に通知または連絡を行い、これらは発信時にユーザーへ到達したものとみなします。
          </p>
        </section>

        <section className="mt-8">
          <h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
            第14条（権利義務の譲渡の禁止）
          </h2>
          <p className="mt-4 text-zinc-600 dark:text-zinc-400">
            ユーザーは、運営者の書面による事前の承諾なく、利用契約上の地位または本規約に基づく権利もしくは義務を第三者に譲渡し、または担保に供することはできません。
          </p>
        </section>

        <section className="mt-8">
          <h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
            第15条（準拠法・裁判管轄）
          </h2>
          <ol className="mt-4 list-decimal space-y-2 pl-6 text-zinc-600 dark:text-zinc-400">
            <li>本規約の解釈にあたっては、日本法を準拠法とします。</li>
            <li>
              本サービスに関して紛争が生じた場合には、運営者の所在地を管轄する裁判所を第一審の専属的合意管轄裁判所とします。
            </li>
          </ol>
        </section>

        <hr className="my-8 border-zinc-200 dark:border-zinc-700" />

        <section className="mt-8">
          <h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
            お問い合わせ窓口
          </h2>
          <p className="mt-4 text-zinc-600 dark:text-zinc-400">
            本規約に関するお問い合わせは、下記のフォームよりお願いいたします。
          </p>
          <p className="mt-4">
            <a
              href="https://forms.gle/xxxxx"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
            >
              お問い合わせフォーム
            </a>
          </p>
        </section>
      </div>
    </div>
  )
}
