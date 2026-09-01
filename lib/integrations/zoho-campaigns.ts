const DEFAULT_REDIRECT_URI = 'https://jyotiai.in/api/integrations/zoho/callback'

export const ZOHO_CAMPAIGNS_SCOPES = [
  'ZohoCampaigns.contact.READ',
  'ZohoCampaigns.contact.UPDATE',
]

export type ZohoTokenResponse = {
  access_token?: string
  refresh_token?: string
  expires_in?: number
  api_domain?: string
  token_type?: string
  error?: string
  error_description?: string
}

export type ZohoMailingList = {
  listname?: string
  listkey?: string
  noofcontacts?: string
  [key: string]: unknown
}

export type ZohoTopic = {
  topicId?: string
  topicName?: string
  primaryList?: string | number
  [key: string]: unknown
}

function requiredEnv(name: string): string {
  const value = process.env[name]?.trim()
  if (!value) throw new Error(`${name} is not configured`)
  return value
}

export function getZohoClientId(): string {
  return requiredEnv('ZOHO_CAMPAIGNS_CLIENT_ID')
}

export function getZohoClientSecret(): string {
  return requiredEnv('ZOHO_CAMPAIGNS_CLIENT_SECRET')
}

export function getZohoRedirectUri(override?: string): string {
  return override?.trim() || process.env.ZOHO_CAMPAIGNS_REDIRECT_URI?.trim() || DEFAULT_REDIRECT_URI
}

export function getZohoAccountsBaseUrl(): string {
  return process.env.ZOHO_ACCOUNTS_BASE_URL?.trim() || 'https://accounts.zoho.in'
}

export function getZohoCampaignsApiBaseUrl(): string {
  return process.env.ZOHO_CAMPAIGNS_API_BASE_URL?.trim() || 'https://campaigns.zoho.in/api/v1.1'
}

export function buildZohoAuthorizationUrl(state: string, redirectUri?: string): string {
  const url = new URL('/oauth/v2/auth', getZohoAccountsBaseUrl())
  url.searchParams.set('scope', ZOHO_CAMPAIGNS_SCOPES.join(','))
  url.searchParams.set('client_id', getZohoClientId())
  url.searchParams.set('response_type', 'code')
  url.searchParams.set('access_type', 'offline')
  url.searchParams.set('prompt', 'consent')
  url.searchParams.set('redirect_uri', getZohoRedirectUri(redirectUri))
  url.searchParams.set('state', state)
  return url.toString()
}

export async function exchangeZohoAuthorizationCode(
  code: string,
  redirectUri?: string
): Promise<ZohoTokenResponse> {
  const body = new URLSearchParams({
    code,
    client_id: getZohoClientId(),
    client_secret: getZohoClientSecret(),
    redirect_uri: getZohoRedirectUri(redirectUri),
    grant_type: 'authorization_code',
  })

  const response = await fetch(`${getZohoAccountsBaseUrl()}/oauth/v2/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
    cache: 'no-store',
  })

  const data = (await response.json()) as ZohoTokenResponse
  if (!response.ok || data.error || !data.access_token) {
    throw new Error(data.error_description || data.error || `Zoho token exchange failed (${response.status})`)
  }
  return data
}

export async function refreshZohoAccessToken(refreshToken: string): Promise<ZohoTokenResponse> {
  const body = new URLSearchParams({
    refresh_token: refreshToken,
    client_id: getZohoClientId(),
    client_secret: getZohoClientSecret(),
    grant_type: 'refresh_token',
  })

  const response = await fetch(`${getZohoAccountsBaseUrl()}/oauth/v2/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
    cache: 'no-store',
  })

  const data = (await response.json()) as ZohoTokenResponse
  if (!response.ok || data.error || !data.access_token) {
    throw new Error(data.error_description || data.error || `Zoho token refresh failed (${response.status})`)
  }
  return data
}

async function zohoCampaignsGet<T>(
  accessToken: string,
  path: string,
  params?: Record<string, string>
): Promise<T> {
  const url = new URL(`${getZohoCampaignsApiBaseUrl()}${path}`)
  for (const [key, value] of Object.entries(params || {})) {
    url.searchParams.set(key, value)
  }

  const response = await fetch(url, {
    headers: { Authorization: `Zoho-oauthtoken ${accessToken}` },
    cache: 'no-store',
  })

  const text = await response.text()
  let data: unknown = text
  try {
    data = JSON.parse(text)
  } catch {
    // Keep the text body so failures remain diagnosable without logging tokens.
  }

  if (!response.ok) {
    throw new Error(`Zoho Campaigns API failed (${response.status}): ${typeof data === 'string' ? data : JSON.stringify(data)}`)
  }

  return data as T
}

export async function getZohoMailingLists(accessToken: string): Promise<ZohoMailingList[]> {
  const data = await zohoCampaignsGet<{ list_of_details?: ZohoMailingList[] }>(
    accessToken,
    '/getmailinglists',
    { resfmt: 'JSON', sort: 'asc', fromindex: '1', range: '200' }
  )
  return Array.isArray(data.list_of_details) ? data.list_of_details : []
}

export async function getZohoTopics(accessToken: string): Promise<ZohoTopic[]> {
  const data = await zohoCampaignsGet<{ topicDetails?: ZohoTopic[] }>(
    accessToken,
    '/topics',
    { details: JSON.stringify({ from_index: 0, range: 200 }) }
  )
  return Array.isArray(data.topicDetails) ? data.topicDetails : []
}
