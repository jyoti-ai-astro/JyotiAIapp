'use client'

export const dynamic = 'force-dynamic'

import { useCallback, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  ArrowRight,
  Bell,
  CalendarDays,
  FileText,
  RefreshCw,
  ScrollText,
  Sun,
} from 'lucide-react'
import DashboardPageShell from '@/src/ui/layout/DashboardPageShell'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { EmptyState, ErrorState, LoadingState, RetryButton } from '@/components/ui/feedback-state'
import { useUserStore } from '@/store/user-store'
import { authenticatedJsonRead } from '@/lib/client/authenticated-read'

type RequestState<T> = {
  loading: boolean
  data: T | null
  error: string | null
  code?: string | null
}

type SummaryData = {
  success: boolean
  user: {
    name: string
    photo: string | null
    rashi: string | null
    nakshatra: unknown
    lagna: string | null
    lagnaDetails: any
  }
  kundali: {
    available: boolean
    generatedAt: string | null
  }
  dasha: {
    mahadasha?: { planet?: string | null; startDate?: string | null; endDate?: string | null }
    antardasha?: { planet?: string | null; startDate?: string | null; endDate?: string | null }
  } | null
  profileComplete: boolean
  derivedAstrologyStatus?: 'current' | 'stale'
}

type HoroscopeData = {
  date: string
  rashi: string
  general: string
  love: string
  career: string
  money: string
  health: string
  luckyColor: string
  luckyNumber: number
  dos: string[]
  donts: string[]
  energyLevel: 'low' | 'medium' | 'high'
}

type ReportRecord = {
  id: string
  reportId: string
  type: string | null
  title: string
  status: 'queued' | 'generating' | 'ready' | 'failed'
  createdAt: string | null
  updatedAt: string | null
  failureReason?: string | null
}

type TicketSummary = {
  hasSubscription: boolean
  subscriptionPlan?: string
  subscriptionExpiry?: string
  tickets: {
    aiGuruTickets: number
    kundaliTickets: number
    lifetimePredictions: number
  }
}

type TimelineState = {
  status: 'ready' | 'empty' | 'generating' | 'failed' | 'stale' | 'error'
  message?: string | null
  data?: any
}

type RecommendedAction =
  | {
      title: string
      description: string
      label: string
      href: string
      onClick?: never
    }
  | {
      title: string
      description: string
      label: string
      onClick: () => void
      href?: never
    }

const defaultRequestState = <T,>(): RequestState<T> => ({
  loading: true,
  data: null,
  error: null,
  code: null,
})

async function fetchJson<T>(url: string): Promise<T> {
  return authenticatedJsonRead<T>(url)
}

function formatDate(date = new Date()) {
  return new Intl.DateTimeFormat('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date)
}

function formatDisplayValue(value: unknown): string | null {
  if (!value) return null
  if (typeof value === 'string') return value === 'Unknown' ? null : value
  if (typeof value === 'number' && Number.isFinite(value)) return String(value)
  return null
}

function formatNakshatraForDisplay(value: unknown): string | null {
  const direct = formatDisplayValue(value)
  if (direct) return direct
  if (!value || typeof value !== 'object') return null

  const record = value as Record<string, unknown>
  const name = formatDisplayValue(record.nakshatra) || formatDisplayValue(record.name) || formatDisplayValue(record.label)
  if (!name) return null

  const rawPada = record.pada
  if (typeof rawPada === 'number' && Number.isFinite(rawPada) && rawPada > 0) {
    return `${name} · Pada ${rawPada}`
  }

  const pada = formatDisplayValue(rawPada)
  return pada && pada !== '0' ? `${name} · Pada ${pada}` : name
}

function firstDisplayValue(...values: unknown[]) {
  for (const value of values) {
    const formatted = formatDisplayValue(value)
    if (formatted) return formatted
  }
  return null
}

function firstNakshatraValue(...values: unknown[]) {
  for (const value of values) {
    const formatted = formatNakshatraForDisplay(value)
    if (formatted) return formatted
  }
  return null
}

function reportTypeLabel(type: string | null) {
  if (!type) return 'Report'
  return type.charAt(0).toUpperCase() + type.slice(1)
}

export default function DashboardPage() {
  const router = useRouter()
  const { user } = useUserStore()
  const [summary, setSummary] = useState<RequestState<SummaryData>>(defaultRequestState)
  const [horoscope, setHoroscope] = useState<RequestState<HoroscopeData>>(defaultRequestState)
  const [kundali, setKundali] = useState<RequestState<any>>(defaultRequestState)
  const [timeline, setTimeline] = useState<RequestState<TimelineState>>(defaultRequestState)
  const [reports, setReports] = useState<RequestState<ReportRecord[]>>(defaultRequestState)
  const [tickets, setTickets] = useState<RequestState<TicketSummary>>(defaultRequestState)
  const [festival, setFestival] = useState<RequestState<any>>(defaultRequestState)
  const [notifications, setNotifications] = useState<RequestState<{ unreadCount: number }>>(defaultRequestState)

  const loadDashboard = useCallback(async () => {
    setSummary(defaultRequestState())
    setHoroscope(defaultRequestState())
    setKundali(defaultRequestState())
    setTimeline(defaultRequestState())
    setReports(defaultRequestState())
    setTickets(defaultRequestState())
    setFestival(defaultRequestState())
    setNotifications(defaultRequestState())

    const load = async <T,>(
      setter: (state: RequestState<T>) => void,
      url: string,
      pick: (data: any) => T
    ) => {
      try {
        const data = await fetchJson<any>(url)
        setter({ loading: false, data: pick(data), error: null, code: null })
      } catch (error: any) {
        setter({
          loading: false,
          data: null,
          error: error.message || 'Unable to load this section.',
          code: error.code || null,
        })
      }
    }

    void load(setSummary, '/api/dashboard/summary', (data) => data)
    void load(setHoroscope, '/api/horoscope/today', (data) => data.horoscope)
    void load(setKundali, '/api/kundali/get', (data) => data.kundali)
    void load(setReports, '/api/reports/list?limit=2', (data) => data.reports || [])
    void (async () => {
      try {
        const data = await authenticatedJsonRead<TicketSummary>('/api/user/tickets', { ttlMs: 60_000 })
        setTickets({ loading: false, data, error: null, code: null })
      } catch (error: any) {
        setTickets({
          loading: false,
          data: null,
          error: error.message || 'Unable to load this section.',
          code: error.code || null,
        })
      }
    })()
    void load(setFestival, '/api/festival/today', (data) => data)
    void load(setNotifications, '/api/notifications/list?limit=1', (data) => ({
      unreadCount: data.unreadCount || 0,
    }))

    try {
      const data = await fetchJson<any>('/api/timeline')
      setTimeline({
        loading: false,
        data: { status: 'ready', data: data.data, message: null },
        error: null,
        code: null,
      })
    } catch (error: any) {
      const status =
        error.code === 'TIMELINE_NOT_FOUND'
          ? 'empty'
          : error.code === 'TIMELINE_GENERATING'
            ? 'generating'
            : error.code === 'TIMELINE_STALE'
              ? 'stale'
              : error.code === 'TIMELINE_FAILED'
                ? 'failed'
                : 'error'
      setTimeline({
        loading: false,
        data: { status, message: error.message },
        error: status === 'error' ? error.message : null,
        code: error.code || null,
      })
    }
  }, [])

  useEffect(() => {
    if (!user) {
      router.push('/login')
      return
    }

    loadDashboard()
  }, [loadDashboard, router, user])

  const birthFieldsMissing = !user?.dob || !user?.tob || !user?.pob
  const profileIncomplete = user ? !user.onboarded || birthFieldsMissing : true
  const astrologyStale =
    user?.derivedAstrologyStatus === 'stale' ||
    summary.data?.derivedAstrologyStatus === 'stale' ||
    kundali.data?.meta?.meta?.stale === true
  const canonicalKundaliMissing =
    summary.loading || kundali.loading
      ? false
      : !summary.data?.kundali.available || kundali.code === 'Kundali not found' || kundali.code === 'KUNDALI_REQUIRED'
  const canonicalKundaliCurrent =
    summary.data?.kundali.available === true &&
    !astrologyStale &&
    !canonicalKundaliMissing
  const todayGuidanceBlocked =
    astrologyStale ||
    canonicalKundaliMissing ||
    (!canonicalKundaliCurrent && profileIncomplete)
  const hasGuruAccess =
    tickets.data?.hasSubscription === true || (tickets.data?.tickets?.aiGuruTickets || 0) > 0
  const readyReports = (reports.data || []).filter((report) => report.status === 'ready')

  const recommendedAction = useMemo<RecommendedAction>(() => {
    if (!user?.onboarded) {
      return {
        title: 'Complete your birth profile',
        description: 'Save your birth date, time, and place before using personalized guidance.',
        href: '/onboarding',
        label: 'Complete birth profile',
      }
    }

    if (birthFieldsMissing) {
      return {
        title: 'Complete your birth profile',
        description: 'Birth date, time, and place are required for your Kundali.',
        href: '/profile',
        label: 'Update birth details',
      }
    }

    if (astrologyStale) {
      return {
        title: 'Regenerate your Kundali',
        description: 'Your birth details changed, so chart-based guidance needs to be refreshed.',
        href: '/kundali',
        label: 'Regenerate Kundali',
      }
    }

    if (canonicalKundaliMissing) {
      return {
        title: 'Generate your Kundali',
        description: 'Create your canonical chart before using personalized guidance.',
        href: '/kundali',
        label: 'Generate Kundali',
      }
    }

    if (horoscope.error) {
      return {
        title: 'Retry today’s guidance',
        description: horoscope.error,
        onClick: loadDashboard,
        label: 'Retry guidance',
      }
    }

    if (!tickets.loading && !hasGuruAccess) {
      return {
        title: 'Get Guru access',
        description: 'Add Guru questions or choose a plan when you are ready to ask.',
        href: '/pricing',
        label: 'View Guru access',
      }
    }

    if (!timeline.loading && timeline.data?.status === 'empty') {
      return {
        title: 'Generate your timeline',
        description: 'Create a month-by-month view when you want a longer-range reading.',
        href: '/timeline',
        label: 'Open Timeline',
      }
    }

    if (!reports.loading && readyReports.length === 0) {
      return {
        title: 'Generate a report',
        description: 'Save a Kundali, prediction, or timeline report to your account.',
        href: '/reports',
        label: 'Open Reports',
      }
    }

    return {
      title: 'Ask Guru about your current Dasha',
      description: 'Use your saved Kundali context for a focused question.',
      href: '/guru?prompt=current-dasha',
      label: 'Ask Guru',
    }
  }, [
    astrologyStale,
    birthFieldsMissing,
    canonicalKundaliMissing,
    hasGuruAccess,
    horoscope.error,
    loadDashboard,
    readyReports.length,
    reports.loading,
    tickets.loading,
    timeline.data?.status,
    timeline.loading,
    user?.onboarded,
  ])

  if (!user) {
    return (
      <DashboardPageShell
        title="Dashboard"
        subtitle="Restoring your JyotiAI session."
      >
        <div className="rounded-xl border border-border bg-card p-6">
          <LoadingState
            title="Opening Dashboard"
            description="Restoring your JyotiAI workspace."
          />
        </div>
      </DashboardPageShell>
    )
  }

  const displayName = user.name || summary.data?.user.name || 'there'
  const dashaLabel = summary.data?.dasha
    ? [summary.data.dasha.mahadasha?.planet, summary.data.dasha.antardasha?.planet]
        .filter(Boolean)
        .join(' / ')
    : null
  const kundaliIdentity = {
    rashi: firstDisplayValue(summary.data?.user.rashi, user.rashi, user.rashiMoon),
    lagna: firstDisplayValue(summary.data?.user.lagna, user.ascendant),
    nakshatra: firstNakshatraValue(summary.data?.user.nakshatra, user.nakshatra),
    mahadasha: summary.data?.dasha?.mahadasha?.planet || null,
    antardasha: summary.data?.dasha?.antardasha?.planet || null,
    place: user.pob || null,
    freshness: astrologyStale ? 'Stale' : summary.data?.kundali.available ? 'Current' : 'Missing',
  }

  return (
    <DashboardPageShell
      title={`Namaste, ${displayName}`}
      subtitle={formatDate()}
      rightActions={
        notifications.data?.unreadCount ? (
          <Link href="/notifications">
            <Button variant="outline" iconLeft={<Bell className="h-4 w-4" />}>
              {notifications.data.unreadCount} unread
            </Button>
          </Link>
        ) : null
      }
    >
      <div className="grid gap-6">
        <Card className="border-[#D8B56A]/35 bg-[#07131F] text-[#FFF7E8] shadow-[0_20px_60px_rgba(7,19,31,0.18)]">
          <CardContent className="grid gap-6 pt-6 md:grid-cols-[1fr_auto] md:items-center">
            <div>
              <Badge className="border-[#C9A24A]/35 bg-[#F28C28]/12 text-[#F1C979]">Solar Observatory</Badge>
              <h2 className="mt-4 font-heading text-3xl font-semibold text-[#FFF7E8] md:text-4xl">
                Your chart-led day, organized.
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-[#B9C2BF]">
                Dashboard reads current Kundali, horoscope, timeline, reports, and access state without creating new background renderers.
              </p>
            </div>
            <div className="hidden h-28 w-28 items-center justify-center rounded-full border border-[#D8B56A]/30 bg-[#F28C28]/12 md:flex">
              <Sun className="h-10 w-10 text-[#F1C979]" aria-hidden="true" />
            </div>
          </CardContent>
        </Card>

        <TodayCard
          horoscope={horoscope}
          onRetry={loadDashboard}
          kundaliBlocked={todayGuidanceBlocked}
        />

        <Card>
          <CardHeader>
            <CardTitle className="font-heading text-xl font-semibold text-[#17222c]">Recommended next action</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="font-medium text-[#17222c]">{recommendedAction.title}</p>
              <p className="mt-1 text-sm text-muted-foreground">{recommendedAction.description}</p>
            </div>
            {recommendedAction.href ? (
              <Link href={recommendedAction.href}>
                <Button iconRight={<ArrowRight className="h-4 w-4" />}>{recommendedAction.label}</Button>
              </Link>
            ) : (
              <Button onClick={recommendedAction.onClick} iconLeft={<RefreshCw className="h-4 w-4" />}>
                {recommendedAction.label}
              </Button>
            )}
          </CardContent>
        </Card>

        <div className="grid gap-6 lg:grid-cols-[0.9fr_1fr]">
          <div className="lg:order-2">
            <GuruLauncher hasAccess={hasGuruAccess} loading={tickets.loading} />
          </div>
          <div className="lg:order-1">
            <KundaliIdentityCard identity={kundaliIdentity} dashaLabel={dashaLabel} />
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <PreviewCard
            title="Predictions"
            description="Open your prediction hub for deeper forecasts."
            href="/predictions"
            cta="View predictions"
            icon={<ScrollText className="h-5 w-5" />}
          />
          <TimelinePreview timeline={timeline} />
          <ReportsPreview reports={reports} />
        </div>

        <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <PlanUsage tickets={tickets} />
          <MoreInsights festival={festival.data} />
        </div>
      </div>
    </DashboardPageShell>
  )
}

function TodayCard({
  horoscope,
  onRetry,
  kundaliBlocked,
}: {
  horoscope: RequestState<HoroscopeData>
  onRetry: () => void
  kundaliBlocked: boolean
}) {
  if (kundaliBlocked) {
    return (
      <Card>
        <EmptyState
          title="Today’s guidance needs your current Kundali"
          description="Complete or refresh your birth chart before JyotiAI can show personalized daily guidance."
          action={
            <Link href="/kundali">
              <Button>Open Kundali</Button>
            </Link>
          }
        />
      </Card>
    )
  }

  if (horoscope.loading) {
    return (
      <Card>
        <LoadingState title="Loading today’s guidance" description="Reading your saved Kundali context." />
      </Card>
    )
  }

  if (horoscope.error || !horoscope.data) {
    return (
      <Card>
        <ErrorState
          title="Today’s guidance is unavailable"
          description={horoscope.error || 'Please retry.'}
          action={<RetryButton onClick={onRetry} />}
        />
      </Card>
    )
  }

  const today = horoscope.data
  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div>
            <Badge variant="premium">Rashi used: {today.rashi}</Badge>
            <CardTitle className="mt-3 font-heading text-xl font-semibold text-[#17222c]">Today’s guidance</CardTitle>
          </div>
          <Badge variant="secondary">{today.date}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <p className="text-lg leading-8 text-primary">{today.general}</p>
        <div className="grid gap-4 md:grid-cols-2">
          {[
            ['Career', today.career],
            ['Love', today.love],
            ['Money', today.money],
            ['Health', today.health],
          ].map(([label, value]) => (
            <div key={label} className="rounded-lg border border-border bg-secondary/50 p-4">
              <p className="text-sm font-semibold text-primary">{label}</p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{value}</p>
            </div>
          ))}
        </div>
        <div className="grid gap-3 md:grid-cols-3">
          <InfoPill label="Lucky color" value={today.luckyColor} />
          <InfoPill label="Lucky number" value={String(today.luckyNumber)} />
          <InfoPill label="Energy level" value={today.energyLevel} />
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <ListBlock title="Do" items={today.dos} />
          <ListBlock title="Avoid" items={today.donts} />
        </div>
      </CardContent>
    </Card>
  )
}

function InfoPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-surface-raised p-4">
      <p className="text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">{label}</p>
      <p className="mt-1 font-medium capitalize text-primary">{value}</p>
    </div>
  )
}

function ListBlock({ title, items }: { title: string; items: string[] }) {
  if (!items?.length) return null
  return (
    <div>
      <p className="mb-2 text-sm font-semibold text-primary">{title}</p>
      <ul className="space-y-2 text-sm text-muted-foreground">
        {items.map((item) => (
          <li key={item} className="rounded-lg bg-secondary/50 px-3 py-2">
            {item}
          </li>
        ))}
      </ul>
    </div>
  )
}

function KundaliIdentityCard({
  identity,
  dashaLabel,
}: {
  identity: Record<string, string | null>
  dashaLabel: string | null
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-heading text-xl font-semibold text-[#17222c]">Kundali identity</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <IdentityRow label="Rashi / Moon sign" value={identity.rashi} />
        <IdentityRow label="Lagna" value={identity.lagna} />
        <IdentityRow label="Nakshatra" value={identity.nakshatra} />
        <IdentityRow label="Current Dasha" value={dashaLabel} />
        <IdentityRow label="Birth place" value={identity.place} />
        <div className="pt-2">
          <Badge variant={identity.freshness === 'Current' ? 'success' : 'warning'}>
            {identity.freshness}
          </Badge>
        </div>
      </CardContent>
    </Card>
  )
}

function IdentityRow({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-border/70 pb-3 last:border-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-right text-sm font-medium text-[#17222c]">{value || 'Not available'}</span>
    </div>
  )
}

function GuruLauncher({ hasAccess, loading }: { hasAccess: boolean; loading: boolean }) {
  const prompts = [
    'Ask about my current Dasha',
    'What should I focus on today?',
    'Ask about career',
    'Ask about relationships',
  ]
  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-heading text-xl font-semibold text-[#17222c]">Ask Guru</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm leading-6 text-muted-foreground">
          Open the full Guru page with your saved Kundali context. Tickets are used only after you submit a question.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {prompts.map((prompt) => (
            <Link key={prompt} href={`/guru?prompt=${encodeURIComponent(prompt)}`}>
              <Badge clickable variant="outline">
                {prompt}
              </Badge>
            </Link>
          ))}
        </div>
        <div className="mt-5">
          {loading || hasAccess ? (
            <Link href="/guru">
              <Button iconRight={<ArrowRight className="h-4 w-4" />}>Open Guru</Button>
            </Link>
          ) : (
            <Link href="/pricing">
              <Button variant="outline">Get Guru access</Button>
            </Link>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

function PreviewCard({
  title,
  description,
  href,
  cta,
  icon,
}: {
  title: string
  description: string
  href: string
  cta: string
    icon: ReactNode
  }) {
  return (
    <Card>
      <CardContent className="space-y-4 pt-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary text-primary">
          {icon}
        </div>
        <div>
          <h3 className="font-heading text-xl font-semibold text-[#17222c]">{title}</h3>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p>
        </div>
        <Link href={href}>
          <Button variant="outline" fullWidth>
            {cta}
          </Button>
        </Link>
      </CardContent>
    </Card>
  )
}

function TimelinePreview({ timeline }: { timeline: RequestState<TimelineState> }) {
  const status = timeline.loading ? 'Loading' : timeline.data?.status || 'Unavailable'
  const message =
    timeline.data?.status === 'ready'
      ? 'Your timeline is ready.'
      : timeline.data?.message || 'Generate your timeline when you want a longer-range view.'
  return (
    <PreviewCard
      title={`Timeline: ${status}`}
      description={message}
      href="/timeline"
      cta={timeline.data?.status === 'ready' ? 'Open timeline' : 'Manage timeline'}
      icon={<CalendarDays className="h-5 w-5" />}
    />
  )
}

function ReportsPreview({ reports }: { reports: RequestState<ReportRecord[]> }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-heading text-xl font-semibold text-[#17222c]">Latest reports</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {reports.loading && <LoadingState title="Loading reports" description="Checking your saved report library." />}
        {!reports.loading && reports.error && (
          <ErrorState title="Reports unavailable" description={reports.error} />
        )}
        {!reports.loading && !reports.error && (reports.data?.length || 0) === 0 && (
          <EmptyState
            title="No reports yet"
            description="Generated reports will stay in your account for later."
            action={
              <Link href="/reports">
                <Button variant="outline">Generate report</Button>
              </Link>
            }
          />
        )}
        {(reports.data || []).slice(0, 2).map((report) => (
          <Link
            key={report.reportId}
            href={report.status === 'ready' ? `/reports/${report.reportId}` : '/reports'}
            className="block rounded-lg border border-border bg-secondary/40 p-4 transition-colors hover:bg-secondary"
          >
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="font-medium text-[#17222c]">{report.title}</p>
                <p className="mt-1 text-xs text-muted-foreground">{reportTypeLabel(report.type)}</p>
              </div>
              <Badge variant={report.status === 'ready' ? 'success' : report.status === 'failed' ? 'error' : 'warning'}>
                {report.status}
              </Badge>
            </div>
          </Link>
        ))}
      </CardContent>
    </Card>
  )
}

function PlanUsage({ tickets }: { tickets: RequestState<TicketSummary> }) {
  const data = tickets.data
  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-heading text-xl font-semibold text-[#17222c]">Plan and usage</CardTitle>
      </CardHeader>
      <CardContent>
        {tickets.loading && <LoadingState title="Loading access" description="Checking your plan." />}
        {!tickets.loading && tickets.error && <ErrorState title="Access unavailable" description={tickets.error} />}
        {data && (
          <div className="space-y-4">
            <Badge variant={data.hasSubscription ? 'success' : 'secondary'}>
              {data.hasSubscription ? 'Included in your plan' : 'Ticket access'}
            </Badge>
            {!data.hasSubscription && (
              <div className="grid grid-cols-3 gap-3">
                <InfoPill label="Guru" value={String(data.tickets.aiGuruTickets || 0)} />
                <InfoPill label="Kundali" value={String(data.tickets.kundaliTickets || 0)} />
                <InfoPill label="Predictions" value={String(data.tickets.lifetimePredictions || 0)} />
              </div>
            )}
            <Link href="/payments">
              <Button variant="outline">Manage plan</Button>
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function MoreInsights({ festival }: { festival: any }) {
  const groups = [
    { title: 'Spiritual', links: [['Rituals', '/rituals'], ['Calendar', '/calendar']] },
  ]
  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-heading text-xl font-semibold text-[#17222c]">More insights</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        {festival?.festival && (
          <div className="rounded-lg border border-jyoti-gold/30 bg-jyoti-gold/10 p-4">
            <p className="text-sm font-semibold text-[#17222c]">{festival.festival.name}</p>
            <p className="mt-1 text-sm text-muted-foreground">Today’s festival is available in your calendar context.</p>
          </div>
        )}
        <div className="grid gap-4 md:grid-cols-2">
          {groups.map((group) => (
            <div key={group.title}>
              <p className="text-sm font-semibold text-[#17222c]">{group.title}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {group.links.map(([label, href]) => (
                  <Link key={href} href={href}>
                    <Badge variant="outline" clickable>
                      {label}
                    </Badge>
                  </Link>
                ))}
              </div>
            </div>
          ))}
          <div>
            <p className="text-sm font-semibold text-[#17222c]">Personal insights</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {[
                ['Career', '/career'],
                ['Business', '/business'],
                ['Compatibility', '/compatibility'],
                ['Numerology', '/numerology'],
                ['Palmistry', '/palmistry'],
                ['Aura', '/aura'],
                ['Face', '/face'],
              ].map(([label, href]) => (
                <Link key={href} href={href}>
                  <Badge variant="outline" clickable>
                    {label}
                  </Badge>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
