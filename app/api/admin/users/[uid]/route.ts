export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { adminAuth, adminDb } from '@/lib/firebase/admin'
import { withAdminAuth } from '@/lib/middleware/admin-middleware'

function normalizeDate(value: any): string | null {
  if (!value) return null
  if (typeof value === 'string') return value
  if (typeof value?.toDate === 'function') return value.toDate().toISOString()
  if (value instanceof Date) return value.toISOString()
  return null
}

function providerLabel(providerId: string) {
  if (providerId === 'google.com') return 'Google'
  if (providerId === 'facebook.com') return 'Facebook'
  if (providerId === 'password') return 'Email / password or email link'
  if (providerId === 'phone') return 'Phone'
  return providerId
}

export async function GET(request: NextRequest, { params }: { params: { uid: string } }) {
  return withAdminAuth(async (req, admin) => {
    if (!adminDb || !adminAuth) return NextResponse.json({ error: 'Firebase Admin is not initialized' }, { status: 500 })

    try {
      const { uid } = params
      let authUser: any = null
      try {
        authUser = await adminAuth.getUser(uid)
      } catch (error: any) {
        if (error?.code !== 'auth/user-not-found') throw error
      }

      const userRef = adminDb.collection('users').doc(uid)
      const userSnap = await userRef.get()
      const userData: any = userSnap.exists ? userSnap.data() || {} : {}
      if (!authUser && !userSnap.exists) return NextResponse.json({ error: 'User not found' }, { status: 404 })

      const [kundaliSnap, palmistrySnap, auraSnap, reportsSnapshot, paymentsSnapshot, notificationsSnapshot, guruChatsSnapshot, currentSubSnap, legacySubSnap] = await Promise.all([
        adminDb.collection('kundali').doc(uid).get(),
        adminDb.collection('scans').doc(uid).collection('palmistry').doc('latest').get(),
        adminDb.collection('scans').doc(uid).collection('aura').doc('latest').get(),
        adminDb.collection('reports').doc(uid).collection('items').limit(20).get(),
        adminDb.collection('payments').where('userId', '==', uid).limit(20).get(),
        adminDb.collection('notifications').doc(uid).collection('items').limit(50).get(),
        adminDb.collection('guruChat').doc(uid).collection('messages').limit(50).get(),
        adminDb.collection('users').doc(uid).collection('subscriptions').doc('current').get(),
        adminDb.collection('subscriptions').doc(uid).get(),
      ])

      const providers = authUser?.providerData?.map((entry: any) => ({
        providerId: entry.providerId,
        label: providerLabel(entry.providerId),
        providerUid: entry.uid,
        email: entry.email || null,
        displayName: entry.displayName || null,
        phoneNumber: entry.phoneNumber || null,
        photoURL: entry.photoURL || null,
      })) || []
      const subscription: any = currentSubSnap.exists ? currentSubSnap.data() : legacySubSnap.exists ? legacySubSnap.data() : null

      return NextResponse.json({
        success: true,
        user: {
          uid,
          ...userData,
          email: authUser?.email || userData.email || '',
          displayName: authUser?.displayName || userData.displayName || userData.name || 'Unnamed user',
          phone: authUser?.phoneNumber || userData.phone || null,
          photoURL: authUser?.photoURL || userData.photoURL || null,
          createdAt: authUser?.metadata?.creationTime || normalizeDate(userData.createdAt),
          lastLoginAt: authUser?.metadata?.lastSignInTime || normalizeDate(userData.lastLoginAt),
          authentication: {
            exists: Boolean(authUser),
            emailVerified: Boolean(authUser?.emailVerified),
            disabled: Boolean(authUser?.disabled),
            creationTime: authUser?.metadata?.creationTime || null,
            lastSignInTime: authUser?.metadata?.lastSignInTime || null,
            lastRefreshTime: authUser?.metadata?.lastRefreshTime || null,
            providers,
          },
          profile: {
            exists: userSnap.exists,
            state: userSnap.exists ? 'Application profile present' : 'Auth-only identity',
          },
          subscription: subscription ? {
            ...subscription,
            startedAt: normalizeDate(subscription.startedAt || subscription.createdAt),
            expiresAt: normalizeDate(subscription.expiresAt || subscription.currentPeriodEnd),
          } : null,
          kundali: kundaliSnap.exists ? kundaliSnap.data() : null,
          numerology: userData.numerology || null,
          palmistry: palmistrySnap.exists ? palmistrySnap.data() : null,
          aura: auraSnap.exists ? auraSnap.data() : null,
          reports: reportsSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })),
          payments: paymentsSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })),
          notifications: notificationsSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })),
          guruChats: guruChatsSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })),
        },
      })
    } catch (error: any) {
      console.error('Get user error:', error)
      return NextResponse.json({ error: error.message || 'Failed to get user' }, { status: 500 })
    }
  }, 'users.read')(request)
}

export async function PATCH(request: NextRequest, { params }: { params: { uid: string } }) {
  return withAdminAuth(async (req, admin) => {
    if (!adminDb) return NextResponse.json({ error: 'Firestore not initialized' }, { status: 500 })
    try {
      const { uid } = params
      const body = await req.json()
      if (body.action === 'delete' && !admin.permissions.includes('users.delete')) return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
      if (body.action === 'block' && !admin.permissions.includes('users.write')) return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
      const userRef = adminDb.collection('users').doc(uid)
      const userSnap = await userRef.get()
      if (!userSnap.exists) return NextResponse.json({ error: 'Application profile not found for this authentication identity' }, { status: 409 })
      switch (body.action) {
        case 'upgrade_premium':
          await userRef.update({ subscriptionStatus: 'premium', upgradedAt: new Date() })
          break
        case 'block':
          await userRef.update({ blocked: true, blockedAt: new Date(), blockedBy: admin.uid })
          break
        case 'reset_onboarding':
          await userRef.update({ onboardingComplete: false })
          break
        case 'delete':
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
      return NextResponse.json({ error: error.message || 'Failed to update user' }, { status: 500 })
    }
  }, 'users.write')(request)
}
