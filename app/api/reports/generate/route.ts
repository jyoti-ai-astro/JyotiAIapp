import { NextRequest, NextResponse } from 'next/server'
import { adminAuth, adminDb } from '@/lib/firebase/admin'
import { collectReportData, normalizeData } from '@/lib/engines/reports/data-collector'
import { generatePredictions } from '@/lib/engines/reports/prediction-engine'
import { generateStructuredReport } from '@/lib/engines/reports/report-generator'
import { generatePDF } from '@/lib/services/pdf-service'
import { sendPredictionReport } from '@/lib/email/email-service'

/**
 * Generate Report
 * Part B - Section 6: Reports Engine
 * Milestone 6 - Step 5
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

    const { type, includePalmistry, includeAura } = await request.json()

    if (!type || !['basic', 'premium', 'marriage', 'business', 'child'].includes(type)) {
      return NextResponse.json({ error: 'Invalid report type' }, { status: 400 })
    }

    // Check if premium report requires payment
    if (type === 'premium' || type === 'marriage' || type === 'business') {
      const subscriptionSnap = await adminDb.collection('subscriptions').doc(uid).get()
      const subscription = subscriptionSnap.exists ? subscriptionSnap.data() : null
      
      if (!subscription || subscription.status !== 'active') {
        return NextResponse.json(
          { error: 'Premium subscription required', requiresPayment: true },
          { status: 402 }
        )
      }
    }

    // Collect data
    const dataset = await collectReportData(uid, includePalmistry || false, includeAura || false)
    const normalizedData = normalizeData(dataset)

    // Generate predictions
    const predictions = await generatePredictions(normalizedData)

    // Generate structured report
    const structuredReport = generateStructuredReport(
      predictions,
      type,
      includePalmistry || false,
      includeAura || false
    )

    // Generate PDF
    const reportId = `report_${Date.now()}_${Math.random().toString(36).substring(7)}`
    const pdfUrl = await generatePDF(structuredReport, dataset.user.name, uid, reportId)

    // Save to Firestore
    const reportRef = adminDb.collection('reports').doc(uid).collection('reports').doc(reportId)
    await reportRef.set({
      reportId,
      type,
      title: structuredReport.title,
      pdfUrl,
      metadata: {
        generatedAt: new Date(),
        includesPalmistry: includePalmistry || false,
        includesAura: includeAura || false,
      },
      status: 'completed',
      createdAt: new Date(),
    })

    // Send email notification
    try {
      await sendPredictionReport(dataset.user.email, pdfUrl, structuredReport.title)
    } catch (emailError) {
      console.error('Failed to send report email:', emailError)
      // Don't fail the request if email fails
    }

    return NextResponse.json({
      success: true,
      report: {
        reportId,
        type,
        title: structuredReport.title,
        pdfUrl,
        generatedAt: new Date().toISOString(),
      },
    })
  } catch (error: any) {
    console.error('Report generation error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to generate report' },
      { status: 500 }
    )
  }
}

