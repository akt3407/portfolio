import './globals.css'

import Footer from '@components/layout/footer'
import Header from '@components/layout/header'
import type { Metadata } from 'next'
import { Akt, Zen_Kaku_Gothic_Antique } from 'next/font/google'
import { Suspense } from 'react'

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'

const akt = Akt({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-akt',
})

const zenKakuGothicAntique = Zen_Kaku_Gothic_Antique({
  weight: ['400', '500', '700'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-zen-kaku',
})

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: 'Home | Akito Iuchi | Portfolio', template: '%s | Akito Iuchi | Portfolio' },
  description: '井内秋斗のポートフォリオです。',
  openGraph: {
    title: 'Akito Iuchi | Portfolio',
    description: '...',
    type: 'website',
    locale: 'ja_JP',
  },
  twitter: { card: 'summary_large_image' },
}

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="ja" className={`${akt.variable} ${zenKakuGothicAntique.variable}`}>
      <body className="flex min-h-full flex-col">
        <Suspense fallback={<div style={{ height: 64 }} aria-hidden />}>
          <Header />
        </Suspense>
        {children}
        <Footer />
      </body>
    </html>
  )
}
