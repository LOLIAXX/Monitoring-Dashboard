import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Energy Monitoring',
  description: 'Energy Monitoring Web App',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
