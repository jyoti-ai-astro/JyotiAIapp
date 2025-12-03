export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

/**
 * Admin Logout API
 * Milestone 10 - Step 1
 */
export async function POST(request: NextRequest) {
  const cookieStore = await cookies()
  cookieStore.delete('admin_session')

  return NextResponse.json({ success: true })
}

