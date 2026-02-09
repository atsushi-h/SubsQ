import { env, isProduction } from '@/shared/lib/env'

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
    index: isProduction(),
    follow: isProduction(),
    googleBot: {
      index: isProduction(),
      follow: isProduction(),
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
  SUBSCRIPTIONS: {
    title: 'サブスク一覧',
    description: '契約中のサブスクリプションを一覧で管理',
  },
  SUBSCRIPTION_NEW: {
    title: 'サブスク追加',
    description: '新しいサブスクリプションを追加',
  },
  PAYMENT_METHODS: {
    title: '支払い方法',
    description: '登録した支払い方法を管理',
  },
  PAYMENT_METHOD_NEW: {
    title: '支払い方法を追加',
    description: '新しい支払い方法を追加',
  },
  SETTINGS: {
    title: '設定',
    description: 'アカウント設定と退会',
  },
} as const
