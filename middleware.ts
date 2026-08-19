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
    if (payload.exp && Date.now() > payload.exp) {
      return false
    }

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
  if (pad) {
    value += '='.repeat(4 - pad)
  }
  return Buffer.from(value, 'base64').toString('utf8')
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Public auth routes (always allow)
  const publicAuthRoutes = ['/login', '/signup', '/reset-password', '/magic-link']
  const isPublicAuthRoute = publicAuthRoutes.some((route) => pathname === route)

  // Protected routes that require authentication
  const protectedRoutes = ['/dashboard', '/onboarding', '/scan', '/insights', '/reports', '/guru', '/settings']
  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route))

  // Admin routes
  const adminRoutes = ['/admin']
  const isAdminRoute = adminRoutes.some((route) => pathname.startsWith(route))

  // Always allow public auth routes
  if (isPublicAuthRoute) {
    return NextResponse.next()
  }

  // Check for session cookie (will be set by auth API)
  const sessionCookie = request.cookies.get('session')

  if (isProtectedRoute && !sessionCookie) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Admin routes require admin_session cookie (not regular session)
  if (isAdminRoute) {
    const adminSessionCookie = request.cookies.get('admin_session')?.value
    if (!adminSessionCookie) {
      // Allow /admin/login to pass through
      if (pathname === '/admin/login') {
        return NextResponse.next()
      }
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }

    // Validate signed admin session token
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
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
