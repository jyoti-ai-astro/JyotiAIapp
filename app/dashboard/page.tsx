'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useUserStore } from '@/store/user-store'
import { CosmicDashboard } from '@/components/dashboard/CosmicDashboard'
import type { AstroContext } from '@/lib/engines/astro-types'
import DashboardPageShell from '@/src/ui/layout/DashboardPageShell'
import { CreditsOverview } from '@/components/dashboard/CreditsOverview'

interface DashboardData {
  user: {
    name: string
    photo: string | null
    rashi: string | null
    nakshatra: string | null
    lagna: string | null
    lagnaDetails: any
  }
  kundali: {
    available: boolean
    generatedAt: string | null
  }
  dasha: {
    mahadasha: {
      planet: string
      startDate: string
      endDate: string
    }
    antardasha: {
      planet: string
      startDate: string
      endDate: string
    }
  } | null
  todayPrediction: {
    summary: string
    career: string
    love: string
    health: string
    remedy: string
  }
  nextTransits: Array<{
    planet: string
    event: string
    date: string
    impact: string
  }>
  profileComplete: boolean
}

export default function DashboardPage() {
  const router = useRouter()
  const { user } = useUserStore()
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<DashboardData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [horoscope, setHoroscope] = useState<any>(null)
  const [transits, setTransits] = useState<any[]>([])
  const [festival, setFestival] = useState<any>(null)
  const [unreadCount, setUnreadCount] = useState(0)
  const [astro, setAstro] = useState<AstroContext | null>(null) // Super Phase B

  useEffect(() => {
    // Check if user is logged in
    if (!user) {
      router.push('/login')
      return
    }

    // Check if user needs onboarding
    if (!user.onboarded) {
      router.push('/onboarding')
      return
    }

    // Fetch dashboard data
    fetchDashboardData()
    fetchHoroscope()
    fetchTransits()
    fetchFestival()
    fetchUnreadCount()
    fetchAstroContext() // Super Phase B
  }, [user, router])

  const fetchAstroContext = async () => {
    if (!user?.uid) return
    try {
      const response = await fetch('/api/astro/context', {
        credentials: 'include',
      })
      if (response.ok) {
        const data = await response.json()
        setAstro(data.astro)
      }
    } catch (err) {
      console.error('Error fetching astro context:', err)
    }
  }

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/dashboard/summary', {
        credentials: 'include',
      })

      if (!response.ok) {
        throw new Error('Failed to load dashboard')
      }

      const result = await response.json()
      setData(result)
    } catch (err: any) {
      console.error('Dashboard fetch error:', err)
      setError(err.message || 'Failed to load dashboard')
    } finally {
      setLoading(false)
    }
  }

  const fetchHoroscope = async () => {
    try {
      const response = await fetch('/api/horoscope/today', {
        credentials: 'include',
      })
      if (response.ok) {
        const result = await response.json()
        setHoroscope(result.horoscope)
      }
    } catch (error) {
      console.error('Fetch horoscope error:', error)
    }
  }

  const fetchTransits = async () => {
    try {
      const response = await fetch('/api/transits/upcoming', {
        credentials: 'include',
      })
      if (response.ok) {
        const result = await response.json()
        setTransits(result.transits || [])
      }
    } catch (error) {
      console.error('Fetch transits error:', error)
    }
  }

  const fetchFestival = async () => {
    try {
      const response = await fetch('/api/festival/today', {
        credentials: 'include',
      })
      if (response.ok) {
        const result = await response.json()
        if (result.festival) {
          setFestival(result)
        }
      }
    } catch (error) {
      console.error('Fetch festival error:', error)
    }
  }

  const fetchUnreadCount = async () => {
    try {
      const response = await fetch('/api/notifications/list?limit=1', {
        credentials: 'include',
      })
      if (response.ok) {
        const result = await response.json()
        setUnreadCount(result.unreadCount || 0)
      }
    } catch (error) {
      console.error('Fetch unread count error:', error)
    }
  }

  // Transform data for CosmicDashboard
  const dashboardData = data ? {
    user: {
      name: data.user.name,
      photo: data.user.photo,
      rashi: data.user.rashi || 'Unknown',
      nakshatra: data.user.nakshatra || 'Unknown',
      lagna: data.user.lagna || 'Unknown',
    },
    todayHoroscope: horoscope ? {
      rashi: horoscope.rashi,
      general: horoscope.general,
      love: horoscope.love,
      career: horoscope.career,
      money: horoscope.money,
      health: horoscope.health,
      luckyColor: horoscope.luckyColor,
      luckyNumber: horoscope.luckyNumber,
    } : null,
    quickInfo: {
      rashi: data.user.rashi || 'Unknown',
      lagna: data.user.lagna || 'Unknown',
      nakshatra: data.user.nakshatra || 'Unknown',
      dasha: data.dasha 
        ? `${data.dasha.mahadasha.planet} / ${data.dasha.antardasha.planet}`
        : 'Unknown',
    },
    transits: [
      ...transits.map((t) => ({
        planet: t.transit.planet,
        event: t.transit.event,
        date: t.transit.date,
        impact: t.transit.impact,
      })),
      ...data.nextTransits.map((t) => ({
        planet: t.planet,
        event: t.event,
        date: t.date,
        impact: t.impact,
      })),
    ],
  } : undefined;

  return (
    <DashboardPageShell
      title="Your Cosmic Dashboard"
      subtitle="All your charts, timelines, and predictions in one place."
    >
      {/* Phase M: Credits Overview */}
      <div className="mb-6">
        <CreditsOverview />
      </div>

      {/* Super Phase B - Insights Section */}
      {astro && (
        <div className="fixed top-20 right-4 z-30 max-w-sm space-y-3">
          {/* Insight 1: Next Major Dasha */}
          {astro.dasha?.currentMahadasha && (
            <div className="rounded-2xl border border-white/5 bg-white/5/10 backdrop-blur-xl p-4 shadow-[0_8px_32px_rgba(255,213,122,0.15)]">
              <h4 className="text-[#FFD57A] font-heading text-sm mb-1">Next Major Dasha</h4>
              <p className="text-white/80 text-xs">
                {astro.dasha.currentMahadasha.planet} Period
              </p>
              {astro.dasha.currentMahadasha.theme && (
                <p className="text-white/60 text-xs mt-1">{astro.dasha.currentMahadasha.theme}</p>
              )}
            </div>
          )}

          {/* Insight 2: Strongest Life Theme */}
          {astro.lifeThemes && astro.lifeThemes.length > 0 && (
            <div className="rounded-2xl border border-white/5 bg-white/5/10 backdrop-blur-xl p-4 shadow-[0_8px_32px_rgba(255,213,122,0.15)]">
              <h4 className="text-[#FFD57A] font-heading text-sm mb-1">Strongest Life Theme</h4>
              <p className="text-white/80 text-xs capitalize">{astro.lifeThemes[0].area}</p>
              <p className="text-white/60 text-xs mt-1">{astro.lifeThemes[0].summary}</p>
              <div className="mt-2 w-full bg-white/10 rounded-full h-1.5">
                <div 
                  className="bg-[#FFD57A] h-1.5 rounded-full" 
                  style={{ width: `${astro.lifeThemes[0].confidence}%` }}
                />
              </div>
            </div>
          )}

          {/* Insight 3: Warning/Watch Area */}
          {astro.riskFlags && astro.riskFlags.length > 0 && (
            <div className="rounded-2xl border border-yellow-500/20 bg-yellow-500/5 backdrop-blur-xl p-4">
              <h4 className="text-yellow-400 font-heading text-sm mb-1">Watch Area</h4>
              <p className="text-white/80 text-xs">
                Be mindful of {astro.riskFlags[0].replace('_', ' ')} this month
              </p>
            </div>
          )}
        </div>
      )}
      
      {/* Cosmic Dashboard */}
      <CosmicDashboard
        data={dashboardData}
        loading={loading}
        error={error}
        onRetry={fetchDashboardData}
      />
    </DashboardPageShell>
  )
}