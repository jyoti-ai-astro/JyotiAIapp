import { NextRequest, NextResponse } from 'next/server'
import { adminAuth, adminDb } from '@/lib/firebase/admin'
import { generateEnhancedGuruResponse } from '@/lib/engines/guru/guru-fusion-v2'
import { generatePredictions } from '@/lib/engines/reports/prediction-engine'
import { normalizeData } from '@/lib/engines/reports/data-collector'
import { rateLimit, getRateLimitHeaders } from '@/lib/middleware/rate-limit'
import { createErrorResponse } from '@/lib/utils/error-handler'

export const dynamic = 'force-dynamic'

/**
 * Guru Chat API
 * Part B - Section 5: AI Guru
 * Milestone 5 - Step 5
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

    // Rate limiting
    const rateLimitResult = rateLimit(uid, { windowMs: 15 * 60 * 1000, maxRequests: 50 })
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: rateLimitResult.error || 'Rate limit exceeded' },
        {
          status: 429,
          headers: getRateLimitHeaders(rateLimitResult.remaining, rateLimitResult.resetTime),
        }
      )
    }

    if (!adminDb) {
      return NextResponse.json({ error: 'Firestore not initialized' }, { status: 500 })
    }

    const { message, contextType } = await request.json()

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 })
    }

    // Retrieve user profile
    const userRef = adminDb.collection('users').doc(uid)
    const userSnap = await userRef.get()
    const userData = userSnap.exists ? userSnap.data() : null

    // Build Guru context
    const context: GuruContext = {}

    // Get Kundali snapshot
    const kundaliRef = adminDb.collection('kundali').doc(uid)
    const kundaliSnap = await kundaliRef.get()
    if (kundaliSnap.exists) {
      const kundaliData = kundaliSnap.data()
      const D1Snap = await kundaliRef.collection('D1').doc('chart').get()
      const dashaSnap = await kundaliRef.collection('dasha').doc('vimshottari').get()
      
      if (D1Snap.exists && dashaSnap.exists) {
        const D1Data = D1Snap.data()
        const dashaData = dashaSnap.data()
        
        context.kundali = {
          rashi: userData?.rashi || D1Data?.grahas?.moon?.sign || 'Unknown',
          nakshatra: D1Data?.grahas?.moon?.nakshatra || 'Unknown',
          lagna: D1Data?.lagna?.sign || 'Unknown',
          currentDasha: dashaData?.currentMahadasha?.planet || 'Unknown',
        }
      }
    }

    // Get Numerology snapshot
    if (userData?.numerology) {
      context.numerology = {
        lifePathNumber: userData.numerology.lifePathNumber,
        destinyNumber: userData.numerology.destinyNumber,
      }
    }

    // Get Palmistry snapshot
    const palmistrySnap = await adminDb
      .collection('scans')
      .doc(uid)
      .collection('palmistry')
      .doc('latest')
      .get()
    if (palmistrySnap.exists) {
      const palmistryData = palmistrySnap.data()
      context.palmistry = {
        overallScore: palmistryData?.analysis?.overallScore || 0,
      }
    }

    // Get Aura snapshot
    const auraSnap = await adminDb
      .collection('scans')
      .doc(uid)
      .collection('aura')
      .doc('latest')
      .get()
    if (auraSnap.exists) {
      const auraData = auraSnap.data()
      context.aura = {
        primaryColor: auraData?.analysis?.primaryColor || 'unknown',
        energyScore: auraData?.analysis?.energyScore || 0,
      }
    }

    // Get predictions for consolidation
    let predictions = null
    try {
      const normalizedData = normalizeData({
        user: userData as any,
        kundali: kundaliSnap.exists
          ? {
              grahas: D1Data?.grahas || {},
              bhavas: D1Data?.bhavas || {},
              lagna: D1Data?.lagna || null,
              dasha: {
                currentMahadasha: dashaData?.currentMahadasha || null,
                currentAntardasha: dashaData?.currentAntardasha || null,
              },
            }
          : null,
        numerology: userData?.numerology || null,
        palmistry: palmistrySnap.exists ? palmistrySnap.data()?.analysis : null,
        aura: auraSnap.exists ? auraSnap.data()?.analysis : null,
      })
      predictions = await generatePredictions(normalizedData)
    } catch (predError) {
      console.warn('Failed to generate predictions for Guru:', predError)
    }

    // Generate enhanced Guru response with full fusion
    const guruResponse = await generateEnhancedGuruResponse(
      message,
      {
        kundali: kundaliSnap.exists
          ? {
              grahas: D1Data?.grahas || {},
              bhavas: D1Data?.bhavas || {},
              lagna: D1Data?.lagna || null,
              dasha: {
                currentMahadasha: dashaData?.currentMahadasha || null,
                currentAntardasha: dashaData?.currentAntardasha || null,
              },
            }
          : undefined,
        numerology: userData?.numerology || undefined,
        palmistry: palmistrySnap.exists ? palmistrySnap.data()?.analysis : undefined,
        aura: auraSnap.exists ? auraSnap.data()?.analysis : undefined,
        predictions: predictions || undefined,
      },
      contextType || 'general'
    )

    // Save chat history
    const chatRef = adminDb.collection('guruChat').doc(uid).collection('messages').doc()
    await chatRef.set({
      message,
      response: guruResponse.answer,
      contextType: contextType || 'general',
      sources: guruResponse.sources,
      contextUsed: guruResponse.contextUsed,
      confidence: guruResponse.confidence,
      relatedInsights: guruResponse.relatedInsights,
      createdAt: new Date(),
    })

    const response = NextResponse.json({
      success: true,
      response: guruResponse.answer,
      sources: guruResponse.sources,
      contextUsed: guruResponse.contextUsed,
      confidence: guruResponse.confidence,
      relatedInsights: guruResponse.relatedInsights,
    })

    // Add rate limit headers
    Object.entries(getRateLimitHeaders(rateLimitResult.remaining, rateLimitResult.resetTime)).forEach(
      ([key, value]) => {
        response.headers.set(key, value)
      }
    )

    return response
  } catch (error: any) {
    console.error('Guru chat error:', error)
    const errorResponse = createErrorResponse(error, 500, {
      userId: request.cookies.get('session')?.value ? 'authenticated' : 'anonymous',
      endpoint: '/api/guru/chat',
    })
    return NextResponse.json(
      { error: errorResponse.error },
      { status: errorResponse.statusCode }
    )
  }
}
