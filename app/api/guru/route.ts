/**
 * Guru Brain API Route
 * 
 * MEGA BUILD 1 - Phase 7 Core
 * Unified endpoint for Guru Brain with AstroContext integration
 */

import { NextRequest, NextResponse } from 'next/server'
import { adminAuth, adminDb } from '@/lib/firebase/admin'
import { runGuruBrain, type GuruMessage } from '@/lib/engines/guru-engine'
import { saveGuruTurn } from '@/lib/guru/guru-session-store'
import { rateLimit, getRateLimitHeaders } from '@/lib/middleware/rate-limit'
import { sanitizeMessage } from '@/lib/security/xss-protection'
import { rateLimitConfig } from '@/lib/security/validation-schemas'

export async function POST(request: NextRequest) {
  try {
    // Get user session
    const sessionCookie = request.cookies.get('session')?.value
    let userId: string | null = null
    let userName: string | undefined
    let gender: string | undefined

    if (sessionCookie && adminAuth) {
      try {
        const decodedClaims = await adminAuth.verifySessionCookie(sessionCookie, true)
        userId = decodedClaims.uid

        // Get user profile for name/gender
        if (adminDb && userId) {
          const userRef = adminDb.collection('users').doc(userId)
          const userSnap = await userRef.get()
          if (userSnap.exists) {
            const userData = userSnap.data()
            userName = userData?.name || undefined
            gender = userData?.gender || undefined
          }
        }
      } catch (error) {
        // Not authenticated - continue as guest
        userId = null
      }
    }

    // Rate limiting (use fingerprint or userId)
    const fingerprint = userId || request.ip || 'anonymous'
    const rateLimitResult = rateLimit(fingerprint, rateLimitConfig.chat)
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: rateLimitResult.error || 'Rate limit exceeded. Please try again later.' },
        {
          status: 429,
          headers: getRateLimitHeaders(rateLimitResult.remaining, rateLimitResult.resetTime),
        }
      )
    }

    // Parse request body
    const body = await request.json()
    const { messages, mode } = body

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: 'Messages array is required' }, { status: 400 })
    }

    // Validate and sanitize messages
    const validatedMessages: GuruMessage[] = messages.map((msg: any) => ({
      role: msg.role === 'assistant' ? 'assistant' : 'user',
      content: sanitizeMessage(msg.content || ''),
      createdAt: msg.createdAt || new Date().toISOString(),
    }))

    // Get last user message
    const lastUserMessage = validatedMessages.filter((m) => m.role === 'user').slice(-1)[0]
    if (!lastUserMessage) {
      return NextResponse.json({ error: 'No user message found' }, { status: 400 })
    }

    // Call Guru Brain
    const response = await runGuruBrain({
      userId,
      messages: validatedMessages,
      mode,
      userName,
      gender,
    })

    // Save turn to session store
    if (userId) {
      try {
        await saveGuruTurn(
          userId,
          lastUserMessage,
          response,
          'default' // sessionId
        )
      } catch (error) {
        console.error('Error saving guru turn:', error)
        // Don't fail the request if saving fails
      }
    }

    // Return response
    return NextResponse.json(
      {
        answer: response.answer,
        usedAstroContext: response.usedAstroContext,
        usedRag: response.usedRag,
        suggestions: response.suggestions,
        followUps: response.followUps,
      },
      {
        headers: getRateLimitHeaders(rateLimitResult.remaining, rateLimitResult.resetTime),
      }
    )
  } catch (error: any) {
    console.error('Guru API error:', error)
    return NextResponse.json(
      {
        error: 'An error occurred. Please try again later.',
        message: 'The Guru is temporarily unavailable. The divine energies are realigning.',
      },
      { status: 500 }
    )
  }
}

