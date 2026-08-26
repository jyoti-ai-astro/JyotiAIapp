import type { Metadata } from 'next'
import './globals.css'
import './mission-components.css'
import AdminShell from '@/components/admin-shell'

export const metadata: Metadata = {
  title: 'JyotiAI Mission Control',
  description: 'JyotiAI secure administration and operations portal',
  robots: { index: false, follow: false, nocache: true },
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body><AdminShell>{children}</AdminShell></body>
    </html>
  )
}
