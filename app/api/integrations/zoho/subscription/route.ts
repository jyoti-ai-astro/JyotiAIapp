export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { adminAuth, adminDb } from '@/lib/firebase/admin'
import {
  subscribeZohoContact,
  unsubscribeZohoContact,
} from '@/lib/integrations/zoho-campaigns'

function splitName(displayName?: string | null): { firstName?: string; lastName?: string } {
  const value = displayName?.trim()
  if (!value) return {}
  const parts = value.split(/\s+/)
  if (parts.length === 1) return { firstName: parts[0] }
  return { firstName: parts[0], lastName: parts.slice(1).join(' ') }
}

export async function POST(request: NextRequest) {
  try {
    if (!adminAuth || !adminDb) {
      return NextResponse.json({ error: 'Server authentication is not configured' }, { status: 500 })
    }

    const sessionCookie = request.cookies.get('session')?.value
    if (!sessionCookie) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const decoded = await adminAuth.verifySessionCookie(sessionCookie, true)
    const email = decoded.email?.trim().toLowerCase()
    if (!email) {
      return NextResponse.json({ error: 'Authenticated account has no email address' }, { status: 400 })
    }

    const body = await request.json().catch(() => null) as { consent?: unknown } | null
    if (!body || typeof body.consent !== 'boolean') {
      return NextResponse.json({ error: 'consent must be true or false' }, { status: 400 })
    }

    const userRef = adminDb.collection('users').doc(decoded.uid)
    const userSnap = await userRef.get()
    const userData = userSnap.exists ? userSnap.data() : null
    const names = splitName((userData?.name as string | null | undefined) || decoded.name || null)
    const now = new Date()

    if (body.consent) {
      const zoho = await subscribeZohoContact({
        email,
        firstName: names.firstName,
        lastName: names.lastName,
        source: 'JyotiAI App Explicit Opt-in',
      })

      await userRef.set({
        marketingConsent: true,
        marketingConsentUpdatedAt: now,
        marketingConsentSource: 'app',
        marketingProvider: 'zoho_campaigns',
        marketingSyncStatus: 'subscribed',
        marketingSyncedAt: now,
      }, { merge: true })

      return NextResponse.json({
        success: true,
        consent: true,
        status: zoho.status || 'success',
        message: zoho.message || 'Marketing subscription updated',
      })
    }

    const zoho = await unsubscribeZohoContact(email)

    await userRef.set({
      marketingConsent: false,
      marketingConsentUpdatedAt: now,
      marketingConsentSource: 'app',
      marketingProvider: 'zoho_campaigns',
      marketingSyncStatus: 'unsubscribed',
      marketingSyncedAt: now,
    }, { merge: true })

    return NextResponse.json({
      success: true,
      consent: false,
      status: zoho.status || 'success',
      message: zoho.message || 'Marketing subscription updated',
    })
  } catch (error: any) {
    console.error('Zoho marketing subscription sync failed:', error)
    return NextResponse.json(
      { error: error?.message || 'Unable to update marketing subscription' },
      { status: 500 }
    )
  }
}
