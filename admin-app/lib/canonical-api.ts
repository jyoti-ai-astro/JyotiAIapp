import { cookies } from 'next/headers'

function getOrigin() {
  const origin = process.env.JYOTIAI_ADMIN_API_ORIGIN
  if (!origin) throw new Error('JYOTIAI_ADMIN_API_ORIGIN is not configured')
  return origin.replace(/\/$/, '')
}

function isApprovedJyotiHost(url: URL) {
  return url.protocol === 'https:' && (url.hostname === 'jyotiai.in' || url.hostname === 'www.jyotiai.in')
}

async function fetchWithCanonicalRedirect(url: string, init: RequestInit) {
  const first = await fetch(url, { ...init, redirect: 'manual', cache: 'no-store' })
  if (![307, 308].includes(first.status)) return first

  const location = first.headers.get('location')
  if (!location) return first
  const target = new URL(location, url)
  if (!isApprovedJyotiHost(target)) {
    throw new Error(`Refused admin API redirect to unapproved host: ${target.hostname}`)
  }

  return fetch(target, { ...init, redirect: 'manual', cache: 'no-store' })
}

export async function canonicalAdminFetch(path: string, init: RequestInit = {}) {
  const cookieStore = await cookies()
  const adminSession = cookieStore.get('admin_session')?.value
  const origin = getOrigin()
  const headers = new Headers(init.headers)
  headers.set('Accept', 'application/json')
  headers.set('Origin', origin)
  if (adminSession) headers.set('Cookie', `admin_session=${adminSession}`)

  return fetchWithCanonicalRedirect(`${origin}${path}`, { ...init, headers })
}
