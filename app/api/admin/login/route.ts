export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase/admin'
import { getAdminUser, updateAdminLastLogin, createAdminSession, verifyPassword } from '@/lib/admin/admin-auth'
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

    if (!adminDb) {
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

    // Verify password (hashed, with legacy plaintext migration)
    const passwordOk = await verifyPassword(
      password,
      {
        passwordHash: adminData.passwordHash,
        passwordSalt: adminData.passwordSalt,
        passwordVersion: adminData.passwordVersion,
        password: adminData.password, // legacy
      },
      async (newHash) => {
        // Migrate legacy plaintext to hashed
        await adminDoc.ref.update({
          passwordHash: newHash.hash,
          passwordSalt: newHash.salt,
          passwordVersion: newHash.version,
          password: null,
        })
      }
    )

    if (!passwordOk) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    const uid = adminDoc.id
    const admin = await getAdminUser(uid)

    if (!admin) {
      return NextResponse.json({ error: 'Admin not found' }, { status: 404 })
    }

    // Update last login
    await updateAdminLastLogin(uid)

    // Create signed session token
    const sessionToken = await createAdminSession(uid)
    const expiresIn = 60 * 60 * 24 * 5 * 1000 // 5 days

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
