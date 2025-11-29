/**
 * Ticket-Based Access Control
 * 
 * Utilities for checking if a user can access features based on:
 * 1. Active subscription
 * 2. Available tickets
 */

interface UserAccess {
  hasSubscription: boolean
  // New structure: simple number for AI questions
  tickets?: number
  // Legacy structure: object with ticket types
  legacyTickets?: {
    ai_questions?: number
    kundali_basic?: number
  }
}

/**
 * Check if user can access a feature
 */
export function canAccessFeature(
  user: UserAccess | null,
  feature: 'ai_question' | 'kundali_basic' | 'compatibility' | 'career' | 'palmistry' | 'aura'
): boolean {
  if (!user) return false

  // If user has active subscription, allow access
  if (user.hasSubscription) {
    return true
  }

  // Check tickets based on feature
  // Support both new structure (tickets as number) and legacy structure
  const newTickets = typeof user.tickets === 'number' ? user.tickets : 0
  const legacyTickets = user.legacyTickets || {}

  switch (feature) {
    case 'ai_question':
      return newTickets > 0 || (legacyTickets.ai_questions || 0) > 0
    case 'kundali_basic':
      return (legacyTickets.kundali_basic || 0) > 0
    case 'compatibility':
    case 'career':
    case 'palmistry':
    case 'aura':
      // These require kundali_basic ticket or subscription
      return (legacyTickets.kundali_basic || 0) > 0 || user.hasSubscription
    default:
      return false
  }
}

/**
 * Get remaining tickets for a feature
 */
export function getRemainingTickets(
  user: UserAccess | null,
  feature: 'ai_question' | 'kundali_basic'
): number {
  if (!user) return 0

  switch (feature) {
    case 'ai_question':
      // Support both new and legacy structures
      const newTickets = typeof user.tickets === 'number' ? user.tickets : 0
      const legacyTickets = user.legacyTickets?.ai_questions || 0
      return Math.max(newTickets + legacyTickets, 0)
    case 'kundali_basic':
      return Math.max(user.legacyTickets?.kundali_basic || 0, 0)
    default:
      return 0
  }
}

/**
 * Check if user has any active access (subscription or tickets)
 */
export function hasAnyAccess(user: UserAccess | null): boolean {
  if (!user) return false

  if (user.hasSubscription) return true

  // Support both new and legacy structures
  const newTickets = typeof user.tickets === 'number' ? user.tickets : 0
  const legacyTickets = user.legacyTickets || {}
  return newTickets > 0 || (legacyTickets.ai_questions || 0) > 0 || (legacyTickets.kundali_basic || 0) > 0
}

/**
 * Decrement ticket via API call
 * Client-side function that calls the backend API
 */
export async function decrementTicket(
  ticketType: 'ai_questions' | 'kundali_basic'
): Promise<{ success: boolean; tickets?: any } | null> {
  try {
    const response = await fetch('/api/tickets/decrement', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ ticketType }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to decrement ticket')
    }

    return await response.json()
  } catch (error) {
    console.error('Decrement ticket error:', error)
    return null
  }
}

