'use client'

import { useSearchParams } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { CosmicGuruChat } from '@/components/guru/CosmicGuruChat'

export function GuruPageClient() {
  const searchParams = useSearchParams()
  const prompt = searchParams.get('prompt') || ''
  const source = searchParams.get('source') || undefined

  return (
    <main className="page-container flex min-h-[calc(100vh-5rem)] flex-col gap-6 py-6 md:py-8">
      <section className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <Badge variant="guru">Jyoti Guru</Badge>
          <h1 className="mt-4 font-heading text-4xl font-semibold leading-tight text-primary md:text-5xl">
            What do you want clarity on?
          </h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-muted-foreground">
            Ask from your saved Kundali context. Suggested prompts can prefill the composer, but nothing is sent until you confirm.
          </p>
        </div>
      </section>

      <CosmicGuruChat initialPrompt={prompt} source={source} />
    </main>
  )
}
