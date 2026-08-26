import { cookies } from 'next/headers'

const REQUEST_TIMEOUT_MS = 12_000
let learnedCanonicalOrigin: string | null = null

function getConfiguredOrigin() {
  const origin = process.env.JYOTIAI_ADMIN_API_ORIGIN
  if (!origin) throw new Error('JYOTIAI_ADMIN_API_ORIGIN is not configured')
  return origin.replace(/\/$/, '')
}

function isApprovedJyotiHost(url: URL) {
  return url.protocol === 'https:' && (url.hostname === 'jyotiai.in' || url.hostname === 'www.jyotiai.in')
}

function methodOf(init: RequestInit) {
  return String(init.method || 'GET').toUpperCase()
}

function isRetryableRead(init: RequestInit) {
  return ['GET', 'HEAD'].includes(methodOf(init))
}

async function boundedFetch(url: string, init: RequestInit) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)
  try {
    return await fetch(url, { ...init, signal: controller.signal, redirect: 'manual', cache: 'no-store' })
  } finally {
    clearTimeout(timer)
  }
}

async function fetchWithCanonicalRedirect(url: string, init: RequestInit) {
  const first = await boundedFetch(url, init)
  if (![307, 308].includes(first.status)) return first

  const location = first.headers.get('location')
  if (!location) return first
  const target = new URL(location, url)
  if (!isApprovedJyotiHost(target)) {
    throw new Error(`Refused admin API redirect to unapproved host: ${target.hostname}`)
  }

  learnedCanonicalOrigin = target.origin
  return boundedFetch(target.toString(), init)
}

async function fetchWithSafeRetry(url: string, init: RequestInit) {
  try {
    return await fetchWithCanonicalRedirect(url, init)
  } catch (error: any) {
    if (!isRetryableRead(init)) throw error
    const retryable = error?.name === 'AbortError' || ['ETIMEDOUT', 'ECONNRESET', 'EAI_AGAIN'].includes(error?.cause?.code || error?.code)
    if (!retryable) throw error
    await new Promise((resolve) => setTimeout(resolve, 250))
    return fetchWithCanonicalRedirect(url, init)
  }
}

async function fetchPath(origin: string, path: string, init: RequestInit) {
  return fetchWithSafeRetry(`${origin}${path}`, init)
}

export async function canonicalAdminFetch(path: string, init: RequestInit = {}) {
  const cookieStore = await cookies()
  const adminSession = cookieStore.get('admin_session')?.value
  const configuredOrigin = getConfiguredOrigin()
  const origin = learnedCanonicalOrigin || configuredOrigin
  const headers = new Headers(init.headers)
  headers.set('Accept', 'application/json')
  headers.set('Origin', configuredOrigin)
  if (adminSession) headers.set('Cookie', `admin_session=${adminSession}`)
  const requestInit = { ...init, headers }

  // The Mission Control overview is additive and verified-success-only. Until its
  // backend batch is deployed, fall back to the legacy dashboard route so local
  // development remains usable without coordinating both deployments atomically.
  if (path.startsWith('/api/admin/dashboard/stats') && isRetryableRead(init)) {
    const queryIndex = path.indexOf('?')
    const query = queryIndex >= 0 ? path.slice(queryIndex) : ''
    const mission = await fetchPath(origin, `/api/admin/mission/overview${query}`, requestInit)
    if (mission.status !== 404 && mission.status !== 401 && mission.status !== 403) return mission
  }

  return fetchPath(origin, path, requestInit)
}
