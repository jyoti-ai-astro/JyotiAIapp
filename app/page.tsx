'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import {
  ArrowRight,
  CalendarDays,
  FileText,
  LockKeyhole,
  MessageCircle,
  Orbit,
  ShieldCheck,
  Sparkle,
  Sun,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Section } from '@/components/ui/section';
import { SolarJyotiMark } from '@/src/ui/brand/SolarJyotiMark';
import { useUserStore } from '@/store/user-store';
import type { LucideIcon } from 'lucide-react';

const SolarObservatoryScene = dynamic(() => import('@/components/home/SolarObservatoryScene'), {
  ssr: false,
  loading: () => null,
});

const guidanceFeatures: Array<{
  title: string;
  description: string;
  icon: LucideIcon;
}> = [
  {
    title: 'Guru',
    description: 'Ask focused questions using saved chart and Dasha context when available.',
    icon: MessageCircle,
  },
  {
    title: 'Predictions',
    description: 'Generate deeper forecasts from the same verified astrology context.',
    icon: Sparkle,
  },
  {
    title: 'Timeline',
    description: 'Create longer-range guidance without switching to a local mock engine.',
    icon: CalendarDays,
  },
  {
    title: 'Reports',
    description: 'Persist Kundali, prediction, and timeline reports for later access.',
    icon: FileText,
  },
];

function useCanUseHeroScene() {
  const [canUseScene, setCanUseScene] = useState(false);

  useEffect(() => {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const mobile = window.matchMedia('(max-width: 767px)');

    const update = () => {
      setCanUseScene(!reducedMotion.matches && !mobile.matches);
    };

    update();
    reducedMotion.addEventListener('change', update);
    mobile.addEventListener('change', update);

    return () => {
      reducedMotion.removeEventListener('change', update);
      mobile.removeEventListener('change', update);
    };
  }, []);

  return canUseScene;
}

function StaticSolarFallback() {
  return (
    <div className="absolute inset-0" aria-hidden="true">
      <div className="absolute left-1/2 top-1/2 h-[19rem] w-[19rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,#fff7c4_0_14%,#ffd980_25%,#f28c28_51%,transparent_70%)] shadow-[0_0_4rem_rgba(242,140,40,0.28),0_0_12rem_rgba(201,162,74,0.18)] md:h-[24rem] md:w-[24rem]" />
      <div className="absolute left-1/2 top-1/2 h-[28rem] w-[28rem] -translate-x-1/2 -translate-y-1/2 rotate-[-14deg] rounded-full border border-[#D8B56A]/30 [transform:translate(-50%,-50%)_rotate(-14deg)_scaleY(0.42)] md:h-[36rem] md:w-[36rem]" />
      <div className="absolute left-1/2 top-1/2 h-[21rem] w-[21rem] -translate-x-1/2 -translate-y-1/2 rotate-12 border border-[#FFF8E6]/10 [clip-path:polygon(50%_0,93%_25%,93%_75%,50%_100%,7%_75%,7%_25%)] md:h-[28rem] md:w-[28rem]" />
      <div className="absolute left-[72%] top-[42%] h-3 w-3 rounded-full bg-[#C9A24A] shadow-[0_0_1.5rem_rgba(242,140,40,0.6)]" />
      <div className="absolute left-[28%] top-[65%] h-2 w-2 rounded-full bg-[#2F7D7E]" />
    </div>
  );
}

function SolarHeroVisual() {
  const canUseScene = useCanUseHeroScene();

  return (
    <div className="relative min-h-[22rem] overflow-hidden rounded-lg border border-[#D8B56A]/22 bg-[#07131F] md:min-h-[34rem]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_16%,rgba(242,140,40,0.2),transparent_22rem),radial-gradient(circle_at_18%_76%,rgba(47,125,126,0.16),transparent_20rem)]" />
      <StaticSolarFallback />
      {canUseScene && (
        <div className="absolute inset-0 hidden md:block">
          <SolarObservatoryScene />
        </div>
      )}
      <div className="absolute inset-x-6 bottom-6 rounded-lg border border-[#FFF8E6]/12 bg-[#07131F]/68 p-4 backdrop-blur">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#F1C979]">Solar Observatory</p>
        <p className="mt-2 text-sm leading-6 text-[#B9C2BF]">
          A restrained celestial system: solar core, orbiting planets, sacred geometry, and star depth.
        </p>
      </div>
    </div>
  );
}

export default function HomePage() {
  const { user } = useUserStore();
  const isLoggedIn = Boolean(user);
  const birthProfileMissing = isLoggedIn && (!user?.onboarded || !user?.dob || !user?.tob || !user?.pob);
  const astrologyStale = user?.derivedAstrologyStatus === 'stale';

  const primaryCta = birthProfileMissing
    ? { href: '/onboarding', label: 'Complete birth profile' }
    : astrologyStale
      ? { href: '/kundali', label: 'Refresh my Kundali' }
      : isLoggedIn
        ? { href: '/dashboard', label: 'Open today' }
        : { href: '/onboarding', label: 'Get my free reading' };

  return (
    <main className="relative overflow-hidden">
      <section className="relative bg-[#07131F] text-[#FFF7E8]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_78%_10%,rgba(242,140,40,0.18),transparent_24rem),radial-gradient(circle_at_12%_28%,rgba(47,125,126,0.18),transparent_24rem)]" />
        <div className="page-container relative grid min-h-[calc(100svh-6rem)] items-center gap-10 py-12 md:grid-cols-[0.92fr_1.08fr] md:py-16">
          <div className="max-w-3xl">
            <Badge className="border-[#C9A24A]/35 bg-[#F28C28]/12 text-[#F1C979]">JyotiAI Solar Observatory</Badge>
            <h1 className="mt-5 max-w-4xl font-heading text-5xl font-semibold leading-[0.98] text-[#FFF7E8] md:text-7xl">
              Vedic guidance from the chart you were born with.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-[#B9C2BF]">
              JyotiAI turns your verified birth profile and Kundali into practical guidance for today,
              longer timelines, reports, and questions with Guru.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href={primaryCta.href}>
                <Button
                  size="lg"
                  className="bg-[#F28C28] text-[#07131F] hover:bg-[#F28C28]/90"
                  iconRight={<ArrowRight className="h-4 w-4" />}
                >
                  {primaryCta.label}
                </Button>
              </Link>
              <Link href="/guru">
                <Button
                  variant="outline"
                  size="lg"
                  className="border-[#D8B56A]/35 bg-[#FFF8E6]/8 text-[#FFF7E8] hover:bg-[#FFF8E6]/14"
                >
                  Ask Guru
                </Button>
              </Link>
            </div>
            <div className="mt-8 grid gap-3 text-sm text-[#B9C2BF] sm:grid-cols-3">
              {['First basic Kundali during onboarding', 'Verified birth location required', 'Saved reports for later'].map((item) => (
                <div key={item} className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-[#C9A24A]" aria-hidden="true" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
          <SolarHeroVisual />
        </div>
      </section>

      <Section
        eyebrow="What JyotiAI is"
        title="A personal Vedic observatory, not a generic horoscope feed."
        description="Your account keeps the key pieces together: verified birth details, canonical Kundali, daily guidance, Guru, predictions, timeline, and saved reports."
      >
        <div className="grid gap-4 md:grid-cols-3">
          {[
            ['Verified birth profile', 'Date, time, place, coordinates, and timezone are checked before personalized astrology runs.'],
            ['Canonical Kundali', 'Dashboard, Guru, Timeline, Predictions, Horoscope, and Reports read from the same chart source.'],
            ['Clear product state', 'If birth details change, stale guidance is marked clearly until the chart is refreshed.'],
          ].map(([title, description]) => (
            <Card key={title}>
              <CardContent className="pt-6">
                <SolarJyotiMark className="mb-4 h-7 w-7 text-saffron" mono />
                <h3 className="font-heading text-xl font-semibold text-primary">{title}</h3>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">{description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </Section>

      <section className="bg-[#07131F] py-16 text-[#FFF7E8] md:py-24">
        <div className="page-container py-0">
          <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#F1C979]">How guidance becomes personal</p>
              <h2 className="mt-3 font-heading text-4xl font-semibold leading-tight md:text-5xl">
                Kundali is the source, not a decorative add-on.
              </h2>
              <p className="mt-5 leading-8 text-[#B9C2BF]">
                JyotiAI uses chart-derived context only when the canonical Kundali is present and current. That keeps personalized answers tied to your saved birth data.
              </p>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {guidanceFeatures.map(({ title, description, icon: DisplayIcon }) => {
                return (
                  <div key={title} className="rounded-lg border border-[#D8B56A]/22 bg-[#FFF8E6]/7 p-5">
                    <DisplayIcon className="h-5 w-5 text-[#F28C28]" aria-hidden="true" />
                    <h3 className="mt-4 font-heading text-2xl text-[#FFF7E8]">{title}</h3>
                    <p className="mt-2 text-sm leading-6 text-[#B9C2BF]">{description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <Section
        eyebrow="Product flow"
        title="Start with a free chart, then choose what to go deeper on."
        description="The first basic Kundali generated during onboarding is free once. Regeneration and premium requests use the normal access path."
      >
        <div className="grid gap-4 md:grid-cols-4">
          {[
            ['1', 'Create your birth profile'],
            ['2', 'Generate your first Kundali'],
            ['3', 'Read today and ask Guru'],
            ['4', 'Save reports or generate timeline'],
          ].map(([step, title]) => (
            <Card key={step}>
              <CardContent className="pt-6">
                <Badge className="border-[#C9A24A]/35 bg-[#F28C28]/12 text-primary">{step}</Badge>
                <p className="mt-4 font-medium text-primary">{title}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </Section>

      <section className="relative overflow-hidden bg-[#FFF8E6] py-16 md:py-24">
        <div className="absolute left-[-8rem] top-8 h-64 w-64 rounded-full border border-[#D8B56A]/35" aria-hidden="true" />
        <div className="absolute right-[-10rem] bottom-10 h-80 w-80 rounded-full border border-[#2F7D7E]/20" aria-hidden="true" />
        <div className="page-container relative py-0">
          <div className="grid gap-6 lg:grid-cols-[1fr_0.9fr] lg:items-center">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#8E581D]">Trust and privacy</p>
              <h2 className="mt-3 font-heading text-4xl font-semibold leading-tight text-[#07131F] md:text-5xl">
                Personalized does not mean careless.
              </h2>
              <p className="mt-5 max-w-2xl leading-8 text-[#56666A]">
                Birth details are treated as account data. Personalized Guru, Timeline, Predictions, Horoscope, and Reports require current verified astrology state instead of guessed or fallback charts.
              </p>
            </div>
            <Card>
              <CardContent className="space-y-4 pt-6">
                {[
                  ['No mock birth chart guidance', 'Personalized flows require the canonical Kundali.'],
                  ['Stale state is visible', 'Birth-data changes mark chart-derived surfaces stale.'],
                  ['Reports persist', 'Launch reports are saved to your account for later open/download.'],
                ].map(([title, description]) => (
                  <div key={title} className="flex gap-4 rounded-lg border border-border bg-secondary/35 p-4">
                    <LockKeyhole className="mt-1 h-5 w-5 shrink-0 text-teal" aria-hidden="true" />
                    <div>
                      <p className="font-medium text-primary">{title}</p>
                      <p className="mt-1 text-sm leading-6 text-muted-foreground">{description}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <Section eyebrow="Plans" title="Begin with onboarding. Add access only when you need it.">
        <Card className="border-[#C9A24A]/45 bg-[linear-gradient(135deg,#FFFDF4_0%,#F5EAD0_100%)]">
          <CardContent className="flex flex-col gap-5 pt-6 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="flex items-center gap-3">
                <Sun className="h-6 w-6 text-saffron" aria-hidden="true" />
                <h2 className="font-heading text-3xl font-semibold text-primary">Get your first reading from your real chart.</h2>
              </div>
              <p className="mt-3 max-w-2xl text-muted-foreground">
                Use JyotiAI when you want practical Vedic guidance, not another generic AI chat surface.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link href={primaryCta.href}>
                <Button iconRight={<ArrowRight className="h-4 w-4" />}>{primaryCta.label}</Button>
              </Link>
              <Link href="/pricing">
                <Button variant="outline">View pricing</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </Section>

      <Section eyebrow="Questions" title="Straight answers before you begin.">
        <div className="grid gap-4 md:grid-cols-2">
          {[
            ['What powers JyotiAI?', 'A verified birth profile and canonical Kundali power personalized surfaces across the product.'],
            ['What is free?', 'The first basic Kundali generated during onboarding is free once for Launch v1.'],
            ['When should I use Guru?', 'Use Guru for questions that need context from your chart, Dasha, and current guidance.'],
            ['What happens if birth details change?', 'JyotiAI marks derived astrology stale and asks you to refresh before using personalized guidance.'],
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

      <div className="pointer-events-none fixed bottom-8 right-8 hidden text-[#C9A24A]/20 md:block" aria-hidden="true">
        <Orbit className="h-24 w-24" />
      </div>
    </main>
  );
}
