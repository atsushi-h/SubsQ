import type { MetadataRoute } from 'next'
import { METADATA_CONSTANTS } from '@/shared/constants/metadata'
import { isProduction } from '@/shared/lib/env'

export default function robots(): MetadataRoute.Robots {
  if (!isProduction()) {
    // dev環境: 全クローラーをブロック
    return {
      rules: {
        userAgent: '*',
        disallow: '/',
      },
    }
  }

  // production環境: 全ページを許可
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: '/api/',
    },
    sitemap: `${METADATA_CONSTANTS.APP_URL}/sitemap.xml`,
  }
}
