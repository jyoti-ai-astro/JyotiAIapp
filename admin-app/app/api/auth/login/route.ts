import { NextRequest, NextResponse } from 'next/server'

function getSetCookies(headers: Headers): string[] {
  const extended = headers as Headers & { getSetCookie?: () => string[] }
  const values = extended.getSetCookie?.()
  if (values?.length) return values
  const single = headers.get('set-cookie')
  return single ? [single] : []
}

function extractAdminSession(setCookies: string[]): string | null {
  for (const value of setCookies) {
    const match = value.match(/(?:^|[,;]\s*)admin_session=([^;,\s]+)/)
    if (match?.[1]) return match[1]
  }
  return null
}

export async function POST(request: NextRequest) {
  const origin = process.env.JYOTIAI_ADMIN_API_ORIGIN?.replace(/\/$/, '')
  if (!origin) return NextResponse.json({ error: 'Admin backend is not configured' }, { status: 500 })

  const body = await request.text()
  const upstream = await fetch(`${origin}/api/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Origin: origin },
    body,
    cache: 'no-store',
    redirect: 'manual',
  })

  const payload = await upstream.json().catch(() => ({ error: 'Authentication failed' }))
  const setCookies = getSetCookies(upstream.headers)
  const adminSession = extractAdminSession(setCookies)

  if (upstream.ok && !adminSession) {
    console.error('[admin-login-proxy] Upstream authenticated but no admin_session cookie was returned', {
      upstreamStatus: upstream.status,
      setCookieCount: setCookies.length,
    })
    return NextResponse.json(
      { error: 'Authentication succeeded upstream but the admin session cookie was not returned' },
      { status: 502 }
    )
  }

  const response = NextResponse.json(payload, { status: upstream.status })
  if (upstream.ok && adminSession) {
    response.cookies.set('admin_session', adminSession, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 5,
    })
    response.headers.set('X-JyotiAI-Admin-Session', 'captured')
  }

  return response
}
