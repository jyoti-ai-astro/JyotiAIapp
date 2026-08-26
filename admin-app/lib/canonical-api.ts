import { cookies } from 'next/headers'

function getOrigin() {
  const origin = process.env.JYOTIAI_ADMIN_API_ORIGIN
  if (!origin) throw new Error('JYOTIAI_ADMIN_API_ORIGIN is not configured')
  return origin.replace(/\/$/, '')
}

export async function canonicalAdminFetch(path: string, init: RequestInit = {}) {
  const cookieStore = await cookies()
  const adminSession = cookieStore.get('admin_session')?.value
  const origin = getOrigin()
  const headers = new Headers(init.headers)
  headers.set('Accept', 'application/json')
  headers.set('Origin', origin)
  if (adminSession) headers.set('Cookie', `admin_session=${adminSession}`)
  return fetch(`${origin}${path}`, { ...init, headers, cache: 'no-store' })
}
