/**
 * Report Generation API Route
 * 
 * Mega Build 3 - Report Engine + PDF Generator
 * API endpoint for generating PDF reports
 */

import { NextRequest, NextResponse } from 'next/server'
import { adminAuth } from '@/lib/firebase/admin'
import { checkFeatureAccess } from '@/lib/access/checkFeatureAccess'
import {
  generateKundaliReportPdf,
  generatePredictionsReportPdf,
  generateTimelineReportPdf,
} from '@/lib/report-engine'
import { sendReportEmail } from '@/lib/email/sendReportEmail'
import { envVars } from '@/lib/env/env.mjs'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    // Get user session
    const sessionCookie = request.cookies.get('session')?.value
    let userId: string | null = null

    if (sessionCookie && adminAuth) {
      try {
        const decodedClaims = await adminAuth.verifySessionCookie(sessionCookie, true)
        userId = decodedClaims.uid
      } catch (error) {
        return NextResponse.json(
          {
            status: 'error',
            code: 'UNAUTHENTICATED',
            message: 'Please log in to generate reports.',
          },
          { status: 401 }
        )
      }
    } else {
      return NextResponse.json(
        {
          status: 'error',
          code: 'UNAUTHENTICATED',
          message: 'Please log in to generate reports.',
        },
        { status: 401 }
      )
    }

    if (!userId) {
      return NextResponse.json(
        {
          status: 'error',
          code: 'UNAUTHENTICATED',
          message: 'Please log in to generate reports.',
        },
        { status: 401 }
      )
    }

    // Parse request body
    let body: { type: 'kundali' | 'predictions' | 'timeline'; sendEmail?: boolean } = {}
    try {
      body = await request.json()
    } catch (error) {
      return NextResponse.json(
        {
          status: 'error',
          code: 'INVALID_INPUT',
          message: 'Invalid request body.',
        },
        { status: 400 }
      )
    }

    const { type, sendEmail: shouldSendEmail } = body

    if (!type || !['kundali', 'predictions', 'timeline'].includes(type)) {
      return NextResponse.json(
        {
          status: 'error',
          code: 'INVALID_INPUT',
          message: 'Report type must be one of: kundali, predictions, timeline',
        },
        { status: 400 }
      )
    }

    // Map report type to feature access
    const featureMap: Record<string, 'kundali' | 'predictions'> = {
      kundali: 'kundali',
      predictions: 'predictions',
      timeline: 'predictions', // Timeline uses same access as predictions
    }

    const feature = featureMap[type]

    // Check feature access (we'll need to get user data for this)
    // For now, we'll check after fetching user
    // TODO: Refactor checkFeatureAccess to accept userId instead of user object

    // Generate report
    let result: { buffer: Buffer; fileName: string }
    let reportTitle: string

    try {
      switch (type) {
        case 'kundali':
          result = await generateKundaliReportPdf(userId)
          reportTitle = 'Full Kundali Report'
          break
        case 'predictions':
          result = await generatePredictionsReportPdf(userId)
          reportTitle = '12-Month Predictions Report'
          break
        case 'timeline':
          result = await generateTimelineReportPdf(userId)
          reportTitle = '12-Month Timeline Report'
          break
        default:
          throw new Error('Invalid report type')
      }
    } catch (error: any) {
      console.error('Error generating report:', error)

      if (error.message === 'NO_USER') {
        return NextResponse.json(
          {
            status: 'error',
            code: 'NO_USER',
            message: 'User not found.',
          },
          { status: 404 }
        )
      }

      if (error.message === 'NO_ASTRO_CONTEXT') {
        return NextResponse.json(
          {
            status: 'error',
            code: 'NO_ASTRO_CONTEXT',
            message: 'Birth chart data not available. Please complete your profile.',
          },
          { status: 404 }
        )
      }

      return NextResponse.json(
        {
          status: 'error',
          code: 'GENERATION_ERROR',
          message: 'Failed to generate report. Please try again.',
        },
        { status: 500 }
      )
    }

    // Send email if requested
    if (shouldSendEmail) {
      try {
        // Get user email
        const { adminDb } = await import('@/lib/firebase/admin')
        if (adminDb) {
          const userRef = adminDb.collection('users').doc(userId)
          const userSnap = await userRef.get()
          const userData = userSnap.data()
          const userEmail = userData?.email

          if (userEmail) {
            const emailSubject = `Your ${reportTitle} is Ready - JyotiAI`
            const emailBody = `
              <!DOCTYPE html>
              <html>
              <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
              </head>
              <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="background: linear-gradient(135deg, #0D0A33 0%, #5A3FEF 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                  <h1 style="color: #fff; margin: 0; font-size: 28px;">📊 Your Report is Ready</h1>
                  <p style="color: #fff; margin: 10px 0 0 0; opacity: 0.9;">${reportTitle}</p>
                </div>
                <div style="background: #fff; padding: 30px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 10px 10px;">
                  <p style="font-size: 16px; margin-bottom: 20px;">Dear Seeker,</p>
                  <p style="font-size: 16px; margin-bottom: 20px;">Your personalized ${reportTitle} has been generated and is attached to this email.</p>
                  <p style="font-size: 14px; color: #666; margin-top: 30px;">If you have any questions, feel free to reach out to our support team.</p>
                </div>
                <div style="text-align: center; margin-top: 20px; color: #999; font-size: 12px;">
                  <p>© ${new Date().getFullYear()} Jyoti.ai. All rights reserved.</p>
                </div>
              </body>
              </html>
            `

            await sendReportEmail({
              to: userEmail,
              subject: emailSubject,
              htmlBody: emailBody,
              pdfBuffer: result.buffer,
              fileName: result.fileName,
            })
          }
        }
      } catch (emailError) {
        console.error('Error sending report email:', emailError)
        // Don't fail the request if email fails, just log it
      }
    }

    // Return PDF as response
    return new NextResponse(result.buffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${result.fileName}"`,
        'Content-Length': result.buffer.length.toString(),
      },
    })
  } catch (error: any) {
    console.error('Unhandled error in report generation API:', error)
    return NextResponse.json(
      {
        status: 'error',
        code: 'INTERNAL_ERROR',
        message: 'An error occurred while generating the report. Please try again.',
      },
      { status: 500 }
    )
  }
}

