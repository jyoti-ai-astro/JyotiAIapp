/**
 * Admin Middleware
 * Central authentication, authorization, and mutation-origin enforcement.
 */

import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminSession, hasPermission } from '@/lib/admin/admin-auth'

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS'])

function validateMutationOrigin(request: NextRequest): boolean {
  if (SAFE_METHODS.has(request.method.toUpperCase())) return true

  const origin = request.headers.get('origin')
  if (!origin) return false

  try {
    const originUrl = new URL(origin)
    return originUrl.host === request.nextUrl.host && originUrl.protocol === request.nextUrl.protocol
  } catch {
    return false
  }
}

export function withAdminAuth(
  handler: (request: NextRequest, admin: any) => Promise<NextResponse>,
  requiredPermission?: string
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    try {
      const sessionCookie = request.cookies.get('admin_session')?.value
      if (!sessionCookie) {
        return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
      }

      const admin = await verifyAdminSession(sessionCookie)
      if (!admin) {
        return NextResponse.json({ error: 'Invalid session' }, { status: 401 })
      }

      if (!validateMutationOrigin(request)) {
        return NextResponse.json(
          { error: 'Invalid request origin', code: 'ADMIN_ORIGIN_REJECTED' },
          { status: 403 }
        )
      }

      if (requiredPermission) {
        const hasAccess = await hasPermission(admin.uid, requiredPermission)
        if (!hasAccess) {
          return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
        }
      }

      return handler(request, admin)
    } catch (error) {
      console.error('Admin middleware error:', error)
      return NextResponse.json({ error: 'Authentication failed' }, { status: 401 })
    }
  }
}

export async function checkAdminSession(request: NextRequest): Promise<{
  admin: any
  error?: NextResponse
}> {
  const sessionCookie = request.cookies.get('admin_session')?.value

  if (!sessionCookie) {
    return {
      admin: null,
      error: NextResponse.json({ error: 'Not authenticated' }, { status: 401 }),
    }
  }

  const admin = await verifyAdminSession(sessionCookie)
  if (!admin) {
    return {
      admin: null,
      error: NextResponse.json({ error: 'Invalid session' }, { status: 401 }),
    }
  }

  if (!validateMutationOrigin(request)) {
    return {
      admin: null,
      error: NextResponse.json(
        { error: 'Invalid request origin', code: 'ADMIN_ORIGIN_REJECTED' },
        { status: 403 }
      ),
    }
  }

  return { admin }
}
