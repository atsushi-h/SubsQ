import { expect, type Page, test } from '@playwright/test'

/**
 * メタデータ検証ヘルパー
 */
async function expectMetadata(
  page: Page,
  expected: {
    title: string
    description: string
    path: string
  },
) {
  const baseUrl = 'http://localhost:3000'

  // title タグ
  await expect(page).toHaveTitle(expected.title)

  // meta description
  const metaDescription = page.locator('meta[name="description"]')
  await expect(metaDescription).toHaveAttribute('content', expected.description)

  // OG タグ
  const ogTitle = page.locator('meta[property="og:title"]')
  await expect(ogTitle).toHaveAttribute('content', expected.title)

  const ogDescription = page.locator('meta[property="og:description"]')
  await expect(ogDescription).toHaveAttribute('content', expected.description)

  const ogUrl = page.locator('meta[property="og:url"]')
  await expect(ogUrl).toHaveAttribute('content', `${baseUrl}${expected.path}`)

  const ogSiteName = page.locator('meta[property="og:site_name"]')
  await expect(ogSiteName).toHaveAttribute('content', 'SubsQ')

  // Twitter Card
  const twitterCard = page.locator('meta[name="twitter:card"]')
  await expect(twitterCard).toHaveAttribute('content', 'summary_large_image')

  const twitterTitle = page.locator('meta[name="twitter:title"]')
  await expect(twitterTitle).toHaveAttribute('content', expected.title)

  const twitterDescription = page.locator('meta[name="twitter:description"]')
  await expect(twitterDescription).toHaveAttribute('content', expected.description)
}

/**
 * 動的ページのタイトルパターンを検証するヘルパー
 */
async function expectDynamicTitlePattern(page: Page, pattern: RegExp) {
  const title = await page.title()
  expect(title).toMatch(pattern)

  // OGタグも同じパターンに一致することを確認
  const ogTitle = page.locator('meta[property="og:title"]')
  const ogTitleContent = await ogTitle.getAttribute('content')
  expect(ogTitleContent).toMatch(pattern)
}

test.describe('静的ページのメタデータ', () => {
  test('サブスク一覧ページ', async ({ page }) => {
    await page.goto('/subscriptions')

    await expectMetadata(page, {
      title: 'サブスク一覧 | SubsQ',
      description: '契約中のサブスクリプションを一覧で管理',
      path: '/subscriptions',
    })
  })

  test('サブスク追加ページ', async ({ page }) => {
    await page.goto('/subscriptions/new')

    await expectMetadata(page, {
      title: 'サブスク追加 | SubsQ',
      description: '新しいサブスクリプションを追加',
      path: '/subscriptions/new',
    })
  })

  test('支払い方法一覧ページ', async ({ page }) => {
    await page.goto('/payment-methods')

    await expectMetadata(page, {
      title: '支払い方法 | SubsQ',
      description: '登録した支払い方法を管理',
      path: '/payment-methods',
    })
  })

  test('支払い方法追加ページ', async ({ page }) => {
    await page.goto('/payment-methods/new')

    await expectMetadata(page, {
      title: '支払い方法を追加 | SubsQ',
      description: '新しい支払い方法を追加',
      path: '/payment-methods/new',
    })
  })

  test('設定ページ', async ({ page }) => {
    await page.goto('/settings')

    await expectMetadata(page, {
      title: '設定 | SubsQ',
      description: 'アカウント設定と退会',
      path: '/settings',
    })
  })
})

test.describe('動的ページのメタデータパターン検証', () => {
  test('サブスク詳細ページ - タイトルが正しいパターンで生成される', async ({ page }) => {
    await page.goto('/subscriptions')

    // ページが読み込まれるまで待つ
    await page.waitForLoadState('networkidle')

    // サブスクリプションがある場合、最初のリンクをクリック
    const firstLink = page.locator('a[href^="/subscriptions/"][href$!="/new"]').first()
    const isVisible = await firstLink.isVisible().catch(() => false)

    if (!isVisible) {
      // サブスクリプションがない場合はスキップ
      test.skip()
      return
    }

    await firstLink.click()
    await page.waitForURL(/\/subscriptions\/[^/]+$/)

    // タイトルが「{サービス名} の詳細 | SubsQ」のパターンに一致することを確認
    await expectDynamicTitlePattern(page, /.+ の詳細 \| SubsQ/)

    // descriptionも動的に生成されていることを確認
    const metaDescription = page.locator('meta[name="description"]')
    const descContent = await metaDescription.getAttribute('content')
    expect(descContent).toMatch(/.+ のサブスクリプション詳細を確認/)
  })

  test('サブスク編集ページ - タイトルが正しいパターンで生成される', async ({ page }) => {
    await page.goto('/subscriptions')
    await page.waitForLoadState('networkidle')

    // 編集リンクを探す
    const editLink = page.locator('a[href*="/subscriptions/"][href$="/edit"]').first()
    const isVisible = await editLink.isVisible().catch(() => false)

    if (!isVisible) {
      test.skip()
      return
    }

    await editLink.click()
    await page.waitForURL(/\/subscriptions\/[^/]+\/edit$/)

    // タイトルが「{サービス名} を編集 | SubsQ」のパターンに一致
    await expectDynamicTitlePattern(page, /.+ を編集 \| SubsQ/)

    // descriptionも動的に生成されていることを確認
    const metaDescription = page.locator('meta[name="description"]')
    const descContent = await metaDescription.getAttribute('content')
    expect(descContent).toMatch(/.+ のサブスクリプション情報を編集/)
  })

  test('支払い方法編集ページ - タイトルが正しいパターンで生成される', async ({ page }) => {
    await page.goto('/payment-methods')
    await page.waitForLoadState('networkidle')

    // 編集リンクを探す
    const editLink = page.locator('a[href*="/payment-methods/"][href$="/edit"]').first()
    const isVisible = await editLink.isVisible().catch(() => false)

    if (!isVisible) {
      test.skip()
      return
    }

    await editLink.click()
    await page.waitForURL(/\/payment-methods\/[^/]+\/edit$/)

    // タイトルが「{支払い方法名} を編集 | SubsQ」のパターンに一致
    await expectDynamicTitlePattern(page, /.+ を編集 \| SubsQ/)

    // descriptionも動的に生成されていることを確認
    const metaDescription = page.locator('meta[name="description"]')
    const descContent = await metaDescription.getAttribute('content')
    expect(descContent).toMatch(/.+ の情報を編集/)
  })
})

test.describe('エラーページのメタデータ', () => {
  test('存在しないサブスクIDでアクセス - データが見つからない場合のタイトル', async ({ page }) => {
    // 存在しないIDでアクセス
    await page.goto('/subscriptions/00000000-0000-0000-0000-000000000000')

    // データが見つからない場合のタイトルが表示される
    await expect(page).toHaveTitle('サブスクが見つかりません | SubsQ')
  })

  test('存在しない支払い方法IDでアクセス - データが見つからない場合のタイトル', async ({
    page,
  }) => {
    await page.goto('/payment-methods/00000000-0000-0000-0000-000000000000/edit')

    // データが見つからない場合のタイトルが表示される
    await expect(page).toHaveTitle('支払い方法が見つかりません | SubsQ')
  })
})
