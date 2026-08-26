import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const origin = process.env.JYOTIAI_ADMIN_API_ORIGIN?.replace(/\/$/, '')
  if (!origin) return NextResponse.json({ error: 'Admin backend is not configured' }, { status: 500 })

  const body = await request.text()
  const upstream = await fetch(`${origin}/api/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Origin': origin },
    body,
    cache: 'no-store',
  })

  const payload = await upstream.json().catch(() => ({ error: 'Authentication failed' }))
  const response = NextResponse.json(payload, { status: upstream.status })

  const setCookie = upstream.headers.get('set-cookie')
  const sessionMatch = setCookie?.match(/admin_session=([^;]+)/)
  if (upstream.ok && sessionMatch?.[1]) {
    response.cookies.set('admin_session', sessionMatch[1], {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 5,
    })
  }

  return response
}
