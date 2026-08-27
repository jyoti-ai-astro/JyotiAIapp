/**
 * Ticket Service
 *
 * Pricing & Payments v3 - Phase F
 *
 * Centralized ticket + subscription management for one-time purchases
 * and feature access.
 */

import { randomUUID } from 'crypto'
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

const ACTIVE_STATUSES = new Set(['active', 'authenticated'])

function toDateOrNull(value: any): Date | null {
  if (!value) return null
  if (value instanceof Date) return value
  if (typeof value?.toDate === 'function') return value.toDate()
  const d = new Date(value)
  return Number.isNaN(d.getTime()) ? null : d
}

/**
 * Internal helper: detect active subscription (new + legacy shapes).
 */
function detectSubscription(userData: any): {
  hasSubscription: boolean
  planId?: string
  expiry?: Date
} {
  const now = new Date()

  let hasNew = false
  let hasLegacy = false
  let planId: string | undefined
  let expiry: Date | undefined

  // New object-based subscription
  const subObj = typeof userData?.subscription === 'object' ? userData.subscription : null
  if (subObj) {
    const status: string | null = subObj.status ?? null
    const activeFlag: boolean = subObj.active === true

    const statusActive = status ? ACTIVE_STATUSES.has(status) : false

    const rawExpiry =
      subObj.expiry ??
      subObj.expiresAt ??
      subObj.subscriptionExpiry

    const expiryDate = toDateOrNull(rawExpiry) ?? undefined

    const isWithinExpiry =
      !expiryDate || expiryDate > now

    if ((activeFlag || statusActive) && isWithinExpiry) {
      hasNew = true
      planId = subObj.planId ?? planId
      expiry = expiryDate ?? expiry
    }
  }

  // Legacy string-based subscription + subscriptionExpiry
  const legacySub =
    typeof userData?.subscription === 'string'
      ? (userData.subscription as string)
      : undefined

  const legacyExpiry = toDateOrNull(userData?.subscriptionExpiry) ?? undefined

  if (
    legacySub &&
    legacySub !== 'free' &&
    legacyExpiry &&
    legacyExpiry > now
  ) {
    hasLegacy = true
    if (!planId) {
      planId = legacySub
    }
    if (!expiry) {
      expiry = legacyExpiry
    }
  }

  return {
    hasSubscription: hasNew || hasLegacy,
    planId,
    expiry,
  }
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

    return await adminDb.runTransaction(async (transaction) => {
      const userSnap = await transaction.get(userRef)

      if (!userSnap.exists) {
        throw new Error('User not found')
      }

      const userData = userSnap.data()
      const updates: any = {}

      if (ticketPayload.aiGuruTickets !== undefined && ticketPayload.aiGuruTickets > 0) {
        const current = userData?.aiGuruTickets || 0

        if (current < ticketPayload.aiGuruTickets) {
          return false
        }

        updates.aiGuruTickets = current - ticketPayload.aiGuruTickets

        // Keep the legacy mirror synchronized while backward compatibility remains.
        const legacyTickets =
          typeof userData?.tickets === 'number'
            ? userData.tickets
            : current

        updates.tickets = Math.max(
          0,
          legacyTickets - ticketPayload.aiGuruTickets
        )
      }

      if (ticketPayload.kundaliTickets !== undefined && ticketPayload.kundaliTickets > 0) {
        const current = userData?.kundaliTickets || 0

        if (current < ticketPayload.kundaliTickets) {
          return false
        }

        updates.kundaliTickets = current - ticketPayload.kundaliTickets
      }

      if (
        ticketPayload.lifetimePredictions !== undefined &&
        ticketPayload.lifetimePredictions > 0
      ) {
        const current = userData?.lifetimePredictions || 0

        if (current < ticketPayload.lifetimePredictions) {
          return false
        }

        updates.lifetimePredictions =
          current - ticketPayload.lifetimePredictions
      }

      updates.updatedAt = new Date()

      transaction.update(userRef, updates)

      return true
    })
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
 * Split user access into subscription and tickets.
 * Returns object with subscription info and ticket counts.
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

    const { hasSubscription, planId, expiry } = detectSubscription(userData)

    const tickets = await fetchUserTickets(uid)

    return {
      hasSubscription,
      subscriptionPlan: planId,
      subscriptionExpiry: expiry,
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
    updates.lifetimePredictions =
      (updates.lifetimePredictions || 0) + ticketPayload.lifetimePredictions
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
    updates.kundaliTickets = Math.max(
      0,
      (updates.kundaliTickets || 0) - ticketPayload.kundaliTickets
    )
  }

  if (ticketPayload.lifetimePredictions !== undefined) {
    updates.lifetimePredictions = Math.max(
      0,
      (updates.lifetimePredictions || 0) - ticketPayload.lifetimePredictions
    )
  }

  return updates
}


export type FeatureUseClaimMode = 'subscription' | 'ticket'

export interface FeatureUseClaimResult {
  status: 'claimed' | 'in_progress'
  claimId?: string
  mode?: FeatureUseClaimMode
}

/**
 * Atomically reserve a feature use.
 *
 * Subscription users receive a zero-ticket claim.
 * Ticket users have the configured ticket reserved in the same transaction.
 * A fresh existing claim prevents concurrent duplicate generation.
 */
export async function claimFeatureUse(
  uid: string,
  featureKey: FeatureKey,
  claimField: string,
  ttlMs = 10 * 60 * 1000
): Promise<FeatureUseClaimResult> {
  if (!adminDb) {
    throw new Error('Firestore not initialized')
  }

  const config = getFeatureAccess(featureKey)
  const userRef = adminDb.collection('users').doc(uid)
  const claimId = randomUUID()

  return adminDb.runTransaction(async (transaction) => {
    const userSnap = await transaction.get(userRef)

    if (!userSnap.exists) {
      throw new Error('User not found')
    }

    const userData = userSnap.data() || {}
    const existingClaim = userData?.[claimField]
    const existingClaimedAt = toDateOrNull(existingClaim?.claimedAt)

    if (
      existingClaim?.id &&
      existingClaimedAt &&
      Date.now() - existingClaimedAt.getTime() < ttlMs
    ) {
      return {
        status: 'in_progress' as const,
      }
    }

    const subscription = detectSubscription(userData)
    const updates: Record<string, any> = {}
    let mode: FeatureUseClaimMode = 'subscription'

    if (!subscription.hasSubscription) {
      mode = 'ticket'

      const current = Number(userData?.[config.ticketField] || 0)

      if (current < config.costPerUse) {
        const error: any = new Error(
          `Insufficient ${config.ticketField} for ${config.label}`
        )
        error.code = 'NO_TICKETS'
        error.feature = featureKey
        throw error
      }

      updates[config.ticketField] = current - config.costPerUse

      if (config.ticketField === 'aiGuruTickets') {
        const legacyTickets =
          typeof userData?.tickets === 'number'
            ? userData.tickets
            : current

        updates.tickets = Math.max(
          0,
          legacyTickets - config.costPerUse
        )
      }
    }

    updates[claimField] = {
      id: claimId,
      featureKey,
      mode,
      claimedAt: new Date(),
    }
    updates.updatedAt = new Date()

    transaction.update(userRef, updates)

    return {
      status: 'claimed' as const,
      claimId,
      mode,
    }
  })
}

/**
 * Release a feature-use claim.
 *
 * When refundTicket=true, a ticket-reserved claim restores the exact
 * configured feature cost. Subscription claims never mint tickets.
 */
export async function releaseFeatureUseClaim(
  uid: string,
  featureKey: FeatureKey,
  claimField: string,
  claimId: string,
  refundTicket: boolean
): Promise<void> {
  if (!adminDb) {
    throw new Error('Firestore not initialized')
  }

  const config = getFeatureAccess(featureKey)
  const userRef = adminDb.collection('users').doc(uid)

  await adminDb.runTransaction(async (transaction) => {
    const userSnap = await transaction.get(userRef)

    if (!userSnap.exists) {
      return
    }

    const userData = userSnap.data() || {}
    const claim = userData?.[claimField]

    // Never release or refund somebody else's newer claim.
    if (!claim || claim.id !== claimId) {
      return
    }

    const updates: Record<string, any> = {
      [claimField]: null,
      updatedAt: new Date(),
    }

    if (refundTicket && claim.mode === 'ticket') {
      const current = Number(userData?.[config.ticketField] || 0)
      updates[config.ticketField] = current + config.costPerUse

      if (config.ticketField === 'aiGuruTickets') {
        const legacyTickets =
          typeof userData?.tickets === 'number'
            ? userData.tickets
            : current

        updates.tickets = legacyTickets + config.costPerUse
      }
    }

    transaction.update(userRef, updates)
  })
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
  const ticketCount = (accessInfo.tickets as any)[config.ticketField] || 0
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
  ;(ticketPayload as any)[config.ticketField] = config.costPerUse

  const consumed = await consumeTickets(uid, ticketPayload)
  if (!consumed) {
    const error: any = new Error(`Failed to consume tickets for ${config.label}`)
    error.code = 'TICKET_CONSUMPTION_FAILED'
    throw error
  }
}
