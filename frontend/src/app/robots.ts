import type { MetadataRoute } from 'next'
import { env } from '@/shared/lib/env'

/**
 * robots.txtを動的に生成
 *
 * @see https://nextjs.org/docs/app/api-reference/file-conventions/metadata/robots
 */
export default function robots(): MetadataRoute.Robots {
  const appUrl = env.NEXT_PUBLIC_APP_URL

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/_next/', '/static/'],
    },
    sitemap: `${appUrl}/sitemap.xml`,
  }
}
