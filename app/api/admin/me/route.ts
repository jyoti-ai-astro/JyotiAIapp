export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { checkAdminSession } from '@/lib/middleware/admin-middleware'

/**
 * Get Current Admin User
 * Milestone 10 - Step 1
 */
export async function GET(request: NextRequest) {
  const { admin, error } = await checkAdminSession(request)

  if (error) {
    return error
  }

  return NextResponse.json({
    success: true,
    admin: {
      uid: admin.uid,
      email: admin.email,
      role: admin.role,
      name: admin.name,
    },
  })
}

