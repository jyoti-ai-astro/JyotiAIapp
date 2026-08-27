'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import {
  AlertCircle,
  Clock3,
  HeartHandshake,
  ListChecks,
  Loader2,
  PackageOpen,
  ShieldCheck,
  Sparkles,
} from 'lucide-react'

import { useRouter } from 'next/navigation'

import DashboardPageShell from '@/src/ui/layout/DashboardPageShell'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { useUserStore } from '@/store/user-store'

interface Ritual {
  type: 'puja' | 'mantra' | 'yantra' | 'gemstone' | 'donation' | 'fasting'
  name: string
  deity?: string
  purpose: string
  procedure: string[]
  timing: {
    bestDays: string[]
    bestTime: string
    duration: string
  }
  materials: string[]
  mantra?: string
  benefits: string[]
  precautions: string[]
}

export default function RitualsPage() {
  const router = useRouter()
  const { user } = useUserStore()

  const [purpose, setPurpose] = useState('')
  const [ritual, setRitual] = useState<Ritual | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [needsBirthDetails, setNeedsBirthDetails] = useState(false)

  useEffect(() => {
    if (!user) {
      router.push('/login')
    }
  }, [user, router])

  const generateRitual = async () => {
    const normalizedPurpose = purpose.trim()

    if (!normalizedPurpose) {
      setError('Tell JyotiAI what you want guidance or a remedy for.')
      return
    }

    setLoading(true)
    setError(null)
    setNeedsBirthDetails(false)

    try {
      const response = await fetch('/api/ritual/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ purpose: normalizedPurpose }),
      })

      const data = await response.json().catch(() => ({}))

      if (!response.ok) {
        if (response.status === 401) {
          router.push('/login')
          return
        }

        if (response.status === 404) {
          setNeedsBirthDetails(true)
          throw new Error(
            'Please complete your birth details and generate your Kundali before requesting a ritual.'
          )
        }

        if (data?.error === 'NO_TICKETS') {
          throw new Error('You have no ritual credits left. Visit Payments/Plan to continue.')
        }

        throw new Error(data?.message || data?.error || 'Failed to generate ritual guidance.')
      }

      setRitual(data.ritual)
    } catch (err: any) {
      setError(err?.message || 'Failed to generate ritual guidance.')
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return null
  }

  return (
    <DashboardPageShell
      title="Vedic Rituals"
      subtitle="Receive personalized ritual and remedy guidance grounded in your JyotiAI profile."
    >
      <Card
        size="lg"
        className="border-border bg-card shadow-[0_16px_44px_rgba(0,0,0,0.18)]"
      >
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end">
          <div className="min-w-0 flex-1">
            <div className="mb-4 flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-saffron/25 bg-saffron/10 text-saffron">
                <Sparkles className="h-5 w-5" aria-hidden="true" />
              </div>
              <div>
                <h2 className="font-heading text-xl font-semibold text-primary">
                  What would you like support with?
                </h2>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  Describe your intention, concern, or area where you want a traditional Vedic remedy.
                </p>
              </div>
            </div>

            <Input
              value={purpose}
              onChange={(event) => setPurpose(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' && !loading) {
                  void generateRitual()
                }
              }}
              placeholder="For example: career stability, focus, family harmony..."
              aria-label="Ritual purpose"
            />
          </div>

          <Button
            onClick={() => void generateRitual()}
            disabled={loading || !purpose.trim()}
            className="w-full lg:w-auto"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                Preparing guidance...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" aria-hidden="true" />
                Generate Ritual
              </>
            )}
          </Button>
        </div>

        <p className="mt-4 text-xs leading-5 text-muted-foreground">
          Personalized generation uses your available Kundali data and consumes ritual access
          according to your current plan or ticket balance.
        </p>
      </Card>

      {error && (
        <div
          role="alert"
          className="rounded-xl border border-danger/25 bg-danger/10 px-4 py-3 text-sm text-primary"
        >
          <div className="flex items-start gap-3">
            <AlertCircle
              className="mt-0.5 h-4 w-4 shrink-0 text-danger"
              aria-hidden="true"
            />
            <span>{error}</span>
          </div>

          {needsBirthDetails && (
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => router.push('/onboarding')}
            >
              Complete Birth Details
            </Button>
          )}
        </div>
      )}

      {!ritual && !loading && (
        <Card size="lg" className="border-border bg-surface-raised">
          <div className="grid gap-5 md:grid-cols-3">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-saffron">
                Personalized
              </p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Guidance can incorporate the astrological profile already associated with your account.
              </p>
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-saffron">
                Practical
              </p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Receive procedure, timing, materials, benefits, and precautions in one structured result.
              </p>
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-saffron">
                Traditional
              </p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Recommendations are generated from the Vedic ritual knowledge available to JyotiAI.
              </p>
            </div>
          </div>
        </Card>
      )}

      {ritual && (
        <div className="grid gap-6">
          <Card
            size="lg"
            className="border-saffron/25 bg-card shadow-[0_16px_44px_rgba(0,0,0,0.18)]"
          >
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-saffron">
                  {ritual.type}
                </p>
                <h2 className="mt-2 font-heading text-2xl font-semibold text-primary md:text-3xl">
                  {ritual.name}
                </h2>
                {ritual.deity && (
                  <p className="mt-1 text-sm text-muted-foreground">Deity: {ritual.deity}</p>
                )}
              </div>

              <Button variant="outline" onClick={() => setRitual(null)}>
                New intention
              </Button>
            </div>

            <div className="mt-6 rounded-xl border border-border bg-surface-raised p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                Purpose
              </p>
              <p className="mt-2 leading-7 text-primary">{ritual.purpose}</p>
            </div>
          </Card>

          <div className="grid gap-6 xl:grid-cols-2">
            <Card size="lg" className="border-border bg-card">
              <div className="flex items-center gap-3">
                <ListChecks className="h-5 w-5 text-saffron" aria-hidden="true" />
                <h3 className="font-heading text-xl font-semibold text-primary">Procedure</h3>
              </div>
              <ol className="mt-5 space-y-3">
                {ritual.procedure.map((step, index) => (
                  <li key={`${step}-${index}`} className="flex gap-3 text-sm leading-6 text-muted-foreground">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-saffron/30 bg-saffron/10 text-xs font-semibold text-saffron">
                      {index + 1}
                    </span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
            </Card>

            <Card size="lg" className="border-border bg-card">
              <div className="flex items-center gap-3">
                <Clock3 className="h-5 w-5 text-saffron" aria-hidden="true" />
                <h3 className="font-heading text-xl font-semibold text-primary">Timing</h3>
              </div>

              <div className="mt-5 divide-y divide-border rounded-xl border border-border bg-surface-raised">
                <div className="flex justify-between gap-4 p-4 text-sm">
                  <span className="text-muted-foreground">Best days</span>
                  <span className="text-right font-medium text-primary">
                    {ritual.timing.bestDays.join(', ')}
                  </span>
                </div>
                <div className="flex justify-between gap-4 p-4 text-sm">
                  <span className="text-muted-foreground">Best time</span>
                  <span className="text-right font-medium text-primary">{ritual.timing.bestTime}</span>
                </div>
                <div className="flex justify-between gap-4 p-4 text-sm">
                  <span className="text-muted-foreground">Duration</span>
                  <span className="text-right font-medium text-primary">{ritual.timing.duration}</span>
                </div>
              </div>
            </Card>

            <Card size="lg" className="border-border bg-card">
              <div className="flex items-center gap-3">
                <PackageOpen className="h-5 w-5 text-saffron" aria-hidden="true" />
                <h3 className="font-heading text-xl font-semibold text-primary">Materials</h3>
              </div>
              <ul className="mt-5 space-y-2 text-sm leading-6 text-muted-foreground">
                {ritual.materials.map((material) => (
                  <li key={material} className="flex gap-3">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-saffron" />
                    {material}
                  </li>
                ))}
              </ul>
            </Card>

            <Card size="lg" className="border-border bg-card">
              <div className="flex items-center gap-3">
                <HeartHandshake className="h-5 w-5 text-saffron" aria-hidden="true" />
                <h3 className="font-heading text-xl font-semibold text-primary">Benefits</h3>
              </div>
              <ul className="mt-5 space-y-2 text-sm leading-6 text-muted-foreground">
                {ritual.benefits.map((benefit) => (
                  <li key={benefit} className="flex gap-3">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-success" />
                    {benefit}
                  </li>
                ))}
              </ul>
            </Card>
          </div>

          {ritual.mantra && (
            <Card size="lg" className="border-saffron/25 bg-saffron/10">
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-saffron">
                Mantra
              </p>
              <p className="mt-3 font-heading text-xl leading-8 text-primary">{ritual.mantra}</p>
            </Card>
          )}

          {ritual.precautions.length > 0 && (
            <Card size="lg" className="border-border bg-surface-raised">
              <div className="flex items-center gap-3">
                <ShieldCheck className="h-5 w-5 text-saffron" aria-hidden="true" />
                <h3 className="font-heading text-xl font-semibold text-primary">Precautions</h3>
              </div>
              <ul className="mt-4 space-y-2 text-sm leading-6 text-muted-foreground">
                {ritual.precautions.map((precaution) => (
                  <li key={precaution} className="flex gap-3">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-saffron" />
                    {precaution}
                  </li>
                ))}
              </ul>
            </Card>
          )}
        </div>
      )}
    </DashboardPageShell>
  )
}
