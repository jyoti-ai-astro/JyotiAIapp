import { NextResponse, type NextRequest } from 'next/server'

const encoder = new TextEncoder()

async function verifyAdminSessionToken(token: string) {
  try {
    const secret = process.env.ADMIN_SESSION_SECRET
    if (!secret) return false

    const parts = token.split('.')
    if (parts.length !== 3) return false

    const [header, body, signature] = parts
    const data = `${header}.${body}`

    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    )

    const sigBuffer = await crypto.subtle.sign('HMAC', key, encoder.encode(data))
    const expected = base64UrlEncode(new Uint8Array(sigBuffer))
    if (expected !== signature) return false

    const payload = JSON.parse(atobUrl(body))
    if (payload.exp && Date.now() > payload.exp) return false

    return true
  } catch (error) {
    console.error('Admin session verification failed in middleware:', error)
    return false
  }
}

function base64UrlEncode(bytes: Uint8Array) {
  return Buffer.from(bytes)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')
}

function atobUrl(value: string) {
  value = value.replace(/-/g, '+').replace(/_/g, '/')
  const pad = value.length % 4
  if (pad) value += '='.repeat(4 - pad)
  return Buffer.from(value, 'base64').toString('utf8')
}

function hardenAdminResponse(response: NextResponse) {
  response.headers.set('X-Robots-Tag', 'noindex, nofollow, noarchive, nosnippet')
  response.headers.set('Cache-Control', 'no-store, private')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('Referrer-Policy', 'no-referrer')
  response.headers.set('X-Frame-Options', 'DENY')
  return response
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Development surfaces must not exist in production.
  if (process.env.NODE_ENV === 'production' && (pathname === '/dev' || pathname.startsWith('/dev/'))) {
    return new NextResponse('Not Found', { status: 404 })
  }

  const legacyRedirects: Record<string, string> = {
    '/home': '/',
    '/premium': '/pricing',
    '/profile-setup': '/onboarding',
    '/rasi-confirmation': '/onboarding',
    '/report': '/reports',
  }

  const legacyDestination = legacyRedirects[pathname]
  if (legacyDestination) {
    return NextResponse.redirect(new URL(legacyDestination, request.url))
  }

  const publicAuthRoutes = ['/login', '/signup', '/reset-password', '/magic-link']
  const isPublicAuthRoute = publicAuthRoutes.some((route) => pathname === route)

  const protectedRoutes = [
    '/dashboard',
    '/onboarding',
    '/kundali',
    '/guru',
    '/predictions',
    '/timeline',
    '/reports',
    '/profile',
    '/settings',
    '/payments',
    '/pay',
    '/scan',
    '/insights',
  ]

  const isProtectedRoute = protectedRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  )

  const isAdminRoute = pathname === '/admin' || pathname.startsWith('/admin/')

  if (isPublicAuthRoute) return NextResponse.next()

  const sessionCookie = request.cookies.get('session')
  if (isProtectedRoute && !sessionCookie) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  if (isAdminRoute) {
    const adminSessionCookie = request.cookies.get('admin_session')?.value

    if (!adminSessionCookie) {
      if (pathname === '/admin/login') {
        return hardenAdminResponse(NextResponse.next())
      }
      return hardenAdminResponse(NextResponse.redirect(new URL('/admin/login', request.url)))
    }

    const isValid = await verifyAdminSessionToken(adminSessionCookie)
    if (!isValid) {
      return hardenAdminResponse(NextResponse.redirect(new URL('/admin/login', request.url)))
    }

    return hardenAdminResponse(NextResponse.next())
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
