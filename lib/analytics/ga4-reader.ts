import { createSign } from 'node:crypto'

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
  error?: string
}

type Ga4RunReportResponse = {
  rows?: Array<{
    dimensionValues?: Array<{ value?: string }>
    metricValues?: Array<{ value?: string }>
  }>
}

function asNumber(value?: string | null) {
  const parsed = Number(value || 0)
  return Number.isFinite(parsed) ? parsed : 0
}

function toBase64Url(input: string | Buffer) {
  return Buffer.from(input)
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
}

function getGa4Config() {
  const propertyId = process.env.GA4_PROPERTY_ID?.trim()
  const clientEmail = process.env.GA4_CLIENT_EMAIL?.trim()
  const privateKey = process.env.GA4_PRIVATE_KEY?.replace(/\\n/g, '\n')

  if (!propertyId || !clientEmail || !privateKey) return null
  return { propertyId, clientEmail, privateKey }
}

async function getAccessToken(clientEmail: string, privateKey: string) {
  const now = Math.floor(Date.now() / 1000)
  const header = toBase64Url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }))
  const payload = toBase64Url(
    JSON.stringify({
      iss: clientEmail,
      scope: 'https://www.googleapis.com/auth/analytics.readonly',
      aud: 'https://oauth2.googleapis.com/token',
      iat: now,
      exp: now + 3600,
    })
  )

  const unsigned = `${header}.${payload}`
  const signer = createSign('RSA-SHA256')
  signer.update(unsigned)
  signer.end()
  const signature = toBase64Url(signer.sign(privateKey))
  const assertion = `${unsigned}.${signature}`

  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion,
    }),
    cache: 'no-store',
  })

  const payloadJson = await response.json().catch(() => null)
  if (!response.ok || !payloadJson?.access_token) {
    throw new Error(`GA4 OAuth failed (${response.status})`)
  }

  return String(payloadJson.access_token)
}

async function runReport(
  propertyId: string,
  accessToken: string,
  body: Record<string, unknown>
): Promise<Ga4RunReportResponse> {
  const response = await fetch(
    `https://analyticsdata.googleapis.com/v1beta/properties/${encodeURIComponent(propertyId)}:runReport`,
    {
      method: 'POST',
      headers: {
        authorization: `Bearer ${accessToken}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify(body),
      cache: 'no-store',
    }
  )

  const payload = await response.json().catch(() => null)
  if (!response.ok) {
    const message = payload?.error?.message || `GA4 report failed (${response.status})`
    throw new Error(String(message))
  }

  return payload || {}
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

  try {
    const accessToken = await getAccessToken(config.clientEmail, config.privateKey)
    const safeDays = Math.max(1, Math.min(90, days))
    const dateRanges = [{ startDate: `${safeDays}daysAgo`, endDate: 'today' }]

    const [summaryResponse, sourcesResponse] = await Promise.all([
      runReport(config.propertyId, accessToken, {
        dateRanges,
        metrics: [
          { name: 'activeUsers' },
          { name: 'sessions' },
          { name: 'newUsers' },
          { name: 'screenPageViews' },
        ],
      }),
      runReport(config.propertyId, accessToken, {
        dateRanges,
        dimensions: [{ name: 'sessionSource' }, { name: 'sessionMedium' }],
        metrics: [{ name: 'sessions' }, { name: 'activeUsers' }],
        orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
        limit: 12,
      }),
    ])

    const summary = summaryResponse.rows?.[0]?.metricValues || []
    const sources = (sourcesResponse.rows || []).map((row) => ({
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
  } catch (error) {
    console.error('[ga4-reader] Failed to read Google Analytics Data API', error)
    return {
      configured: true,
      propertyId: config.propertyId,
      activeUsers: 0,
      sessions: 0,
      newUsers: 0,
      screenPageViews: 0,
      sources: [],
      error: error instanceof Error ? error.message : 'GA4 read failed',
    }
  }
}
