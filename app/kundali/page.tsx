'use client'

export const dynamic = 'force-dynamic'

import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  ArrowRight,
  CalendarDays,
  Download,
  Eye,
  FileText,
  RefreshCw,
  Sparkles,
  TriangleAlert,
} from 'lucide-react'
import DashboardPageShell from '@/src/ui/layout/DashboardPageShell'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { EmptyState, ErrorState, LoadingState, RetryButton } from '@/components/ui/feedback-state'
import { KundaliChart2D, type KundaliBhava, type KundaliGraha } from '@/components/charts/kundali-chart'
import { KundaliWheel3D } from '@/components/organisms/kundali-wheel-3d'
import { OneTimeOfferBanner } from '@/components/paywall/OneTimeOfferBanner'
import { useTicketAccess } from '@/lib/access/useTicketAccess'
import { useUserStore } from '@/store/user-store'

type DashaPeriod = {
  planet?: string | null
  startDate?: string | null
  endDate?: string | null
}

type KundaliData = {
  meta?: {
    birthDetails?: any
    generatedAt?: string | null
    chartType?: string | null
    houseSystem?: string | null
    generationKind?: string | null
    source?: string | null
    stale?: boolean
    staleReason?: string | null
    staleAt?: string | null
  }
  D1?: {
    chartType?: string
    grahas?: Record<string, KundaliGraha>
    bhavas?: Record<string, KundaliBhava>
    lagna?: KundaliGraha & { sign?: string; longitude?: number }
    aspects?: Array<{
      fromPlanet?: string
      toPlanet?: string
      angle?: number
      type?: string
    }>
  } | null
  dasha?: {
    currentMahadasha?: DashaPeriod
    currentAntardasha?: DashaPeriod
    currentPratyantardasha?: DashaPeriod
  } | null
}

function formatDate(value?: string | null) {
  if (!value) return 'Not available'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Not available'
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date)
}

function formatDegree(value?: number) {
  return typeof value === 'number' && Number.isFinite(value) ? `${value.toFixed(2)}°` : 'Not available'
}

function firstValue(...values: Array<string | null | undefined>) {
  return values.find((value) => value && value !== 'Unknown') || null
}

function getPlanetsByHouse(grahas: Record<string, KundaliGraha>, houseNumber?: number) {
  if (!houseNumber) return []
  return Object.values(grahas).filter((graha) => Number(graha.house) === houseNumber)
}

export default function KundaliPage() {
  const router = useRouter()
  const { user } = useUserStore()
  const {
    hasAccess,
    hasSubscription,
    tickets,
    loading: ticketLoading,
  } = useTicketAccess('kundali')

  const [loading, setLoading] = useState(true)
  const [kundali, setKundali] = useState<KundaliData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [generating, setGenerating] = useState(false)
  const [generationError, setGenerationError] = useState<string | null>(null)
  const [reporting, setReporting] = useState(false)
  const [reportError, setReportError] = useState<string | null>(null)
  const [show3D, setShow3D] = useState(false)
  const [hoveredPlanet, setHoveredPlanet] = useState<string | null>(null)

  const fetchKundali = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch('/api/kundali/get', { credentials: 'include' })
      const data = await response.json().catch(() => ({}))

      if (response.status === 404) {
        setKundali(null)
        setError(null)
        return
      }

      if (!response.ok) {
        throw new Error(data.error || data.message || 'Failed to load Kundali')
      }

      setKundali(data.kundali)
    } catch (err: any) {
      setError(err?.message || 'Failed to load Kundali')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!user) {
      router.push('/login')
      return
    }

    void fetchKundali()
  }, [fetchKundali, router, user])

  const birthProfileMissing =
    !user?.dob || !user?.tob || !user?.pob || user?.lat == null || user?.lng == null
  const grahas = kundali?.D1?.grahas || {}
  const bhavas = kundali?.D1?.bhavas || {}
  const lagna = kundali?.D1?.lagna
  const dasha = kundali?.dasha
  const isStale = kundali?.meta?.stale === true || user?.derivedAstrologyStatus === 'stale'
  const hasDasha = Boolean(dasha?.currentMahadasha || dasha?.currentAntardasha)

  const identity = useMemo(
    () => ({
      lagna: firstValue(lagna?.sign, user?.ascendant),
      rashi: firstValue(user?.rashiMoon, user?.rashi, grahas.Moon?.sign, grahas.Chandra?.sign),
      nakshatra: firstValue(user?.nakshatra, grahas.Moon?.nakshatra, grahas.Chandra?.nakshatra, lagna?.nakshatra),
      mahadasha: dasha?.currentMahadasha?.planet || null,
      antardasha: dasha?.currentAntardasha?.planet || null,
      birthPlace: user?.pob || kundali?.meta?.birthDetails?.pob || null,
    }),
    [dasha, grahas, kundali?.meta?.birthDetails?.pob, lagna, user]
  )

  const grahaPositions = Object.entries(grahas).map(([planetName, graha]) => ({
    planet: graha.planet || planetName,
    degrees: graha.degreesInSign || 0,
    sign: graha.sign || 'Unknown',
    house: graha.house || 0,
    longitude: graha.longitude || 0,
    latitude: 0,
  }))

  const handleGenerate = async () => {
    if (!hasAccess) {
      setGenerationError('Kundali credits or an active plan are required to regenerate this chart.')
      return
    }

    try {
      setGenerating(true)
      setGenerationError(null)
      const response = await fetch('/api/kundali/generate-full', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({}),
      })
      const data = await response.json().catch(() => ({}))

      if (!response.ok) {
        throw new Error(data.message || data.error || 'Kundali generation failed')
      }

      await fetchKundali()
      setShow3D(false)
    } catch (err: any) {
      setGenerationError(err?.message || 'Kundali generation failed')
    } finally {
      setGenerating(false)
    }
  }

  const handleGenerateReport = async () => {
    try {
      setReporting(true)
      setReportError(null)
      const response = await fetch('/api/reports/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ type: 'kundali', sendEmail: false }),
      })
      const data = await response.json().catch(() => ({}))

      if (!response.ok) {
        throw new Error(data.error || data.message || 'Failed to generate report')
      }

      const reportId = data.report?.reportId || data.reportId
      router.push(reportId ? `/reports/${reportId}` : '/reports')
    } catch (err: any) {
      setReportError(err?.message || 'Failed to generate report')
    } finally {
      setReporting(false)
    }
  }

  if (!user) return null

  if (loading || ticketLoading) {
    return (
      <DashboardPageShell title="Your Vedic Birth Chart" subtitle="Preparing your Kundali view.">
        <Card>
          <LoadingState title="Loading Kundali" description="Reading your saved birth chart." />
        </Card>
      </DashboardPageShell>
    )
  }

  if (error) {
    return (
      <DashboardPageShell title="Your Vedic Birth Chart" subtitle="A clear view of your saved chart.">
        <Card>
          <ErrorState
            title="Kundali unavailable"
            description={error}
            action={<RetryButton onClick={fetchKundali} />}
          />
        </Card>
      </DashboardPageShell>
    )
  }

  const missingKundali = !kundali

  return (
    <DashboardPageShell
      title="Your Vedic Birth Chart"
      subtitle="A clear view of your Lagna, Moon sign, Nakshatra, current Dasha, and planetary placements."
    >
      <div className="space-y-6">
        <Card className="border-jyoti-gold/35 bg-jyoti-gold/10">
          <CardContent className="grid gap-6 pt-6 lg:grid-cols-[1fr_0.85fr] lg:items-center">
            <div>
              <Badge variant="premium">Your birth chart</Badge>
              <h1 className="mt-4 font-heading text-4xl font-semibold leading-tight text-primary md:text-5xl">
                Your Vedic Birth Chart
              </h1>
              <p className="mt-4 max-w-3xl text-base leading-7 text-muted-foreground">
                A clear view of your Lagna, Moon sign, Nakshatra, current Dasha, and planetary placements.
              </p>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                {missingKundali ? (
                  <PrimaryKundaliAction
                    birthProfileMissing={birthProfileMissing}
                    hasAccess={hasAccess}
                    generating={generating}
                    onGenerate={handleGenerate}
                  />
                ) : isStale ? (
                  <PrimaryKundaliAction
                    birthProfileMissing={birthProfileMissing}
                    hasAccess={hasAccess}
                    generating={generating}
                    onGenerate={handleGenerate}
                    stale
                  />
                ) : (
                  <Link href="/guru?prompt=What%20does%20my%20current%20Dasha%20mean%3F&source=kundali">
                    <Button iconRight={<ArrowRight className="h-4 w-4" />}>Ask Guru about my Kundali</Button>
                  </Link>
                )}
                {!missingKundali && (
                  <Button
                    variant="outline"
                    onClick={handleGenerateReport}
                    disabled={reporting}
                    iconLeft={reporting ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                  >
                    {reporting ? 'Creating report' : 'Generate report'}
                  </Button>
                )}
              </div>
              {(generationError || reportError) && (
                <p className="mt-4 text-sm text-danger">{generationError || reportError}</p>
              )}
            </div>
            <div className="rounded-xl border border-border bg-card p-5">
              <p className="text-sm font-semibold text-primary">Chart status</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Badge variant={missingKundali ? 'warning' : isStale ? 'warning' : 'success'}>
                  {missingKundali ? 'Not generated' : isStale ? 'Stale' : 'Current'}
                </Badge>
                {kundali?.meta?.generatedAt && (
                  <Badge variant="outline">Generated {formatDate(kundali.meta.generatedAt)}</Badge>
                )}
                {hasSubscription ? (
                  <Badge variant="success">Included in your plan</Badge>
                ) : (
                  <Badge variant="secondary">{tickets.kundaliTickets || 0} Kundali credits</Badge>
                )}
              </div>
              {isStale && (
                <p className="mt-4 text-sm leading-6 text-muted-foreground">
                  Your birth details changed. This saved chart is preserved, but JyotiAI will not present it as current
                  until it is regenerated.
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {birthProfileMissing && missingKundali && (
          <Card>
            <EmptyState
              title="Complete your birth profile"
              description="Birth date, time, place, latitude, and longitude are required before JyotiAI can generate your Kundali."
              action={
                <Link href="/profile">
                  <Button>Complete birth profile</Button>
                </Link>
              }
            />
          </Card>
        )}

        {!birthProfileMissing && missingKundali && (
          <Card>
            <EmptyState
              title="Generate your Kundali"
              description="Create the canonical chart used by Dashboard, Guru, Timeline, and reports."
              action={
                hasAccess ? (
                  <Button onClick={handleGenerate} disabled={generating} iconLeft={generating ? <RefreshCw className="h-4 w-4 animate-spin" /> : undefined}>
                    {generating ? 'Generating' : 'Generate my Kundali'}
                  </Button>
                ) : (
                  <Link href="/pricing">
                    <Button>Get Kundali access</Button>
                  </Link>
                )
              }
            />
          </Card>
        )}

        {isStale && kundali && (
          <Card className="border-warning/30 bg-warning/10">
            <CardContent className="flex flex-col gap-4 pt-6 md:flex-row md:items-start md:justify-between">
              <div className="flex gap-3">
                <TriangleAlert className="mt-1 h-5 w-5 shrink-0 text-warning" aria-hidden="true" />
                <div>
                  <h2 className="font-heading text-xl font-semibold text-primary">This Kundali is outdated</h2>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    {kundali.meta?.staleReason || 'Your birth profile changed after this chart was generated.'}
                  </p>
                  {kundali.meta?.staleAt && (
                    <p className="mt-1 text-xs text-muted-foreground">Marked stale {formatDate(kundali.meta.staleAt)}.</p>
                  )}
                </div>
              </div>
              {hasAccess ? (
                <Button onClick={handleGenerate} disabled={generating} iconLeft={<RefreshCw className={generating ? 'h-4 w-4 animate-spin' : 'h-4 w-4'} />}>
                  {generating ? 'Regenerating' : 'Regenerate Kundali'}
                </Button>
              ) : (
                <Link href="/pricing">
                  <Button>Get Kundali access</Button>
                </Link>
              )}
            </CardContent>
          </Card>
        )}

        {kundali && (
          <>
            {!isStale && (
              <VedicIdentity identity={identity} />
            )}

            <KundaliChart2D
              grahas={grahas}
              bhavas={bhavas}
              lagnaSign={identity.lagna}
              stale={isStale}
            />

            {!isStale && hasDasha && <DashaCard dasha={dasha} />}

            {!isStale && (
              <div className="grid gap-6 lg:grid-cols-2">
                <PlanetSummary grahas={grahas} />
                <HouseSummary grahas={grahas} bhavas={bhavas} />
              </div>
            )}

            <Card>
              <CardHeader>
                <CardTitle>Actions</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                {!isStale && (
                  <Link href="/guru?prompt=What%20does%20my%20current%20Dasha%20mean%3F&source=kundali">
                    <Button iconLeft={<Sparkles className="h-4 w-4" />}>Ask Guru about my Kundali</Button>
                  </Link>
                )}
                <Link href="/dasha">
                  <Button variant="outline" iconLeft={<CalendarDays className="h-4 w-4" />}>View Dasha</Button>
                </Link>
                <Button
                  variant="outline"
                  onClick={handleGenerateReport}
                  disabled={reporting}
                  iconLeft={<FileText className="h-4 w-4" />}
                >
                  {reporting ? 'Creating report' : 'Generate report'}
                </Button>
                <Button variant="ghost" onClick={() => setShow3D((value) => !value)} iconLeft={<Eye className="h-4 w-4" />}>
                  {show3D ? 'Hide 3D chart' : 'View 3D chart'}
                </Button>
              </CardContent>
            </Card>

            <AdvancedDetails kundali={kundali} />

            {show3D && grahaPositions.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Optional 3D view</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    This WebGL view loads only after you request it.
                  </p>
                </CardHeader>
                <CardContent>
                  <KundaliWheel3D
                    grahas={grahaPositions}
                    lagna={lagna?.longitude || 0}
                    onPlanetHover={setHoveredPlanet}
                    className="h-[560px]"
                  />
                  {hoveredPlanet && (
                    <p className="mt-3 text-center text-sm text-muted-foreground">Hovering: {hoveredPlanet}</p>
                  )}
                </CardContent>
              </Card>
            )}
          </>
        )}

        {!hasAccess && !missingKundali && (
          <OneTimeOfferBanner
            title="Need a fresh Kundali?"
            description="Regeneration uses Kundali credits or an active plan."
            priceLabel="₹199"
            ctaLabel="Get Kundali access"
            ctaHref="/pay/199"
          />
        )}
      </div>
    </DashboardPageShell>
  )
}

function PrimaryKundaliAction({
  birthProfileMissing,
  hasAccess,
  generating,
  onGenerate,
  stale,
}: {
  birthProfileMissing: boolean
  hasAccess: boolean
  generating: boolean
  onGenerate: () => void
  stale?: boolean
}) {
  if (birthProfileMissing) {
    return (
      <Link href="/profile">
        <Button>Complete birth profile</Button>
      </Link>
    )
  }

  if (!hasAccess) {
    return (
      <Link href="/pricing">
        <Button>{stale ? 'Get regeneration access' : 'Get Kundali access'}</Button>
      </Link>
    )
  }

  return (
    <Button
      onClick={onGenerate}
      disabled={generating}
      iconLeft={generating ? <RefreshCw className="h-4 w-4 animate-spin" /> : undefined}
    >
      {generating ? 'Generating' : stale ? 'Regenerate Kundali' : 'Generate my Kundali'}
    </Button>
  )
}

function VedicIdentity({ identity }: { identity: Record<string, string | null> }) {
  const items = [
    ['Lagna', identity.lagna, 'Your ascendant, used as the starting point for house placement.'],
    ['Rashi / Moon sign', identity.rashi, 'The Moon sign available from your saved chart/profile.'],
    ['Nakshatra', identity.nakshatra, 'The lunar mansion available from your saved Kundali data.'],
    ['Mahadasha', identity.mahadasha, 'The major life-period currently active.'],
    ['Antardasha', identity.antardasha, 'The sub-period currently active.'],
    ['Birth place', identity.birthPlace, 'The location saved in your birth profile.'],
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Vedic identity</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {items.map(([label, value, description]) => (
          <div key={label} className="rounded-lg border border-border bg-secondary/40 p-4">
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="mt-1 font-heading text-2xl font-semibold text-primary">{value || 'Not available'}</p>
            <p className="mt-2 text-xs leading-5 text-muted-foreground">{description}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

function DashaCard({ dasha }: { dasha: KundaliData['dasha'] }) {
  const mahadasha = dasha?.currentMahadasha
  const antardasha = dasha?.currentAntardasha
  const pratyantardasha = dasha?.currentPratyantardasha

  return (
    <Card id="dasha">
      <CardHeader>
        <CardTitle>Current Dasha</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <p className="text-base leading-7 text-primary">
          You are currently in the {mahadasha?.planet || 'available'} Mahadasha
          {antardasha?.planet ? `, with ${antardasha.planet} Antardasha active.` : '.'}
        </p>
        <div className="grid gap-4 md:grid-cols-3">
          <DashaPeriodCard label="Mahadasha" period={mahadasha} />
          <DashaPeriodCard label="Antardasha" period={antardasha} />
          <DashaPeriodCard label="Pratyantardasha" period={pratyantardasha} />
        </div>
      </CardContent>
    </Card>
  )
}

function DashaPeriodCard({ label, period }: { label: string; period?: DashaPeriod }) {
  return (
    <div className="rounded-lg border border-border bg-surface-raised p-4">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-1 font-heading text-xl font-semibold text-primary">{period?.planet || 'Not available'}</p>
      <p className="mt-2 text-xs text-muted-foreground">
        {formatDate(period?.startDate)} - {formatDate(period?.endDate)}
      </p>
    </div>
  )
}

function PlanetSummary({ grahas }: { grahas: Record<string, KundaliGraha> }) {
  const planets = Object.entries(grahas)
  return (
    <Card>
      <CardHeader>
        <CardTitle>Planet summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {planets.length === 0 ? (
          <p className="text-sm text-muted-foreground">Planetary placement data is unavailable.</p>
        ) : (
          planets.map(([key, graha]) => (
            <div key={key} className="flex items-start justify-between gap-4 border-b border-border/70 pb-3 last:border-0">
              <div>
                <p className="font-medium text-primary">{graha.planet || key}</p>
                <p className="text-sm text-muted-foreground">
                  {graha.sign || 'Unknown sign'}
                  {graha.house ? `, House ${graha.house}` : ''}
                  {graha.nakshatra ? `, ${graha.nakshatra}` : ''}
                </p>
              </div>
              {graha.retrograde && <Badge variant="warning">Retrograde</Badge>}
            </div>
          ))
        )}
      </CardContent>
    </Card>
  )
}

function HouseSummary({
  grahas,
  bhavas,
}: {
  grahas: Record<string, KundaliGraha>
  bhavas: Record<string, KundaliBhava>
}) {
  const houses = Object.values(bhavas)
    .filter((bhava) => bhava.houseNumber)
    .sort((a, b) => Number(a.houseNumber) - Number(b.houseNumber))

  return (
    <Card>
      <CardHeader>
        <CardTitle>House summary</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-3 sm:grid-cols-2">
        {houses.length === 0 ? (
          <p className="text-sm text-muted-foreground">House data is unavailable.</p>
        ) : (
          houses.map((bhava) => {
            const planets = getPlanetsByHouse(grahas, bhava.houseNumber)
            return (
              <div key={bhava.houseNumber} className="rounded-lg border border-border bg-secondary/40 p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-medium text-primary">House {bhava.houseNumber}</p>
                  {bhava.sign && <Badge variant="outline">{bhava.sign}</Badge>}
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  {planets.length ? planets.map((planet) => planet.planet).join(', ') : 'No planets recorded'}
                </p>
              </div>
            )
          })
        )}
      </CardContent>
    </Card>
  )
}

function AdvancedDetails({ kundali }: { kundali: KundaliData }) {
  const grahas = Object.entries(kundali.D1?.grahas || {})
  const bhavas = Object.values(kundali.D1?.bhavas || {}).sort(
    (a, b) => Number(a.houseNumber) - Number(b.houseNumber)
  )
  const aspects = kundali.D1?.aspects || []

  return (
    <Card>
      <CardHeader>
        <CardTitle>Advanced details</CardTitle>
      </CardHeader>
      <CardContent>
        <details className="group">
          <summary className="min-h-11 cursor-pointer rounded-lg border border-border bg-secondary/40 px-4 py-3 font-medium text-primary outline-none focus-visible:ring-2 focus-visible:ring-ring">
            Show technical chart data
          </summary>
          <div className="mt-5 space-y-6">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-muted-foreground">
                    <th className="p-2">Planet</th>
                    <th className="p-2">Sign</th>
                    <th className="p-2">House</th>
                    <th className="p-2">Nakshatra</th>
                    <th className="p-2">Pada</th>
                    <th className="p-2">Longitude</th>
                    <th className="p-2">Degrees</th>
                    <th className="p-2">Retrograde</th>
                  </tr>
                </thead>
                <tbody>
                  {grahas.map(([key, graha]) => (
                    <tr key={key} className="border-b border-border/70">
                      <td className="p-2 font-medium text-primary">{graha.planet || key}</td>
                      <td className="p-2">{graha.sign || '-'}</td>
                      <td className="p-2">{graha.house || '-'}</td>
                      <td className="p-2">{graha.nakshatra || '-'}</td>
                      <td className="p-2">{graha.pada || '-'}</td>
                      <td className="p-2">{formatDegree(graha.longitude)}</td>
                      <td className="p-2">{formatDegree(graha.degreesInSign)}</td>
                      <td className="p-2">{graha.retrograde ? 'Yes' : 'No'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {bhavas.map((bhava) => (
                <div key={bhava.houseNumber} className="rounded-lg border border-border p-3 text-sm">
                  <p className="font-medium text-primary">House {bhava.houseNumber}</p>
                  <p className="text-muted-foreground">Sign: {bhava.sign || '-'}</p>
                  <p className="text-muted-foreground">Cusp: {formatDegree(bhava.cuspLongitude)}</p>
                </div>
              ))}
            </div>
            {aspects.length > 0 && (
              <div className="space-y-2">
                <p className="font-medium text-primary">Aspects</p>
                {aspects.map((aspect, index) => (
                  <div key={`${aspect.fromPlanet}-${aspect.toPlanet}-${index}`} className="rounded-lg border border-border p-3 text-sm">
                    {aspect.fromPlanet || '-'} to {aspect.toPlanet || '-'} · {aspect.type || '-'} · {formatDegree(aspect.angle)}
                  </div>
                ))}
              </div>
            )}
          </div>
        </details>
      </CardContent>
    </Card>
  )
}
