/**
 * Admin Users API
 * Canonical customer identity roster: Firebase Authentication + Firestore enrichment.
 */

import { NextRequest, NextResponse } from 'next/server'
import { adminAuth, adminDb } from '@/lib/firebase/admin'
import { withAdminAuth } from '@/lib/middleware/admin-middleware'

export const dynamic = 'force-dynamic'

type ProviderProfile = {
  providerId: string
  uid: string
  email?: string | null
  displayName?: string | null
  photoURL?: string | null
  phoneNumber?: string | null
}

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

export async function GET(request: NextRequest) {
  return withAdminAuth(async (req, admin) => {
    if (!adminDb || !adminAuth) {
      return NextResponse.json({ error: 'Firebase Admin is not initialized' }, { status: 500 })
    }

    try {
      const { searchParams } = new URL(req.url)
      const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
      const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '50')))
      const search = (searchParams.get('search') || '').trim().toLowerCase()
      const subscription = searchParams.get('subscription') || 'all'
      const joined = searchParams.get('joined') || 'all'
      const staff = searchParams.get('staff') || 'all'
      const identity = searchParams.get('identity') || 'all'
      const provider = searchParams.get('provider') || 'all'

      // Firebase Auth is the source of truth for who has an account.
      // 1000 covers the current estate and keeps the endpoint bounded. When the
      // roster grows beyond this, move to pageToken-driven cursor pagination.
      const authResult = await adminAuth.listUsers(1000)
      const authUsers = authResult.users
      const uids = authUsers.map((user) => user.uid)

      const profileRefs = uids.map((uid) => adminDb!.collection('users').doc(uid))
      const adminRefs = uids.map((uid) => adminDb!.collection('admins').doc(uid))
      const currentSubRefs = uids.map((uid) => adminDb!.collection('users').doc(uid).collection('subscriptions').doc('current'))
      const legacySubRefs = uids.map((uid) => adminDb!.collection('subscriptions').doc(uid))

      const [profileSnaps, adminSnaps, currentSubSnaps, legacySubSnaps] = await Promise.all([
        profileRefs.length ? adminDb.getAll(...profileRefs) : [],
        adminRefs.length ? adminDb.getAll(...adminRefs) : [],
        currentSubRefs.length ? adminDb.getAll(...currentSubRefs) : [],
        legacySubRefs.length ? adminDb.getAll(...legacySubRefs) : [],
      ])

      const now = Date.now()
      const joinedCutoff = joined === '7d' ? now - 7 * 86400000 : joined === '30d' ? now - 30 * 86400000 : joined === '90d' ? now - 90 * 86400000 : null

      let users = authUsers.map((authUser, index) => {
        const profileSnap = profileSnaps[index]
        const profile = profileSnap?.exists ? profileSnap.data() || {} : {}
        const staffSnap = adminSnaps[index]
        const currentSub = currentSubSnaps[index]?.exists ? currentSubSnaps[index].data() : undefined
        const legacySub = legacySubSnaps[index]?.exists ? legacySubSnaps[index].data() : undefined
        const subData: any = currentSub || legacySub || null
        const rawSubStatus = String(subData?.status || (subData?.active === true ? 'active' : profile.subscriptionStatus || 'free')).toLowerCase()
        const subscriptionStatus = rawSubStatus === 'active' || rawSubStatus === 'authenticated' || rawSubStatus === 'premium' ? 'active' : rawSubStatus === 'free' ? 'free' : 'inactive'
        const providerProfiles: ProviderProfile[] = authUser.providerData.map((entry) => ({
          providerId: entry.providerId,
          uid: entry.uid,
          email: entry.email,
          displayName: entry.displayName,
          photoURL: entry.photoURL,
          phoneNumber: entry.phoneNumber,
        }))
        const providerIds = providerProfiles.map((entry) => entry.providerId)
        const createdAt = authUser.metadata.creationTime || normalizeDate(profile.createdAt)
        const lastLoginAt = authUser.metadata.lastSignInTime || normalizeDate(profile.lastLoginAt)

        return {
          uid: authUser.uid,
          email: authUser.email || profile.email || '',
          displayName: authUser.displayName || profile.name || profile.displayName || 'No name',
          photoURL: authUser.photoURL || profile.photoURL || null,
          phoneNumber: authUser.phoneNumber || profile.phone || null,
          emailVerified: authUser.emailVerified,
          disabled: authUser.disabled,
          isAdmin: Boolean(staffSnap?.exists),
          hasProfile: Boolean(profileSnap?.exists),
          identityState: profileSnap?.exists ? 'profile' : 'auth-only',
          createdAt,
          lastLoginAt,
          subscriptionStatus,
          onboardingComplete: Boolean(profile.onboardingComplete ?? profile.onboardingCompleted ?? profile.profileComplete ?? profile.profileCompleted ?? false),
          providerIds,
          providers: providerProfiles.map((entry) => ({ ...entry, label: providerLabel(entry.providerId) })),
          legacyTickets: profile.legacyTickets || {},
        }
      })

      if (search) {
        users = users.filter((user) => [user.email, user.displayName, user.uid, ...user.providerIds].some((value) => String(value || '').toLowerCase().includes(search)))
      }
      if (subscription !== 'all') {
        users = users.filter((user) => subscription === 'paid' ? user.subscriptionStatus === 'active' : subscription === 'free' ? user.subscriptionStatus === 'free' : user.subscriptionStatus === 'inactive')
      }
      if (staff !== 'all') users = users.filter((user) => staff === 'yes' ? user.isAdmin : !user.isAdmin)
      if (identity !== 'all') users = users.filter((user) => identity === 'auth-only' ? !user.hasProfile : user.hasProfile)
      if (provider !== 'all') users = users.filter((user) => user.providerIds.includes(provider))
      if (joinedCutoff) users = users.filter((user) => user.createdAt ? new Date(user.createdAt).getTime() >= joinedCutoff : false)

      users.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())

      const totalAuthUsers = authUsers.length
      const profileUsers = profileSnaps.filter((snap) => snap?.exists).length
      const authOnlyUsers = totalAuthUsers - profileUsers
      const offset = (page - 1) * limit
      const paginatedUsers = users.slice(offset, offset + limit)

      return NextResponse.json({
        success: true,
        users: paginatedUsers,
        pagination: {
          page,
          limit,
          total: users.length,
          hasMore: offset + paginatedUsers.length < users.length,
        },
        summary: {
          totalUsers: totalAuthUsers,
          authUsers: totalAuthUsers,
          profileUsers,
          authOnlyUsers,
          visibleUsers: users.length,
          activeOnPage: paginatedUsers.filter((user) => user.subscriptionStatus === 'active').length,
          staffOnPage: paginatedUsers.filter((user) => user.isAdmin).length,
        },
      })
    } catch (error: any) {
      console.error('Admin users list error:', error)
      return NextResponse.json({ error: error.message || 'Failed to fetch users' }, { status: 500 })
    }
  }, 'users.read')(request)
}

export async function POST(request: NextRequest) {
  return withAdminAuth(async (req, admin) => {
    if (!adminDb) return NextResponse.json({ error: 'Firestore not initialized' }, { status: 500 })
    try {
      const body = await req.json()
      const { action, uid, ...params } = body
      if (!action || !uid) return NextResponse.json({ error: 'Action and uid are required' }, { status: 400 })
      const userRef = adminDb.collection('users').doc(uid)
      const userSnap = await userRef.get()
      if (!userSnap.exists) return NextResponse.json({ error: 'Application profile not found for this authentication identity' }, { status: 404 })
      switch (action) {
        case 'setAdmin': {
          const { isAdmin: shouldBeAdmin } = params
          if (typeof shouldBeAdmin !== 'boolean') return NextResponse.json({ error: 'isAdmin must be boolean' }, { status: 400 })
          if (shouldBeAdmin) {
            await adminDb.collection('admins').doc(uid).set({ email: userSnap.data()?.email || '', role: 'Support', name: userSnap.data()?.name || '', createdAt: new Date() })
          } else {
            await adminDb.collection('admins').doc(uid).delete()
          }
          return NextResponse.json({ success: true, message: `User ${shouldBeAdmin ? 'promoted to' : 'removed from'} admin` })
        }
        case 'resetTickets':
          await userRef.update({ legacyTickets: { ai_questions: 0, kundali_basic: 0 } })
          return NextResponse.json({ success: true, message: 'Tickets reset' })
        case 'updateTickets': {
          const { ai_questions, kundali_basic } = params
          const currentTickets = userSnap.data()?.legacyTickets || {}
          await userRef.update({ legacyTickets: { ai_questions: typeof ai_questions === 'number' ? ai_questions : currentTickets.ai_questions || 0, kundali_basic: typeof kundali_basic === 'number' ? kundali_basic : currentTickets.kundali_basic || 0 } })
          return NextResponse.json({ success: true, message: 'Tickets updated' })
        }
        default:
          return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
      }
    } catch (error: any) {
      console.error('Admin user action error:', error)
      return NextResponse.json({ error: error.message || 'Failed to perform action' }, { status: 500 })
    }
  }, 'users.write')(request)
}
