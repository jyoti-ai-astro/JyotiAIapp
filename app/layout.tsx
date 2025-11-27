import type { Metadata } from 'next'
import { Inter, Marcellus, Playfair_Display } from 'next/font/google'
import './globals.css'
import { GlobalErrorBoundary } from '@/components/error-boundaries/GlobalErrorBoundary'
import { AudioProvider } from '@/providers/audio-provider'
import { Background } from '@/components/global/Background'
import { MotionProvider } from '@/components/providers/MotionProvider'
import { TransitionOverlay } from '@/components/global/TransitionOverlay'
import { RouteTransitionHandler } from '@/components/global/RouteTransitionHandler'
import { BlessingWaveOverlay } from '@/components/global/BlessingWaveOverlay'

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-body',
})

const marcellus = Marcellus({
  weight: ['400'],
  subsets: ['latin'],
  variable: '--font-heading',
})

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-display',
})

export const metadata: Metadata = {
  title: 'Jyoti.ai - Your Spiritual Operating System',
  description: 'AI-powered spiritual guidance combining astrology, palmistry, face reading, aura analysis, and more',
  keywords: ['astrology', 'palmistry', 'spiritual', 'AI', 'kundali', 'numerology'],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${marcellus.variable} ${playfair.variable} font-body antialiased`}>
        <GlobalErrorBoundary>
          <MotionProvider>
            <AudioProvider>
              <Background />
              <RouteTransitionHandler />
              <TransitionOverlay />
              <BlessingWaveOverlay />
              {children}
            </AudioProvider>
          </MotionProvider>
        </GlobalErrorBoundary>
      </body>
    </html>
  )
}

