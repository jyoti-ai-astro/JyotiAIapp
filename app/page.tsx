/**
 * Homepage Wrapper
 * 
 * Phase 3 — Section 16: PAGES PHASE 1 (F16)
 */

'use client';

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { GalaxySceneWrapper } from '@/components/global/GalaxySceneWrapper'
import { useGlobalProgress } from '@/hooks/use-global-progress'

export default function Home() {
  const { globalProgress } = useGlobalProgress();

  return (
    <>
      {/* Galaxy Scene Background */}
      <GalaxySceneWrapper intensity={1.0} globalFade={globalProgress} />
      
      {/* Page Content */}
      <main className="relative z-10 flex min-h-screen flex-col items-center justify-center p-24">
        <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm">
          <div className="text-center space-y-8">
            <h1 className="text-6xl font-display font-bold text-white mb-4">
              Jyoti.ai
            </h1>
            <p className="text-2xl text-white/90 mb-8">
              Your Spiritual Operating System
            </p>
            <p className="text-lg text-white/80 max-w-2xl mx-auto">
              AI-powered spiritual guidance combining ancient Indian sciences with modern technology
            </p>
            <div className="flex gap-4 justify-center mt-8">
              <Link href="/login">
                <Button size="lg" className="bg-gold text-cosmic hover:bg-gold-light">
                  Get Started
                </Button>
              </Link>
              <Link href="/about">
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                  Learn More
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}

