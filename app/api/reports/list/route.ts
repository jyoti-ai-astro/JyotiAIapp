import { NextRequest, NextResponse } from 'next/server'
import { adminAuth, adminDb } from '@/lib/firebase/admin'

export const dynamic = 'force-dynamic'

function toIso(value: any): string | null {
  if (!value) return null
  if (value instanceof Date) return value.toISOString()
  if (typeof value?.toDate === 'function') return value.toDate().toISOString()
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : date.toISOString()
}

function toDate(value: any): Date | null {
  if (!value) return null
  if (value instanceof Date) return value
  if (typeof value?.toDate === 'function') return value.toDate()
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

function getStaleStatus(data: any, birthDetailsUpdatedAt: Date | null, derivedAstrologyStatus?: string) {
  const generatedAt = toDate(data?.generatedAt ?? data?.metadata?.generatedAt)
  const outdatedByBirthChange =
    !!generatedAt && !!birthDetailsUpdatedAt && generatedAt.getTime() < birthDetailsUpdatedAt.getTime()

  return {
    staleStatus:
      derivedAstrologyStatus === 'stale' || outdatedByBirthChange ? 'outdated_after_birth_change' : 'current',
    outdated: derivedAstrologyStatus === 'stale' || outdatedByBirthChange,
  }
}

/**
 * List Reports
 * Part B - Section 6: Reports Engine
 * Milestone 6 - Step 5
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

    const reportsRef = adminDb.collection('reports').doc(uid).collection('reports')
    const [reportsSnap, userSnap] = await Promise.all([
      reportsRef.orderBy('createdAt', 'desc').limit(limit).get(),
      adminDb.collection('users').doc(uid).get(),
    ])
    const userData = userSnap.exists ? userSnap.data() : null
    const birthDetailsUpdatedAt = toDate(userData?.birthDetailsUpdatedAt)
    const derivedAstrologyStatus = userData?.derivedAstrologyStatus

    const reports = reportsSnap.docs.map((doc) => {
      const data = doc.data()
      const stale = getStaleStatus(data, birthDetailsUpdatedAt, derivedAstrologyStatus)
      return {
        id: data?.id || doc.id,
        reportId: doc.id,
        uid: data?.uid || uid,
        type: data?.type || null,
        title: data?.title || 'Untitled Report',
        status: data?.status || (data?.pdfUrl ? 'ready' : 'failed'),
        pdfUrl: data?.pdfUrl || null,
        storagePath: data?.storagePath || null,
        failureReason: data?.failureReason || null,
        entitlement: data?.entitlement || null,
        generatedAt: toIso(data?.generatedAt ?? data?.metadata?.generatedAt),
        createdAt: toIso(data?.createdAt),
        updatedAt: toIso(data?.updatedAt),
        staleStatus: stale.staleStatus,
        outdated: stale.outdated,
      }
    })

    return NextResponse.json({
      success: true,
      reports,
    })
  } catch (error: any) {
    console.error('List reports error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to list reports' },
      { status: 500 }
    )
  }
}
