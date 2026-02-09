import { expect, test } from '@playwright/test'

test.describe('支払い方法追加', () => {
  test.beforeEach(async ({ page }) => {
    // 新規作成ページに遷移
    await page.goto('/payment-methods/new')
    await page.waitForLoadState('networkidle')
  })

  test('支払い方法を作成できる', async ({ page }) => {
    // Arrange - テストデータ準備
    const timestamp = Date.now()
    const paymentMethodName = `[E2E] Test Card ${timestamp}`

    // Act - フォーム入力・送信
    await page.getByTestId('payment-method-form-name').fill(paymentMethodName)

    // 作成ボタンをクリック
    await page.getByTestId('payment-method-form-submit').click()

    // Assert - 成功確認
    // 1. 成功トーストが表示される
    await expect(page.locator('text=支払い方法を追加しました')).toBeVisible()

    // 2. 一覧ページにリダイレクトされる
    await page.waitForURL('/payment-methods')
    await expect(page).toHaveURL('/payment-methods')

    // 3. 作成した支払い方法がリストに表示される
    await expect(page.locator(`text=${paymentMethodName}`).first()).toBeVisible()
  })

  test('複数の支払い方法を作成できる', async ({ page }) => {
    // Arrange - テストデータ準備
    const timestamp = Date.now()
    const paymentMethod1 = `[E2E] Visa Card ${timestamp}`
    const paymentMethod2 = `[E2E] Master Card ${timestamp}`

    // Act - 1つ目の支払い方法を作成
    await page.getByTestId('payment-method-form-name').fill(paymentMethod1)
    await page.getByTestId('payment-method-form-submit').click()

    // Assert - 1つ目の成功確認
    await expect(page.locator('text=支払い方法を追加しました')).toBeVisible()
    await page.waitForURL('/payment-methods')
    await expect(page.locator(`text=${paymentMethod1}`).first()).toBeVisible()

    // Act - 2つ目の支払い方法を作成
    // 新規作成ページに再度遷移
    await page.goto('/payment-methods/new')
    await page.waitForLoadState('networkidle')
    await page.getByTestId('payment-method-form-name').fill(paymentMethod2)
    await page.getByTestId('payment-method-form-submit').click()

    // Assert - 2つ目の成功確認
    await expect(page.locator('text=支払い方法を追加しました')).toBeVisible()
    await page.waitForURL('/payment-methods')
    await expect(page.locator(`text=${paymentMethod2}`).first()).toBeVisible()

    // 両方の支払い方法が表示されていることを確認
    await expect(page.locator(`text=${paymentMethod1}`).first()).toBeVisible()
  })
})
