import type { Metadata } from 'next'
import { Analytics } from '@vercel/analytics/react'
import './globals.css'
import Footer from '@/components/Footer'
import { LanguageProvider } from '@/lib/i18n/LanguageContext'

export const metadata: Metadata = {
  title: 'Υιοθέτησε ένα Δέντρο - Θέρμη | Adopt a Tree',
  description: 'Πλατφόρμα υιοθεσίας δέντρων στη Θέρμη Θεσσαλονίκης / Tree adoption platform in Thermi, Thessaloniki',
  icons: {
    icon: '/images/mytree-icon.png',
    shortcut: '/images/mytree-icon.png',
    apple: '/images/mytree-icon.png',
  },
  openGraph: {
    title: 'Υιοθέτησε ένα Δέντρο - Θέρμη | Adopt a Tree',
    description: 'Βοήθησε να πρασινίσει η Θέρμη Θεσσαλονίκης / Help green Thermi, Thessaloniki by adopting a tree',
    type: 'website',
    locale: 'el_GR',
    alternateLocale: 'en_US',
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Υιοθέτησε ένα Δέντρο - Θέρμη | Adopt a Tree',
    description: 'Βοήθησε να πρασινίσει η Θέρμη Θεσσαλονίκης / Help green Thermi, Thessaloniki by adopting a tree',
    images: ['/og-image.png'],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="el">
      <body className="flex flex-col min-h-screen">
        <LanguageProvider>
          {children}
          <Footer />
        </LanguageProvider>
        <Analytics />
      </body>
    </html>
  )
}
