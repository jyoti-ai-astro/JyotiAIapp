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
import { AuthenticatedAppShell } from '@/src/ui/layout/AuthenticatedAppShell'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { EmptyState, ErrorState, LoadingState, RetryButton } from '@/components/ui/feedback-state'
import { KundaliChart2D, type KundaliBhava, type KundaliGraha } from '@/components/charts/kundali-chart'
import { KundaliWheel3D } from '@/components/organisms/kundali-wheel-3d'
import { OneTimeOfferBanner } from '@/components/paywall/OneTimeOfferBanner'
import { useTicketAccess } from '@/lib/access/useTicketAccess'
import {
  formatAstrologyDisplayValue,
  formatNakshatraDisplay,
  nullableAstrologyDisplay,
  nullableNakshatraDisplay,
} from '@/lib/astrology/display-formatters'
import { useUserStore } from '@/store/user-store'
import { KundaliProductionVisualSystem } from '@/components/celestial/KundaliProductionVisualSystem'
import { invalidateAuthenticatedRead } from '@/lib/client/authenticated-read'

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

function firstValue(...values: unknown[]) {
  for (const value of values) {
    const formatted = nullableAstrologyDisplay(value)
    if (formatted) return formatted
  }
  return null
}

function firstNakshatraValue(...values: unknown[]) {
  for (const value of values) {
    const formatted = nullableNakshatraDisplay(value)
    if (formatted) return formatted
  }
  return null
}

function getPlanetsByHouse(grahas: Record<string, KundaliGraha>, houseNumber?: number) {
  if (!houseNumber) return []
  return Object.values(grahas).filter((graha) => Number(graha.house) === houseNumber)
}

function KundaliExperience() {
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
      nakshatra: firstNakshatraValue(user?.nakshatra, grahas.Moon?.nakshatra, grahas.Chandra?.nakshatra, lagna?.nakshatra),
      mahadasha: firstValue(dasha?.currentMahadasha?.planet),
      antardasha: firstValue(dasha?.currentAntardasha?.planet),
      birthPlace: firstValue(user?.pob, kundali?.meta?.birthDetails?.pob),
    }),
    [dasha, grahas, kundali?.meta?.birthDetails?.pob, lagna, user]
  )

  const grahaPositions = Object.entries(grahas).map(([planetName, graha]) => ({
    planet: formatAstrologyDisplayValue(graha.planet, planetName),
    degrees: graha.degreesInSign || 0,
    sign: formatAstrologyDisplayValue(graha.sign, 'Unknown'),
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

      // Canonical Kundali changed: invalidate only dependent authenticated reads.
      invalidateAuthenticatedRead('/api/kundali/get')
      invalidateAuthenticatedRead('/api/astro/context')
      invalidateAuthenticatedRead('/api/timeline')

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

  if (!user) {
    return (
      <DashboardPageShell
        title="Your Vedic Birth Chart"
        subtitle="Preparing your JyotiAI chart workspace."
        withAuthenticatedShell={false}
      >
        <Card>
          <LoadingState
            title="Opening Kundali"
            description="Restoring your saved JyotiAI session."
          />
        </Card>
      </DashboardPageShell>
    )
  }

  if (loading || ticketLoading) {
    return (
      <DashboardPageShell
        title="Your Vedic Birth Chart"
        subtitle="Preparing your Kundali view."
        withAuthenticatedShell={false}
      >
        <Card>
          <LoadingState title="Loading Kundali" description="Reading your saved birth chart." />
        </Card>
      </DashboardPageShell>
    )
  }

  if (error) {
    return (
      <DashboardPageShell
        title="Your Vedic Birth Chart"
        subtitle="A clear view of your saved chart."
        withAuthenticatedShell={false}
      >
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
    <div
      data-kundali-experience="observatory"
      className="relative isolate min-h-screen overflow-x-hidden bg-[#02080d] text-[#f7f1e7]"
    >
      {/* K4 v2.1 — single-world atmospheric foundation.
          The live WebGL universe belongs to the hero stage below.
          The rest of the page uses lightweight atmospheric depth. */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-0"
      >
        <div className="absolute inset-0 bg-[#02080d]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_72%_14%,rgba(229,130,42,0.10),transparent_34rem)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_16%_52%,rgba(40,119,126,0.055),transparent_30rem)]" />
        <div className="absolute inset-0 opacity-[0.16] bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[length:100%_72px]" />
      </div>

      <div className="relative z-10">


      {/* K3 — route-local visual recomposition.
          These overrides are intentionally scoped to the Kundali experience.
          No shared Card/Button/Dashboard component is globally mutated. */}
      {/* K4 v2.1 — route-local production visual system.
          No DashboardPageShell geometry assumptions.
          No main/aside width hacks.
          No cream SaaS sheets. */}
      <style jsx global>{`
        [data-kundali-experience="observatory"] {
          --kundali-bg: #02080d;
          --kundali-surface: rgba(7, 14, 18, 0.92);
          --kundali-surface-soft: rgba(10, 18, 22, 0.82);
          --kundali-surface-muted: rgba(255, 255, 255, 0.035);
          --kundali-line: rgba(223, 170, 90, 0.20);
          --kundali-line-strong: rgba(232, 166, 69, 0.36);
          --kundali-text: #f7f1e7;
          --kundali-muted: rgba(235, 229, 216, 0.66);
          --kundali-gold: #e5a24a;
        }

        [data-kundali-experience="observatory"] {
          background: var(--kundali-bg);
          color: var(--kundali-text);
        }

        [data-kundali-experience="observatory"] .bg-card,
        [data-kundali-experience="observatory"] [class*="bg-card"],
        [data-kundali-experience="observatory"] .bg-background,
        [data-kundali-experience="observatory"] [class*="bg-background"] {
          background-color: var(--kundali-surface) !important;
          color: var(--kundali-text) !important;
        }

        [data-kundali-experience="observatory"] .bg-muted,
        [data-kundali-experience="observatory"] [class*="bg-muted"],
        [data-kundali-experience="observatory"] .bg-secondary,
        [data-kundali-experience="observatory"] [class*="bg-secondary"] {
          background-color: var(--kundali-surface-muted) !important;
        }

        [data-kundali-experience="observatory"] .bg-jyoti-gold\\/10 {
          background:
            radial-gradient(
              circle at 88% 12%,
              rgba(229, 130, 42, 0.14),
              transparent 24rem
            ),
            linear-gradient(
              135deg,
              rgba(10, 18, 22, 0.92),
              rgba(5, 11, 15, 0.96)
            ) !important;
        }

        [data-kundali-experience="observatory"] .border-border,
        [data-kundali-experience="observatory"] [class*="border-border"] {
          border-color: var(--kundali-line) !important;
        }

        [data-kundali-experience="observatory"] .border-jyoti-gold\\/35 {
          border-color: var(--kundali-line-strong) !important;
        }

        [data-kundali-experience="observatory"] .text-primary,
        [data-kundali-experience="observatory"] .text-card-foreground,
        [data-kundali-experience="observatory"] .text-foreground {
          color: var(--kundali-text) !important;
        }

        [data-kundali-experience="observatory"] .text-muted-foreground {
          color: var(--kundali-muted) !important;
        }

        [data-kundali-experience="observatory"] [class*="bg-card"] {
          box-shadow:
            0 24px 90px rgba(0, 0, 0, 0.24),
            inset 0 1px 0 rgba(255, 255, 255, 0.025);
          backdrop-filter: blur(14px);
        }

        [data-kundali-experience="observatory"] [class*="bg-muted"],
        [data-kundali-experience="observatory"] [class*="bg-secondary"] {
          border-color: rgba(222, 168, 87, 0.14) !important;
        }

        [data-kundali-experience="observatory"]
          button:not([class*="bg-primary"]):not([class*="variant-ghost"]) {
          border-color: rgba(225, 173, 96, 0.25);
        }

        @media (max-width: 1023px) {
          [data-kundali-experience="observatory"]
            [data-kundali-hero-visual="true"] {
            min-height: 420px;
          }
        }

        @media (max-width: 767px) {
          [data-kundali-experience="observatory"]
            [data-kundali-hero-visual="true"] {
            min-height: 340px;
          }
        }
      `}</style>

      <section
        data-kundali-product="true"
        className="relative z-10"
      >
        <KundaliProductionVisualSystem />


        <div className="mx-auto w-full max-w-[1440px] px-5 pb-24 pt-10 sm:px-8 lg:px-10 lg:pb-32 lg:pt-14 xl:px-14">
          <div className="grid min-h-[610px] items-center gap-8 lg:grid-cols-[0.82fr_1.18fr] lg:gap-12 xl:min-h-[660px]">
            <div className="relative z-20 max-w-[620px]">
              <Badge variant="premium">Living Kundali</Badge>

              <h1 className="mt-5 font-heading text-[clamp(3rem,5vw,5.7rem)] font-medium leading-[0.92] tracking-[-0.045em] text-[#fff8ed]">
                Your Vedic
                <span className="block text-[#e8a54a]">
                  birth universe.
                </span>
              </h1>

              <p className="mt-7 max-w-[560px] text-base leading-7 text-[#d8d1c4]/75 md:text-lg md:leading-8">
                Explore your Lagna, planetary architecture, houses, Dasha,
                and deeper Vedic timing inside one connected celestial model.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Badge variant={missingKundali ? 'warning' : isStale ? 'warning' : 'success'}>
                  {missingKundali ? 'Chart not generated' : isStale ? 'Chart needs refresh' : 'Chart current'}
                </Badge>

                {hasSubscription ? (
                  <Badge variant="success">Included in your plan</Badge>
                ) : (
                  <Badge variant="secondary" data-kundali-credit="true">
                    {tickets.kundaliTickets || 0} Kundali credits
                  </Badge>
                )}
              </div>

              {!missingKundali && (
                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  <Link href="/guru?prompt=What%20does%20my%20current%20Dasha%20mean%3F&source=kundali">
                    <Button iconRight={<ArrowRight className="h-4 w-4" />}>
                      Ask Guru about my chart
                    </Button>
                  </Link>

                  <Button
                    variant="outline"
                    className="border-[#d6a44f]/35 !bg-[#11191d] !text-[#f0dfbb] hover:!border-[#e2ad55]/65 hover:!bg-[#182126] disabled:!border-[#d6a44f]/16 disabled:!bg-[#11181b] disabled:!text-[#a99f8c] disabled:!opacity-100"
                    onClick={handleGenerateReport}
                    disabled={reporting}
                    iconLeft={
                      reporting
                        ? <RefreshCw className="h-4 w-4 animate-spin" />
                        : <Download className="h-4 w-4" />
                    }
                  >
                    {reporting ? 'Creating report' : 'Generate report'}
                  </Button>
                </div>
              )}
            </div>

            <div
              data-kundali-hero-visual="true"
              className="relative isolate min-h-[520px] overflow-hidden rounded-[32px] border border-[#dfaa5a]/15 bg-[#03090d] lg:min-h-[610px]"
            >
              {/* K5.7 — deterministic production hero celestial architecture.
                  Inline by design: no WebGL, dynamic import, styled-jsx,
                  or nested component stacking dependency. */}
              <div
                aria-hidden="true"
                data-kundali-inline-celestial="true"
                className="pointer-events-none absolute inset-0 z-20 overflow-hidden"
              >
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_52%_46%,rgba(231,153,54,0.14),transparent_18rem),radial-gradient(circle_at_70%_34%,rgba(74,142,148,0.08),transparent_19rem)]" />

                <svg
                  viewBox="0 0 1200 720"
                  preserveAspectRatio="xMidYMid slice"
                  className="absolute inset-0 h-full w-full"
                  role="presentation"
                >
                  <defs>
                    <radialGradient id="kundaliHeroCore" cx="36%" cy="30%" r="72%">
                      <stop offset="0%" stopColor="#fff0bf" />
                      <stop offset="20%" stopColor="#f3b557" />
                      <stop offset="48%" stopColor="#df8127" />
                      <stop offset="74%" stopColor="#9e4514" />
                      <stop offset="100%" stopColor="#3d1708" />
                    </radialGradient>

                    <radialGradient id="kundaliHeroAura">
                      <stop offset="0%" stopColor="#e99f3f" stopOpacity="0.36" />
                      <stop offset="55%" stopColor="#e99f3f" stopOpacity="0.10" />
                      <stop offset="100%" stopColor="#e99f3f" stopOpacity="0" />
                    </radialGradient>

                    <linearGradient id="kundaliHeroGoldLine" x1="0" x2="1">
                      <stop offset="0%" stopColor="#dca64a" stopOpacity="0" />
                      <stop offset="50%" stopColor="#e6b45e" stopOpacity="0.72" />
                      <stop offset="100%" stopColor="#dca64a" stopOpacity="0" />
                    </linearGradient>

                    <linearGradient id="kundaliHeroTealLine" x1="0" x2="1">
                      <stop offset="0%" stopColor="#619ca0" stopOpacity="0" />
                      <stop offset="50%" stopColor="#72afb1" stopOpacity="0.42" />
                      <stop offset="100%" stopColor="#619ca0" stopOpacity="0" />
                    </linearGradient>

                    <filter id="kundaliHeroGlow" x="-100%" y="-100%" width="300%" height="300%">
                      <feGaussianBlur stdDeviation="18" />
                    </filter>

                    <filter id="kundaliHeroSmallGlow" x="-100%" y="-100%" width="300%" height="300%">
                      <feGaussianBlur stdDeviation="6" />
                    </filter>
                  </defs>

                  {/* faint architectural grid */}
                  <g opacity="0.18">
                    <path
                      d="M110 360 H1090"
                      stroke="#dca64a"
                      strokeWidth="1"
                      strokeDasharray="4 16"
                    />
                    <path
                      d="M600 70 V650"
                      stroke="#dca64a"
                      strokeWidth="1"
                      strokeDasharray="4 16"
                    />
                    <path
                      d="M250 145 L950 575"
                      stroke="#6aa3a5"
                      strokeWidth="1"
                    />
                    <path
                      d="M244 574 L952 145"
                      stroke="#dca64a"
                      strokeWidth="1"
                    />
                  </g>

                  {/* distant celestial field */}
                  <g fill="#f1c16b" opacity="0.55">
                    <circle cx="163" cy="124" r="2.2" />
                    <circle cx="208" cy="541" r="1.6" />
                    <circle cx="1024" cy="174" r="2" />
                    <circle cx="1080" cy="484" r="1.8" />
                    <circle cx="889" cy="94" r="1.5" />
                    <circle cx="349" cy="625" r="1.7" />
                    <circle cx="972" cy="610" r="1.4" />
                    <circle cx="335" cy="96" r="1.3" />
                  </g>

                  <g fill="#69a1a3" opacity="0.48">
                    <circle cx="122" cy="427" r="1.8" />
                    <circle cx="1060" cy="326" r="2.1" />
                    <circle cx="774" cy="118" r="1.4" />
                    <circle cx="418" cy="155" r="1.7" />
                  </g>

                  {/* orbital architecture */}
                  <ellipse
                    cx="604"
                    cy="349"
                    rx="172"
                    ry="172"
                    fill="none"
                    stroke="#e1ad58"
                    strokeOpacity="0.44"
                    strokeWidth="1.6"
                  />

                  <ellipse
                    cx="604"
                    cy="349"
                    rx="290"
                    ry="204"
                    fill="none"
                    stroke="#dca64a"
                    strokeOpacity="0.34"
                    strokeWidth="1.4"
                    transform="rotate(-14 604 349)"
                  />

                  <ellipse
                    cx="604"
                    cy="349"
                    rx="390"
                    ry="244"
                    fill="none"
                    stroke="#659da1"
                    strokeOpacity="0.30"
                    strokeWidth="1.3"
                    transform="rotate(19 604 349)"
                  />

                  <ellipse
                    cx="604"
                    cy="349"
                    rx="485"
                    ry="283"
                    fill="none"
                    stroke="#dca64a"
                    strokeOpacity="0.20"
                    strokeWidth="1.1"
                    transform="rotate(-6 604 349)"
                  />

                  {/* axis paths */}
                  <path
                    d="M166 475 C340 398 440 375 604 349 C785 320 913 254 1054 163"
                    fill="none"
                    stroke="url(#kundaliHeroGoldLine)"
                    strokeWidth="1.4"
                  />

                  <path
                    d="M184 195 C345 274 455 324 604 349 C790 379 918 453 1033 566"
                    fill="none"
                    stroke="url(#kundaliHeroTealLine)"
                    strokeWidth="1.3"
                  />

                  {/* solar aura */}
                  <circle
                    cx="604"
                    cy="349"
                    r="124"
                    fill="url(#kundaliHeroAura)"
                    filter="url(#kundaliHeroGlow)"
                  />

                  {/* solar body */}
                  <circle
                    cx="604"
                    cy="349"
                    r="67"
                    fill="url(#kundaliHeroCore)"
                  />

                  <circle
                    cx="604"
                    cy="349"
                    r="76"
                    fill="none"
                    stroke="#edb459"
                    strokeOpacity="0.34"
                    strokeWidth="1.4"
                  />

                  <circle
                    cx="604"
                    cy="349"
                    r="55"
                    fill="none"
                    stroke="#ffe0a0"
                    strokeOpacity="0.16"
                    strokeWidth="1"
                  />

                  {/* planet nodes */}
                  <g>
                    <circle
                      cx="440"
                      cy="204"
                      r="8"
                      fill="#d9aa53"
                      filter="url(#kundaliHeroSmallGlow)"
                    />
                    <circle cx="440" cy="204" r="5" fill="#efc36e" />

                    <circle
                      cx="813"
                      cy="233"
                      r="11"
                      fill="#5d9599"
                      filter="url(#kundaliHeroSmallGlow)"
                    />
                    <circle cx="813" cy="233" r="7" fill="#70aeb0" />

                    <circle
                      cx="904"
                      cy="411"
                      r="13"
                      fill="#d79a3c"
                      filter="url(#kundaliHeroSmallGlow)"
                    />
                    <circle cx="904" cy="411" r="8" fill="#e8b05a" />

                    <circle
                      cx="366"
                      cy="493"
                      r="9"
                      fill="#548d92"
                      filter="url(#kundaliHeroSmallGlow)"
                    />
                    <circle cx="366" cy="493" r="5.5" fill="#70aeb0" />

                    <circle
                      cx="721"
                      cy="546"
                      r="7"
                      fill="#e1ae54"
                      filter="url(#kundaliHeroSmallGlow)"
                    />
                    <circle cx="721" cy="546" r="4.5" fill="#f0c16f" />

                    <circle cx="261" cy="328" r="5" fill="#c18938" />
                    <circle cx="1000" cy="322" r="4" fill="#659da1" />
                  </g>

                  {/* Saturn-like object */}
                  <g transform="translate(771 431) rotate(-12)">
                    <ellipse
                      cx="0"
                      cy="0"
                      rx="34"
                      ry="11"
                      fill="none"
                      stroke="#d5a14a"
                      strokeOpacity="0.62"
                      strokeWidth="3"
                    />
                    <circle cx="0" cy="0" r="12" fill="#594532" />
                    <circle cx="-4" cy="-4" r="7" fill="#80643d" opacity="0.8" />
                  </g>

                  {/* orbit ticks */}
                  <g fill="#d9a64c" opacity="0.72">
                    <circle cx="604" cy="177" r="3" />
                    <circle cx="604" cy="521" r="3" />
                    <circle cx="432" cy="349" r="3" />
                    <circle cx="776" cy="349" r="3" />
                  </g>

                  {/* small technical markers */}
                  <g
                    fill="none"
                    stroke="#dca64a"
                    strokeOpacity="0.44"
                    strokeWidth="1"
                  >
                    <path d="M428 182 h24" />
                    <path d="M428 182 v24" />
                    <path d="M804 211 h24" />
                    <path d="M828 211 v24" />
                    <path d="M888 432 h28" />
                  </g>

                  {/* coordinate labels */}
                  <g
                    fill="#d8b16a"
                    fontSize="12"
                    fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace"
                    letterSpacing="2"
                    opacity="0.62"
                  >
                    <text x="413" y="174">ASC</text>
                    <text x="831" y="216">GRAHA</text>
                    <text x="919" y="437">DASHA</text>
                    <text x="336" y="520">BHAVA</text>
                  </g>
                </svg>

                {/* restrained vignette */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_48%,transparent_0%,transparent_32%,rgba(3,9,13,0.18)_66%,rgba(3,9,13,0.70)_100%)]" />

                {/* upper-right observatory metadata */}
                <div className="absolute right-6 top-6 grid gap-3 text-right">
                  <div>
                    <p className="text-[9px] uppercase tracking-[0.28em] text-[#dbaa56]/55">
                      Lagna field
                    </p>
                    <p className="mt-1 text-[11px] text-[#eee7dc]/45">
                      Ascendant architecture
                    </p>
                  </div>

                  <div>
                    <p className="text-[9px] uppercase tracking-[0.28em] text-[#70a7a9]/50">
                      Graha matrix
                    </p>
                    <p className="mt-1 text-[11px] text-[#eee7dc]/40">
                      Planetary relationships
                    </p>
                  </div>
                </div>
              </div>

              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 z-[5] bg-[radial-gradient(circle_at_58%_46%,transparent_0%,transparent_24%,rgba(2,8,13,0.06)_54%,rgba(2,8,13,0.30)_100%)]"
              />

              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 z-[5] bg-[linear-gradient(90deg,rgba(2,8,13,0.18)_0%,transparent_26%,transparent_74%,rgba(2,8,13,0.12)_100%)]"
              />

              <div className="pointer-events-none absolute bottom-6 left-6 right-6 z-30 flex items-end justify-between gap-4">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#e7ad55]/70">
                    Celestial architecture
                  </p>
                  <p className="mt-2 max-w-[340px] text-sm leading-6 text-[#eee7dc]/60">
                    Your saved chart remains the source of truth beneath the visual system.
                  </p>
                </div>

                <div className="hidden text-right md:block">
                  <p className="text-[10px] uppercase tracking-[0.22em] text-[#eee7dc]/40">
                    Lagna · Grahas · Dasha
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-10 lg:mt-14">
      <div className="space-y-6">
        <Card className="border-jyoti-gold/35 bg-jyoti-gold/10">
          <CardContent className="grid gap-6 pt-6 lg:grid-cols-[1fr_0.85fr] lg:items-center">
            <div>
              <Badge variant="premium">Chart command center</Badge>
              <h2 className="mt-4 font-heading text-2xl font-semibold leading-tight text-primary md:text-3xl">
                Your chart workspace
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground md:text-base">
                Your saved chart, current status, reports, and Guru actions remain available here.
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
                    className="border-[#d6a44f]/35 !bg-[#11191d] !text-[#f0dfbb] hover:!border-[#e2ad55]/65 hover:!bg-[#182126] disabled:!border-[#d6a44f]/16 disabled:!bg-[#11181b] disabled:!text-[#a99f8c] disabled:!opacity-100"
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
                  <Button
                    variant="outline"
                    className="border-[#d6a44f]/35 !bg-[#11191d] !text-[#f0dfbb] hover:!border-[#e2ad55]/65 hover:!bg-[#182126]"
                    iconLeft={<CalendarDays className="h-4 w-4" />}
                  >
                    View Dasha
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  className="border-[#d6a44f]/35 !bg-[#11191d] !text-[#f0dfbb] hover:!border-[#e2ad55]/65 hover:!bg-[#182126] disabled:!border-[#d6a44f]/16 disabled:!bg-[#11181b] disabled:!text-[#a99f8c] disabled:!opacity-100"
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
          </div>
        </div>
      </section>
      </div>

      {/* K4 v2.1 — END PRODUCTION KUNDALI OBSERVATORY */}
    </div>
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
    <Card data-kundali-dasha-card="true" id="dasha" data-kundali-dasha="true" data-kundali-panel="true">
      <CardHeader>
        <CardTitle>Current Dasha</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <p className="text-base leading-7 text-primary">
          You are currently in the {formatAstrologyDisplayValue(mahadasha?.planet, 'available')} Mahadasha
          {nullableAstrologyDisplay(antardasha?.planet)
            ? `, with ${formatAstrologyDisplayValue(antardasha?.planet)} Antardasha active.`
            : '.'}
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
    <div
      data-kundali-dasha-period="true"
      className="rounded-xl border border-[#d6a44f]/20 bg-[#10191d] p-5 shadow-none"
    >
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#cda252]">{label}</p>
      <p className="mt-2 font-heading text-xl font-semibold text-[#f1ead9]">
        {formatAstrologyDisplayValue(period?.planet)}
      </p>
      <p className="mt-3 text-xs text-[#aaa393]">
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
                <p className="font-medium text-primary">{formatAstrologyDisplayValue(graha.planet, key)}</p>
                <p className="text-sm text-muted-foreground">
                  {formatAstrologyDisplayValue(graha.sign, 'Unknown sign')}
                  {graha.house ? `, House ${graha.house}` : ''}
                  {nullableNakshatraDisplay(graha.nakshatra) ? `, ${formatNakshatraDisplay(graha.nakshatra)}` : ''}
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
                  {nullableAstrologyDisplay(bhava.sign) && (
                    <Badge variant="outline">{formatAstrologyDisplayValue(bhava.sign)}</Badge>
                  )}
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  {planets.length
                    ? planets.map((planet) => formatAstrologyDisplayValue(planet.planet, 'Planet')).join(', ')
                    : 'No planets recorded'}
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
    <Card data-kundali-advanced="true" data-kundali-panel="true">
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
                      <td className="p-2 font-medium text-primary">{formatAstrologyDisplayValue(graha.planet, key)}</td>
                      <td className="p-2">{formatAstrologyDisplayValue(graha.sign, '-')}</td>
                      <td className="p-2">{graha.house || '-'}</td>
                      <td className="p-2">{formatNakshatraDisplay(graha.nakshatra, '-')}</td>
                      <td className="p-2">{formatAstrologyDisplayValue(graha.pada, '-')}</td>
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
                  <p className="text-muted-foreground">Sign: {formatAstrologyDisplayValue(bhava.sign, '-')}</p>
                  <p className="text-muted-foreground">Cusp: {formatDegree(bhava.cuspLongitude)}</p>
                </div>
              ))}
            </div>
            {aspects.length > 0 && (
              <div className="space-y-2">
                <p className="font-medium text-primary">Aspects</p>
                {aspects.map((aspect, index) => (
                  <div key={`${aspect.fromPlanet}-${aspect.toPlanet}-${index}`} className="rounded-lg border border-border p-3 text-sm">
                    {formatAstrologyDisplayValue(aspect.fromPlanet, '-')} to {formatAstrologyDisplayValue(aspect.toPlanet, '-')} · {formatAstrologyDisplayValue(aspect.type, '-')} · {formatDegree(aspect.angle)}
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


export default function KundaliPage() {
  return (
    <div
      data-jyoti-product-shell="true"
      className="relative min-h-screen bg-[#02080d] text-[#f7f1e7]"
    >
      <div className="mx-auto w-full max-w-[1800px] px-4 sm:px-5 lg:px-6">
        <AuthenticatedAppShell>
          <KundaliExperience />
        </AuthenticatedAppShell>
      </div>
    </div>
  )
}
