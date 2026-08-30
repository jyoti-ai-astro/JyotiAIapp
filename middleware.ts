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

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Source modules under /dev may be reused by production UI, but the public
  // development URL namespace itself must not be exposed in production.
  if (
    process.env.NODE_ENV === 'production' &&
    (pathname === '/dev' || pathname.startsWith('/dev/'))
  ) {
    return new NextResponse(null, { status: 404 })
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

  const adminRoutes = ['/admin']
  const isAdminRoute = adminRoutes.some((route) => pathname.startsWith(route))

  if (isPublicAuthRoute) return NextResponse.next()

  const sessionCookie = request.cookies.get('session')

  // Onboarding is the new-user journey. Public CTAs intentionally point here,
  // so a signed-out visitor should enter signup rather than a returning-user
  // login flow. Preserve an explicit redirect back to onboarding after signup.
  if (pathname === '/onboarding' && !sessionCookie) {
    const signupUrl = new URL('/signup', request.url)
    signupUrl.searchParams.set('redirect', '/onboarding')
    return NextResponse.redirect(signupUrl)
  }

  if (isProtectedRoute && !sessionCookie) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  if (isAdminRoute) {
    const adminSessionCookie = request.cookies.get('admin_session')?.value
    if (!adminSessionCookie) {
      if (pathname === '/admin/login') return NextResponse.next()
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }

    const isValid = !!adminSessionCookie && (await verifyAdminSessionToken(adminSessionCookie))
    if (!isValid) {
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }

    return NextResponse.next({
      request: {
        headers: request.headers,
      },
    })
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
