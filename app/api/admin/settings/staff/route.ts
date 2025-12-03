import { NextRequest, NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase/admin'
import { withAdminAuth } from '@/lib/middleware/admin-middleware'
import { ADMIN_PERMISSIONS, type AdminRole } from '@/lib/admin/admin-auth'

export const dynamic = 'force-dynamic'

/**
 * List Staff Accounts API
 * Milestone 10 - Step 12
 */
export async function GET(request: NextRequest) {
  return withAdminAuth(
    async (req, admin) => {
      if (!adminDb) {
        return NextResponse.json({ error: 'Firestore not initialized' }, { status: 500 })
      }

      try {
        const snapshot = await adminDb.collection('admins').get()

        const staff = snapshot.docs.map((doc) => ({
          uid: doc.id,
          ...doc.data(),
        }))

        return NextResponse.json({
          success: true,
          staff,
        })
      } catch (error: any) {
        console.error('List staff error:', error)
        return NextResponse.json(
          { error: error.message || 'Failed to list staff' },
          { status: 500 }
        )
      }
    },
    'settings.read'
  )(request)
}

/**
 * Create/Update Staff Account API
 * Milestone 10 - Step 12
 */
export async function POST(request: NextRequest) {
  return withAdminAuth(
    async (req, admin) => {
      if (!adminDb) {
        return NextResponse.json({ error: 'Firestore not initialized' }, { status: 500 })
      }

      try {
        const { uid, email, name, role } = await req.json()

        if (!email || !name || !role) {
          return NextResponse.json(
            { error: 'email, name, and role are required' },
            { status: 400 }
          )
        }

        if (!['SuperAdmin', 'Astrologer', 'Support', 'ContentManager', 'Finance'].includes(role)) {
          return NextResponse.json({ error: 'Invalid role' }, { status: 400 })
        }

        const staffRef = adminDb.collection('admins').doc(uid || email.toLowerCase())

        await staffRef.set(
          {
            email: email.toLowerCase(),
            name,
            role: role as AdminRole,
            permissions: ADMIN_PERMISSIONS[role as AdminRole],
            createdAt: new Date(),
            updatedAt: new Date(),
            createdBy: admin.uid,
          },
          { merge: true }
        )

        return NextResponse.json({ success: true })
      } catch (error: any) {
        console.error('Create staff error:', error)
        return NextResponse.json(
          { error: error.message || 'Failed to create staff' },
          { status: 500 }
        )
      }
    },
    'settings.write'
  )(request)
}

