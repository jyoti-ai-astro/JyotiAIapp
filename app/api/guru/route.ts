/**
 * Guru Brain API Route
 * 
 * MEGA BUILD 1 - Phase 7 Core
 * Super Phase C - Stability + RAG Engine
 * Unified endpoint for Guru Brain with AstroContext integration
 */

import { NextRequest, NextResponse } from 'next/server'
import { adminAuth, adminDb } from '@/lib/firebase/admin'
import { runGuruBrain, type GuruMessage } from '@/lib/engines/guru-engine'
import { saveGuruTurn } from '@/lib/guru/guru-session-store'
import { rateLimit, getRateLimitHeaders } from '@/lib/middleware/rate-limit'
import { sanitizeMessage } from '@/lib/security/xss-protection'
import { rateLimitConfig } from '@/lib/security/validation-schemas'
import { fetchUserTickets, consumeTickets, splitSubscriptionAndTickets } from '@/lib/payments/ticket-service'

export const dynamic = 'force-dynamic'

/**
 * Timeout helper for promises
 */
async function withTimeout<T>(
  promise: Promise<T>,
  ms: number,
  label: string
): Promise<T> {
  const timeout = new Promise<never>((_, reject) => {
    setTimeout(() => {
      reject(new Error(`TIMEOUT:${label}`))
    }, ms)
  })

  return Promise.race([promise, timeout])
}

export async function POST(request: NextRequest) {
  // Top-level try/catch to ensure we never throw unhandled errors
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
    const { messages, mode, pageSlug, dryRun } = body // Super Phase B - Add pageSlug, Phase LZ2 - Add dryRun

    // Phase LZ2: Dry run mode for smoke testing
    if (dryRun === true) {
      return NextResponse.json({
        status: 'success',
        ok: true,
        message: 'Dry run mode - no actual processing performed',
      })
    }

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
      return NextResponse.json(
        {
          status: 'error',
          code: 'INVALID_INPUT',
          message: 'No user message found',
        },
        { status: 400 }
      )
    }

    // Phase G: Check if user has tickets (if authenticated)
    if (userId) {
      try {
        const accessInfo = await splitSubscriptionAndTickets(userId)
        
        // If no subscription, check for tickets
        if (!accessInfo.hasSubscription) {
          if (accessInfo.tickets.aiGuruTickets <= 0) {
            return NextResponse.json(
              {
                status: 'error',
                code: 'NO_TICKETS',
                message: 'You have 0 AI Guru credits. Please purchase a one-time reading to continue.',
              },
              {
                status: 403,
                headers: getRateLimitHeaders(rateLimitResult.remaining, rateLimitResult.resetTime),
              }
            )
          }
        }
      } catch (ticketError: any) {
        // If ticket check fails, log but don't block (graceful degradation)
        console.error('Ticket check error:', ticketError)
      }
    }

    // Phase G: Check if user has tickets (if authenticated)
    if (userId) {
      try {
        const accessInfo = await splitSubscriptionAndTickets(userId)
        
        // If no subscription, check for tickets
        if (!accessInfo.hasSubscription) {
          if (accessInfo.tickets.aiGuruTickets <= 0) {
            return NextResponse.json(
              {
                status: 'error',
                code: 'NO_TICKETS',
                message: 'You have 0 AI Guru credits. Please purchase a one-time reading to continue.',
              },
              {
                status: 403,
                headers: getRateLimitHeaders(rateLimitResult.remaining, rateLimitResult.resetTime),
              }
            )
          }
        }
      } catch (ticketError: any) {
        // If ticket check fails, log but don't block (graceful degradation)
        console.error('Ticket check error:', ticketError)
      }
    }

    // Call Guru Brain with timeout (30 seconds)
    let result
    try {
      result = await withTimeout(
        runGuruBrain({
          userId,
          messages: validatedMessages,
          mode,
          userName,
          gender,
          pageSlug,
        }),
        30000,
        'guru-brain'
      )
    } catch (error: any) {
      // Handle timeout
      if (error.message?.startsWith('TIMEOUT:')) {
        console.error('Guru Brain timeout:', error)
        return NextResponse.json(
          {
            status: 'error',
            code: 'GURU_TIMEOUT',
            message: 'The Guru is taking too long to respond. Please try again.',
          },
          {
            status: 504,
            headers: getRateLimitHeaders(rateLimitResult.remaining, rateLimitResult.resetTime),
          }
        )
      }

      // Handle other errors from runGuruBrain
      console.error('Guru Brain error:', error)
      
      // Check for missing env vars
      let errorCode = 'INTERNAL_ERROR'
      let errorMessage = 'An error occurred while processing your request.'
      
      if (error.message?.includes('No AI provider configured')) {
        errorCode = 'AI_PROVIDER_MISSING'
        errorMessage = 'AI service is not configured. Please contact support.'
      } else if (error.message?.includes('Pinecone') || error.message?.includes('RAG')) {
        errorCode = 'RAG_UNAVAILABLE'
        errorMessage = 'Knowledge base is temporarily unavailable. The Guru will still respond without enhanced context.'
      }
      
      return NextResponse.json(
        {
          status: 'error',
          code: errorCode,
          message: errorMessage,
        },
        {
          status: 500,
          headers: getRateLimitHeaders(rateLimitResult.remaining, rateLimitResult.resetTime),
        }
      )
    }

    // Phase G: Consume ticket AFTER successful response (if authenticated and no subscription)
    if (userId && result.status !== 'error' && result.status !== 'degraded') {
      try {
        const accessInfo = await splitSubscriptionAndTickets(userId)
        
        // Only consume ticket if user doesn't have subscription
        if (!accessInfo.hasSubscription && accessInfo.tickets.aiGuruTickets > 0) {
          const consumed = await consumeTickets(userId, { aiGuruTickets: 1 })
          if (!consumed) {
            console.warn('Failed to consume ticket for user:', userId)
          }
        }
      } catch (ticketError: any) {
        // Log but don't fail the request if ticket consumption fails
        console.error('Ticket consumption error:', ticketError)
      }
    }

    // Phase G: Consume ticket AFTER successful response (if authenticated and no subscription)
    if (userId && result.status !== 'error' && result.status !== 'degraded') {
      try {
        const accessInfo = await splitSubscriptionAndTickets(userId)
        
        // Only consume ticket if user doesn't have subscription
        if (!accessInfo.hasSubscription && accessInfo.tickets.aiGuruTickets > 0) {
          const consumed = await consumeTickets(userId, { aiGuruTickets: 1 })
          if (!consumed) {
            console.warn('Failed to consume ticket for user:', userId)
          }
        }
      } catch (ticketError: any) {
        // Log but don't fail the request if ticket consumption fails
        console.error('Ticket consumption error:', ticketError)
      }
    }

    // Save turn to session store (non-blocking)
    if (userId && result.status !== 'error') {
      try {
        await saveGuruTurn(
          userId,
          lastUserMessage,
          {
            answer: result.answer || '',
            usedAstroContext: result.usedAstroContext,
            usedRag: result.usedRag,
            mode: result.mode,
          },
          'default'
        )
      } catch (error) {
        console.error('Error saving guru turn (non-blocking):', error)
        // Don't fail the request if saving fails
      }
    }

    // Map result status to HTTP response
    if (result.status === 'error') {
      return NextResponse.json(
        {
          status: 'error',
          code: result.errorCode || 'INTERNAL_ERROR',
          message: result.errorMessage || 'An error occurred.',
        },
        {
          status: result.errorCode === 'GURU_TIMEOUT' ? 504 : 500,
          headers: getRateLimitHeaders(rateLimitResult.remaining, rateLimitResult.resetTime),
        }
      )
    }

    // Success or degraded response
    const httpStatus = result.status === 'degraded' ? 200 : 200 // Always 200 for degraded, just mark status

    return NextResponse.json(
      {
        status: result.status,
        answer: result.answer,
        mode: result.mode,
        usedAstroContext: result.usedAstroContext,
        usedRag: result.usedRag,
        ragChunks: result.ragChunks?.map((c) => ({
          title: c.title,
          snippet: c.snippet,
          source: c.source,
        })),
        suggestions: result.suggestions,
        followUps: result.followUps,
      },
      {
        status: httpStatus,
        headers: getRateLimitHeaders(rateLimitResult.remaining, rateLimitResult.resetTime),
      }
    )
  } catch (error: any) {
    // Catch-all for any unhandled errors
    console.error('Guru API unhandled error:', error)

    // Never leak full stack to client
    return NextResponse.json(
      {
        status: 'error',
        code: 'INTERNAL_ERROR',
        message: 'An unexpected error occurred. Please try again later.',
      },
      { status: 500 }
    )
  }
}

