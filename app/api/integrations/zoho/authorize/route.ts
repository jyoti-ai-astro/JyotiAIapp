export const dynamic = 'force-dynamic'

import { randomBytes, timingSafeEqual } from 'crypto'
import { NextRequest, NextResponse } from 'next/server'
import { checkAdminSession } from '@/lib/middleware/admin-middleware'
import { buildZohoAuthorizationUrl } from '@/lib/integrations/zoho-campaigns'

const BOOTSTRAP_COOKIE = 'zoho_oauth_bootstrap'
const BOOTSTRAP_PATH = '/api/integrations/zoho'

function safeEqual(left: string, right: string): boolean {
  const a = Buffer.from(left)
  const b = Buffer.from(right)
  return a.length === b.length && timingSafeEqual(a, b)
}

function bootstrapSecret(): string | null {
  return process.env.ZOHO_CAMPAIGNS_BOOTSTRAP_SECRET?.trim() || null
}

function hasBootstrapCookie(request: NextRequest): boolean {
  const secret = bootstrapSecret()
  const cookie = request.cookies.get(BOOTSTRAP_COOKIE)?.value
  return Boolean(secret && cookie && safeEqual(cookie, secret))
}

async function isAuthorizedForBootstrap(request: NextRequest): Promise<boolean> {
  const { admin } = await checkAdminSession(request)
  return Boolean(admin) || hasBootstrapCookie(request)
}

export async function GET(request: NextRequest) {
  const suppliedSetupKey = request.nextUrl.searchParams.get('setup_key')
  const secret = bootstrapSecret()

  // Preview-only bootstrap: exchange the URL key for a short-lived HttpOnly cookie,
  // then immediately remove the key from the browser URL/history flow.
  if (suppliedSetupKey) {
    if (!secret || !safeEqual(suppliedSetupKey, secret)) {
      return NextResponse.json({ error: 'Invalid setup key' }, { status: 401 })
    }

    const cleanUrl = new URL(request.url)
    cleanUrl.searchParams.delete('setup_key')
    const response = NextResponse.redirect(cleanUrl)
    response.cookies.set(BOOTSTRAP_COOKIE, secret, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      maxAge: 15 * 60,
      path: BOOTSTRAP_PATH,
    })
    return response
  }

  if (!(await isAuthorizedForBootstrap(request))) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  try {
    const state = randomBytes(32).toString('hex')
    const callbackUrl = new URL('/api/integrations/zoho/callback', request.nextUrl.origin).toString()
    const response = NextResponse.redirect(buildZohoAuthorizationUrl(state, callbackUrl))

    response.cookies.set('zoho_oauth_state', state, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      maxAge: 10 * 60,
      path: BOOTSTRAP_PATH,
    })

    return response
  } catch (err: any) {
    console.error('Zoho authorize error:', err)
    return NextResponse.json(
      { error: err?.message || 'Unable to start Zoho authorization' },
      { status: 500 }
    )
  }
}
