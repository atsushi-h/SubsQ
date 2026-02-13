import type { MetadataRoute } from 'next'
import { env } from '@/shared/lib/env'

/**
 * sitemap.xmlを動的に生成
 *
 * 【含めるページの方針】
 * - 認証不要で公開アクセス可能なページのみ
 * - 認証が必要なページ（/subscriptions, /payment-methods等）は除外
 *   （クローラーがアクセスできないため）
 *
 * 【将来的な拡張】
 * 公開ページが追加された場合（プライバシーポリシー、利用規約等）は追加可能：
 * ```ts
 * {
 *   url: `${appUrl}/privacy`,
 *   lastModified: now,
 *   changeFrequency: 'yearly' as const,
 *   priority: 0.3,
 * }
 * ```
 *
 * @see https://nextjs.org/docs/app/api-reference/file-conventions/metadata/sitemap
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const appUrl = env.NEXT_PUBLIC_APP_URL
  const now = new Date()

  // 認証不要の公開ページのみ含める
  const publicPages: MetadataRoute.Sitemap = [
    {
      url: `${appUrl}/login`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 1.0,
    },
  ]

  return publicPages
}
