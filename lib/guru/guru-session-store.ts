/**
 * Guru Session Store
 * 
 * MEGA BUILD 1 - Phase 7 Core
 * Manages Guru chat session history and persistence
 */

import { adminDb } from '@/lib/firebase/admin'
import type { GuruMessage, GuruResponse } from '@/lib/engines/guru-engine'

const MAX_HISTORY_TOKENS_APPROX = 4000 // Approximate token limit for context

/**
 * Load Guru chat history from Firestore or localStorage
 */
export async function loadGuruHistory(
  userId: string | null,
  sessionId?: string
): Promise<GuruMessage[]> {
  if (!userId) {
    // Guest user - load from localStorage
    if (typeof window === 'undefined') {
      return []
    }

    const stored = localStorage.getItem(`guru-history-${sessionId || 'default'}`)
    if (stored) {
      try {
        return JSON.parse(stored)
      } catch {
        return []
      }
    }
    return []
  }

  // Authenticated user - load from Firestore
  if (!adminDb) {
    return []
  }

  try {
    const sessionIdToUse = sessionId || 'default'
    const messagesRef = adminDb
      .collection('users')
      .doc(userId)
      .collection('guruSessions')
      .doc(sessionIdToUse)
      .collection('messages')
      .orderBy('createdAt', 'desc')
      .limit(50) // Last 50 messages

    const snapshot = await messagesRef.get()
    const messages: GuruMessage[] = snapshot.docs
      .map((doc) => {
        const data = doc.data()
        return {
          role: data.role as 'user' | 'assistant',
          content: data.content,
          createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
        }
      })
      .reverse() // Oldest first

    return messages
  } catch (error) {
    console.error('Error loading guru history:', error)
    return []
  }
}

/**
 * Save a Guru turn (user message + assistant response) to storage
 */
export async function saveGuruTurn(
  userId: string | null,
  message: GuruMessage,
  reply: GuruResponse,
  sessionId?: string
): Promise<void> {
  if (!userId) {
    // Guest user - save to localStorage
    if (typeof window === 'undefined') {
      return
    }

    const sessionIdToUse = sessionId || 'default'
    const existing = await loadGuruHistory(null, sessionIdToUse)
    const updated = [...existing, message, { role: 'assistant' as const, content: reply.answer, createdAt: new Date().toISOString() }]

    // Keep only last 20 messages for guests
    const trimmed = updated.slice(-20)
    localStorage.setItem(`guru-history-${sessionIdToUse}`, JSON.stringify(trimmed))
    return
  }

  // Authenticated user - save to Firestore
  if (!adminDb) {
    return
  }

  try {
    const sessionIdToUse = sessionId || 'default'
    const sessionRef = adminDb
      .collection('users')
      .doc(userId)
      .collection('guruSessions')
      .doc(sessionIdToUse)

    const messagesRef = sessionRef.collection('messages')

    // Save user message
    await messagesRef.add({
      role: message.role,
      content: message.content,
      createdAt: adminDb.Timestamp.now(),
    })

    // Save assistant response
    await messagesRef.add({
      role: 'assistant',
      content: reply.answer,
      metadata: {
        usedAstroContext: reply.usedAstroContext,
        usedRag: reply.usedRag,
      },
      createdAt: adminDb.Timestamp.now(),
    })

    // Update session metadata
    await sessionRef.set(
      {
        updatedAt: adminDb.Timestamp.now(),
        lastMessage: message.content.substring(0, 100),
      },
      { merge: true }
    )
  } catch (error) {
    console.error('Error saving guru turn:', error)
  }
}

/**
 * Truncate history to fit within approximate token limit
 */
export function truncateHistory(history: GuruMessage[], maxTokensApprox: number = MAX_HISTORY_TOKENS_APPROX): GuruMessage[] {
  // Rough estimate: 1 token ≈ 4 characters
  const maxChars = maxTokensApprox * 4
  let totalChars = 0
  const truncated: GuruMessage[] = []

  // Keep system message if present
  const systemMessage = history.find((m) => m.role === 'system')
  if (systemMessage) {
    truncated.push(systemMessage)
    totalChars += systemMessage.content.length
  }

  // Add messages from newest to oldest until limit
  for (let i = history.length - 1; i >= 0; i--) {
    const msg = history[i]
    if (msg.role === 'system') continue // Already added

    const msgChars = msg.content.length
    if (totalChars + msgChars > maxChars) {
      break
    }

    truncated.push(msg)
    totalChars += msgChars
  }

  // Return in chronological order (oldest first)
  return truncated.reverse()
}

