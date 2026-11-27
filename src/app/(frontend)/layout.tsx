import type { Metadata } from 'next'

import { cn } from '@/utilities/ui'
import { GeistSans } from 'geist/font/sans'
import { Bricolage_Grotesque } from 'next/font/google'
import React from 'react'

import { Analytics } from '@vercel/analytics/next'
import { SpeedInsights } from '@vercel/speed-insights/next'

import { AdminBar } from '@/components/AdminBar'
import { FaviconThemeListener } from '@/components/FaviconThemeListener'
import { Footer } from '@/Footer/Component'
import { Header } from '@/Header/Component'
import { StudioStructuredData } from '@/components/StudioStructuredData'
import { mergeOpenGraph } from '@/utilities/mergeOpenGraph'
import { draftMode } from 'next/headers'

import './globals.css'
import { getServerSideURL } from '@/utilities/getURL'

// Headings; body text uses Geist. The optical size axis draws large titles tighter than small ones.
const bricolage = Bricolage_Grotesque({
  axes: ['opsz'],
  subsets: ['latin'],
  variable: '--font-bricolage',
})

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const { isEnabled } = await draftMode()

  return (
    <html className={cn(GeistSans.variable, bricolage.variable)} lang="fr">
      <head>
        <link href="/favicon.ico" rel="icon" sizes="32x32" />
        <link href="/favicon.svg" rel="icon" type="image/svg+xml" />
        <link href="/apple-touch-icon.png" rel="apple-touch-icon" />
      </head>
      <body>
        <AdminBar
          adminBarProps={{
            preview: isEnabled,
          }}
        />

        <Header />
        {children}
        <Footer />
        <StudioStructuredData />
        <FaviconThemeListener />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}

export const metadata: Metadata = {
  metadataBase: new URL(getServerSideURL()),
  openGraph: mergeOpenGraph(),
  twitter: {
    card: 'summary_large_image',
  },
}
