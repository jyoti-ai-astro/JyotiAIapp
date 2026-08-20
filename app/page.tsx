'use client'

import Link from 'next/link'
import {
  ArrowRight,
  CalendarDays,
  FileText,
  MessageCircle,
  MoonStar,
  ShieldCheck,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Section } from '@/components/ui/section'
import { useUserStore } from '@/store/user-store'

function SacredGeometryMark() {
  return (
    <div className="relative mx-auto aspect-square w-full max-w-[420px]">
      <div className="absolute inset-4 rounded-full border border-jyoti-gold/50" />
      <div className="absolute inset-14 rounded-full border border-primary/20" />
      <div className="absolute left-1/2 top-1/2 h-[72%] w-[72%] -translate-x-1/2 -translate-y-1/2 rotate-45 border border-saffron/30" />
      <div className="absolute left-1/2 top-1/2 h-[52%] w-[52%] -translate-x-1/2 -translate-y-1/2 rotate-12 border border-jyoti-lotus/20" />
      <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle,hsl(var(--jyoti-gold)/0.18),transparent_62%)]" />
      <div className="absolute left-1/2 top-1/2 flex h-28 w-28 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-jyoti-gold/40 bg-surface-raised text-primary shadow-[0_16px_40px_rgba(24,33,63,0.12)]">
        <MoonStar className="h-10 w-10" aria-hidden="true" />
      </div>
    </div>
  )
}

export default function HomePage() {
  const { user } = useUserStore()
  const isLoggedIn = Boolean(user)
  const birthProfileMissing = isLoggedIn && (!user?.onboarded || !user?.dob || !user?.tob || !user?.pob)
  const astrologyStale = user?.derivedAstrologyStatus === 'stale'

  const primaryCta = birthProfileMissing
    ? { href: '/onboarding', label: 'Complete birth profile' }
    : astrologyStale
      ? { href: '/kundali', label: 'Refresh my Kundali' }
      : isLoggedIn
        ? { href: '/dashboard', label: 'Open today’s guidance' }
        : { href: '/onboarding', label: 'Create my birth profile' }

  return (
    <main className="relative">
      <section className="page-container grid min-h-[calc(100vh-6rem)] items-center gap-10 py-12 md:grid-cols-[1.05fr_0.95fr] md:py-16">
        <div className="max-w-3xl">
          <Badge variant="premium">Vedic astrology, calmly organized</Badge>
          <h1 className="mt-5 font-heading text-4xl font-semibold leading-tight text-primary md:text-6xl">
            Personal Vedic guidance, built from your birth details.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">
            JyotiAI brings your Kundali, daily guidance, saved reports, and Guru questions into one
            simple account experience.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href={primaryCta.href}>
              <Button size="lg" iconRight={<ArrowRight className="h-4 w-4" />}>
                {primaryCta.label}
              </Button>
            </Link>
            <Link href={isLoggedIn ? '/guru' : '/guru'}>
              <Button variant="outline" size="lg">
                Ask the Guru
              </Button>
            </Link>
          </div>
        </div>
        <SacredGeometryMark />
      </section>

      <Section
        eyebrow="Birth profile"
        title="Start with the details your chart depends on."
        description="Your date, time, and place of birth establish the chart context used across JyotiAI."
      >
        <div className="grid gap-4 md:grid-cols-3">
          {[
            ['Birth details', 'Save date, time, and location in your account.'],
            ['Kundali generation', 'Create the canonical Kundali used by the product.'],
            ['Current state', 'If birth details change, chart-derived guidance is marked stale.'],
          ].map(([title, description]) => (
            <Card key={title}>
              <CardContent className="pt-6">
                <h3 className="font-heading text-xl font-semibold text-primary">{title}</h3>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">{description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </Section>

      <Section
        eyebrow="Today"
        title="Understand today through your Vedic birth chart."
        description="Daily guidance is shown from the real horoscope service when your Kundali is current."
      >
        <Card>
          <CardContent className="grid gap-6 pt-6 md:grid-cols-[1fr_0.8fr] md:items-center">
            <div>
              <h3 className="font-heading text-2xl font-semibold text-primary">A focused daily view</h3>
              <p className="mt-3 leading-7 text-muted-foreground">
                See general guidance plus career, relationships, money, health, lucky color,
                lucky number, energy level, and practical dos and don’ts where available.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {['Career', 'Love', 'Money', 'Health'].map((item) => (
                <div key={item} className="rounded-lg border border-border bg-secondary/50 p-4 text-sm font-medium text-primary">
                  {item}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </Section>

      <Section eyebrow="Guru" title="Ask questions with your saved chart context.">
        <div className="grid gap-6 md:grid-cols-[0.9fr_1.1fr]">
          <Card>
            <CardHeader>
              <CardTitle>Guru preview</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="leading-7 text-muted-foreground">
                Guru is the full conversational experience. When your Kundali is available, it can use
                saved chart context for personalized questions.
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                {['Current Dasha', 'Career focus', 'Relationships', 'Today’s priorities'].map((chip) => (
                  <Badge key={chip} variant="outline">
                    {chip}
                  </Badge>
                ))}
              </div>
              <Link href="/guru" className="mt-6 inline-block">
                <Button variant="outline" iconRight={<MessageCircle className="h-4 w-4" />}>
                  Open Guru
                </Button>
              </Link>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Kundali preview</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="leading-7 text-muted-foreground">
                JyotiAI keeps canonical Kundali data in one place so Dashboard, Timeline, Guru, and
                reports can read the same chart-derived state.
              </p>
              <Link href="/kundali" className="mt-6 inline-block">
                <Button>View Kundali</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </Section>

      <Section
        eyebrow="Saved guidance"
        title="Predictions, timeline, and reports stay organized."
        description="Launch v1 keeps these as separate full pages, with Dashboard showing only status-aware previews."
      >
        <div className="grid gap-4 md:grid-cols-3">
          {[
            ['Predictions', 'Open deeper category forecasts when you want more than today.'],
            ['Timeline', 'Generate a longer-range view from current chart context.'],
            ['Reports', 'Persist generated reports to your account for later download.'],
          ].map(([title, description]) => (
            <Card key={title}>
              <CardContent className="pt-6">
                <FileText className="mb-4 h-6 w-6 text-saffron" aria-hidden="true" />
                <h3 className="font-heading text-xl font-semibold text-primary">{title}</h3>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">{description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </Section>

      <Section eyebrow="How it works" title="A simple astrology-first flow.">
        <div className="grid gap-4 md:grid-cols-4">
          {[
            ['1', 'Create your birth profile'],
            ['2', 'Generate your Kundali'],
            ['3', 'Read today’s guidance'],
            ['4', 'Ask Guru or save reports'],
          ].map(([step, title]) => (
            <Card key={step}>
              <CardContent className="pt-6">
                <Badge variant="secondary">{step}</Badge>
                <p className="mt-4 font-medium text-primary">{title}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </Section>

      <Section eyebrow="Trust" title="Clear about what JyotiAI uses.">
        <div className="grid gap-4 md:grid-cols-2">
          {[
            ['Chart fields', 'Rashi, Lagna, Nakshatra, and Dasha fields may be used where available.'],
            ['Saved context', 'Guru may use your saved Kundali context for personalized questions.'],
            ['Reports', 'Launch v1 reports are stored in your account for later access.'],
            ['Payments', 'Paid access and checkout are handled through Razorpay.'],
          ].map(([title, description]) => (
            <div key={title} className="flex gap-4 rounded-xl border border-border bg-card p-5">
              <ShieldCheck className="mt-1 h-5 w-5 shrink-0 text-success" aria-hidden="true" />
              <div>
                <p className="font-medium text-primary">{title}</p>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">{description}</p>
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section eyebrow="Plans" title="Start free, add access when you need more.">
        <Card>
          <CardContent className="flex flex-col gap-5 pt-6 md:flex-row md:items-center md:justify-between">
            <div>
              <h3 className="font-heading text-2xl font-semibold text-primary">Create your birth profile first.</h3>
              <p className="mt-2 text-muted-foreground">
                Paid Guru questions, Kundali regenerations, predictions, timeline, and reports use the canonical entitlement system.
              </p>
            </div>
            <Link href="/pricing">
              <Button variant="outline">View pricing</Button>
            </Link>
          </CardContent>
        </Card>
      </Section>

      <Section eyebrow="FAQ" title="Common questions">
        <div className="grid gap-4 md:grid-cols-2">
          {[
            ['Is the first Kundali free?', 'Yes. The first basic Kundali during onboarding is free once for Launch v1.'],
            ['Can I change birth details?', 'Yes. Changes can mark chart-derived guidance stale until the Kundali is regenerated.'],
            ['Does Guru answer without my Kundali?', 'Personalized Guru guidance requires a current canonical Kundali.'],
            ['Are reports saved?', 'Launch v1 reports are generated into persistent report records in your account.'],
          ].map(([question, answer]) => (
            <Card key={question}>
              <CardContent className="pt-6">
                <h3 className="font-medium text-primary">{question}</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{answer}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </Section>

      <Section>
        <Card className="border-jyoti-gold/40 bg-jyoti-gold/10">
          <CardContent className="flex flex-col gap-5 pt-6 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="font-heading text-3xl font-semibold text-primary">
                Your Kundali, daily guidance, and Guru in one calm place.
              </h2>
              <p className="mt-2 text-muted-foreground">Begin with your birth profile.</p>
            </div>
            <Link href={primaryCta.href}>
              <Button size="lg" iconRight={<CalendarDays className="h-4 w-4" />}>
                {primaryCta.label}
              </Button>
            </Link>
          </CardContent>
        </Card>
      </Section>
    </main>
  )
}
