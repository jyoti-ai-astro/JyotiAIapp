/**
 * Admin Middleware
 * Milestone 10 - Step 1
 * 
 * Protects admin routes and verifies admin sessions
 */

import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminSession, hasPermission } from '@/lib/admin/admin-auth'

/**
 * Admin middleware wrapper
 */
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

      // Check permission if required
      if (requiredPermission) {
        const hasAccess = await hasPermission(admin.uid, requiredPermission)
        if (!hasAccess) {
          return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
        }
      }

      return handler(request, admin)
    } catch (error: any) {
      console.error('Admin middleware error:', error)
      return NextResponse.json({ error: 'Authentication failed' }, { status: 401 })
    }
  }
}

/**
 * Check admin session (for use in API routes)
 */
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

  return { admin }
}

