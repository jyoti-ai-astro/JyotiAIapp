import { BetaAnalyticsDataClient } from '@google-analytics/data'

export type Ga4GrowthSnapshot = {
  configured: boolean
  propertyId: string | null
  activeUsers: number
  sessions: number
  newUsers: number
  screenPageViews: number
  sources: Array<{
    source: string
    medium: string
    sessions: number
    activeUsers: number
  }>
}

function asNumber(value?: string | null) {
  const parsed = Number(value || 0)
  return Number.isFinite(parsed) ? parsed : 0
}

function getGa4Config() {
  const propertyId = process.env.GA4_PROPERTY_ID?.trim()
  const clientEmail = process.env.GA4_CLIENT_EMAIL?.trim()
  const privateKey = process.env.GA4_PRIVATE_KEY?.replace(/\\n/g, '\n')

  if (!propertyId || !clientEmail || !privateKey) return null

  return { propertyId, clientEmail, privateKey }
}

export async function getGa4GrowthSnapshot(days: number): Promise<Ga4GrowthSnapshot> {
  const config = getGa4Config()

  if (!config) {
    return {
      configured: false,
      propertyId: process.env.GA4_PROPERTY_ID?.trim() || null,
      activeUsers: 0,
      sessions: 0,
      newUsers: 0,
      screenPageViews: 0,
      sources: [],
    }
  }

  const client = new BetaAnalyticsDataClient({
    credentials: {
      client_email: config.clientEmail,
      private_key: config.privateKey,
    },
  })

  const dateRange = [{ startDate: `${Math.max(1, Math.min(90, days))}daysAgo`, endDate: 'today' }]

  const [summaryResponse, sourcesResponse] = await Promise.all([
    client.runReport({
      property: `properties/${config.propertyId}`,
      dateRanges: dateRange,
      metrics: [
        { name: 'activeUsers' },
        { name: 'sessions' },
        { name: 'newUsers' },
        { name: 'screenPageViews' },
      ],
    }),
    client.runReport({
      property: `properties/${config.propertyId}`,
      dateRanges: dateRange,
      dimensions: [{ name: 'sessionSource' }, { name: 'sessionMedium' }],
      metrics: [{ name: 'sessions' }, { name: 'activeUsers' }],
      orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
      limit: 12,
    }),
  ])

  const summary = summaryResponse[0].rows?.[0]?.metricValues || []
  const sources = (sourcesResponse[0].rows || []).map((row) => ({
    source: row.dimensionValues?.[0]?.value || '(direct)',
    medium: row.dimensionValues?.[1]?.value || '(none)',
    sessions: asNumber(row.metricValues?.[0]?.value),
    activeUsers: asNumber(row.metricValues?.[1]?.value),
  }))

  return {
    configured: true,
    propertyId: config.propertyId,
    activeUsers: asNumber(summary[0]?.value),
    sessions: asNumber(summary[1]?.value),
    newUsers: asNumber(summary[2]?.value),
    screenPageViews: asNumber(summary[3]?.value),
    sources,
  }
}
