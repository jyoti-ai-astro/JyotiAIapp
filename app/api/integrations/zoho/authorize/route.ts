export const dynamic = 'force-dynamic'

import { randomBytes } from 'crypto'
import { NextRequest, NextResponse } from 'next/server'
import { checkAdminSession } from '@/lib/middleware/admin-middleware'
import { buildZohoAuthorizationUrl } from '@/lib/integrations/zoho-campaigns'

export async function GET(request: NextRequest) {
  const { admin, error } = await checkAdminSession(request)
  if (error || !admin) return error || NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

  try {
    const state = randomBytes(32).toString('hex')
    const callbackUrl = new URL('/api/integrations/zoho/callback', request.nextUrl.origin).toString()
    const response = NextResponse.redirect(buildZohoAuthorizationUrl(state, callbackUrl))

    response.cookies.set('zoho_oauth_state', state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 10 * 60,
      path: '/api/integrations/zoho',
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
