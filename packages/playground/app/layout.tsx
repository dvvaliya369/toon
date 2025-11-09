import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'TOON Playground',
  description: 'Interactive playground for Token-Oriented Object Notation (TOON) format',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  )
}
