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

export type ZohoCampaignsMutationResponse = {
  status?: string
  code?: string
  message?: string
  uri?: string
  version?: string
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

export function getZohoRefreshToken(): string {
  return requiredEnv('ZOHO_CAMPAIGNS_REFRESH_TOKEN')
}

export function getZohoListKey(): string {
  return requiredEnv('ZOHO_CAMPAIGNS_LIST_KEY')
}

export function getZohoTopicId(): string {
  return requiredEnv('ZOHO_CAMPAIGNS_TOPIC_ID')
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

export async function getZohoAccessToken(): Promise<string> {
  const data = await refreshZohoAccessToken(getZohoRefreshToken())
  return data.access_token!
}

async function parseZohoResponse(response: Response): Promise<unknown> {
  const text = await response.text()
  if (!text) return null
  try {
    return JSON.parse(text)
  } catch {
    return text
  }
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
  const data = await parseZohoResponse(response)
  if (!response.ok) {
    throw new Error(`Zoho Campaigns API failed (${response.status}): ${typeof data === 'string' ? data : JSON.stringify(data)}`)
  }
  return data as T
}

async function zohoCampaignsPost<T>(
  accessToken: string,
  path: string,
  params: Record<string, string>
): Promise<T> {
  const body = new URLSearchParams(params)
  const response = await fetch(`${getZohoCampaignsApiBaseUrl()}${path}`, {
    method: 'POST',
    headers: {
      Authorization: `Zoho-oauthtoken ${accessToken}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body,
    cache: 'no-store',
  })
  const data = await parseZohoResponse(response)
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

export async function subscribeZohoContact(input: {
  email: string
  firstName?: string | null
  lastName?: string | null
  source?: string
}): Promise<ZohoCampaignsMutationResponse> {
  const accessToken = await getZohoAccessToken()
  const contactInfo: Record<string, string> = { 'Contact Email': input.email }
  if (input.firstName?.trim()) contactInfo['First Name'] = input.firstName.trim()
  if (input.lastName?.trim()) contactInfo['Last Name'] = input.lastName.trim()

  const data = await zohoCampaignsPost<ZohoCampaignsMutationResponse>(
    accessToken,
    '/json/listsubscribe',
    {
      resfmt: 'JSON',
      listkey: getZohoListKey(),
      contactinfo: JSON.stringify(contactInfo),
      source: input.source || 'JyotiAI App Opt-in',
      topic_id: getZohoTopicId(),
    }
  )

  if (data && data.code && data.code !== '0') {
    throw new Error(data.message || `Zoho Campaigns subscribe failed (${data.code})`)
  }
  return data
}

export async function unsubscribeZohoContact(email: string): Promise<ZohoCampaignsMutationResponse> {
  const accessToken = await getZohoAccessToken()
  const data = await zohoCampaignsPost<ZohoCampaignsMutationResponse>(
    accessToken,
    '/json/listunsubscribe',
    {
      resfmt: 'JSON',
      listkey: getZohoListKey(),
      contactinfo: JSON.stringify({ 'Contact Email': email }),
      topic_id: getZohoTopicId(),
    }
  )

  if (data && data.code && data.code !== '0') {
    throw new Error(data.message || `Zoho Campaigns unsubscribe failed (${data.code})`)
  }
  return data
}
