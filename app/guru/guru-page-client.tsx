'use client'

import { useSearchParams } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { CosmicGuruChat } from '@/components/guru/CosmicGuruChat'
import DashboardPageShell from '@/src/ui/layout/DashboardPageShell'

export function GuruPageClient() {
  const searchParams = useSearchParams()
  const prompt = searchParams.get('prompt') || ''
  const source = searchParams.get('source') || undefined

  return (
    <DashboardPageShell
      title="Jyoti Guru"
      subtitle="Personal guidance from your saved Kundali context"
    >
      <div className="space-y-6">
        <section className="rounded-2xl border border-border bg-surface-raised p-5 md:p-6">
          <Badge variant="guru">Personal Vedic guidance</Badge>
          <h2 className="mt-4 font-heading text-3xl font-semibold leading-tight text-primary md:text-4xl">
            What do you want clarity on?
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground md:text-base md:leading-7">
            Ask from your saved Kundali context. Suggested prompts can prefill the composer, but nothing is sent until you confirm.
          </p>
        </section>

        <CosmicGuruChat initialPrompt={prompt} source={source} />
      </div>
    </DashboardPageShell>
  )
}
