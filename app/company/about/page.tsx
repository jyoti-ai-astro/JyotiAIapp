'use client';

export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, BookOpen, CircleDot, Orbit, ShieldCheck, Sparkles } from 'lucide-react';
import CompanyPageShell from '@/src/ui/layout/CompanyPageShell';

const principles = [
  {
    icon: CircleDot,
    title: 'Canonical foundation',
    copy: 'JyotiAI begins with saved birth details and a canonical Kundali so connected experiences are built from the same astrological source.',
  },
  {
    icon: Orbit,
    title: 'Living timing',
    copy: 'Dashas, transits, timelines and forecasts should remain connected to the underlying chart instead of becoming isolated readings.',
  },
  {
    icon: Sparkles,
    title: 'Contextual intelligence',
    copy: 'AI is used as an interpretation layer around the user’s astrological context, not as a substitute for the chart or a source of invented personal facts.',
  },
  {
    icon: ShieldCheck,
    title: 'Trust by design',
    copy: 'Account state, paid access and personal astrology context are designed to be verified by the server and handled consistently across the product.',
  },
];

const journey = [
  ['Research & prototyping', 'JyotiAI began as an exploration of how traditional Vedic astrology could be made easier to navigate through modern software.'],
  ['Connected product architecture', 'The product expanded from individual readings into a connected system spanning Kundali, Guru, timing, predictions and saved reports.'],
  ['Celestial OS evolution', 'The experience was redesigned around one verified birth profile and a cinematic interface that keeps the same personal context visible across modules.'],
  ['Pre-launch stabilization', 'Authentication, onboarding, canonical Kundali state, payments, AI resilience and production safety are being hardened before public release.'],
];

export default function AboutPage() {
  return (
    <CompanyPageShell
      eyebrow="About JyotiAI"
      title={<>One chart. <span className="text-[#efaa4f]">A connected Vedic intelligence system.</span></>}
      description="JyotiAI is being built to make serious personal astrology easier to explore without fragmenting the birth chart, timing and guidance into disconnected experiences."
    >
      <section className="grid gap-5 md:grid-cols-2" aria-label="JyotiAI mission and vision">
        <div className="rounded-[28px] border border-[#d9b75f]/20 bg-[#07131f]/78 p-7 md:p-9">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#e7c772]">Mission</p>
          <h2 className="mt-4 font-heading text-3xl text-[#fff6df]">Make personal Vedic astrology coherent, contextual and usable.</h2>
          <p className="mt-5 leading-8 text-[#aab5b2]">We are building a product where verified birth information can power Kundali, timing, questions, predictions and deeper modules through one consistent personal context.</p>
        </div>
        <div className="rounded-[28px] border border-[#4c8988]/25 bg-[#07131f]/78 p-7 md:p-9">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#78aaa8]">Vision</p>
          <h2 className="mt-4 font-heading text-3xl text-[#fff6df]">A trustworthy personal astrology operating system.</h2>
          <p className="mt-5 leading-8 text-[#aab5b2]">Our direction is a connected celestial model that can move from chart to timing to guidance while preserving provenance, account state and the user’s underlying astrological foundation.</p>
        </div>
      </section>

      <section className="py-4">
        <div className="mb-8 max-w-3xl">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#e7c772]">How we build</p>
          <h2 className="mt-3 font-heading text-4xl text-[#fff6df] md:text-5xl">Traditional structure underneath. Modern intelligence above it.</h2>
          <p className="mt-5 text-base leading-8 text-[#aab5b2]">JyotiAI combines astrological calculation and structured product state with modern AI-assisted interpretation. AI outputs are guidance, not guaranteed outcomes, and should remain anchored to the information the product actually knows.</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {principles.map(({ icon: Icon, title, copy }, index) => (
            <motion.article
              key={title}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
              className="rounded-2xl border border-[#d9b75f]/15 bg-[#041016]/70 p-6"
            >
              <Icon className="h-6 w-6 text-[#efaa4f]" aria-hidden="true" />
              <h3 className="mt-5 font-heading text-2xl text-[#fff6df]">{title}</h3>
              <p className="mt-3 leading-7 text-[#9eaaa6]">{copy}</p>
            </motion.article>
          ))}
        </div>
      </section>

      <section className="rounded-[32px] border border-[#d9b75f]/18 bg-[#030b10]/82 p-6 md:p-10">
        <div className="flex items-start gap-4">
          <BookOpen className="mt-1 h-6 w-6 shrink-0 text-[#efaa4f]" aria-hidden="true" />
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#e7c772]">Our journey so far</p>
            <h2 className="mt-3 font-heading text-4xl text-[#fff6df]">A pre-launch product story, not an invented launch history.</h2>
          </div>
        </div>
        <div className="mt-9 grid gap-4 md:grid-cols-2">
          {journey.map(([title, copy], index) => (
            <div key={title} className="relative rounded-2xl border border-white/[0.07] bg-white/[0.025] p-6">
              <span className="text-sm font-semibold text-[#8c7742]">0{index + 1}</span>
              <h3 className="mt-3 font-heading text-2xl text-[#fff6df]">{title}</h3>
              <p className="mt-3 leading-7 text-[#9eaaa6]">{copy}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-[32px] border border-[#efaa4f]/24 bg-[radial-gradient(circle_at_75%_20%,rgba(255,152,45,.13),transparent_24rem),#061016] px-6 py-10 text-center md:px-10 md:py-14">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#e7c772]">Build your own context</p>
        <h2 className="mx-auto mt-4 max-w-3xl font-heading text-4xl text-[#fff6df] md:text-5xl">Your JyotiAI experience starts with your birth profile, not a generic feed.</h2>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/signup" className="inline-flex min-h-12 items-center gap-2 rounded-full bg-[#ff982d] px-6 font-semibold text-[#081017] transition hover:bg-[#ffad4f]">Begin free <ArrowRight className="h-4 w-4" /></Link>
          <Link href="/pricing" className="inline-flex min-h-12 items-center rounded-full border border-[#d9b75f]/30 px-6 text-[#fff6df] transition hover:bg-white/[0.05]">See access options</Link>
        </div>
      </section>
    </CompanyPageShell>
  );
}
