import type { Metadata } from 'next'

import { Inter, Marcellus, Playfair_Display } from 'next/font/google'

import './globals.css'

import { GlobalErrorBoundary } from '@/components/error-boundaries/GlobalErrorBoundary'

import { AudioProvider } from '@/providers/audio-provider'

import { GlobalShaderBackground } from '@/src/ui/background/GlobalShaderBackground'
import { Header } from '@/src/ui/layout/Header'
import { Footer } from '@/src/ui/layout/Footer'
import { MotionProvider } from '@/components/providers/MotionProvider'
import { GlobalProviders } from '@/components/providers/GlobalProviders'
import { GuruChatWidget } from '@/components/guru/GuruChatWidget'

const inter = Inter({ 

  subsets: ['latin'],

  variable: '--font-body',

  display: 'swap',

  preload: true,

})

const marcellus = Marcellus({

  weight: ['400'],

  subsets: ['latin'],

  variable: '--font-heading',

  display: 'swap',

  preload: true,

})

const playfair = Playfair_Display({

  subsets: ['latin'],

  variable: '--font-display',

  display: 'swap',

  preload: true,

})

import { generateMetadata as genMeta } from '@/lib/seo/metadata';

export const metadata: Metadata = genMeta({

  title: 'Home',

  description: 'Your Destiny, Decoded by AI + Ancient Wisdom. Astrology • Numerology • Aura • Palmistry • Remedies • Predictions',

  keywords: ['astrology', 'numerology', 'kundali', 'palmistry', 'aura', 'spiritual guidance', 'AI astrology'],

  canonical: '/',

  ogImage: '/og-home.jpg',

});

export default function RootLayout({

  children,

}: {

  children: React.ReactNode

}) {

  return (

    <html lang="en" suppressHydrationWarning>

      <body
        className={`${inter.variable} ${marcellus.variable} ${playfair.variable} font-body antialiased bg-[#05050A] text-white overflow-x-hidden`}
      >

        <GlobalErrorBoundary>

          <MotionProvider>

            <AudioProvider>

              <GlobalProviders>
                {/* GLOBAL SHADER BACKGROUND */}
                <GlobalShaderBackground />

                {/* GLOBAL HEADER */}
                <Header />

                {/* PAGE CONTENT */}
                <main className="relative z-10 pt-20 md:pt-24">
                  {children}
                </main>

                {/* GLOBAL FOOTER */}
                <Footer />

                {/* GLOBAL GURU CHAT WIDGET */}
                <GuruChatWidget />
              </GlobalProviders>

            </AudioProvider>

          </MotionProvider>

        </GlobalErrorBoundary>

      </body>

    </html>

  )

}
