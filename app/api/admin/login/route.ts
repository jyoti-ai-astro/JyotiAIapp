import { NextRequest, NextResponse } from 'next/server'
import { adminAuth, adminDb } from '@/lib/firebase/admin'
import { getAdminUser, updateAdminLastLogin, createAdminSession } from '@/lib/admin/admin-auth'
import { cookies } from 'next/headers'

/**
 * Admin Login API
 * Milestone 10 - Step 1
 */
export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 })
    }

    if (!adminAuth || !adminDb) {
      return NextResponse.json({ error: 'Admin auth not configured' }, { status: 500 })
    }

    // Find admin by email
    const adminsRef = adminDb.collection('admins')
    const snapshot = await adminsRef.where('email', '==', email.toLowerCase()).limit(1).get()

    if (snapshot.empty) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    const adminDoc = snapshot.docs[0]
    const adminData = adminDoc.data()

    // In production, use proper password hashing (bcrypt, etc.)
    // For now, check if password matches (this should be replaced with secure authentication)
    if (adminData.password !== password) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    const uid = adminDoc.id
    const admin = await getAdminUser(uid)

    if (!admin) {
      return NextResponse.json({ error: 'Admin not found' }, { status: 404 })
    }

    // Create session cookie
    const customToken = await createAdminSession(uid)
    const idToken = await adminAuth.verifyIdToken(customToken)

    const expiresIn = 60 * 60 * 24 * 5 * 1000 // 5 days
    const sessionCookie = await adminAuth.createSessionCookie(idToken.uid, { expiresIn })

    // Update last login
    await updateAdminLastLogin(uid)

    // Set cookie
    const cookieStore = await cookies()
    cookieStore.set('admin_session', sessionCookie, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: expiresIn / 1000,
      path: '/',
    })

    return NextResponse.json({
      success: true,
      admin: {
        uid: admin.uid,
        email: admin.email,
        role: admin.role,
        name: admin.name,
      },
    })
  } catch (error: any) {
    console.error('Admin login error:', error)
    return NextResponse.json(
      { error: error.message || 'Login failed' },
      { status: 500 }
    )
  }
}

