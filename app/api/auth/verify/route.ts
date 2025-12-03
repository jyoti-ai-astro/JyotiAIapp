import { NextRequest, NextResponse } from 'next/server'
import { adminAuth, adminDb } from '@/lib/firebase/admin'

export const dynamic = 'force-dynamic'

/**
 * Verify Auth Token
 * Used by useAuth hook to verify Firebase ID token and get user data
 */
export async function POST(request: NextRequest) {
  try {
    const { idToken } = await request.json()

    if (!idToken) {
      return NextResponse.json({ error: 'ID token required' }, { status: 400 })
    }

    if (!adminAuth) {
      return NextResponse.json(
        { error: 'FIREBASE_ADMIN credentials missing. Firebase Admin not initialized.' },
        { status: 500 }
      )
    }

    const decodedToken = await adminAuth.verifyIdToken(idToken)
    const uid = decodedToken.uid

    // Get user data from Firestore
    if (!adminDb) {
      return NextResponse.json(
        { error: 'FIREBASE_ADMIN credentials missing. Firestore not initialized.' },
        { status: 500 }
      )
    }

    const userRef = adminDb.collection('users').doc(uid)
    const userSnap = await userRef.get()

    if (!userSnap.exists) {
      // User doesn't exist in Firestore yet - return basic data
      return NextResponse.json({
        uid,
        name: decodedToken.name || null,
        email: decodedToken.email || null,
        photo: decodedToken.picture || null,
        dob: null,
        tob: null,
        pob: null,
        rashi: null,
        nakshatra: null,
        subscription: 'free',
        subscriptionExpiry: null,
        onboarded: false,
      })
    }

    const userData = userSnap.data()

    return NextResponse.json({
      uid,
      name: userData?.name || decodedToken.name || null,
      email: userData?.email || decodedToken.email || null,
      photo: userData?.photo || decodedToken.picture || null,
      dob: userData?.dob || null,
      tob: userData?.tob || null,
      pob: userData?.pob || null,
      rashi: userData?.rashi || null,
      nakshatra: userData?.nakshatra || null,
      subscription: userData?.subscription || 'free',
      subscriptionExpiry: userData?.subscriptionExpiry || null,
      onboarded: userData?.onboarded || false,
    })
  } catch (error: any) {
    console.error('Auth verify error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to verify token' },
      { status: 401 }
    )
  }
}

