'use client'

export const dynamic = 'force-dynamic'

import React from 'react'
import { CosmicCalendar } from '@/components/calendar/CosmicCalendar'
import { CosmicBackground } from '@/components/dashboard/CosmicBackground'
import { PageTransitionWrapper } from '@/components/global/PageTransitionWrapper'

export default function CalendarPage() {
  return (
    <PageTransitionWrapper>
      <div className="min-h-screen bg-cosmic-navy text-white relative overflow-hidden">
        <CosmicBackground />

        <div className="relative z-10 container mx-auto px-4 py-20 lg:py-24">
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="text-center space-y-2">
              <h1 className="text-4xl md:text-5xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-gold via-white to-gold">
                Cosmic Calendar
              </h1>
              <p className="text-white/60">Plan your days aligned with the universe.</p>
            </div>

            <CosmicCalendar />
          </div>
        </div>
      </div>
    </PageTransitionWrapper>
  )
}

