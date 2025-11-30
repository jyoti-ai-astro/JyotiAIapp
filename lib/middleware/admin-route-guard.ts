/**
 * Admin Route Guard
 * 
 * Mega Build 4 - Admin Command Center
 * Server-side protection for admin routes
 */

import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminSession } from '@/lib/admin/admin-auth'

/**
 * Check if request is from admin (for use in page components)
 */
export async function checkAdminAccess(request: NextRequest): Promise<{
  isAdmin: boolean
  admin: any | null
  redirect?: NextResponse
}> {
  const sessionCookie = request.cookies.get('admin_session')?.value

  if (!sessionCookie) {
    return {
      isAdmin: false,
      admin: null,
      redirect: NextResponse.redirect(new URL('/admin/login', request.url)),
    }
  }

  const admin = await verifyAdminSession(sessionCookie)

  if (!admin) {
    return {
      isAdmin: false,
      admin: null,
      redirect: NextResponse.redirect(new URL('/admin/login', request.url)),
    }
  }

  return {
    isAdmin: true,
    admin,
  }
}

