import { NextRequest, NextResponse } from 'next/server'
import { adminAuth } from '@/lib/firebase/admin'
import { sendMagicLink } from '@/lib/email/email-service'

export const dynamic = 'force-dynamic'

/**
 * Magic Link Authentication
 * Part B - Section 2: Authentication + Magic Link
 * Part C - Chunk 16: ZeptoMail Integration
 */
export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Valid email required' }, { status: 400 })
    }

    if (!adminAuth) {
      return NextResponse.json(
        { error: 'FIREBASE_ADMIN credentials missing. Firebase Admin not initialized.' },
        { status: 500 }
      )
    }

    // Phase 31 - F46: Use validated environment variables
    const { envVars } = await import('@/lib/env/env.mjs')
    
    // Generate action code settings
    const actionCodeSettings = {
      url: `${envVars.app.baseUrl}/auth/callback`,
      handleCodeInApp: true,
    }

    // Generate magic link
    const link = await adminAuth.generateSignInWithEmailLink(email, actionCodeSettings)

    // Send email via ZeptoMail
    const emailSent = await sendMagicLink(
      email,
      link,
      request.headers.get('user-agent') || undefined
    )

    if (!emailSent) {
      return NextResponse.json(
        { error: 'Failed to send email. Please try again.' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Magic link sent to your email',
    })
  } catch (error: any) {
    console.error('Magic link error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to send magic link' },
      { status: 500 }
    )
  }
}

