import { NextRequest, NextResponse } from 'next/server'
import { adminAuth, adminDb } from '@/lib/firebase/admin'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const { idToken } = await request.json()

    if (!idToken) {
      return NextResponse.json({ error: 'ID token required' }, { status: 400 })
    }

    // Verify ID token with Firebase Admin
    if (!adminAuth) {
      return NextResponse.json(
        { error: 'FIREBASE_ADMIN credentials missing. Firebase Admin not initialized. Check FIREBASE_ADMIN_PROJECT_ID, FIREBASE_ADMIN_PRIVATE_KEY, and FIREBASE_ADMIN_CLIENT_EMAIL environment variables.' },
        { status: 500 }
      )
    }

    const decodedToken = await adminAuth.verifyIdToken(idToken)
    const uid = decodedToken.uid

    // Create or update user profile in Firestore
    if (!adminDb) {
      return NextResponse.json(
        { error: 'FIREBASE_ADMIN credentials missing. Firestore not initialized.' },
        { status: 500 }
      )
    }

    const userRef = adminDb.collection('users').doc(uid)
    const userSnap = await userRef.get()

    // Get user's custom claims to check admin status
    let isAdmin = false
    try {
      const userRecord = await adminAuth.getUser(uid)
      isAdmin = userRecord.customClaims?.admin === true || false
    } catch (error) {
      // If getUser fails, check userData
      const userData = userSnap.exists ? userSnap.data() : null
      isAdmin = userData?.role === 'admin' || false
    }

    if (!userSnap.exists) {
      // Create new user profile
      await userRef.set({
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
        createdAt: new Date(),
        updatedAt: new Date(),
      })
    } else {
      // Update last login
      await userRef.update({
        updatedAt: new Date(),
      })
    }

    // Create session cookie (14 days)
    const expiresIn = 60 * 60 * 24 * 14 * 1000 // 14 days in milliseconds
    const sessionCookie = await adminAuth.createSessionCookie(idToken, {
      expiresIn,
    })

    const userData = userSnap.exists ? userSnap.data() : null

    const response = NextResponse.json({
      success: true,
      uid,
      onboarded: userSnap.exists ? (userData?.onboarded || false) : false,
      isAdmin: isAdmin || false,
    })

    // Set secure HTTP-only cookie
    response.cookies.set('session', sessionCookie, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: expiresIn / 1000, // Convert to seconds
      path: '/',
    })

    return response
  } catch (error: any) {
    console.error('Login error:', error)
    
    // Handle specific Firebase errors
    if (error.code === 'auth/id-token-expired') {
      return NextResponse.json({ error: 'Token expired' }, { status: 401 })
    }
    
    return NextResponse.json(
      { error: error.message || 'Authentication failed' },
      { status: 401 }
    )
  }
}

