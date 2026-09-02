import { NextRequest, NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase/admin'
import { withAdminAuth } from '@/lib/middleware/admin-middleware'

export const dynamic = 'force-dynamic'

function toDate(value: any): Date | null {
  if (!value) return null
  if (typeof value?.toDate === 'function') return value.toDate()

  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime()) ? null : parsed
}

type ProviderStats = {
  attempts: number
  successes: number
  failures: number
  fallbacksIn: number
  fallbacksOut: number
  totalLatencyMs: number
  latencySamples: number
  errors: Record<string, number>
}

function emptyProviderStats(): ProviderStats {
  return {
    attempts: 0,
    successes: 0,
    failures: 0,
    fallbacksIn: 0,
    fallbacksOut: 0,
    totalLatencyMs: 0,
    latencySamples: 0,
    errors: {},
  }
}

export async function GET(request: NextRequest) {
  return withAdminAuth(
    async (req) => {
      if (!adminDb) {
        return NextResponse.json(
          { error: 'Firestore not initialized' },
          { status: 500 }
        )
      }

      try {
        const { searchParams } = new URL(req.url)
        const hours = Math.min(
          168,
          Math.max(
            1,
            Number.parseInt(searchParams.get('hours') || '24', 10) || 24
          )
        )

        const since = new Date(Date.now() - hours * 60 * 60 * 1000)

        const jobsSnapshot = await adminDb
          .collection('background_jobs')
          .get()

        const logDocs: any[] = []
        const logPageSize = 500
        const maxLogPages = 20
        let lastLogDocument: any = null
        let logScanTruncated = false
        let reachedWindowBoundary = false

        for (let page = 0; page < maxLogPages; page += 1) {
          let query = adminDb
            .collection('app_logs')
            .orderBy('createdAt', 'desc')
            .limit(logPageSize)

          if (lastLogDocument) {
            query = query.startAfter(lastLogDocument)
          }

          const pageSnapshot = await query.get()

          if (pageSnapshot.empty) {
            break
          }

          logDocs.push(...pageSnapshot.docs)

          reachedWindowBoundary = pageSnapshot.docs.some((doc) => {
            const createdAt = toDate(doc.data().createdAt)
            return createdAt ? createdAt < since : false
          })

          if (
            reachedWindowBoundary ||
            pageSnapshot.size < logPageSize
          ) {
            break
          }

          lastLogDocument =
            pageSnapshot.docs[pageSnapshot.docs.length - 1] || null

          if (page === maxLogPages - 1) {
            logScanTruncated = true
          }
        }

        const logs = logDocs
          .map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }))
          .filter((entry: any) => {
            const createdAt = toDate(entry.createdAt)
            return createdAt ? createdAt >= since : false
          })

        const providerMap = new Map<string, ProviderStats>()

        const provider = (name: string) => {
          if (!providerMap.has(name)) {
            providerMap.set(name, emptyProviderStats())
          }

          return providerMap.get(name)!
        }

        for (const entry of logs as any[]) {
          const type = String(entry.type || '')
          const data = entry.data || {}

          if (type === 'ai.provider.attempt' && data.provider) {
            provider(String(data.provider)).attempts += 1
          }

          if (type === 'ai.provider.success' && data.provider) {
            const stats = provider(String(data.provider))
            stats.successes += 1

            const latency = Number(data.latencyMs)

            if (Number.isFinite(latency) && latency >= 0) {
              stats.totalLatencyMs += latency
              stats.latencySamples += 1
            }
          }

          if (type === 'ai.provider.failure' && data.provider) {
            const stats = provider(String(data.provider))
            stats.failures += 1

            const latency = Number(data.latencyMs)

            if (Number.isFinite(latency) && latency >= 0) {
              stats.totalLatencyMs += latency
              stats.latencySamples += 1
            }

            const errorCode = String(data.errorCode || 'UNKNOWN')
            stats.errors[errorCode] =
              (stats.errors[errorCode] || 0) + 1
          }

          if (
            type === 'ai.provider.fallback' &&
            data.fromProvider &&
            data.toProvider
          ) {
            provider(String(data.fromProvider)).fallbacksOut += 1
            provider(String(data.toProvider)).fallbacksIn += 1
          }
        }

        const providers = Array.from(providerMap.entries())
          .map(([name, stats]) => ({
            provider: name,
            attempts: stats.attempts,
            successes: stats.successes,
            failures: stats.failures,
            fallbacksIn: stats.fallbacksIn,
            fallbacksOut: stats.fallbacksOut,
            successRate:
              stats.attempts > 0
                ? stats.successes / stats.attempts
                : null,
            averageLatencyMs:
              stats.latencySamples > 0
                ? Math.round(
                    stats.totalLatencyMs / stats.latencySamples
                  )
                : null,
            errors: stats.errors,
          }))
          .sort((a, b) => b.attempts - a.attempts)

        const importantTypes = new Set([
          'api.error',
          'horoscope.error',
          'payment.failed',
          'webhook.failed',
          'job.failed',
          'ai.provider.failure',
        ])

        const recentFailures = (logs as any[])
          .filter((entry) => importantTypes.has(String(entry.type || '')))
          .slice(0, 40)
          .map((entry) => ({
            id: entry.id,
            type: entry.type,
            createdAt:
              toDate(entry.createdAt)?.toISOString() || null,
            data: {
              provider: entry.data?.provider || null,
              errorCode: entry.data?.errorCode || null,
              jobId: entry.data?.jobId || null,
              error:
                typeof entry.data?.error === 'string'
                  ? entry.data.error.slice(0, 300)
                  : null,
            },
          }))

        const jobs = jobsSnapshot.docs.map((doc) => {
          const data = doc.data()

          return {
            id: doc.id,
            lastStatus: data.lastStatus || null,
            lastRun: toDate(data.lastRun)?.toISOString() || null,
            lastSuccess:
              toDate(data.lastSuccess)?.toISOString() || null,
            lastFailure:
              toDate(data.lastFailure)?.toISOString() || null,
            failures: Number(data.failures || 0),
            lastDurationMs: data.lastDurationMs || null,
            lastError:
              typeof data.lastError === 'string'
                ? data.lastError.slice(0, 300)
                : null,
            lastTriggerSource: data.lastTriggerSource || null,
          }
        })

        const counts = {
          operationalEvents: logs.filter(
            (entry: any) => entry.operational === true
          ).length,
          aiFailures: logs.filter(
            (entry: any) => entry.type === 'ai.provider.failure'
          ).length,
          aiFallbacks: logs.filter(
            (entry: any) => entry.type === 'ai.provider.fallback'
          ).length,
          jobFailures: logs.filter(
            (entry: any) => entry.type === 'job.failed'
          ).length,
          paymentFailures: logs.filter(
            (entry: any) => entry.type === 'payment.failed'
          ).length,
          webhookFailures: logs.filter(
            (entry: any) => entry.type === 'webhook.failed'
          ).length,
          apiErrors: logs.filter(
            (entry: any) => entry.type === 'api.error'
          ).length,
        }

        return NextResponse.json({
          success: true,
          windowHours: hours,
          checkedAt: new Date().toISOString(),
          logScan: {
            scannedEvents: logDocs.length,
            truncated: logScanTruncated,
            reachedWindowBoundary,
            maxEvents: logPageSize * maxLogPages,
          },
          providers,
          jobs,
          counts,
          recentFailures,
          contract: {
            operationalStore: 'app_logs',
            jobStore: 'background_jobs',
            promptsLogged: false,
            customerContentLogged: false,
            credentialsLogged: false,
          },
        })
      } catch (error) {
        console.error('Mission Control observability error:', error)

        return NextResponse.json(
          { error: 'Failed to load operational observability' },
          { status: 500 }
        )
      }
    },
    'logs.read'
  )(request)
}
