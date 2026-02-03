import { expect, test } from '@playwright/test'

test.describe('サブスクリプション機能', () => {
  test('サブスクリプション一覧ページが表示される', async ({ page }) => {
    await page.goto('/subscriptions')
    await expect(page).toHaveURL('/subscriptions')
  })
})
