import { NextRequest, NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase/admin'
import { withAdminAuth } from '@/lib/middleware/admin-middleware'
import { ADMIN_PERMISSIONS, type AdminRole } from '@/lib/admin/admin-auth'

export const dynamic = 'force-dynamic'

const VALID_ROLES: AdminRole[] = ['SuperAdmin', 'Astrologer', 'Support', 'ContentManager', 'Finance']

export async function GET(request: NextRequest) {
  return withAdminAuth(
    async () => {
      if (!adminDb) return NextResponse.json({ error: 'Firestore not initialized' }, { status: 500 })
      try {
        const snapshot = await adminDb.collection('admins').get()
        const staff = snapshot.docs.map((doc) => {
          const data = doc.data()
          return {
            uid: doc.id,
            email: data.email || '',
            name: data.name || '',
            role: data.role || 'Support',
            createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt || null,
            updatedAt: data.updatedAt?.toDate?.()?.toISOString() || data.updatedAt || null,
          }
        })
        return NextResponse.json({ success: true, staff })
      } catch (error) {
        console.error('List staff error:', error)
        return NextResponse.json({ error: 'Failed to list staff' }, { status: 500 })
      }
    },
    'staff.read'
  )(request)
}

export async function POST(request: NextRequest) {
  return withAdminAuth(
    async (req, admin) => {
      if (!adminDb) return NextResponse.json({ error: 'Firestore not initialized' }, { status: 500 })
      try {
        const { uid, email, name, role, reason } = await req.json()
        const normalizedEmail = typeof email === 'string' ? email.trim().toLowerCase() : ''
        const normalizedName = typeof name === 'string' ? name.trim() : ''
        const normalizedReason = typeof reason === 'string' ? reason.trim() : ''

        if (!uid || !normalizedEmail || !normalizedName || !role || !normalizedReason) {
          return NextResponse.json({ error: 'uid, email, name, role, and reason are required' }, { status: 400 })
        }
        if (!VALID_ROLES.includes(role as AdminRole)) {
          return NextResponse.json({ error: 'Invalid role' }, { status: 400 })
        }
        if (normalizedReason.length < 5 || normalizedReason.length > 500) {
          return NextResponse.json({ error: 'Reason must be 5-500 characters' }, { status: 400 })
        }
        if (uid === admin.uid && role !== 'SuperAdmin' && admin.role === 'SuperAdmin') {
          return NextResponse.json({ error: 'SuperAdmin cannot demote their own active account' }, { status: 400 })
        }

        const staffRef = adminDb.collection('admins').doc(uid)
        const auditRef = adminDb.collection('admin_audit').doc()
        const existing = await staffRef.get()
        const before = existing.exists
          ? { email: existing.data()?.email || '', name: existing.data()?.name || '', role: existing.data()?.role || 'Support' }
          : null
        const now = new Date()

        await adminDb.runTransaction(async (tx) => {
          tx.set(
            staffRef,
            {
              email: normalizedEmail,
              name: normalizedName,
              role: role as AdminRole,
              permissions: ADMIN_PERMISSIONS[role as AdminRole],
              createdAt: existing.exists ? existing.data()?.createdAt || now : now,
              updatedAt: now,
              updatedBy: admin.uid,
            },
            { merge: true }
          )
          tx.create(auditRef, {
            actorUid: admin.uid,
            permission: 'staff.manage',
            action: existing.exists ? 'staff.update' : 'staff.create',
            targetType: 'admin',
            targetId: uid,
            reason: normalizedReason,
            beforeSummary: before,
            afterSummary: { email: normalizedEmail, name: normalizedName, role },
            requestId: auditRef.id,
            createdAt: now,
          })
        })

        return NextResponse.json({ success: true, uid })
      } catch (error) {
        console.error('Create/update staff error:', error)
        return NextResponse.json({ error: 'Failed to update staff' }, { status: 500 })
      }
    },
    'staff.manage'
  )(request)
}
