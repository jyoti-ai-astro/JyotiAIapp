import {
  Activity,
  CheckCircle2,
  CircleAlert,
  ExternalLink,
  ServerCog,
  ShieldCheck,
} from 'lucide-react'
import Link from 'next/link'

import CompanyPageShell from '@/src/ui/layout/CompanyPageShell'

const surfaces = [
  {
    name: 'Public website',
    description:
      'Marketing, pricing, company, support and account-entry surfaces.',
    icon: Activity,
  },
  {
    name: 'Account & astrology services',
    description:
      'Authentication, saved birth profile, Kundali and personalized product APIs.',
    icon: ServerCog,
  },
  {
    name: 'AI-assisted experiences',
    description:
      'Guru, predictions, timeline and other generated experiences depend on their configured AI providers.',
    icon: CircleAlert,
  },
]

export default function StatusPage() {
  return (
    <CompanyPageShell
      eyebrow="System status"
      title={
        <>
          JyotiAI service <span className="text-[#efaa4f]">status.</span>
        </>
      }
      description="A transparent pre-launch service overview. We do not publish invented uptime percentages, simulated monitoring results, or a false 'last checked just now' signal."
    >
      <section className="grid gap-4 lg:grid-cols-3">
        {surfaces.map(({ name, description, icon: Icon }) => (
          <article
            key={name}
            className="rounded-[24px] border border-[#d9b75f]/18 bg-[linear-gradient(145deg,rgba(8,22,28,0.96),rgba(4,13,18,0.98))] p-6"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#efaa4f]/25 bg-[#efaa4f]/[0.07] text-[#efaa4f]">
              <Icon className="h-5 w-5" aria-hidden="true" />
            </div>

            <h2 className="mt-5 font-heading text-2xl text-[#fff6df]">
              {name}
            </h2>

            <p className="mt-3 text-sm leading-7 text-[#aab5b2]">
              {description}
            </p>

            <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-[#d9b75f]/18 bg-white/[0.025] px-3 py-1.5 text-xs font-medium text-[#d8dfdc]">
              <CheckCircle2 className="h-4 w-4 text-[#78aaa8]" aria-hidden="true" />
              Pre-launch monitoring
            </div>
          </article>
        ))}
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <article className="rounded-[26px] border border-[#d9b75f]/18 bg-[#07131f]/80 p-6 md:p-7">
          <ShieldCheck className="h-6 w-6 text-[#efaa4f]" aria-hidden="true" />

          <h2 className="mt-5 font-heading text-2xl text-[#fff6df]">
            What this page means
          </h2>

          <p className="mt-3 text-sm leading-7 text-[#aab5b2]">
            JyotiAI is still in launch preparation. Until automated monitoring
            and public incident reporting are connected, this page will not
            claim measured uptime or real-time operational state.
          </p>
        </article>

        <article className="rounded-[26px] border border-[#d9b75f]/18 bg-[#07131f]/80 p-6 md:p-7">
          <ExternalLink className="h-6 w-6 text-[#efaa4f]" aria-hidden="true" />

          <h2 className="mt-5 font-heading text-2xl text-[#fff6df]">
            Need help with your account?
          </h2>

          <p className="mt-3 text-sm leading-7 text-[#aab5b2]">
            Product or account-specific issues belong in the Help Center rather
            than the public status page.
          </p>

          <Link
            href="/support"
            className="mt-5 inline-flex min-h-11 items-center rounded-full bg-[#ef982f] px-5 text-sm font-semibold text-[#081017] transition hover:bg-[#ffad4f]"
          >
            Open Help Center
          </Link>
        </article>
      </section>
    </CompanyPageShell>
  )
}
