export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase/admin'
import { withAdminAuth } from '@/lib/middleware/admin-middleware'

/**
 * Get User Details API
 * Milestone 10 - Step 3
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { uid: string } }
) {
  return withAdminAuth(async (req, admin) => {
    if (!adminDb) {
      return NextResponse.json({ error: 'Firestore not initialized' }, { status: 500 })
    }

    try {
      const { uid } = params

      // Get user profile
      const userRef = adminDb.collection('users').doc(uid)
      const userSnap = await userRef.get()
      const userData = userSnap.exists ? userSnap.data() : null

      if (!userData) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 })
      }

      // Get kundali
      const kundaliRef = adminDb.collection('kundali').doc(uid)
      const kundaliSnap = await kundaliRef.get()
      const kundali = kundaliSnap.exists ? kundaliSnap.data() : null

      // Get numerology
      const numerology = userData.numerology || null

      // Get palmistry
      const palmistrySnap = await adminDb
        .collection('scans')
        .doc(uid)
        .collection('palmistry')
        .doc('latest')
        .get()
      const palmistry = palmistrySnap.exists ? palmistrySnap.data() : null

      // Get aura
      const auraSnap = await adminDb
        .collection('scans')
        .doc(uid)
        .collection('aura')
        .doc('latest')
        .get()
      const aura = auraSnap.exists ? auraSnap.data() : null

      // Get reports
      const reportsSnapshot = await adminDb
        .collection('reports')
        .doc(uid)
        .collection('items')
        .get()
      const reports = reportsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))

      // Get payments
      const paymentsSnapshot = await adminDb
        .collection('payments')
        .where('userId', '==', uid)
        .get()
      const payments = paymentsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))

      // Get notifications
      const notificationsSnapshot = await adminDb
        .collection('notifications')
        .doc(uid)
        .collection('items')
        .limit(50)
        .get()
      const notifications = notificationsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))

      // Get Guru chats
      const guruChatsSnapshot = await adminDb
        .collection('guruChat')
        .doc(uid)
        .collection('messages')
        .limit(50)
        .get()
      const guruChats = guruChatsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))

      return NextResponse.json({
        success: true,
        user: {
          uid,
          ...userData,
          kundali,
          numerology,
          palmistry,
          aura,
          reports,
          payments,
          notifications,
          guruChats,
        },
      })
    } catch (error: any) {
      console.error('Get user error:', error)
      return NextResponse.json(
        { error: error.message || 'Failed to get user' },
        { status: 500 }
      )
    }
  })(request)
}

/**
 * Update User API
 * Milestone 10 - Step 3
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { uid: string } }
) {
  return withAdminAuth(
    async (req, admin) => {
      if (!adminDb) {
        return NextResponse.json({ error: 'Firestore not initialized' }, { status: 500 })
      }

      try {
        const { uid } = params
        const body = await req.json()

        // Check permissions
        if (body.action === 'delete' && !admin.permissions.includes('users.delete')) {
          return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
        }

        if (body.action === 'block' && !admin.permissions.includes('users.write')) {
          return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
        }

        const userRef = adminDb.collection('users').doc(uid)

        switch (body.action) {
          case 'upgrade_premium':
            await userRef.update({
              subscriptionStatus: 'premium',
              upgradedAt: new Date(),
            })
            break

          case 'block':
            await userRef.update({
              blocked: true,
              blockedAt: new Date(),
              blockedBy: admin.uid,
            })
            break

          case 'reset_onboarding':
            await userRef.update({
              onboardingComplete: false,
            })
            break

          case 'delete':
            // Delete user and all related data
            await userRef.delete()
            await adminDb.collection('kundali').doc(uid).delete()
            await adminDb.collection('reports').doc(uid).delete()
            await adminDb.collection('notifications').doc(uid).delete()
            await adminDb.collection('guruChat').doc(uid).delete()
            await adminDb.collection('scans').doc(uid).delete()
            break

          default:
            return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
        }

        return NextResponse.json({ success: true })
      } catch (error: any) {
        console.error('Update user error:', error)
        return NextResponse.json(
          { error: error.message || 'Failed to update user' },
          { status: 500 }
        )
      }
    },
    'users.write'
  )(request)
}

