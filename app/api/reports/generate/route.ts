export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { getStorage } from 'firebase-admin/storage'
import { FieldValue } from 'firebase-admin/firestore'
import { adminAuth, adminDb } from '@/lib/firebase/admin'
import { ensureFeatureAccess, splitSubscriptionAndTickets } from '@/lib/payments/ticket-service'
import { getFeatureAccess } from '@/lib/payments/feature-access'
import type { FeatureKey } from '@/lib/payments/feature-access'
import {
  generateKundaliReportPdf,
  generatePredictionsReportPdf,
  generateTimelineReportPdf,
} from '@/lib/report-engine'
import { sendReportEmail } from '@/lib/email/sendReportEmail'

type LaunchReportType = 'kundali' | 'predictions' | 'timeline'
type ReportStatus = 'queued' | 'generating' | 'ready' | 'failed'

const REPORT_TYPES: Record<
  LaunchReportType,
  {
    title: string
    feature: FeatureKey
    generate: (uid: string) => Promise<{ buffer: Buffer; fileName: string }>
  }
> = {
  kundali: {
    title: 'Full Kundali Report',
    feature: 'kundali',
    generate: generateKundaliReportPdf,
  },
  predictions: {
    title: '12-Month Predictions Report',
    feature: 'predictions',
    generate: generatePredictionsReportPdf,
  },
  timeline: {
    title: '12-Month Timeline Report',
    feature: 'timeline',
    generate: generateTimelineReportPdf,
  },
}

function isLaunchReportType(type: unknown): type is LaunchReportType {
  return typeof type === 'string' && type in REPORT_TYPES
}

function toIso(value: any): string | null {
  if (!value) return null
  if (value instanceof Date) return value.toISOString()
  if (typeof value?.toDate === 'function') return value.toDate().toISOString()
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : date.toISOString()
}

function serializeReport(id: string, data: any) {
  return {
    id,
    reportId: data?.reportId || id,
    uid: data?.uid || null,
    type: data?.type || null,
    title: data?.title || null,
    status: (data?.status || 'failed') as ReportStatus,
    pdfUrl: data?.pdfUrl || null,
    storagePath: data?.storagePath || null,
    failureReason: data?.failureReason || null,
    entitlement: data?.entitlement || null,
    createdAt: toIso(data?.createdAt),
    updatedAt: toIso(data?.updatedAt),
    generatedAt: toIso(data?.generatedAt),
  }
}

async function uploadReportPdf(
  uid: string,
  reportId: string,
  buffer: Buffer,
  fileName: string
): Promise<{ pdfUrl: string; storagePath: string }> {
  const storage = getStorage()
  const bucket = storage.bucket()
  const storagePath = `reports/${uid}/${reportId}/${fileName}`
  const file = bucket.file(storagePath)

  await file.save(buffer, {
    contentType: 'application/pdf',
    metadata: {
      contentType: 'application/pdf',
      metadata: {
        uid,
        reportId,
      },
    },
  })

  return {
    pdfUrl: `/api/reports/download?reportId=${encodeURIComponent(reportId)}`,
    storagePath,
  }
}

export async function POST(request: NextRequest) {
  let reportRef: FirebaseFirestore.DocumentReference | null = null
  let reportId: string | null = null
  let uid: string | null = null
  let type: LaunchReportType | null = null

  try {
    const sessionCookie = request.cookies.get('session')?.value
    if (!sessionCookie || !adminAuth) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const decodedClaims = await adminAuth.verifySessionCookie(sessionCookie, true)
    uid = decodedClaims.uid

    if (!adminDb) {
      return NextResponse.json({ error: 'Firestore not initialized' }, { status: 500 })
    }
    const db = adminDb

    const body = await request.json().catch(() => ({}))
    if (!isLaunchReportType(body?.type)) {
      return NextResponse.json(
        {
          error: 'Invalid report type',
          allowedTypes: Object.keys(REPORT_TYPES),
        },
        { status: 400 }
      )
    }

    const requestedType: LaunchReportType = body.type
    type = requestedType
    const config = REPORT_TYPES[requestedType]
    const sendEmail = body?.sendEmail === true

    reportId = `launch_v1_${type}`
    reportRef = db.collection('reports').doc(uid).collection('reports').doc(reportId)

    const existingBeforeAccessSnap = await reportRef.get()
    const existingBeforeAccess = existingBeforeAccessSnap.exists
      ? existingBeforeAccessSnap.data()
      : null
    const existingChargedAt = existingBeforeAccess?.entitlement?.chargedAt || null

    if (!existingChargedAt) {
      await ensureFeatureAccess(uid, config.feature)
    }

    const claim = await db.runTransaction(async (transaction) => {
      const snap = await transaction.get(reportRef!)
      const existing = snap.exists ? snap.data() : null
      const existingStatus = existing?.status as ReportStatus | undefined

      if (existing && ['queued', 'generating', 'ready'].includes(existingStatus || '')) {
        return {
          reused: true,
          report: serializeReport(reportId!, existing),
        }
      }

      const now = new Date()
      const queuedRecord = {
        id: reportId,
        reportId,
        uid,
        type,
        title: config.title,
        status: 'queued' satisfies ReportStatus,
        createdAt: existing?.createdAt || now,
        updatedAt: now,
        pdfUrl: null,
        storagePath: null,
        failureReason: null,
        entitlement: {
          feature: config.feature,
          chargedAt: existing?.entitlement?.chargedAt || null,
        },
      }

      transaction.set(reportRef!, queuedRecord, { merge: true })

      return {
        reused: false,
        report: serializeReport(reportId!, queuedRecord),
      }
    })

    if (claim.reused) {
      return NextResponse.json({
        success: true,
        reused: true,
        report: claim.report,
      })
    }

    await reportRef.set(
      {
        status: 'generating' satisfies ReportStatus,
        updatedAt: new Date(),
      },
      { merge: true }
    )

    const result = await config.generate(uid)
    const { pdfUrl, storagePath } = await uploadReportPdf(uid, reportId, result.buffer, result.fileName)

    const accessInfo = await splitSubscriptionAndTickets(uid)
    const featureConfig = getFeatureAccess(config.feature)

    await db.runTransaction(async (transaction) => {
      const chargeReportSnap = await transaction.get(reportRef!)
      const chargeReportData = chargeReportSnap.exists ? chargeReportSnap.data() : null

      if (chargeReportData?.entitlement?.chargedAt) {
        return
      }

      if (!accessInfo.hasSubscription) {
        const userRef = db.collection('users').doc(uid!)
        const userSnap = await transaction.get(userRef)
        const userData = userSnap.exists ? userSnap.data() : null
        const currentTickets = userData?.[featureConfig.ticketField] || 0

        if (currentTickets < featureConfig.costPerUse) {
          const error: any = new Error('Insufficient report entitlement')
          error.code = 'NO_TICKETS'
          throw error
        }

        transaction.set(
          userRef,
          {
            [featureConfig.ticketField]: FieldValue.increment(-featureConfig.costPerUse),
            updatedAt: new Date(),
          },
          { merge: true }
        )
      }

      transaction.set(
        reportRef!,
        {
          entitlement: {
            feature: config.feature,
            chargedAt: new Date(),
          },
          updatedAt: new Date(),
        },
        { merge: true }
      )
    })

    const finalChargeSnap = await reportRef.get()
    const finalChargedAt = finalChargeSnap.data()?.entitlement?.chargedAt || new Date()

    const readyUpdate = {
      status: 'ready' satisfies ReportStatus,
      pdfUrl,
      storagePath,
      fileName: result.fileName,
      generatedAt: new Date(),
      updatedAt: new Date(),
      failureReason: null,
      entitlement: {
        feature: config.feature,
        chargedAt: finalChargedAt,
      },
    }

    await reportRef.set(readyUpdate, { merge: true })

    const readySnap = await reportRef.get()
    const readyReport = serializeReport(reportId, readySnap.data())

    if (sendEmail) {
      try {
        const userSnap = await db.collection('users').doc(uid).get()
        const email = userSnap.data()?.email

        if (email) {
          await sendReportEmail({
            to: email,
            subject: `Your ${config.title} is Ready - JyotiAI`,
            htmlBody: `<p>Your personalized ${config.title} is ready.</p>`,
            pdfBuffer: result.buffer,
            fileName: result.fileName,
          })
        }
      } catch (emailError) {
        console.error('Failed to send report email:', emailError)
      }
    }

    return NextResponse.json({
      success: true,
      reused: false,
      report: readyReport,
    })
  } catch (error: any) {
    console.error('Report generation error:', error)

    if (reportRef) {
      await reportRef.set(
        {
          status: 'failed' satisfies ReportStatus,
          failureReason: error?.code || error?.message || 'Report generation failed',
          updatedAt: new Date(),
        },
        { merge: true }
      )
    }

    if (error?.code === 'NO_TICKETS') {
      return NextResponse.json(
        {
          success: false,
          code: 'NO_TICKETS',
          error: 'Report access requires an active subscription or available tickets.',
        },
        { status: 403 }
      )
    }

    return NextResponse.json(
      {
        success: false,
        error: error?.message || 'Failed to generate report',
      },
      { status: 500 }
    )
  }
}
