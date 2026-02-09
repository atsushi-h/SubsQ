import { expect, test } from '@playwright/test'

test.describe('サブスクリプション作成', () => {
  test.beforeEach(async ({ page }) => {
    // 新規作成ページに遷移
    await page.goto('/subscriptions/new')
    await page.waitForLoadState('networkidle')
  })

  test('必須項目のみでサブスクリプションを作成できる', async ({ page }) => {
    // Arrange - テストデータ準備
    const timestamp = Date.now()
    const serviceName = `[E2E] Netflix ${timestamp}`
    const amount = '1980'
    const billingCycle = 'monthly'
    const baseDate = '2025-03-15'

    // Act - フォーム入力・送信
    await page.getByTestId('subscription-form-service-name').fill(serviceName)
    await page.getByTestId('subscription-form-amount').fill(amount)
    await page.getByTestId('subscription-form-billing-cycle').selectOption(billingCycle)
    await page.getByTestId('subscription-form-base-date').fill(baseDate)

    // 作成ボタンをクリック
    await page.getByTestId('subscription-form-submit').click()

    // Assert - 成功確認
    // 1. 成功トーストが表示される
    await expect(page.locator('text=サブスクリプションを作成しました')).toBeVisible()

    // 2. 一覧ページにリダイレクトされる
    await page.waitForURL('/subscriptions')
    await expect(page).toHaveURL('/subscriptions')

    // 3. 作成したサブスクリプションがリストに表示される
    await expect(page.locator(`text=${serviceName}`).first()).toBeVisible()
  })

  test('全項目を入力してサブスクリプションを作成できる', async ({ page }) => {
    // Arrange - テストデータ準備
    const timestamp = Date.now()
    const serviceName = `[E2E] Netflix Premium ${timestamp}`
    const amount = '1980'
    const billingCycle = 'monthly'
    const baseDate = '2025-03-15'
    const memo = 'E2E Test Subscription - Full Form'

    // Act - フォーム入力・送信
    await page.getByTestId('subscription-form-service-name').fill(serviceName)
    await page.getByTestId('subscription-form-amount').fill(amount)
    await page.getByTestId('subscription-form-billing-cycle').selectOption(billingCycle)
    await page.getByTestId('subscription-form-base-date').fill(baseDate)
    await page.getByTestId('subscription-form-memo').fill(memo)

    // 作成ボタンをクリック
    await page.getByTestId('subscription-form-submit').click()

    // Assert - 成功確認
    // 1. 成功トーストが表示される
    await expect(page.locator('text=サブスクリプションを作成しました')).toBeVisible()

    // 2. 一覧ページにリダイレクトされる
    await page.waitForURL('/subscriptions')
    await expect(page).toHaveURL('/subscriptions')

    // 3. 作成したサブスクリプションがリストに表示される
    await expect(page.locator(`text=${serviceName}`).first()).toBeVisible()
  })

  test('年額サブスクリプションを作成できる', async ({ page }) => {
    // Arrange - テストデータ準備
    const timestamp = Date.now()
    const serviceName = `[E2E] Adobe CC ${timestamp}`
    const amount = '65760'
    const billingCycle = 'yearly'
    const baseDate = '2025-04-01'

    // Act - フォーム入力・送信
    await page.getByTestId('subscription-form-service-name').fill(serviceName)
    await page.getByTestId('subscription-form-amount').fill(amount)
    await page.getByTestId('subscription-form-billing-cycle').selectOption(billingCycle)
    await page.getByTestId('subscription-form-base-date').fill(baseDate)

    // 作成ボタンをクリック
    await page.getByTestId('subscription-form-submit').click()

    // Assert - 成功確認
    // 1. 成功トーストが表示される
    await expect(page.locator('text=サブスクリプションを作成しました')).toBeVisible()

    // 2. 一覧ページにリダイレクトされる
    await page.waitForURL('/subscriptions')
    await expect(page).toHaveURL('/subscriptions')

    // 3. 作成したサブスクリプションがリストに表示される
    await expect(page.locator(`text=${serviceName}`).first()).toBeVisible()
  })
})
