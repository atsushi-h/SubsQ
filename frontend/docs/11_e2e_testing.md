# E2Eテスト

## 概要

SubsQプロジェクトでは、PlaywrightによるE2Eテストを実装しています。実際のブラウザ環境でアプリケーション全体の動作を検証し、ユーザーフローの正常性を確保します。

## テストフレームワーク

- **Playwright** 1.58.1
  - クロスブラウザ対応（本プロジェクトではChromiumを使用）
  - 高速で安定したE2Eテスト実行
  - スクリーンショット、動画録画、トレース機能

## E2E認証の仕組み

### 開発環境専用のCredentials認証

通常、本アプリケーションはGoogle OAuthでのみログイン可能ですが、E2Eテスト実行時のために**開発環境限定**でCredentials認証（メール/パスワード）を追加しています。

#### セキュリティ保証

以下の3層の防御により、本番環境への影響はゼロです：

1. **環境変数チェック**: `E2E_TEST_PASSWORD` が設定されている場合のみ有効
2. **環境判定**: `NEXT_PUBLIC_APP_ENV !== 'dev'` の場合は完全に無効
3. **警告コメント**: `.env.example` に本番環境で設定しないよう明記

#### 認証フロー

1. **テスト開始時**: auth.setup.tsでユーザーを自動作成
2. **Better Auth設定**: emailAndPasswordオプションで認証を処理
3. **カスタム検証**: verify関数でE2E_TEST_PASSWORDとの一致をチェック

```typescript
// Better Auth設定例
emailAndPassword: {
  enabled: isE2EAuthEnabled(),
  requireEmailVerification: false,
  sendVerificationOnSignUp: false,
  password: {
    hash: async (password: string) => password,
    verify: async ({ password }) => password === env.E2E_TEST_PASSWORD
  },
}
```

**重要:** E2E認証は開発環境でのテスト実行を容易にするための機能であり、本番環境では決して有効化しないでください。

## セットアップ

### 1. 環境変数の設定

`.env.local` ファイルに以下を追加します：

```bash
# E2Eテスト用（開発環境のみ）
E2E_TEST_PASSWORD=test-password-12345
```

**注意:** 本番環境では絶対に設定しないこと

Playwrightは`playwright.config.ts`でdotenvを使用して`.env.local`を自動的に読み込むため、追加の設定は不要です。

### 2. Playwrightブラウザのインストール（初回のみ）

```bash
cd frontend
pnpm exec playwright install
```

## テストの実行

### 基本的な実行

```bash
# 全テストを実行
pnpm e2e

# UIモードで実行（対話的にテストを実行・デバッグ）
pnpm e2e:ui

# ヘッドレスモードを無効化（ブラウザを表示して実行）
pnpm e2e:headed

# デバッグモード（ステップ実行）
pnpm e2e:debug

# テストレポートを表示
pnpm e2e:report
```

### 認証セットアップのみ実行

```bash
pnpm e2e --project=setup
```

認証状態は `playwright/.auth/user.json` に保存されます。

## テストの構成

### ディレクトリ構造

```
frontend/
├── e2e/
│   ├── auth.setup.ts       # 認証セットアップ
│   └── example.spec.ts     # サンプルテスト
├── playwright/
│   └── .auth/
│       └── user.json       # 認証状態（自動生成、gitignore）
├── playwright.config.ts    # Playwright設定（dotenvで.env.localを読み込む）
└── package.json
```

### Playwright設定（playwright.config.ts）

`playwright.config.ts`では、dotenvを使って`.env.local`から環境変数を自動的に読み込みます：

```typescript
import { defineConfig, devices } from '@playwright/test'
import dotenv from 'dotenv'
import path from 'node:path'

// .env.localから環境変数を読み込む
dotenv.config({ path: path.resolve(__dirname, '.env.local') })

export default defineConfig({
  // ... 設定
})
```

これにより、`E2E_TEST_PASSWORD`がテスト実行時に自動的に利用可能になります。

### 認証セットアップ（auth.setup.ts）

全テストの前に一度だけ実行され、認証状態を保存します。

**重要:** テスト用ユーザーが存在しない場合は自動的に作成されます。

```typescript
setup('authenticate', async ({ page, request }) => {
  const email = 'e2e-test@example.com'
  const password = process.env.E2E_TEST_PASSWORD

  // 1. ユーザーを事前に作成（既に存在する場合はエラーを無視）
  await request
    .post('http://localhost:3000/api/auth/sign-up/email', {
      data: { email, password, name: 'E2E Test User' },
    })
    .catch(() => {
      // ユーザーが既に存在する場合はエラーを無視
    })

  // 2. ログインページに移動
  await page.goto('/login')
  await expect(page.getByTestId('e2e-login-form')).toBeVisible()

  // 3. ログイン
  await page.getByTestId('e2e-email-input').fill(email)
  await page.getByTestId('e2e-password-input').fill(password)
  await page.getByTestId('e2e-login-button').click()

  // 4. ログイン成功を確認
  await page.waitForURL('/subscriptions')
  await expect(page).toHaveURL('/subscriptions')

  // 5. 認証状態を保存
  await page.context().storageState({ path: authFile })
})
```

**フロー説明:**
1. APIを直接呼び出してテスト用ユーザーを作成（初回のみ、2回目以降はスキップ）
2. ログインフォームでCredentials認証を実行
3. 認証成功後、セッション情報をファイルに保存
4. 以降のテストでは保存された認証状態を再利用

### テストファイルの作成

`e2e/` ディレクトリに `.spec.ts` ファイルを作成します：

```typescript
import { test, expect } from '@playwright/test'

test.describe('サブスクリプション機能', () => {
  test('サブスクリプションを追加できる', async ({ page }) => {
    await page.goto('/subscriptions')

    // 「追加」ボタンをクリック
    await page.getByRole('button', { name: '追加' }).click()

    // フォームに入力
    await page.getByLabel('サービス名').fill('Netflix')
    await page.getByLabel('月額料金').fill('1980')

    // 保存
    await page.getByRole('button', { name: '保存' }).click()

    // 追加されたことを確認
    await expect(page.getByText('Netflix')).toBeVisible()
  })
})
```

## ベストプラクティス

### 1. data-testid属性の使用

UI要素の取得には `data-testid` 属性を優先的に使用します：

```tsx
// コンポーネント側
<button data-testid="add-subscription-button">追加</button>

// テスト側
await page.getByTestId('add-subscription-button').click()
```

### 2. 明示的な待機

非同期処理の完了を確実に待機します：

```typescript
// URLの変更を待つ
await page.waitForURL('/subscriptions')

// 要素の表示を待つ
await page.waitForSelector('[data-testid="subscription-list"]')
```

### 3. テストの独立性

各テストは他のテストに依存せず、単独で実行できるようにします：

```typescript
test.beforeEach(async ({ page }) => {
  // 各テストの前に初期状態にリセット
  await page.goto('/subscriptions')
})
```

### 4. エラー時のデバッグ情報

失敗時の調査を容易にするため、スクリーンショットやトレースを活用します：

```typescript
// playwright.config.ts で設定済み
screenshot: 'only-on-failure',
trace: 'on-first-retry',
video: 'retain-on-failure',
```

## トラブルシューティング

### E2Eログインフォームが表示されない

**原因:** `E2E_TEST_PASSWORD` が設定されていない、または本番環境になっている

**解決方法:**
1. `.env.local` に `E2E_TEST_PASSWORD` を追加
2. `NEXT_PUBLIC_APP_ENV=dev` であることを確認
3. 開発サーバーを再起動

### 認証セットアップが失敗する

**原因:** データベース接続エラー、または環境変数の設定ミス

**解決方法:**
1. データベースの接続を確認: `DATABASE_URL`が正しく設定されているか
2. マイグレーションが実行されているか確認: `pnpm db:migrate`
3. `.env.local`に`E2E_TEST_PASSWORD`が設定されているか確認
4. 開発サーバーが起動しているか確認: `pnpm dev`
5. サーバーログを確認して詳細なエラーを特定

### テストがタイムアウトする

**原因:** 開発サーバーが起動していない、または応答が遅い

**解決方法:**
1. `playwright.config.ts` の `timeout` を増やす
2. 手動で開発サーバーを起動してから `reuseExistingServer: true` で実行

### ブラウザが起動しない

**原因:** Playwrightブラウザがインストールされていない

**解決方法:**
```bash
pnpm exec playwright install
```

## CI/CD環境での実行

CI環境では以下の設定が自動的に適用されます：

```typescript
// playwright.config.ts
retries: process.env.CI ? 2 : 0,  // 失敗時に2回リトライ
workers: process.env.CI ? 1 : undefined,  // 並列実行を1に制限
```

GitHub Actionsでの実行例：

```yaml
- name: Install dependencies
  run: pnpm install

- name: Install Playwright Browsers
  run: pnpm exec playwright install --with-deps

- name: Run E2E tests
  env:
    E2E_TEST_PASSWORD: ${{ secrets.E2E_TEST_PASSWORD }}
  run: pnpm e2e
```

## まとめ

- E2Eテストは**開発環境専用**のCredentials認証を使用
- 本番環境への影響はゼロ（3層の防御）
- テスト用ユーザーは初回実行時に自動作成される（手動セットアップ不要）
- Playwrightによる高速・安定したテスト実行
- 認証状態を保存することで、各テストでログイン不要
- data-testid属性を活用した堅牢なセレクター
- スクリーンショット、動画、トレースによる充実したデバッグ機能
- dotenvによる環境変数の自動読み込み
