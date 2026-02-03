import path from 'node:path'
import { expect, test as setup } from '@playwright/test'

const authFile = path.join(__dirname, '../playwright/.auth/user.json')

setup('authenticate', async ({ page, request }) => {
  const email = 'e2e-test@example.com'
  const password = process.env.E2E_TEST_PASSWORD
  if (!password) {
    throw new Error(
      'E2E_TEST_PASSWORD environment variable is not set. Please set it in .env.local',
    )
  }

  // ユーザーを事前に作成（既に存在する場合はエラーを無視）
  await request
    .post('http://localhost:3000/api/auth/sign-up/email', {
      data: {
        email,
        password,
        name: 'E2E Test User',
      },
    })
    .catch((error) => {
      // ユーザーが既に存在する場合はエラーを無視
      // その他のエラーはログ出力して確認できるようにする
      console.log('[E2E Auth Setup] User creation skipped or failed:', error.message)
    })

  // ログインページに移動
  await page.goto('/login')
  await expect(page.getByTestId('e2e-login-form')).toBeVisible()

  // ログイン
  await page.getByTestId('e2e-email-input').fill(email)
  await page.getByTestId('e2e-password-input').fill(password)
  await page.getByTestId('e2e-login-button').click()

  // ログイン成功を確認
  await page.waitForURL('/subscriptions')
  await expect(page).toHaveURL('/subscriptions')

  // 認証状態を保存
  await page.context().storageState({ path: authFile })
})
