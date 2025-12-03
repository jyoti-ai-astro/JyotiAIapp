export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { adminAuth, adminDb } from '@/lib/firebase/admin'

/**
 * Mark Notification as Read
 * Part B - Section 8: Notifications & Daily Insights
 * Milestone 7 - Step 7
 */
export async function POST(request: NextRequest) {
  try {
    // Verify session
    const sessionCookie = request.cookies.get('session')?.value
    if (!sessionCookie || !adminAuth) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const decodedClaims = await adminAuth.verifySessionCookie(sessionCookie, true)
    const uid = decodedClaims.uid

    if (!adminDb) {
      return NextResponse.json({ error: 'Firestore not initialized' }, { status: 500 })
    }

    const { notificationId, markAll } = await request.json()

    if (markAll) {
      // Mark all as read
      const notificationsRef = adminDb
        .collection('notifications')
        .doc(uid)
        .collection('items')
        .where('read', '==', false)

      const batch = adminDb.batch()
      const notificationsSnap = await notificationsRef.get()

      notificationsSnap.docs.forEach((doc) => {
        batch.update(doc.ref, { read: true })
      })

      await batch.commit()
    } else if (notificationId) {
      // Mark single notification as read
      const notificationRef = adminDb
        .collection('notifications')
        .doc(uid)
        .collection('items')
        .doc(notificationId)

      await notificationRef.update({ read: true })
    } else {
      return NextResponse.json({ error: 'Notification ID or markAll required' }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
    })
  } catch (error: any) {
    console.error('Mark read error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to mark as read' },
      { status: 500 }
    )
  }
}

