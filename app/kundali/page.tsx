'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useUserStore } from '@/store/user-store'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Download, RefreshCw } from 'lucide-react'
import { KundaliWheel3D } from '@/components/organisms/kundali-wheel-3d'
import { OneTimeOfferBanner } from '@/components/paywall/OneTimeOfferBanner'
import { useTicketAccess } from '@/lib/access/useTicketAccess'
import { checkFeatureAccess } from '@/lib/access/checkFeatureAccess'
import { decrementTicket } from '@/lib/access/ticket-access'
import Link from 'next/link'
import type { AstroContext } from '@/lib/engines/astro-types'
import DashboardPageShell from '@/src/ui/layout/DashboardPageShell'

interface KundaliData {
  meta: {
    birthDetails: any
    generatedAt: string
    chartType: string
    houseSystem: string
  }
  D1: {
    chartType: string
    grahas: Record<string, any>
    bhavas: Record<string, any>
    lagna: any
    aspects: Array<{
      fromPlanet: string
      toPlanet: string
      angle: number
      type: string
    }>
  }
  dasha: {
    currentMahadasha: any
    currentAntardasha: any
    currentPratyantardasha: any
  }
}

export default function KundaliPage() {
  const router = useRouter()
  const { user } = useUserStore()
  const { hasAccess, hasSubscription, tickets, loading: ticketLoading } = useTicketAccess('kundali')
  const [loading, setLoading] = useState(true)
  const [kundali, setKundali] = useState<KundaliData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [astro, setAstro] = useState<AstroContext | null>(null)
  
  // Mega Build 3 - Download report state
  const [downloadingReport, setDownloadingReport] = useState(false)

  useEffect(() => {
    if (!user) {
      router.push('/login')
      return
    }

    fetchKundali()
    fetchAstroContext()
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

  const fetchKundali = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/kundali/get', {
        credentials: 'include',
      })

      if (!response.ok) {
        if (response.status === 404) {
          setError('Kundali not found. Please complete onboarding first.')
          return
        }
        throw new Error('Failed to load kundali')
      }

      const result = await response.json()
      setKundali(result.kundali)
    } catch (err: any) {
      console.error('Kundali fetch error:', err)
      setError(err.message || 'Failed to load kundali')
    } finally {
      setLoading(false)
    }
  }

  // Mega Build 3 - Download PDF Report
  const handleDownloadReport = async () => {
    if (!user) return

    // Check feature access
    const accessCheck = await checkFeatureAccess(user, 'kundali')
    if (!accessCheck.allowed) {
      if (accessCheck.redirectTo) {
        router.push(accessCheck.redirectTo)
      }
      return
    }

    setDownloadingReport(true)

    try {
      const response = await fetch('/api/report/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          type: 'kundali',
          sendEmail: false,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || 'Failed to generate report')
      }

      // Download PDF
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `Kundali-Report-${new Date().toISOString().split('T')[0]}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      // Decrement ticket if needed
      if (accessCheck.decrementTicket) {
        await decrementTicket(user.uid, 'kundali_basic')
      }
    } catch (err: any) {
      console.error('Error downloading report:', err)
      alert(err.message || 'Failed to download report. Please try again.')
    } finally {
      setDownloadingReport(false)
    }
  }

  // Phase L: Check ticket access
  if (ticketLoading) {
    return (
      <DashboardPageShell title="Your Birth Chart" subtitle="Loading...">
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold"></div>
        </div>
      </DashboardPageShell>
    )
  }

  if (!hasAccess) {
    return (
      <DashboardPageShell title="Your Birth Chart" subtitle="Unlock your cosmic blueprint">
        <OneTimeOfferBanner feature="Kundali Reading" productId="199" />
      </DashboardPageShell>
    )
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center space-y-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-mystic border-t-transparent mx-auto"></div>
          <p className="text-muted-foreground">Loading your kundali...</p>
        </div>
      </div>
    )
  }

  if (error || !kundali) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="pt-6 text-center space-y-4">
            <p className="text-destructive">{error || 'Kundali not found'}</p>
            <div className="flex gap-4 justify-center">
              <Button onClick={fetchKundali}>Retry</Button>
              <Link href="/onboarding">
                <Button variant="outline">Complete Onboarding</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const grahas = kundali.D1?.grahas || {}
  const bhavas = kundali.D1?.bhavas || {}
  const lagna = kundali.D1?.lagna

  // Transform grahas to 3D wheel format
  const grahaPositions = Object.entries(grahas).map(([planetName, graha]: [string, any]) => ({
    planet: graha.planet || planetName,
    degrees: graha.degreesInSign || 0,
    sign: graha.sign,
    house: graha.house || 0,
    longitude: graha.longitude || 0,
    latitude: graha.latitude || 0,
  }));

  const lagnaDegrees = lagna?.longitude || 0;
  const [hoveredPlanet, setHoveredPlanet] = useState<string | null>(null);

  return (
    <DashboardPageShell
      title="Your Kundali"
      subtitle="Complete birth chart with planetary positions, houses, and aspects"
    >
      <div className="space-y-6">
        {/* Context Panel */}
        <div className="mb-8">
          <OneTimeOfferBanner
            title="Unlock Full Insights"
            description="This module uses your birth chart & predictions powered by Guru Brain."
            priceLabel="₹199"
            ctaLabel="Unlock Now"
            ctaHref="/pay/199"
          />
        </div>

        {/* Astro Summary Block */}
        {astro && (
          <div className="glass-card p-6 mb-10 rounded-2xl border border-gold/20">
            <h3 className="text-gold font-heading text-xl mb-2">Astro Summary</h3>
            <p className="text-white/80 text-sm">Sun Sign: {astro.coreChart?.sunSign || 'N/A'}</p>
            <p className="text-white/80 text-sm">Moon Sign: {astro.coreChart?.moonSign || 'N/A'}</p>
            <p className="text-white/80 text-sm">Ascendant: {astro.coreChart?.ascendantSign || 'N/A'}</p>
            <p className="text-white/80 text-sm mt-4">Next Major Dasha: {astro.dasha?.currentMahadasha?.planet || 'N/A'}</p>
          </div>
        )}

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-display font-bold text-cosmic-gold">Your Kundali</h1>
          <p className="text-aura-cyan">
            Generated on {new Date(kundali.meta.generatedAt).toLocaleDateString()}
          </p>
        </div>
        <Link href="/dashboard">
          <Button className="cosmic-button border-aura-cyan/30 text-aura-cyan hover:bg-aura-cyan/10">
            Back to Dashboard
          </Button>
        </Link>
      </div>

      {/* 3D Kundali Wheel */}
      {grahaPositions.length > 0 && (
        <div className="mb-8">
          <KundaliWheel3D
            grahas={grahaPositions}
            lagna={lagnaDegrees}
            onPlanetHover={setHoveredPlanet}
            className="h-[600px]"
          />
          {hoveredPlanet && (
            <div className="mt-4 text-center">
              <p className="text-aura-cyan">Hovering: {hoveredPlanet}</p>
            </div>
          )}
        </div>
      )}

      {/* Lagna Details */}
      {lagna && (
        <Card className="cosmic-card border-aura-blue/30 bg-cosmic-indigo/10">
          <CardHeader>
            <CardTitle className="text-cosmic-gold">Lagna (Ascendant)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <p className="text-sm font-medium">Sign</p>
                <p className="text-lg font-semibold text-mystic">{lagna.sign}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Nakshatra</p>
                <p className="text-lg font-semibold">{lagna.nakshatra}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Pada</p>
                <p className="text-lg font-semibold">{lagna.pada}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Longitude</p>
                <p className="text-sm">{lagna.longitude.toFixed(2)}°</p>
              </div>
              <div>
                <p className="text-sm font-medium">Degrees in Sign</p>
                <p className="text-sm">{lagna.degreesInSign.toFixed(2)}°</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Grahas (Planets) Table */}
      <Card className="cosmic-card border-aura-violet/30 bg-cosmic-indigo/10">
        <CardHeader>
          <CardTitle className="text-aura-violet">Grahas (Planets)</CardTitle>
          <CardDescription className="text-aura-cyan">Planetary positions in your birth chart</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Planet</th>
                  <th className="text-left p-2">Sign</th>
                  <th className="text-left p-2">Nakshatra</th>
                  <th className="text-left p-2">Pada</th>
                  <th className="text-left p-2">House</th>
                  <th className="text-left p-2">Longitude</th>
                  <th className="text-left p-2">Retrograde</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(grahas).map(([planetName, graha]: [string, any]) => (
                  <tr key={planetName} className="border-b">
                    <td className="p-2 font-medium">{graha.planet}</td>
                    <td className="p-2">{graha.sign}</td>
                    <td className="p-2">{graha.nakshatra}</td>
                    <td className="p-2">{graha.pada}</td>
                    <td className="p-2">{graha.house || '-'}</td>
                    <td className="p-2">{graha.longitude.toFixed(2)}°</td>
                    <td className="p-2">
                      {graha.retrograde ? (
                        <span className="text-destructive">Yes</span>
                      ) : (
                        <span className="text-muted-foreground">No</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Bhavas (Houses) Table */}
      <Card className="cosmic-card border-aura-green/30 bg-cosmic-indigo/10">
        <CardHeader>
          <CardTitle className="text-aura-green">Bhavas (Houses)</CardTitle>
          <CardDescription className="text-aura-cyan">House cusps and planetary placements</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {Object.values(bhavas)
              .sort((a: any, b: any) => a.houseNumber - b.houseNumber)
              .map((bhava: any) => (
                <div key={bhava.houseNumber} className="rounded-lg border p-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-semibold">House {bhava.houseNumber}</p>
                    <p className="text-sm text-mystic">{bhava.sign}</p>
                  </div>
                  <p className="text-xs text-muted-foreground mb-2">
                    Cusp: {bhava.cuspLongitude.toFixed(2)}°
                  </p>
                  {bhava.planets && bhava.planets.length > 0 && (
                    <div>
                      <p className="text-xs font-medium mb-1">Planets:</p>
                      <p className="text-xs text-muted-foreground">
                        {bhava.planets.join(', ')}
                      </p>
                    </div>
                  )}
                </div>
              ))}
          </div>
        </CardContent>
      </Card>

      {/* Dasha Summary */}
      {kundali.dasha && (
        <Card className="cosmic-card border-aura-orange/30 bg-cosmic-indigo/10">
          <CardHeader>
            <CardTitle className="text-aura-orange">Vimshottari Dasha</CardTitle>
            <CardDescription className="text-aura-cyan">Current life phase periods</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium">Current Mahadasha</p>
              <p className="text-xl font-semibold text-mystic">
                {kundali.dasha.currentMahadasha?.planet}
              </p>
              <p className="text-xs text-muted-foreground">
                {kundali.dasha.currentMahadasha?.startDate &&
                  new Date(kundali.dasha.currentMahadasha.startDate).toLocaleDateString()}{' '}
                -{' '}
                {kundali.dasha.currentMahadasha?.endDate &&
                  new Date(kundali.dasha.currentMahadasha.endDate).toLocaleDateString()}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium">Current Antar Dasha</p>
              <p className="text-lg font-semibold">
                {kundali.dasha.currentAntardasha?.planet}
              </p>
              <p className="text-xs text-muted-foreground">
                {kundali.dasha.currentAntardasha?.startDate &&
                  new Date(kundali.dasha.currentAntardasha.startDate).toLocaleDateString()}{' '}
                -{' '}
                {kundali.dasha.currentAntardasha?.endDate &&
                  new Date(kundali.dasha.currentAntardasha.endDate).toLocaleDateString()}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium">Current Pratyantar Dasha</p>
              <p className="text-lg">
                {kundali.dasha.currentPratyantardasha?.planet}
              </p>
              <p className="text-xs text-muted-foreground">
                {kundali.dasha.currentPratyantardasha?.startDate &&
                  new Date(kundali.dasha.currentPratyantardasha.startDate).toLocaleDateString()}{' '}
                -{' '}
                {kundali.dasha.currentPratyantardasha?.endDate &&
                  new Date(kundali.dasha.currentPratyantardasha.endDate).toLocaleDateString()}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Aspects */}
      {kundali.D1?.aspects && kundali.D1.aspects.length > 0 && (
        <Card className="cosmic-card border-aura-red/30 bg-cosmic-indigo/10">
          <CardHeader>
            <CardTitle className="text-aura-red">Planetary Aspects</CardTitle>
            <CardDescription className="text-aura-cyan">Important planetary relationships</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {kundali.D1.aspects.map((aspect, index) => (
                <div key={index} className="flex items-center justify-between border-b pb-2">
                  <div>
                    <p className="text-sm font-medium">
                      {aspect.fromPlanet} → {aspect.toPlanet}
                    </p>
                    <p className="text-xs text-muted-foreground">{aspect.type}</p>
                  </div>
                  <p className="text-sm">{aspect.angle.toFixed(2)}°</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Mega Build 3 - Download Report Section */}
      <Card className="cosmic-card border-gold/30 bg-cosmic-indigo/10 mt-8">
        <CardHeader>
          <CardTitle className="text-gold">Download Full PDF Report</CardTitle>
          <CardDescription className="text-aura-cyan">
            Get a comprehensive Kundali report as a PDF document
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            onClick={handleDownloadReport}
            disabled={downloadingReport}
            className="w-full bg-gold/20 border border-gold/50 text-gold hover:bg-gold/30"
          >
            {downloadingReport ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Generating PDF...
              </>
            ) : (
              <>
                <Download className="h-4 w-4 mr-2" />
                Download Kundali PDF
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Ask Guru With Context Button */}
      {astro && (
        <div className="mt-8 text-center">
          <Button
            onClick={() => router.push(`/guru?context=${encodeURIComponent(JSON.stringify(astro))}`)}
            className="gold-btn"
          >
            Ask Guru With My Birth Context
          </Button>
        </div>
      )}
      </div>
    </DashboardPageShell>
  )
}

