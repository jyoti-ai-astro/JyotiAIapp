/**
 * Ticket Service
 * 
 * Pricing & Payments v3 - Phase F
 * 
 * Centralized ticket management for one-time purchases
 */

import { adminDb } from '@/lib/firebase/admin'
import { getFeatureAccess, type FeatureKey } from '@/lib/payments/feature-access'

export interface TicketPayload {
  aiGuruTickets?: number
  kundaliTickets?: number
  lifetimePredictions?: number
}

export interface UserTickets {
  aiGuruTickets: number
  kundaliTickets: number
  lifetimePredictions: number
  email?: string
  uid?: string
}

/**
 * Get user tickets from Firestore
 */
export async function fetchUserTickets(uid: string): Promise<UserTickets | null> {
  if (!adminDb) {
    throw new Error('Firestore not initialized')
  }

  try {
    const userRef = adminDb.collection('users').doc(uid)
    const userSnap = await userRef.get()

    if (!userSnap.exists) {
      return null
    }

    const userData = userSnap.data()
    return {
      aiGuruTickets: userData?.aiGuruTickets || 0,
      kundaliTickets: userData?.kundaliTickets || 0,
      lifetimePredictions: userData?.lifetimePredictions || 0,
      email: userData?.email || undefined,
      uid: uid,
    }
  } catch (error: any) {
    console.error('Error fetching user tickets:', error)
    throw new Error(`Failed to fetch user tickets: ${error.message}`)
  }
}

/**
 * Add tickets to user account
 */
export async function addTickets(uid: string, ticketPayload: TicketPayload): Promise<void> {
  if (!adminDb) {
    throw new Error('Firestore not initialized')
  }

  try {
    const userRef = adminDb.collection('users').doc(uid)
    const userSnap = await userRef.get()

    if (!userSnap.exists) {
      throw new Error('User not found')
    }

    const userData = userSnap.data()
    const updates: any = {}

    if (ticketPayload.aiGuruTickets !== undefined) {
      const current = userData?.aiGuruTickets || 0
      updates.aiGuruTickets = current + ticketPayload.aiGuruTickets
      // Also update legacy tickets field for backward compatibility
      const legacyTickets = userData?.tickets || 0
      updates.tickets = legacyTickets + ticketPayload.aiGuruTickets
    }

    if (ticketPayload.kundaliTickets !== undefined) {
      const current = userData?.kundaliTickets || 0
      updates.kundaliTickets = current + ticketPayload.kundaliTickets
    }

    if (ticketPayload.lifetimePredictions !== undefined) {
      const current = userData?.lifetimePredictions || 0
      updates.lifetimePredictions = current + ticketPayload.lifetimePredictions
    }

    updates.updatedAt = new Date()

    await userRef.update(updates)
  } catch (error: any) {
    console.error('Error adding tickets:', error)
    throw new Error(`Failed to add tickets: ${error.message}`)
  }
}

/**
 * Consume tickets from user account
 */
export async function consumeTickets(uid: string, ticketPayload: TicketPayload): Promise<boolean> {
  if (!adminDb) {
    throw new Error('Firestore not initialized')
  }

  try {
    const userRef = adminDb.collection('users').doc(uid)
    const userSnap = await userRef.get()

    if (!userSnap.exists) {
      throw new Error('User not found')
    }

    const userData = userSnap.data()
    const updates: any = {}

    // Check if user has enough tickets
    if (ticketPayload.aiGuruTickets !== undefined && ticketPayload.aiGuruTickets > 0) {
      const current = userData?.aiGuruTickets || 0
      if (current < ticketPayload.aiGuruTickets) {
        return false // Not enough tickets
      }
      updates.aiGuruTickets = current - ticketPayload.aiGuruTickets
      // Also update legacy tickets field for backward compatibility
      const legacyTickets = userData?.tickets || 0
      updates.tickets = Math.max(0, legacyTickets - ticketPayload.aiGuruTickets)
    }

    if (ticketPayload.kundaliTickets !== undefined && ticketPayload.kundaliTickets > 0) {
      const current = userData?.kundaliTickets || 0
      if (current < ticketPayload.kundaliTickets) {
        return false // Not enough tickets
      }
      updates.kundaliTickets = current - ticketPayload.kundaliTickets
    }

    if (ticketPayload.lifetimePredictions !== undefined && ticketPayload.lifetimePredictions > 0) {
      const current = userData?.lifetimePredictions || 0
      if (current < ticketPayload.lifetimePredictions) {
        return false // Not enough tickets
      }
      updates.lifetimePredictions = current - ticketPayload.lifetimePredictions
    }

    updates.updatedAt = new Date()

    await userRef.update(updates)
    return true
  } catch (error: any) {
    console.error('Error consuming tickets:', error)
    throw new Error(`Failed to consume tickets: ${error.message}`)
  }
}

/**
 * Check if user has enough tickets for required operation
 */
export async function haveEnoughTickets(uid: string, required: TicketPayload): Promise<boolean> {
  try {
    const userTickets = await fetchUserTickets(uid)
    if (!userTickets) {
      return false
    }

    if (required.aiGuruTickets !== undefined && required.aiGuruTickets > 0) {
      if (userTickets.aiGuruTickets < required.aiGuruTickets) {
        return false
      }
    }

    if (required.kundaliTickets !== undefined && required.kundaliTickets > 0) {
      if (userTickets.kundaliTickets < required.kundaliTickets) {
        return false
      }
    }

    if (required.lifetimePredictions !== undefined && required.lifetimePredictions > 0) {
      if (userTickets.lifetimePredictions < required.lifetimePredictions) {
        return false
      }
    }

    return true
  } catch (error) {
    console.error('Error checking tickets:', error)
    return false
  }
}

/**
 * Split user access into subscription and tickets
 * Returns object with subscription info and ticket counts
 */
export async function splitSubscriptionAndTickets(uid: string): Promise<{
  hasSubscription: boolean
  subscriptionPlan?: string
  subscriptionExpiry?: Date
  tickets: UserTickets
}> {
  if (!adminDb) {
    throw new Error('Firestore not initialized')
  }

  try {
    const userRef = adminDb.collection('users').doc(uid)
    const userSnap = await userRef.get()

    if (!userSnap.exists) {
      throw new Error('User not found')
    }

    const userData = userSnap.data()
    
    // Check new subscription structure (from subscription API)
    const subscriptionData = userData?.subscription
    const hasSubscription = subscriptionData?.active === true
    
    // Fallback to old structure for backward compatibility
    const legacySubscription = userData?.subscription
    const subscriptionExpiry = userData?.subscriptionExpiry?.toDate()
    const hasLegacySubscription =
      legacySubscription &&
      legacySubscription !== 'free' &&
      subscriptionExpiry &&
      subscriptionExpiry > new Date()
    
    const hasActiveSubscription = hasSubscription || hasLegacySubscription

    const tickets = await fetchUserTickets(uid)

    return {
      hasSubscription: hasActiveSubscription,
      subscriptionPlan: subscriptionData?.planId || (hasLegacySubscription ? legacySubscription : undefined),
      subscriptionExpiry: subscriptionExpiry || undefined,
      tickets: tickets || {
        aiGuruTickets: 0,
        kundaliTickets: 0,
        lifetimePredictions: 0,
      },
    }
  } catch (error: any) {
    console.error('Error splitting subscription and tickets:', error)
    throw new Error(`Failed to split subscription and tickets: ${error.message}`)
  }
}

/**
 * Get user tickets (helper for client-side compatible format)
 */
export function getUserTickets(user: any): UserTickets {
  return {
    aiGuruTickets: user?.aiGuruTickets || 0,
    kundaliTickets: user?.kundaliTickets || 0,
    lifetimePredictions: user?.lifetimePredictions || 0,
    email: user?.email || undefined,
    uid: user?.uid || undefined,
  }
}

/**
 * Increment tickets (client-side helper)
 */
export function incrementTickets(user: any, ticketPayload: TicketPayload): any {
  const updates: any = { ...user }

  if (ticketPayload.aiGuruTickets !== undefined) {
    updates.aiGuruTickets = (updates.aiGuruTickets || 0) + ticketPayload.aiGuruTickets
    updates.tickets = (updates.tickets || 0) + ticketPayload.aiGuruTickets
  }

  if (ticketPayload.kundaliTickets !== undefined) {
    updates.kundaliTickets = (updates.kundaliTickets || 0) + ticketPayload.kundaliTickets
  }

  if (ticketPayload.lifetimePredictions !== undefined) {
    updates.lifetimePredictions = (updates.lifetimePredictions || 0) + ticketPayload.lifetimePredictions
  }

  return updates
}

/**
 * Decrement tickets (client-side helper)
 */
export function decrementTickets(user: any, ticketPayload: TicketPayload): any {
  const updates: any = { ...user }

  if (ticketPayload.aiGuruTickets !== undefined) {
    updates.aiGuruTickets = Math.max(0, (updates.aiGuruTickets || 0) - ticketPayload.aiGuruTickets)
    updates.tickets = Math.max(0, (updates.tickets || 0) - ticketPayload.aiGuruTickets)
  }

  if (ticketPayload.kundaliTickets !== undefined) {
    updates.kundaliTickets = Math.max(0, (updates.kundaliTickets || 0) - ticketPayload.kundaliTickets)
  }

  if (ticketPayload.lifetimePredictions !== undefined) {
    updates.lifetimePredictions = Math.max(0, (updates.lifetimePredictions || 0) - ticketPayload.lifetimePredictions)
  }

  return updates
}

/**
 * Ensure user has access to a feature (throws if not)
 * Phase S: Backend API enforcement helper
 */
export async function ensureFeatureAccess(uid: string, featureKey: FeatureKey): Promise<void> {
  const config = getFeatureAccess(featureKey)
  const accessInfo = await splitSubscriptionAndTickets(uid)

  // If user has active subscription, allow access
  if (accessInfo.hasSubscription) {
    return
  }

  // Check if user has enough tickets
  const ticketCount = accessInfo.tickets[config.ticketField] || 0
  if (ticketCount < config.costPerUse) {
    const error: any = new Error(`Insufficient ${config.ticketField} for ${config.label}`)
    error.code = 'NO_TICKETS'
    error.feature = featureKey
    throw error
  }
}

/**
 * Consume tickets for a feature use
 * Phase S: Backend API enforcement helper
 */
export async function consumeFeatureTicket(uid: string, featureKey: FeatureKey): Promise<void> {
  const config = getFeatureAccess(featureKey)
  const accessInfo = await splitSubscriptionAndTickets(uid)

  // If user has active subscription, don't consume tickets
  if (accessInfo.hasSubscription) {
    return
  }

  // Consume the required tickets
  const ticketPayload: TicketPayload = {}
  ticketPayload[config.ticketField] = config.costPerUse

  const consumed = await consumeTickets(uid, ticketPayload)
  if (!consumed) {
    const error: any = new Error(`Failed to consume tickets for ${config.label}`)
    error.code = 'TICKET_CONSUMPTION_FAILED'
    throw error
  }
}

