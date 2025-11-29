'use client'

export const dynamic = 'force-dynamic'

import React from 'react'
import { CosmicGuruChat } from '@/components/guru/CosmicGuruChat'
import { CosmicBackground } from '@/components/dashboard/CosmicBackground'
import { PageTransitionWrapper } from '@/components/global/PageTransitionWrapper'

export default function GuruPageSimple() {
  return (
    <PageTransitionWrapper>
      <div className="min-h-screen bg-cosmic-navy text-white relative overflow-hidden flex flex-col">
        {/* Darker background for chat focus */}
        <CosmicBackground />

        {/* Main Content Area - Fixed Height for Chat */}
        <div className="relative z-10 flex-1 flex flex-col container mx-auto px-4 py-20 lg:py-24 h-screen max-h-screen">
          <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full h-full overflow-hidden">
            {/* Header */}
            <div className="text-center space-y-2 mb-6 flex-shrink-0">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-purple-500/10 border border-purple-500/30 mb-2 animate-pulse">
                <span className="text-2xl">🧙‍♂️</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-white to-purple-400">
                AI Spiritual Guru
              </h1>
              <p className="text-sm text-white/60">Ask anything. Answers based on your Kundali & Dasha.</p>
            </div>

            {/* Chat Interface */}
            <CosmicGuruChat />
          </div>
        </div>
      </div>
    </PageTransitionWrapper>
  )
}

