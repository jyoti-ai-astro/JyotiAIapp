'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useUserStore } from '@/store/user-store'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

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
  }, [user, router])

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

  if (!user || !user.onboarded) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center space-y-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-mystic border-t-transparent mx-auto"></div>
          <p className="text-muted-foreground">Loading your spiritual profile...</p>
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-destructive">{error || 'Failed to load dashboard'}</p>
          <Button onClick={fetchDashboardData}>Retry</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Welcome Banner */}
      {data.kundali.available && (
        <Card className="border-gold bg-gradient-to-r from-gold/10 to-mystic/10">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-3">
              <div className="text-2xl">✨</div>
              <div>
                <p className="font-semibold text-gold">Your Kundali is ready!</p>
                <p className="text-sm text-muted-foreground">
                  Explore your complete astrological profile below.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Festival Banner */}
      {festival && festival.festival && (
        <Card className="border-gold bg-gradient-to-r from-gold/20 to-mystic/20">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-3">
              <div className="text-3xl">🎉</div>
              <div className="flex-1">
                <p className="font-semibold text-gold text-lg">{festival.festival.name}</p>
                <p className="text-sm text-muted-foreground">{festival.festival.description}</p>
                {festival.dashaSensitive && (
                  <p className="text-xs text-mystic mt-1">
                    ⚠️ Your current Dasha ({festival.currentDasha}) is sensitive to this festival
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* User Profile Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {data.user.photo && (
              <img
                src={data.user.photo}
                alt={data.user.name}
                className="h-16 w-16 rounded-full"
              />
            )}
            <div>
              <CardTitle className="text-3xl font-display">Welcome, {data.user.name}</CardTitle>
              <CardDescription>
                {data.user.rashi && (
                  <span>
                    {data.user.rashi} • {data.user.nakshatra}
                    {data.user.lagna && ` • Lagna: ${data.user.lagna}`}
                  </span>
                )}
              </CardDescription>
            </div>
          </div>
          <Link href="/notifications">
            <Button variant="outline" className="relative">
              🔔 Notifications
              {unreadCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-destructive text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </Button>
          </Link>
        </div>
        </CardHeader>
      </Card>

      {/* Today's Horoscope */}
      {horoscope && (
        <Card>
          <CardHeader>
            <CardTitle>🌟 Today's Horoscope</CardTitle>
            <CardDescription>Your daily spiritual guidance for {horoscope.rashi}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium mb-1">General</p>
              <p className="text-sm text-muted-foreground">{horoscope.general}</p>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <p className="text-sm font-medium">💕 Love</p>
                <p className="text-sm text-muted-foreground">{horoscope.love}</p>
              </div>
              <div>
                <p className="text-sm font-medium">💼 Career</p>
                <p className="text-sm text-muted-foreground">{horoscope.career}</p>
              </div>
              <div>
                <p className="text-sm font-medium">💰 Money</p>
                <p className="text-sm text-muted-foreground">{horoscope.money}</p>
              </div>
              <div>
                <p className="text-sm font-medium">🏥 Health</p>
                <p className="text-sm text-muted-foreground">{horoscope.health}</p>
              </div>
            </div>
            <div className="flex gap-4 pt-2 border-t">
              <div>
                <p className="text-xs font-medium">Lucky Color</p>
                <p className="text-sm font-semibold text-mystic">{horoscope.luckyColor}</p>
              </div>
              <div>
                <p className="text-xs font-medium">Lucky Number</p>
                <p className="text-sm font-semibold text-mystic">{horoscope.luckyNumber}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Transit Alerts */}
      {transits.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>🔮 Upcoming Transits</CardTitle>
            <CardDescription>Important planetary movements affecting you</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {transits.slice(0, 3).map((userTransit, index) => (
                <div key={index} className="border-b pb-3 last:border-0">
                  <div className="flex items-center justify-between mb-1">
                    <p className="font-medium">{userTransit.transit.planet} - {userTransit.transit.event}</p>
                    <span className={`text-xs px-2 py-1 rounded ${
                      userTransit.transit.impact === 'strong' ? 'bg-destructive/10 text-destructive' :
                      userTransit.transit.impact === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-muted text-muted-foreground'
                    }`}>
                      {userTransit.transit.impact}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-1">{userTransit.transit.description}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(userTransit.transit.date).toLocaleDateString()} • {userTransit.personalImpact}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Dasha Summary */}
      {data.dasha && (
        <Card>
          <CardHeader>
            <CardTitle>Current Dasha Period</CardTitle>
            <CardDescription>Your life phase timeline</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium">Mahadasha</p>
              <p className="text-lg font-semibold text-mystic">
                {data.dasha.mahadasha.planet}
              </p>
              <p className="text-xs text-muted-foreground">
                {new Date(data.dasha.mahadasha.startDate).toLocaleDateString()} -{' '}
                {new Date(data.dasha.mahadasha.endDate).toLocaleDateString()}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium">Antar Dasha</p>
              <p className="text-lg font-semibold">
                {data.dasha.antardasha.planet}
              </p>
              <p className="text-xs text-muted-foreground">
                {new Date(data.dasha.antardasha.startDate).toLocaleDateString()} -{' '}
                {new Date(data.dasha.antardasha.endDate).toLocaleDateString()}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Explore your spiritual profile</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Link href="/kundali">
              <Button variant="outline" className="w-full">
                View Full Kundali
              </Button>
            </Link>
            <Button variant="outline" className="w-full" disabled>
              Generate Premium Report
            </Button>
            <Link href="/numerology">
              <Button variant="outline" className="w-full">
                Numerology
              </Button>
            </Link>
            <Link href="/palmistry">
              <Button variant="outline" className="w-full">
                Palmistry
              </Button>
            </Link>
            <Link href="/aura">
              <Button variant="outline" className="w-full">
                Aura Scan
              </Button>
            </Link>
            <Link href="/guru">
              <Button variant="outline" className="w-full">
                AI Guru
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Upcoming Transits */}
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Planetary Transits</CardTitle>
          <CardDescription>Next 5 important events</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {data.nextTransits.map((transit, index) => (
              <div key={index} className="flex items-center justify-between border-b pb-3 last:border-0">
                <div>
                  <p className="font-medium">{transit.planet}</p>
                  <p className="text-sm text-muted-foreground">{transit.event}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm">{new Date(transit.date).toLocaleDateString()}</p>
                  <p className="text-xs text-muted-foreground">{transit.impact}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
