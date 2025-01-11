import { geist, geistMono } from './fonts'
import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Ball Type',
  description: 'A fun way to type with a bouncing ball',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${geist.variable} ${geistMono.variable}`}>
      <body className="antialiased">{children}</body>
    </html>
  )
}
