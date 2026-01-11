import { env } from '@/shared/lib/env'

/**
 * アプリケーション全体で使用するメタデータ定数
 */
export const METADATA_CONSTANTS = {
  // 基本情報
  APP_NAME: 'SubsQ',
  APP_DESCRIPTION: '毎月のサブスクリプションを管理するアプリ',
  APP_URL: env.NEXT_PUBLIC_APP_URL,

  // SEO & ソーシャル
  SITE_NAME: 'SubsQ',
  LOCALE: 'ja_JP',

  // デフォルト OG 画像
  DEFAULT_OG_IMAGE: `${env.NEXT_PUBLIC_APP_URL}/og-image.png`,
  OG_IMAGE_WIDTH: 1200,
  OG_IMAGE_HEIGHT: 630,

  // テーマカラー
  THEME_COLOR: '#000000',

  // Robots 設定
  DEFAULT_ROBOTS: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
} as const

/**
 * ページ別メタデータテンプレート
 */
export const PAGE_METADATA = {
  LOGIN: {
    title: 'ログイン',
    description: 'SubsQにログインして毎月のサブスクリプションを管理しましょう',
  },
} as const
