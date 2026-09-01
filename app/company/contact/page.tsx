'use client';

export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { ArrowRight, Mail, MessageCircle, ShieldCheck } from 'lucide-react';
import CompanyPageShell from '@/src/ui/layout/CompanyPageShell';

const channels = [
  {
    icon: MessageCircle,
    title: 'Product & account support',
    copy: 'Questions about your account, onboarding, access or product experience.',
    email: 'support@jyotiai.in',
  },
  {
    icon: ShieldCheck,
    title: 'Privacy & data requests',
    copy: 'Questions about personal data, privacy or account-data requests.',
    email: 'privacy@jyotiai.in',
  },
  {
    icon: Mail,
    title: 'Security reports',
    copy: 'Responsible reports about a suspected security issue or vulnerability.',
    email: 'security@jyotiai.in',
  },
];

export default function ContactPage() {
  return (
    <CompanyPageShell
      eyebrow="Contact"
      title={<>Talk to the <span className="text-[#efaa4f]">right JyotiAI channel.</span></>}
      description="Choose the contact route that matches your request. We do not display fabricated live-user activity, fake availability signals or simulated customer presence."
    >
      <section className="grid gap-4 md:grid-cols-3">
        {channels.map(({ icon: Icon, title, copy, email }) => (
          <article key={email} className="flex min-h-[300px] flex-col rounded-[28px] border border-[#d9b75f]/18 bg-[#07131f]/76 p-7">
            <Icon className="h-6 w-6 text-[#efaa4f]" aria-hidden="true" />
            <h2 className="mt-6 font-heading text-2xl text-[#fff6df]">{title}</h2>
            <p className="mt-3 flex-1 leading-7 text-[#9eaaa6]">{copy}</p>
            <a href={`mailto:${email}`} className="mt-7 inline-flex items-center gap-2 text-sm font-semibold text-[#e7c772] hover:text-[#fff6df]">
              {email} <ArrowRight className="h-4 w-4" />
            </a>
          </article>
        ))}
      </section>

      <section className="grid gap-5 rounded-[32px] border border-white/[0.07] bg-[#041016]/72 p-7 md:grid-cols-[1.2fr_.8fr] md:p-10">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#e7c772]">Before you contact us</p>
          <h2 className="mt-3 font-heading text-3xl text-[#fff6df]">Include enough context for us to identify the issue without sharing unnecessary secrets.</h2>
          <p className="mt-4 max-w-2xl leading-7 text-[#9eaaa6]">For account issues, include the email address associated with the account and a concise description. Never email passwords, API keys, payment-card details or private authentication tokens.</p>
        </div>
        <div className="flex items-center md:justify-end">
          <Link href="/support" className="inline-flex min-h-12 items-center gap-2 rounded-full bg-[#ff982d] px-6 font-semibold text-[#081017] transition hover:bg-[#ffad4f]">Open Help Center <ArrowRight className="h-4 w-4" /></Link>
        </div>
      </section>
    </CompanyPageShell>
  );
}
