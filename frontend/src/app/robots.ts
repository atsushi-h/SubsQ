import type { MetadataRoute } from 'next'
import { env, isProduction } from '@/shared/lib/env'

/**
 * robots.txtを動的に生成
 *
 * 開発環境: 全クローラーをブロック（誤ってインデックスされるのを防ぐ）
 * 本番環境: 全ページを許可（APIエンドポイントと静的アセットは除外）
 *
 * @see https://nextjs.org/docs/app/api-reference/file-conventions/metadata/robots
 */
export default function robots(): MetadataRoute.Robots {
  const appUrl = env.NEXT_PUBLIC_APP_URL

  // 開発環境では全クローラーをブロック
  if (!isProduction()) {
    return {
      rules: {
        userAgent: '*',
        disallow: '/',
      },
    }
  }

  // 本番環境では全ページを許可（API・静的アセットは除外）
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/_next/', '/static/'],
    },
    sitemap: `${appUrl}/sitemap.xml`,
  }
}
