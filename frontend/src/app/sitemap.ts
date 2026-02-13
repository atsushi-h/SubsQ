import type { MetadataRoute } from 'next'
import { env } from '@/shared/lib/env'

/**
 * sitemap.xmlを動的に生成
 *
 * 現在は静的ページのみを含むが、将来的に以下のような動的ページを追加可能：
 * - サブスク詳細ページ (`/subscriptions/[id]`)
 * - 支払い方法詳細ページ (`/payment-methods/[id]`)
 *
 * 動的ページの追加例：
 * ```ts
 * // データベースから取得
 * const subscriptions = await db.select().from(subscriptionsTable)
 * const dynamicPages = subscriptions.map(sub => ({
 *   url: `${appUrl}/subscriptions/${sub.id}`,
 *   lastModified: new Date(sub.updatedAt),
 *   changeFrequency: 'weekly' as const,
 *   priority: 0.5,
 * }))
 * ```
 *
 * @see https://nextjs.org/docs/app/api-reference/file-conventions/metadata/sitemap
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const appUrl = env.NEXT_PUBLIC_APP_URL
  const now = new Date()

  // 静的ページ
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: appUrl,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 1,
    },
    {
      url: `${appUrl}/login`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
  ]

  // TODO: 将来的に動的ページを追加
  // const dynamicPages = await fetchDynamicPages()

  return [...staticPages]
}
