'use client'

import { usePathname } from 'next/navigation'

import { Header } from '@/src/ui/layout/Header'
import { Footer } from '@/src/ui/layout/Footer'
import { GuruChatWidget } from '@/components/guru/GuruChatWidget'

export function RootSiteShell({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()

  const isSelfContainedCelestialExperience =
    pathname === '/' ||
    pathname === '/dev/visual-v2' ||
    pathname === '/dev/visual-v3' ||
    pathname.startsWith('/dev/visual-v2/') ||
    pathname.startsWith('/dev/visual-v3/')

  if (isSelfContainedCelestialExperience) {
    return (
      <main className="relative z-10 min-h-screen">
        {children}
      </main>
    )
  }

  return (
    <>
      <Header />

      <main className="relative z-10 pt-20 md:pt-24">
        {children}
      </main>

      <Footer />

      <GuruChatWidget />
    </>
  )
}
