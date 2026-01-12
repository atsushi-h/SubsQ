import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import { METADATA_CONSTANTS } from '@/shared/constants/metadata'
import { generateMetadata, generateViewport } from '@/shared/lib/metadata'
import { QueryProvider } from '@/shared/providers/QueryProvider'

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
}

export const viewport = generateViewport()

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ja">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  )
}
