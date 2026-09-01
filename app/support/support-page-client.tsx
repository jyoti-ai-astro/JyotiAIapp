'use client'

import Link from 'next/link'
import {
  ArrowRight,
  BookOpen,
  CircleHelp,
  CreditCard,
  FileText,
  Mail,
  ShieldCheck,
  UserRound,
} from 'lucide-react'

import CompanyPageShell from '@/src/ui/layout/CompanyPageShell'

const categories = [
  {
    title: 'Getting started',
    description:
      'Learn where to begin with your profile, Kundali, Guru, predictions, and reports.',
    href: '/dashboard',
    icon: BookOpen,
  },
  {
    title: 'Account & profile',
    description:
      'Review your personal details and the birth information used by JyotiAI.',
    href: '/profile',
    icon: UserRound,
  },
  {
    title: 'Plans & access',
    description:
      'Review your plan, payments, feature access, and available product credits.',
    href: '/payments',
    icon: CreditCard,
  },
  {
    title: 'Reports & readings',
    description:
      'Return to generated reports and continue exploring your JyotiAI insights.',
    href: '/reports',
    icon: FileText,
  },
]

const questions = [
  {
    question: 'Why does a feature ask me to update my birth details?',
    answer:
      'Personalized astrology depends on the birth information associated with your JyotiAI profile. If required details are incomplete or need verification, the product may ask you to update them before creating chart-based guidance.',
  },
  {
    question: 'Why am I being asked for a credit or ticket?',
    answer:
      'Some JyotiAI experiences use one-time credits or subscription access. Access is applied only after the server verifies the relevant entitlement, so checkout by itself does not unlock a paid feature.',
  },
  {
    question: 'Where can I find readings I already generated?',
    answer:
      'Open Reports to return to saved readings and generated reports associated with your JyotiAI account.',
  },
]

export function SupportPageClient() {
  return (
    <>
      <div data-support-celestial="true">
        <CompanyPageShell
          eyebrow="Support"
          title={
            <>
              Help for your{' '}
              <span className="text-[#efaa4f]">JyotiAI journey.</span>
            </>
          }
          description="Find the right place for account, product, access, reports, and JyotiAI guidance."
        >
          <section
            aria-label="Support categories"
            className="grid gap-4 md:grid-cols-2"
          >
            {categories.map(({ title, description, href, icon: Icon }) => (
              <Link
                key={title}
                href={href}
                className="group rounded-[24px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#efaa4f]/70"
              >
                <article className="relative h-full overflow-hidden rounded-[24px] border border-[#d9b75f]/18 bg-[linear-gradient(145deg,rgba(8,22,28,0.96),rgba(4,13,18,0.98))] p-6 transition duration-200 group-hover:-translate-y-0.5 group-hover:border-[#efaa4f]/45 md:p-7">
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_85%_10%,rgba(239,170,79,0.08),transparent_15rem)]"
                  />

                  <div className="relative flex items-start gap-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[#efaa4f]/25 bg-[#efaa4f]/[0.07] text-[#efaa4f]">
                      <Icon className="h-5 w-5" aria-hidden="true" />
                    </div>

                    <div>
                      <h2 className="font-heading text-2xl font-medium text-[#fff6df]">
                        {title}
                      </h2>

                      <p className="mt-2 text-sm leading-6 text-[#aab5b2]">
                        {description}
                      </p>

                      <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[#efaa4f] transition group-hover:text-[#ffd07a]">
                        Open section
                        <ArrowRight className="h-4 w-4" aria-hidden="true" />
                      </span>
                    </div>
                  </div>
                </article>
              </Link>
            ))}
          </section>

          <section
            id="faq"
            aria-labelledby="support-common-questions"
            className="overflow-hidden rounded-[28px] border border-[#d9b75f]/18 bg-[linear-gradient(150deg,rgba(7,19,25,0.98),rgba(3,11,16,0.99))]"
          >
            <div className="flex items-start gap-4 border-b border-[#d9b75f]/14 px-6 py-7 md:px-8">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[#efaa4f]/25 bg-[#efaa4f]/[0.07] text-[#efaa4f]">
                <CircleHelp className="h-5 w-5" aria-hidden="true" />
              </div>

              <div>
                <h2
                  id="support-common-questions"
                  className="font-heading text-3xl font-medium text-[#fff6df]"
                >
                  Common questions
                </h2>
                <p className="mt-2 text-sm leading-6 text-[#aab5b2]">
                  Quick guidance for common account and product situations.
                </p>
              </div>
            </div>

            <div>
              {questions.map(({ question, answer }) => (
                <details
                  key={question}
                  className="group border-b border-[#d9b75f]/12 last:border-b-0"
                >
                  <summary className="flex min-h-[76px] cursor-pointer list-none items-center justify-between gap-6 px-6 py-5 text-left font-medium text-[#f7f1e7] outline-none transition hover:bg-white/[0.025] focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#efaa4f]/55 md:px-8">
                    <span>{question}</span>
                    <span
                      aria-hidden="true"
                      className="text-xl text-[#efaa4f] transition-transform group-open:rotate-45"
                    >
                      +
                    </span>
                  </summary>

                  <div className="px-6 pb-6 md:px-8">
                    <p className="max-w-4xl text-sm leading-7 text-[#aab5b2] md:text-base">
                      {answer}
                    </p>
                  </div>
                </details>
              ))}
            </div>
          </section>

          <section className="relative overflow-hidden rounded-[26px] border border-[#efaa4f]/28 bg-[radial-gradient(circle_at_88%_12%,rgba(239,170,79,0.10),transparent_20rem),linear-gradient(145deg,#07151b,#061017)] p-6 md:p-7">
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div className="flex items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[#efaa4f]/25 bg-[#efaa4f]/[0.07] text-[#efaa4f]">
                  <Mail className="h-5 w-5" aria-hidden="true" />
                </div>

                <div>
                  <h2 className="font-heading text-2xl font-medium text-[#fff6df]">
                    Still need assistance?
                  </h2>

                  <p className="mt-2 max-w-2xl text-sm leading-6 text-[#aab5b2]">
                    Contact the JyotiAI team for account-specific or unresolved
                    product issues.
                  </p>
                </div>
              </div>

              <Link
                href="/company/contact"
                className="inline-flex min-h-12 shrink-0 items-center justify-center gap-2 rounded-full bg-[#ef982f] px-6 font-semibold text-[#081017] transition hover:bg-[#ffad4f] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ffd07a]"
              >
                Contact support
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
          </section>

          <aside className="flex items-start gap-3 rounded-2xl border border-[#d9b75f]/15 bg-[#07131f]/75 px-5 py-4 text-sm leading-6 text-[#9eaaa6]">
            <ShieldCheck
              className="mt-0.5 h-5 w-5 shrink-0 text-[#efaa4f]"
              aria-hidden="true"
            />

            <p>
              Never share passwords, authentication codes, private keys, API
              tokens, or payment-card credentials in a support message.
            </p>
          </aside>
        </CompanyPageShell>
      </div>

      <style jsx global>{`
        /*
         * P4.8A3.3 — Support route visual ownership.
         * Keep the shared public header dark and legible while Support is
         * mounted, without modifying the global Header implementation.
         */
        body:has([data-support-celestial='true']) header {
          background: rgba(3, 11, 16, 0.96) !important;
          border-bottom-color: rgba(217, 183, 95, 0.22) !important;
          color: #fff7e8 !important;
          backdrop-filter: blur(18px) !important;
          -webkit-backdrop-filter: blur(18px) !important;
        }

        body:has([data-support-celestial='true'])
          header
          a:not([class*='bg-orange']):not([class*='bg-[#ef']):not(
            [class*='bg-[#ff']
          ),
        body:has([data-support-celestial='true'])
          header
          button:not([class*='bg-orange']):not([class*='bg-[#ef']):not(
            [class*='bg-[#ff']
          ) {
          color: #d8dfdc !important;
        }

        body:has([data-support-celestial='true']) header a:hover,
        body:has([data-support-celestial='true']) header button:hover {
          color: #fff7e8 !important;
        }

        body:has([data-support-celestial='true']) header::before,
        body:has([data-support-celestial='true']) header::after {
          opacity: 0 !important;
        }
      `}</style>
    </>
  )
}
