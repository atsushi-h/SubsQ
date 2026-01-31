import { describe, expect, it, vi } from 'vitest'
import { generateMetadata, generateViewport } from './metadata'

// 依存関係をモック
vi.mock('@/shared/constants/metadata', () => ({
  METADATA_CONSTANTS: {
    APP_NAME: 'SubsQ',
    APP_DESCRIPTION: '毎月のサブスクリプションを管理するアプリ',
    APP_URL: 'https://example.com',
    SITE_NAME: 'SubsQ',
    LOCALE: 'ja_JP',
    DEFAULT_OG_IMAGE: 'https://example.com/og-image.png',
    OG_IMAGE_WIDTH: 1200,
    OG_IMAGE_HEIGHT: 630,
    THEME_COLOR: '#000000',
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
  },
  PAGE_METADATA: {
    LOGIN: {
      title: 'ログイン',
      description: 'SubsQにログインして毎月のサブスクリプションを管理しましょう',
    },
  },
}))

describe('generateMetadata', () => {
  it('デフォルト値でメタデータを生成する', () => {
    // Act
    const metadata = generateMetadata()

    // Assert
    expect(metadata).toEqual({
      title: undefined,
      description: '毎月のサブスクリプションを管理するアプリ',
      applicationName: 'SubsQ',
      robots: {
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
      openGraph: {
        type: 'website',
        siteName: 'SubsQ',
        title: 'SubsQ',
        description: '毎月のサブスクリプションを管理するアプリ',
        url: 'https://example.com',
        locale: 'ja_JP',
        images: [
          {
            url: 'https://example.com/og-image.png',
            width: 1200,
            height: 630,
            alt: 'SubsQ',
          },
        ],
      },
      twitter: {
        card: 'summary_large_image',
        title: 'SubsQ',
        description: '毎月のサブスクリプションを管理するアプリ',
        images: ['https://example.com/og-image.png'],
      },
      alternates: {
        canonical: 'https://example.com',
      },
    })
  })

  it('カスタムタイトルと説明でメタデータを生成する', () => {
    // Arrange
    const options = {
      title: 'ログイン',
      description: 'アカウントにログインする',
    }

    // Act
    const metadata = generateMetadata(options)

    // Assert
    expect(metadata.title).toBe('ログイン')
    expect(metadata.description).toBe('アカウントにログインする')
    expect(metadata.openGraph?.title).toBe('ログイン')
    expect(metadata.openGraph?.description).toBe('アカウントにログインする')
    expect(metadata.twitter?.title).toBe('ログイン')
    expect(metadata.twitter?.description).toBe('アカウントにログインする')
  })

  it('パスを指定してcanonical URLを生成する', () => {
    // Arrange
    const options = {
      path: '/login',
    }

    // Act
    const metadata = generateMetadata(options)

    // Assert
    expect(metadata.alternates?.canonical).toBe('https://example.com/login')
    expect(metadata.openGraph?.url).toBe('https://example.com/login')
  })

  it('カスタムOG画像を設定する', () => {
    // Arrange
    const options = {
      ogImage: 'https://example.com/custom-og.png',
    }

    // Act
    const metadata = generateMetadata(options)

    // Assert
    expect(metadata.openGraph?.images).toEqual([
      {
        url: 'https://example.com/custom-og.png',
        width: 1200,
        height: 630,
        alt: 'SubsQ',
      },
    ])
    expect(metadata.twitter?.images).toEqual(['https://example.com/custom-og.png'])
  })

  it('noIndexがtrueの場合、検索エンジンのインデックスを無効化する', () => {
    // Arrange
    const options = {
      noIndex: true,
    }

    // Act
    const metadata = generateMetadata(options)

    // Assert
    expect(metadata.robots).toEqual({
      index: false,
      follow: false,
    })
  })

  it('noIndexがfalseの場合、デフォルトのrobots設定を使用する', () => {
    // Arrange
    const options = {
      noIndex: false,
    }

    // Act
    const metadata = generateMetadata(options)

    // Assert
    expect(metadata.robots).toEqual({
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    })
  })

  it('タイトルが指定されている場合、OG画像のaltにタイトルを使用する', () => {
    // Arrange
    const options = {
      title: 'マイページ',
    }

    // Act
    const metadata = generateMetadata(options)

    // Assert
    const images = metadata.openGraph?.images as Array<{
      url: string
      width: number
      height: number
      alt: string
    }>
    expect(images?.[0].alt).toBe('マイページ')
  })

  it('すべてのオプションを組み合わせてメタデータを生成する', () => {
    // Arrange
    const options = {
      title: 'サブスクリプション一覧',
      description: '登録されているサブスクリプションの一覧を表示します',
      path: '/subscriptions',
      ogImage: 'https://example.com/subscriptions-og.png',
      noIndex: false,
    }

    // Act
    const metadata = generateMetadata(options)

    // Assert
    expect(metadata).toMatchObject({
      title: 'サブスクリプション一覧',
      description: '登録されているサブスクリプションの一覧を表示します',
      alternates: {
        canonical: 'https://example.com/subscriptions',
      },
      openGraph: expect.objectContaining({
        title: 'サブスクリプション一覧',
        description: '登録されているサブスクリプションの一覧を表示します',
        url: 'https://example.com/subscriptions',
        images: [
          expect.objectContaining({
            url: 'https://example.com/subscriptions-og.png',
            alt: 'サブスクリプション一覧',
          }),
        ],
      }),
      twitter: expect.objectContaining({
        title: 'サブスクリプション一覧',
        description: '登録されているサブスクリプションの一覧を表示します',
        images: ['https://example.com/subscriptions-og.png'],
      }),
    })
  })
})

describe('generateViewport', () => {
  it('ビューポート設定を生成する', () => {
    // Act
    const viewport = generateViewport()

    // Assert
    expect(viewport).toEqual({
      themeColor: '#000000',
    })
  })
})
