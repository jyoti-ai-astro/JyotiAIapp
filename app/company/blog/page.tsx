import Link from 'next/link'
import {
  ArrowRight,
  BookOpen,
  Activity,
  MessageCircle,
  Sparkles,
} from 'lucide-react'

import CompanyPageShell from '@/src/ui/layout/CompanyPageShell'

const themes = [
  {
    title: 'Understanding your chart',
    description:
      'Clear explanations of Kundali structure, birth-data quality, timing and how JyotiAI connects them.',
    icon: Activity,
  },
  {
    title: 'Using JyotiAI responsibly',
    description:
      'Product notes about generated guidance, AI-assisted interpretation and where human judgment still matters.',
    icon: Sparkles,
  },
  {
    title: 'Product & launch notes',
    description:
      'Changes to JyotiAI, new capabilities, reliability improvements and launch preparation.',
    icon: MessageCircle,
  },
]

export default function BlogPage() {
  return (
    <CompanyPageShell
      eyebrow="JyotiAI journal"
      title={
        <>
          Notes from the <span className="text-[#efaa4f]">JyotiAI build.</span>
        </>
      }
      description="The public journal is being prepared for launch. We are not presenting old placeholder articles or invented publication history as current editorial content."
    >
      <section className="grid gap-4 md:grid-cols-3">
        {themes.map(({ title, description, icon: Icon }) => (
          <article
            key={title}
            className="rounded-[24px] border border-[#d9b75f]/18 bg-[linear-gradient(145deg,rgba(8,22,28,0.96),rgba(4,13,18,0.98))] p-6"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#efaa4f]/25 bg-[#efaa4f]/[0.07] text-[#efaa4f]">
              <Icon className="h-5 w-5" aria-hidden="true" />
            </div>

            <h2 className="mt-5 font-heading text-2xl text-[#fff6df]">
              {title}
            </h2>

            <p className="mt-3 text-sm leading-7 text-[#aab5b2]">
              {description}
            </p>
          </article>
        ))}
      </section>

      <section className="rounded-[28px] border border-[#efaa4f]/25 bg-[radial-gradient(circle_at_88%_12%,rgba(239,170,79,0.09),transparent_22rem),#07131f] p-7 md:p-9">
        <div className="grid gap-6 md:grid-cols-[1fr_auto] md:items-center">
          <div>
            <BookOpen className="h-6 w-6 text-[#efaa4f]" aria-hidden="true" />

            <h2 className="mt-4 font-heading text-3xl text-[#fff6df]">
              Editorial content is coming with launch.
            </h2>

            <p className="mt-3 max-w-3xl text-sm leading-7 text-[#aab5b2] md:text-base">
              Until articles are reviewed and genuinely published, JyotiAI will
              not show placeholder dates or imply an editorial history that did
              not occur.
            </p>
          </div>

          <Link
            href="/company/about"
            className="inline-flex min-h-12 items-center gap-2 rounded-full border border-[#d9b75f]/28 px-6 font-semibold text-[#fff6df] transition hover:bg-white/[0.05]"
          >
            About JyotiAI
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </section>
    </CompanyPageShell>
  )
}
