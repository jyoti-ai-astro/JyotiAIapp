export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { adminAuth, adminDb } from '@/lib/firebase/admin'
import { getAdminUser, updateAdminLastLogin, createAdminSession } from '@/lib/admin/admin-auth'
import { cookies } from 'next/headers'
import { scryptSync, timingSafeEqual } from 'node:crypto'

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

    // Authenticate against the password format created by the
    // JyotiAI Mission Control SuperAdmin bootstrap.
    const passwordHash =
      typeof adminData.passwordHash === 'string' ? adminData.passwordHash : ''
    const passwordSalt =
      typeof adminData.passwordSalt === 'string' ? adminData.passwordSalt : ''
    const passwordVersion =
      typeof adminData.passwordVersion === 'string' ? adminData.passwordVersion : ''

    if (
      !passwordHash ||
      !passwordSalt ||
      passwordVersion !== 'scrypt-v1'
    ) {
      console.error('[admin-login] Unsupported or missing admin password credentials', {
        uid: adminDoc.id,
        passwordVersion: passwordVersion || 'missing',
      })

      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    let suppliedHash: Buffer
    let storedHash: Buffer

    try {
      suppliedHash = scryptSync(String(password), passwordSalt, 64)
      storedHash = Buffer.from(passwordHash, 'hex')
    } catch (error) {
      console.error('[admin-login] Password verification failed', error)

      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    if (
      suppliedHash.length !== storedHash.length ||
      !timingSafeEqual(suppliedHash, storedHash)
    ) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    const uid = adminDoc.id
    const admin = await getAdminUser(uid)

    if (!admin) {
      return NextResponse.json({ error: 'Admin not found' }, { status: 404 })
    }

    // Update last login
    await updateAdminLastLogin(uid)

    // Create a session token (simplified approach for now)
    // In production, this should use Firebase Admin session cookies with proper ID tokens
    const expiresIn = 60 * 60 * 24 * 5 * 1000 // 5 days

    // Create a session payload
    const sessionPayload = {
      uid,
      email: admin.email,
      role: admin.role,
      exp: Date.now() + expiresIn,
    }

    // Create a simple session token (in production, use proper JWT signing)
    const sessionToken = Buffer.from(JSON.stringify(sessionPayload)).toString('base64')

    // Set cookie
    const cookieStore = await cookies()
    cookieStore.set('admin_session', sessionToken, {
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
