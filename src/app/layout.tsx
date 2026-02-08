import type { Metadata } from 'next'
import { Analytics } from '@vercel/analytics/react'
import './globals.css'
import Footer from '@/components/Footer'

export const metadata: Metadata = {
  title: 'Υιοθέτησε ένα Δέντρο - Θέρμη',
  description: 'Πλατφόρμα υιοθεσίας δέντρων στη Θέρμη Θεσσαλονίκης',
  openGraph: {
    title: 'Υιοθέτησε ένα Δέντρο - Θέρμη',
    description: 'Βοήθησε να πρασινίσει η Θέρμη Θεσσαλονίκης υιοθετώντας και φροντίζοντας ένα δέντρο',
    type: 'website',
    locale: 'el_GR',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Υιοθέτησε ένα Δέντρο - Θέρμη',
    description: 'Βοήθησε να πρασινίσει η Θέρμη Θεσσαλονίκης υιοθετώντας και φροντίζοντας ένα δέντρο',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="flex flex-col min-h-screen">
        {children}
        <Footer />
        <Analytics />
      </body>
    </html>
  )
}