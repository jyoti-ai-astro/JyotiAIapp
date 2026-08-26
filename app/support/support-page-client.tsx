'use client'

import Link from 'next/link'
import {
  BookOpen,
  CircleHelp,
  CreditCard,
  FileText,
  Mail,
  MessageCircleQuestion,
  ShieldCheck,
  UserRound,
} from 'lucide-react'

import DashboardPageShell from '@/src/ui/layout/DashboardPageShell'
import { Card } from '@/components/ui/card'

const categories = [
  {
    title: 'Getting started',
    description: 'Learn where to begin with your profile, Kundali, Guru, predictions, and reports.',
    href: '/dashboard',
    icon: BookOpen,
  },
  {
    title: 'Account & profile',
    description: 'Review your personal details and the birth information used by JyotiAI.',
    href: '/profile',
    icon: UserRound,
  },
  {
    title: 'Plans & access',
    description: 'Review your plan, payments, feature access, and available product credits.',
    href: '/payments',
    icon: CreditCard,
  },
  {
    title: 'Reports & readings',
    description: 'Return to generated reports and continue exploring your JyotiAI insights.',
    href: '/reports',
    icon: FileText,
  },
]

export function SupportPageClient() {
  return (
    <DashboardPageShell
      title="Support"
      subtitle="Find the right place for account, product, access, and JyotiAI guidance."
    >
      <div id="faq" className="grid gap-4 md:grid-cols-2">
        {categories.map(({ title, description, href, icon: Icon }) => (
          <Link key={title} href={href} className="group block">
            <Card
              size="lg"
              className="h-full border-border bg-card transition-colors group-hover:border-saffron/45 group-hover:bg-surface-raised"
            >
              <div className="flex items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-saffron/25 bg-saffron/10 text-saffron">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </div>

                <div>
                  <h2 className="font-heading text-xl font-semibold text-primary">{title}</h2>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p>
                  <p className="mt-4 text-sm font-medium text-saffron">Open section →</p>
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>

      <Card
        size="lg"
        className="border-border bg-card shadow-[0_16px_44px_rgba(0,0,0,0.18)]"
      >
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-saffron/25 bg-saffron/10 text-saffron">
            <CircleHelp className="h-5 w-5" aria-hidden="true" />
          </div>
          <div>
            <h2 className="font-heading text-2xl font-semibold text-primary">Common questions</h2>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">
              Quick guidance for the most common account and product situations.
            </p>
          </div>
        </div>

        <div className="mt-6 divide-y divide-border overflow-hidden rounded-xl border border-border bg-surface-raised">
          <details className="group p-4 md:p-5">
            <summary className="cursor-pointer list-none font-medium text-primary">
              Why does a feature ask me to update my birth details?
            </summary>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground">
              Personalized astrology features depend on the birth information associated with your
              account. Review Profile first when JyotiAI reports missing or outdated Kundali data.
            </p>
          </details>

          <details className="group p-4 md:p-5">
            <summary className="cursor-pointer list-none font-medium text-primary">
              Why am I being asked for a credit or ticket?
            </summary>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground">
              Some generated features use plan entitlements or one-time access credits. Open
              Payments/Plan to review the access currently available to your account.
            </p>
          </details>

          <details className="group p-4 md:p-5">
            <summary className="cursor-pointer list-none font-medium text-primary">
              Where can I find readings I already generated?
            </summary>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground">
              Open Reports for saved report experiences. Other product areas may also keep their
              latest result directly inside the relevant feature.
            </p>
          </details>
        </div>
      </Card>

      <Card size="lg" className="border-saffron/25 bg-saffron/10">
        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div className="flex items-start gap-3">
            <MessageCircleQuestion className="mt-1 h-5 w-5 shrink-0 text-saffron" aria-hidden="true" />
            <div>
              <h2 className="font-heading text-xl font-semibold text-primary">
                Still need assistance?
              </h2>
              <p className="mt-1 max-w-2xl text-sm leading-6 text-muted-foreground">
                Contact the JyotiAI support team for account-specific or unresolved product issues.
              </p>
            </div>
          </div>

          <Link
            href="/contact"
            className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-lg border border-saffron/35 bg-surface-raised px-5 text-sm font-medium text-primary transition-colors hover:border-saffron hover:bg-card"
          >
            <Mail className="h-4 w-4" aria-hidden="true" />
            Contact Support
          </Link>
        </div>
      </Card>

      <div className="flex items-start gap-3 rounded-xl border border-border bg-surface-raised px-4 py-3 text-xs leading-5 text-muted-foreground">
        <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-saffron" aria-hidden="true" />
        Never share passwords, authentication codes, private keys, or payment credentials in a
        support message.
      </div>
    </DashboardPageShell>
  )
}
