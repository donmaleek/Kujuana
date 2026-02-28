import type { Metadata, Viewport } from 'next'
import { Cormorant_Garamond, Jost } from 'next/font/google'
import './globals.css'

/* ─── Fonts ─────────────────────────────────────────────────────────── */
const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  style: ['normal', 'italic'],
  variable: '--font-cormorant',
  display: 'swap',
})

const jost = Jost({
  subsets: ['latin'],
  weight: ['200', '300', '400', '500', '600'],
  variable: '--font-jost',
  display: 'swap',
})

/* ─── Metadata ───────────────────────────────────────────────────────── */
export const metadata: Metadata = {
  metadataBase: new URL('https://kujuana.com'),
  title: {
    default: 'Kujuana — Dating with Intention',
    template: '%s | Kujuana',
  },
  description:
    'Premium curated matchmaking for Kenya and the global diaspora. Three-tier system designed for intentional relationships — Standard, Priority, and VIP.',
  keywords: [
    'matchmaking Kenya',
    'dating Kenya',
    'intentional dating',
    'African matchmaking',
    'premium dating app',
    'Nairobi dating',
    'diaspora dating',
    'kujuana',
  ],
  authors: [{ name: 'Kujuana Ltd', url: 'https://kujuana.com' }],
  creator: 'Kujuana Ltd',
  publisher: 'Kujuana Ltd',
  openGraph: {
    type: 'website',
    locale: 'en_KE',
    url: 'https://kujuana.com',
    siteName: 'Kujuana',
    title: 'Kujuana — Dating with Intention',
    description:
      'Premium curated matchmaking for Kenya and the global diaspora. Where compatibility meets intention.',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Kujuana — Dating with Intention',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Kujuana — Dating with Intention',
    description:
      'Premium curated matchmaking for Kenya and the global diaspora.',
    images: ['/og-image.jpg'],
    creator: '@kujuana',
  },
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
  icons: {
    icon: '/brand/logo.png',
    shortcut: '/brand/logo.png',
    apple: '/brand/logo.png',
  },
  manifest: '/site.webmanifest',
}

export const viewport: Viewport = {
  themeColor: '#3B0F4F',
  colorScheme: 'dark',
  width: 'device-width',
  initialScale: 1,
}

/* ─── Root Layout ────────────────────────────────────────────────────── */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="en"
      // Both font variables available as CSS custom properties throughout the app.
      // jost.className applies Jost as the default body font.
      // cormorant.variable exposes --font-cormorant for display headings via CSS.
      className={`${jost.variable} ${cormorant.variable}`}
      suppressHydrationWarning
    >
      {/*
        Apply jost.className so Jost is used as the body font by default.
        The cormorant variable is accessed via var(--font-cormorant) in CSS
        for all display/heading uses.
      */}
      <body className={jost.className}>
        {children}
      </body>
    </html>
  )
}
