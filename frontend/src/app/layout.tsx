import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import { METADATA_CONSTANTS } from '@/shared/constants/metadata'
import { generateMetadata, generateViewport } from '@/shared/lib/metadata'
import { QueryProvider } from '@/shared/providers/QueryProvider'
import { ThemeProvider } from '@/shared/providers/ThemeProvider'
import pkg from '../../package.json'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  ...generateMetadata({
    title: METADATA_CONSTANTS.APP_NAME,
    description: METADATA_CONSTANTS.APP_DESCRIPTION,
    path: '/',
  }),

  // Title テンプレート - 子ページは「ログイン」だけ指定すれば「ログイン | SubsQ」になる
  title: {
    default: METADATA_CONSTANTS.APP_NAME,
    template: `%s | ${METADATA_CONSTANTS.APP_NAME}`,
  },

  // 相対 URL の基準
  metadataBase: new URL(METADATA_CONSTANTS.APP_URL),

  // PWA設定
  manifest: '/manifest.webmanifest',
  applicationName: METADATA_CONSTANTS.APP_NAME,
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: METADATA_CONSTANTS.APP_NAME,
  },
  formatDetection: {
    telephone: false,
  },

  // デプロイバージョンを確認できるようにカスタムメタタグを追加
  other: {
    'app-version': pkg.version,
  },
}

export const viewport = generateViewport()

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ja" suppressHydrationWarning>
      <head>
        <link rel="apple-touch-icon" href="/icon-192.png" />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ThemeProvider>
          <QueryProvider>{children}</QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
