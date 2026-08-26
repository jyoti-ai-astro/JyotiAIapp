export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { adminDb } from '@/lib/firebase/admin'
import { getAdminUser, updateAdminLastLogin, createAdminSession, verifyPassword } from '@/lib/admin/admin-auth'
import { withRateLimit } from '@/lib/middleware/rate-limit-enforcement'

async function login(request: NextRequest) {
  try {
    const { email, password } = await request.json()
    if (typeof email !== 'string' || typeof password !== 'string' || !email.trim() || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 })
    }
    if (!adminDb) {
      return NextResponse.json({ error: 'Admin auth not configured' }, { status: 500 })
    }

    const normalizedEmail = email.trim().toLowerCase()
    const snapshot = await adminDb.collection('admins').where('email', '==', normalizedEmail).limit(1).get()
    if (snapshot.empty) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    const adminDoc = snapshot.docs[0]
    const adminData = adminDoc.data()
    const passwordOk = await verifyPassword(
      password,
      {
        passwordHash: adminData.passwordHash,
        passwordSalt: adminData.passwordSalt,
        passwordVersion: adminData.passwordVersion,
        password: adminData.password,
      },
      async (newHash) => {
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

    const admin = await getAdminUser(adminDoc.id)
    if (!admin) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    await updateAdminLastLogin(admin.uid)
    const sessionToken = await createAdminSession(admin.uid)
    const expiresIn = 60 * 60 * 24 * 5
    const cookieStore = await cookies()
    cookieStore.set('admin_session', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: expiresIn,
      path: '/',
    })

    return NextResponse.json({
      success: true,
      admin: { uid: admin.uid, email: admin.email, role: admin.role, name: admin.name },
    })
  } catch (error) {
    console.error('Admin login error:', error)
    return NextResponse.json({ error: 'Login failed' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  return withRateLimit(login)(request)
}
