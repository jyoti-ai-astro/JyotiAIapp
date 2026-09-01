import { NextRequest, NextResponse } from 'next/server'
import { adminAuth } from '@/lib/firebase/admin'
import { envVars } from '@/lib/env/env.mjs'
import { sendPasswordResetLink } from '@/lib/email/email-service'

export const dynamic = 'force-dynamic'

const GENERIC_RESPONSE = {
  success: true,
  message:
    'If an account can receive password recovery at that address, recovery instructions will be sent.',
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null)
    const email =
      typeof body?.email === 'string' ? body.email.trim().toLowerCase() : ''

    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Enter a valid email address.' },
        { status: 400 }
      )
    }

    if (!adminAuth) {
      console.error(
        'Password reset unavailable: Firebase Admin is not initialized.'
      )
      return NextResponse.json(
        { error: 'Password recovery is temporarily unavailable.' },
        { status: 503 }
      )
    }

    try {
      const actionCodeSettings = {
        url: `${envVars.app.baseUrl}/login`,
      }

      const resetUrl = await adminAuth.generatePasswordResetLink(
        email,
        actionCodeSettings
      )

      const sent = await sendPasswordResetLink(email, resetUrl)

      if (!sent) {
        console.error('Password reset email sending returned false')
        return NextResponse.json(
          { error: 'Password recovery is temporarily unavailable.' },
          { status: 503 }
        )
      }
    } catch (error: unknown) {
      const code =
        typeof error === 'object' &&
        error &&
        'code' in error
          ? String((error as { code?: unknown }).code || '')
          : ''

      if (
        code === 'auth/user-not-found' ||
        code === 'auth/invalid-email'
      ) {
        return NextResponse.json(GENERIC_RESPONSE)
      }

      console.error('Password reset delivery error:', error)

      return NextResponse.json(
        { error: 'Password recovery is temporarily unavailable.' },
        { status: 503 }
      )
    }

    return NextResponse.json(GENERIC_RESPONSE)
  } catch (error) {
    console.error('Password reset request error:', error)

    return NextResponse.json(
      { error: 'Password recovery is temporarily unavailable.' },
      { status: 500 }
    )
  }
}
