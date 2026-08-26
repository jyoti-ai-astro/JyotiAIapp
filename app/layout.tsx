import type { Metadata } from 'next'

import { Inter, Marcellus } from 'next/font/google'

import './globals.css'

import { GlobalErrorBoundary } from '@/components/error-boundaries/GlobalErrorBoundary'

import { AudioProvider } from '@/providers/audio-provider'

import { MotionProvider } from '@/components/providers/MotionProvider'
import { GlobalProviders } from '@/components/providers/GlobalProviders'
import { RootSiteShell } from '@/components/layout/RootSiteShell'

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
        className={`${inter.variable} ${marcellus.variable} font-body antialiased bg-background text-foreground overflow-x-hidden`}
      >

        <GlobalErrorBoundary>

          <MotionProvider>

            <AudioProvider>

              <GlobalProviders>
                <div
                  aria-hidden="true"
                  className="fixed inset-0 z-0 pointer-events-none bg-background"
                  style={{
                    background:
                      'radial-gradient(circle at 16% 0%, hsl(var(--saffron) / 0.14), transparent 28rem), radial-gradient(circle at 84% 8%, hsl(var(--teal) / 0.1), transparent 26rem), linear-gradient(180deg, hsl(var(--background)) 0%, hsl(var(--surface-sunken)) 100%)',
                  }}
                />

                <RootSiteShell>
                  {children}
                </RootSiteShell>
              </GlobalProviders>

            </AudioProvider>

          </MotionProvider>

        </GlobalErrorBoundary>

      </body>

    </html>

  )

}
