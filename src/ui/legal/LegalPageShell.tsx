import Link from 'next/link'
import type { ReactNode } from 'react'

type LegalSection = {
  title: string
  content: ReactNode
}

type LegalPageShellProps = {
  eyebrow: string
  title: string
  description: string
  updated: string
  sections: LegalSection[]
}

const legalLinks = [
  ['/legal/privacy', 'Privacy'],
  ['/legal/terms', 'Terms'],
  ['/legal/cookies', 'Cookies'],
  ['/legal/security', 'Security'],
  ['/legal/refund', 'Refunds'],
  ['/legal/licenses', 'Licenses'],
] as const

export function LegalPageShell({
  eyebrow,
  title,
  description,
  updated,
  sections,
}: LegalPageShellProps) {
  return (
    <div className="min-h-screen bg-[#03090b] text-[#f5efe3]">
      <section className="border-b border-[#c9943a]/20 bg-[radial-gradient(circle_at_top,rgba(201,148,58,0.12),transparent_38%)]">
        <div className="mx-auto max-w-6xl px-6 pb-14 pt-14 md:px-8 md:pb-20 md:pt-20">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#dca64b]">
            {eyebrow}
          </p>

          <h1 className="mt-5 max-w-4xl font-serif text-4xl leading-tight text-[#fff8eb] md:text-6xl">
            {title}
          </h1>

          <p className="mt-6 max-w-3xl text-base leading-8 text-[#a9b0ad] md:text-lg">
            {description}
          </p>

          <p className="mt-6 text-xs uppercase tracking-[0.18em] text-[#747d79]">
            Last updated {updated}
          </p>
        </div>
      </section>

      <div className="mx-auto grid max-w-6xl gap-10 px-6 py-12 md:px-8 lg:grid-cols-[220px_minmax(0,1fr)] lg:py-16">
        <aside>
          <div className="sticky top-28 rounded-2xl border border-[#c9943a]/18 bg-[#071012]/80 p-4">
            <p className="px-3 pb-3 text-[11px] font-semibold uppercase tracking-[0.24em] text-[#747d79]">
              Legal & trust
            </p>

            <nav className="space-y-1">
              {legalLinks.map(([href, label]) => (
                <Link
                  key={href}
                  href={href}
                  className="block rounded-xl px-3 py-2.5 text-sm text-[#b9bfbc] transition hover:bg-[#c9943a]/10 hover:text-[#f6c86f]"
                >
                  {label}
                </Link>
              ))}
            </nav>
          </div>
        </aside>

        <main className="min-w-0">
          <div className="space-y-6">
            {sections.map((section) => (
              <section
                key={section.title}
                className="rounded-2xl border border-white/[0.07] bg-[#071012]/72 p-6 md:p-8"
              >
                <h2 className="font-serif text-2xl text-[#fff8eb] md:text-3xl">
                  {section.title}
                </h2>

                <div className="mt-4 space-y-4 text-[15px] leading-7 text-[#aeb5b1]">
                  {section.content}
                </div>
              </section>
            ))}
          </div>

          <div className="mt-8 rounded-2xl border border-[#c9943a]/20 bg-[#c9943a]/[0.06] p-6">
            <p className="text-sm leading-7 text-[#aeb5b1]">
              Questions about these terms or JyotiAI&apos;s trust practices can be
              directed to the relevant contact listed on our{' '}
              <Link
                href="/company/contact"
                className="text-[#f2bd5c] underline decoration-[#f2bd5c]/30 underline-offset-4"
              >
                contact page
              </Link>
              .
            </p>
          </div>
        </main>
      </div>
    </div>
  )
}
