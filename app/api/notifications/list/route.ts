import { NextRequest, NextResponse } from 'next/server'
import { adminAuth, adminDb } from '@/lib/firebase/admin'

/**
 * List Notifications
 * Part B - Section 8: Notifications & Daily Insights
 * Milestone 7 - Step 7
 */
export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '50')
    const type = searchParams.get('type')

    const notificationsRef = adminDb
      .collection('notifications')
      .doc(uid)
      .collection('items')

    let query = notificationsRef.orderBy('timestamp', 'desc').limit(limit)

    if (type) {
      query = query.where('type', '==', type) as any
    }

    const notificationsSnap = await query.get()

    const notifications = notificationsSnap.docs.map((doc) => {
      const data = doc.data()
      return {
        id: doc.id,
        ...data,
        timestamp: data.timestamp?.toDate?.()?.toISOString() || null,
      }
    })

    // Get unread count
    const unreadSnap = await adminDb
      .collection('notifications')
      .doc(uid)
      .collection('items')
      .where('read', '==', false)
      .get()

    return NextResponse.json({
      success: true,
      notifications,
      unreadCount: unreadSnap.size,
    })
  } catch (error: any) {
    console.error('List notifications error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to list notifications' },
      { status: 500 }
    )
  }
}

