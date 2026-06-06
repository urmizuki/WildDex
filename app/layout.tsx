import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'WildDex - Malaysian Tree Trading Card Game',
  description: 'Scan trees, collect cards, and build your forest encyclopedia.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <link rel="icon" type="image/svg+xml" href="/assets/icons/icon.svg" />
      </head>
      <body>{children}</body>
    </html>
  )
}