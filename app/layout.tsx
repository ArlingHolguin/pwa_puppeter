import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'PWA | Scraping',
  description: 'PWA scraping',
      viewport: "width=device-width, initial-scale=1.0",
      manifest: "manifest.json",
      themeColor: "#ffffff",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <head>
      <link rel="apple-touch-icon" href="/icon-512x512.png"></link>
      </head>
      <body className={inter.className}>{children}</body>
    </html>
  )
}
