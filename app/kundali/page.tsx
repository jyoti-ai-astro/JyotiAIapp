'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useUserStore } from '@/store/user-store'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

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
  const [loading, setLoading] = useState(true)
  const [kundali, setKundali] = useState<KundaliData | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!user) {
      router.push('/login')
      return
    }

    fetchKundali()
  }, [user, router])

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

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-display font-bold">Your Kundali</h1>
          <p className="text-muted-foreground">
            Generated on {new Date(kundali.meta.generatedAt).toLocaleDateString()}
          </p>
        </div>
        <Link href="/dashboard">
          <Button variant="outline">Back to Dashboard</Button>
        </Link>
      </div>

      {/* Lagna Details */}
      {lagna && (
        <Card>
          <CardHeader>
            <CardTitle>Lagna (Ascendant)</CardTitle>
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
      <Card>
        <CardHeader>
          <CardTitle>Grahas (Planets)</CardTitle>
          <CardDescription>Planetary positions in your birth chart</CardDescription>
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
      <Card>
        <CardHeader>
          <CardTitle>Bhavas (Houses)</CardTitle>
          <CardDescription>House cusps and planetary placements</CardDescription>
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
        <Card>
          <CardHeader>
            <CardTitle>Vimshottari Dasha</CardTitle>
            <CardDescription>Current life phase periods</CardDescription>
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
        <Card>
          <CardHeader>
            <CardTitle>Planetary Aspects</CardTitle>
            <CardDescription>Important planetary relationships</CardDescription>
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
    </div>
  )
}

