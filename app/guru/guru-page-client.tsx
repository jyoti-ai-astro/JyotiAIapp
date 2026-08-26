'use client'

import { useSearchParams } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { CosmicGuruChat } from '@/components/guru/CosmicGuruChat'
import DashboardPageShell from '@/src/ui/layout/DashboardPageShell'
import { ProductPageFrame } from '@/components/product'

export function GuruPageClient() {
  const searchParams = useSearchParams()
  const prompt = searchParams.get('prompt') || ''
  const source = searchParams.get('source') || undefined

  return (
    <ProductPageFrame product="guru">
      <DashboardPageShell
        title="Jyoti Guru"
        subtitle="Personal guidance from your saved Kundali context"
      >
        <div data-guru-product="true" className="mx-auto w-full max-w-[1320px] space-y-6">
          <section className="relative overflow-hidden rounded-[28px] border border-[#dfa84d]/20 bg-[#091216] px-6 py-7 md:px-8 md:py-9">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full border border-[#dfa84d]/10"
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute right-12 top-10 h-40 w-40 rounded-full border border-[#66a5a5]/10"
            />

            <div className="relative z-10 max-w-3xl">
              <Badge
                variant="guru"
                className="border-[#dfa84d]/25 bg-[#dfa84d]/10 text-[#f5eee2]"
              >
                Personal Vedic guidance
              </Badge>

              <h2 className="mt-5 font-heading text-3xl font-semibold leading-tight text-[#f8f1e6] md:text-5xl">
                What do you want clarity on?
              </h2>

              <p className="mt-4 max-w-2xl text-sm leading-7 text-[#aaa69e] md:text-base">
                Ask from your saved Kundali context. Suggested prompts can prefill
                the composer, but nothing is sent until you confirm.
              </p>
            </div>
          </section>

          <div className="[&>div]:border-[#dca94e]/20 [&>div]:bg-[#071014] [&>div]:shadow-[0_24px_70px_rgba(0,0,0,0.20)]">
            <CosmicGuruChat initialPrompt={prompt} source={source} />
          </div>
        </div>
      </DashboardPageShell>
    </ProductPageFrame>
  )
}
