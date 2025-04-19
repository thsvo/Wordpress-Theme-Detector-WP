import type { Metadata } from 'next'
import './globals.css'
import { Toaster } from '@/components/ui/sonner'

export const metadata: Metadata = {
  title: 'WordPress Theme Detector | Identify WP Themes and Plugins',
  description: 'Free WordPress theme and plugin detector tool. Instantly identify any WordPress theme, plugins, and technologies used on any WordPress website.',
  keywords: 'wordpress detector, wp theme detector, wordpress theme finder, wordpress plugin detector, website analyzer, wordpress tools',
  authors: [{ name: 'WordPress Detector Team' }],
  creator: 'WordPress Detector',
  publisher: 'WordPress Detector',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-video-preview': -1,
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://wordpress-detector.com/',
    title: 'WordPress Theme Detector | Identify WP Themes and Plugins',
    description: 'Free WordPress theme and plugin detector tool. Instantly identify any WordPress theme, plugins, and technologies used on any WordPress website.',
    siteName: 'WordPress Detector',
    images: [
      {
        url: '/images/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'WordPress Detector Tool',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'WordPress Theme Detector | Identify WP Themes and Plugins',
    description: 'Free WordPress theme and plugin detector tool. Instantly identify any WordPress theme, plugins, and technologies used on any WordPress website.',
    images: ['/images/twitter-image.jpg'],
    creator: '@wpdetector',
  },
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 5,
  },
  verification: {
    google: 'your-google-verification-code',
    yandex: 'your-yandex-verification-code',
    yahoo: 'your-yahoo-verification-code',
    other: {
      me: ['your-personal-site'],
    },
  },
  category: 'Technology',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <link rel="canonical" href="https://wordpress-detector.com/" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/apple-icon.png" />
        <link rel="manifest" href="/manifest.json" />
        {/* Preload critical assets */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* Add structured data for rich results */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              "name": "WordPress Detector",
              "url": "https://wordpress-detector.com",
              "description": "Free WordPress theme and plugin detector tool",
              "applicationCategory": "WebApplication",
              "operatingSystem": "All",
              "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "USD"
              }
            })
          }}
        />
      </head>
      <body className="min-h-screen antialiased">
        {children}
        <Toaster />
      </body>
    </html>
  )
}
