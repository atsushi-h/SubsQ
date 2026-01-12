import type { Metadata, Viewport } from 'next'
import { METADATA_CONSTANTS } from '@/shared/constants/metadata'

export type MetadataOptions = {
  /** ページタイトル (テンプレートと組み合わされる) */
  title?: string
  /** ページ説明 */
  description?: string
  /** 相対パス (canonical URL 用) */
  path?: string
  /** カスタム OG 画像 */
  ogImage?: string
  /** 検索エンジンのインデックスを無効化 */
  noIndex?: boolean
}

/**
 * ページのメタデータを生成
 *
 * @example
 * ```ts
 * export const metadata = generateMetadata({
 *   title: 'ログイン',
 *   description: 'アカウントにログインする',
 *   path: '/login',
 * })
 * ```
 */
export function generateMetadata(options: MetadataOptions = {}): Metadata {
  const {
    title,
    description = METADATA_CONSTANTS.APP_DESCRIPTION,
    path = '',
    ogImage = METADATA_CONSTANTS.DEFAULT_OG_IMAGE,
    noIndex = false,
  } = options

  const url = `${METADATA_CONSTANTS.APP_URL}${path}`

  return {
    title,
    description,
    applicationName: METADATA_CONSTANTS.APP_NAME,

    // Robots
    robots: noIndex ? { index: false, follow: false } : METADATA_CONSTANTS.DEFAULT_ROBOTS,

    // Open Graph
    openGraph: {
      type: 'website',
      siteName: METADATA_CONSTANTS.SITE_NAME,
      title: title || METADATA_CONSTANTS.APP_NAME,
      description,
      url,
      locale: METADATA_CONSTANTS.LOCALE,
      images: [
        {
          url: ogImage,
          width: METADATA_CONSTANTS.OG_IMAGE_WIDTH,
          height: METADATA_CONSTANTS.OG_IMAGE_HEIGHT,
          alt: title || METADATA_CONSTANTS.APP_NAME,
        },
      ],
    },

    // Twitter Card
    twitter: {
      card: 'summary_large_image',
      title: title || METADATA_CONSTANTS.APP_NAME,
      description,
      images: [ogImage],
    },

    // Canonical URL
    alternates: {
      canonical: url,
    },
  }
}

/**
 * ビューポート設定を生成
 *
 * @example
 * ```ts
 * export const viewport = generateViewport()
 * ```
 */
export function generateViewport(): Viewport {
  return {
    themeColor: METADATA_CONSTANTS.THEME_COLOR,
  }
}

/**
 * 定義済みのページテンプレートからメタデータを生成
 *
 * @example
 * ```ts
 * export const metadata = generatePageMetadata('LOGIN', { path: '/login' })
 * ```
 */
export function generatePageMetadata(
  pageKey: keyof typeof import('@/shared/constants/metadata').PAGE_METADATA,
  options: Omit<MetadataOptions, 'title' | 'description'> = {},
): Metadata {
  const { PAGE_METADATA } = require('@/shared/constants/metadata')
  const pageTemplate = PAGE_METADATA[pageKey]

  return generateMetadata({
    ...pageTemplate,
    ...options,
  })
}
