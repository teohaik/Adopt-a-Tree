import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Υιοθέτησε ένα Δέντρο - Θέρμη',
  description: 'Πλατφόρμα υιοθεσίας δέντρων στη Θέρμη Θεσσαλονίκης',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}