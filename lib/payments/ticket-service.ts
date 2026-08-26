/**
 * Ticket Service
 *
 * Pricing & Payments v3 - Phase F
 * Centralized ticket + subscription management.
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

export interface AdminTicketAdjustmentInput {
  uid: string
  actorAdminUid: string
  reason: string
  correlationId: string
  deltas?: TicketPayload
  reset?: boolean
}

export interface AdminTicketAdjustmentResult {
  before: UserTickets
  after: UserTickets
  idempotentReplay: boolean
}

const ACTIVE_STATUSES = new Set(['active', 'authenticated'])
const TICKET_FIELDS = ['aiGuruTickets', 'kundaliTickets', 'lifetimePredictions'] as const

type TicketField = (typeof TICKET_FIELDS)[number]

function toDateOrNull(value: any): Date | null {
  if (!value) return null
  if (value instanceof Date) return value
  if (typeof value?.toDate === 'function') return value.toDate()
  const d = new Date(value)
  return Number.isNaN(d.getTime()) ? null : d
}

function detectSubscription(userData: any): { hasSubscription: boolean; planId?: string; expiry?: Date } {
  const now = new Date()
  let hasNew = false
  let hasLegacy = false
  let planId: string | undefined
  let expiry: Date | undefined

  const subObj = typeof userData?.subscription === 'object' ? userData.subscription : null
  if (subObj) {
    const status: string | null = subObj.status ?? null
    const activeFlag: boolean = subObj.active === true
    const statusActive = status ? ACTIVE_STATUSES.has(status) : false
    const expiryDate = toDateOrNull(subObj.expiry ?? subObj.expiresAt ?? subObj.subscriptionExpiry) ?? undefined
    if ((activeFlag || statusActive) && (!expiryDate || expiryDate > now)) {
      hasNew = true
      planId = subObj.planId ?? planId
      expiry = expiryDate ?? expiry
    }
  }

  const legacySub = typeof userData?.subscription === 'string' ? userData.subscription : undefined
  const legacyExpiry = toDateOrNull(userData?.subscriptionExpiry) ?? undefined
  if (legacySub && legacySub !== 'free' && legacyExpiry && legacyExpiry > now) {
    hasLegacy = true
    planId = planId || legacySub
    expiry = expiry || legacyExpiry
  }

  return { hasSubscription: hasNew || hasLegacy, planId, expiry }
}

function normalizeTickets(data: any): UserTickets {
  return {
    aiGuruTickets: Number(data?.aiGuruTickets || 0),
    kundaliTickets: Number(data?.kundaliTickets || 0),
    lifetimePredictions: Number(data?.lifetimePredictions || 0),
  }
}

function validateTicketPayload(payload: TicketPayload | undefined): TicketPayload {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    throw new Error('A ticket adjustment payload is required')
  }

  const keys = Object.keys(payload)
  if (keys.length === 0 || keys.some((key) => !TICKET_FIELDS.includes(key as TicketField))) {
    throw new Error('Invalid ticket field')
  }

  const validated: TicketPayload = {}
  for (const field of TICKET_FIELDS) {
    const value = payload[field]
    if (value !== undefined) {
      if (!Number.isSafeInteger(value) || value === 0 || Math.abs(value) > 100000) {
        throw new Error(`Invalid ${field} adjustment`)
      }
      validated[field] = value
    }
  }
  return validated
}

export async function fetchUserTickets(uid: string): Promise<UserTickets | null> {
  if (!adminDb) throw new Error('Firestore not initialized')
  const snap = await adminDb.collection('users').doc(uid).get()
  if (!snap.exists) return null
  const data = snap.data()
  return { ...normalizeTickets(data), email: data?.email || undefined, uid }
}

export async function addTickets(uid: string, ticketPayload: TicketPayload): Promise<void> {
  if (!adminDb) throw new Error('Firestore not initialized')
  const payload = validateTicketPayload(ticketPayload)
  if (Object.values(payload).some((value) => (value || 0) < 0)) throw new Error('addTickets only accepts positive values')

  const userRef = adminDb.collection('users').doc(uid)
  await adminDb.runTransaction(async (tx) => {
    const snap = await tx.get(userRef)
    if (!snap.exists) throw new Error('User not found')
    const current = normalizeTickets(snap.data())
    const updates: Record<string, any> = { updatedAt: new Date() }
    for (const field of TICKET_FIELDS) {
      const delta = payload[field]
      if (delta !== undefined) updates[field] = current[field] + delta
    }
    if (payload.aiGuruTickets !== undefined) {
      updates.tickets = Number(snap.data()?.tickets || 0) + payload.aiGuruTickets
    }
    tx.update(userRef, updates)
  })
}

export async function consumeTickets(uid: string, ticketPayload: TicketPayload): Promise<boolean> {
  if (!adminDb) throw new Error('Firestore not initialized')
  const payload = validateTicketPayload(ticketPayload)
  if (Object.values(payload).some((value) => (value || 0) < 0)) throw new Error('consumeTickets only accepts positive values')

  const userRef = adminDb.collection('users').doc(uid)
  return adminDb.runTransaction(async (tx) => {
    const snap = await tx.get(userRef)
    if (!snap.exists) throw new Error('User not found')
    const current = normalizeTickets(snap.data())
    const updates: Record<string, any> = { updatedAt: new Date() }

    for (const field of TICKET_FIELDS) {
      const amount = payload[field]
      if (amount !== undefined) {
        if (current[field] < amount) return false
        updates[field] = current[field] - amount
      }
    }
    if (payload.aiGuruTickets !== undefined) {
      updates.tickets = Math.max(0, Number(snap.data()?.tickets || 0) - payload.aiGuruTickets)
    }
    tx.update(userRef, updates)
    return true
  })
}

export async function adjustTicketsByAdmin(input: AdminTicketAdjustmentInput): Promise<AdminTicketAdjustmentResult> {
  if (!adminDb) throw new Error('Firestore not initialized')

  const uid = input.uid?.trim()
  const actorAdminUid = input.actorAdminUid?.trim()
  const reason = input.reason?.trim()
  const correlationId = input.correlationId?.trim()
  if (!uid || !actorAdminUid) throw new Error('uid and actorAdminUid are required')
  if (!reason || reason.length < 5 || reason.length > 500) throw new Error('A reason of 5-500 characters is required')
  if (!correlationId || correlationId.length < 8 || correlationId.length > 128) throw new Error('A valid correlationId is required')
  if (input.reset && input.deltas) throw new Error('reset and deltas are mutually exclusive')
  const deltas = input.reset ? undefined : validateTicketPayload(input.deltas)

  const userRef = adminDb.collection('users').doc(uid)
  const ledgerRef = adminDb.collection('ticket_ledger').doc(correlationId)
  const auditRef = adminDb.collection('admin_audit').doc(`ticket-${correlationId}`)

  return adminDb.runTransaction(async (tx) => {
    const existing = await tx.get(ledgerRef)
    if (existing.exists) {
      const data = existing.data() || {}
      if (data.actorAdminUid !== actorAdminUid || data.userId !== uid) {
        throw new Error('Correlation ID already used for a different adjustment')
      }
      return { before: data.before, after: data.after, idempotentReplay: true }
    }

    const userSnap = await tx.get(userRef)
    if (!userSnap.exists) throw new Error('User not found')

    const before = normalizeTickets(userSnap.data())
    const after: UserTickets = { ...before }
    if (input.reset) {
      for (const field of TICKET_FIELDS) after[field] = 0
    } else {
      for (const field of TICKET_FIELDS) {
        const delta = deltas?.[field]
        if (delta !== undefined) after[field] = before[field] + delta
        if (after[field] < 0) throw new Error(`Adjustment would make ${field} negative`)
      }
    }

    const updates: Record<string, any> = {
      aiGuruTickets: after.aiGuruTickets,
      kundaliTickets: after.kundaliTickets,
      lifetimePredictions: after.lifetimePredictions,
      updatedAt: new Date(),
    }
    const legacyTickets = Number(userSnap.data()?.tickets || 0)
    updates.tickets = input.reset
      ? 0
      : Math.max(0, legacyTickets + (deltas?.aiGuruTickets || 0))

    const createdAt = new Date()
    tx.update(userRef, updates)
    tx.create(ledgerRef, {
      userId: uid,
      actorAdminUid,
      source: 'admin',
      reason,
      correlationId,
      operation: input.reset ? 'reset' : 'adjust',
      deltas: input.reset ? null : deltas,
      before,
      after,
      createdAt,
    })
    tx.create(auditRef, {
      actorUid: actorAdminUid,
      permission: 'tickets.adjust',
      action: input.reset ? 'tickets.reset' : 'tickets.adjust',
      targetType: 'user',
      targetId: uid,
      reason,
      beforeSummary: before,
      afterSummary: after,
      requestId: correlationId,
      createdAt,
    })

    return { before, after, idempotentReplay: false }
  })
}

export async function haveEnoughTickets(uid: string, required: TicketPayload): Promise<boolean> {
  const userTickets = await fetchUserTickets(uid)
  if (!userTickets) return false
  return TICKET_FIELDS.every((field) => required[field] === undefined || userTickets[field] >= (required[field] || 0))
}

export async function splitSubscriptionAndTickets(uid: string): Promise<{
  hasSubscription: boolean
  subscriptionPlan?: string
  subscriptionExpiry?: Date
  tickets: UserTickets
}> {
  if (!adminDb) throw new Error('Firestore not initialized')
  const snap = await adminDb.collection('users').doc(uid).get()
  if (!snap.exists) throw new Error('User not found')
  const data = snap.data()
  const { hasSubscription, planId, expiry } = detectSubscription(data)
  return { hasSubscription, subscriptionPlan: planId, subscriptionExpiry: expiry, tickets: normalizeTickets(data) }
}

export function getUserTickets(user: any): UserTickets {
  return { ...normalizeTickets(user), email: user?.email || undefined, uid: user?.uid || undefined }
}

export function incrementTickets(user: any, ticketPayload: TicketPayload): any {
  const updates: any = { ...user }
  for (const field of TICKET_FIELDS) {
    const value = ticketPayload[field]
    if (value !== undefined) updates[field] = (updates[field] || 0) + value
  }
  if (ticketPayload.aiGuruTickets !== undefined) updates.tickets = (updates.tickets || 0) + ticketPayload.aiGuruTickets
  return updates
}

export function decrementTickets(user: any, ticketPayload: TicketPayload): any {
  const updates: any = { ...user }
  for (const field of TICKET_FIELDS) {
    const value = ticketPayload[field]
    if (value !== undefined) updates[field] = Math.max(0, (updates[field] || 0) - value)
  }
  if (ticketPayload.aiGuruTickets !== undefined) updates.tickets = Math.max(0, (updates.tickets || 0) - ticketPayload.aiGuruTickets)
  return updates
}

export async function ensureFeatureAccess(uid: string, featureKey: FeatureKey): Promise<void> {
  const config = getFeatureAccess(featureKey)
  const accessInfo = await splitSubscriptionAndTickets(uid)
  if (accessInfo.hasSubscription) return
  const ticketCount = (accessInfo.tickets as any)[config.ticketField] || 0
  if (ticketCount < config.costPerUse) {
    const error: any = new Error(`Insufficient ${config.ticketField} for ${config.label}`)
    error.code = 'NO_TICKETS'
    error.feature = featureKey
    throw error
  }
}

export async function consumeFeatureTicket(uid: string, featureKey: FeatureKey): Promise<void> {
  const config = getFeatureAccess(featureKey)
  const accessInfo = await splitSubscriptionAndTickets(uid)
  if (accessInfo.hasSubscription) return
  const ticketPayload: TicketPayload = { [config.ticketField]: config.costPerUse } as TicketPayload
  const consumed = await consumeTickets(uid, ticketPayload)
  if (!consumed) {
    const error: any = new Error(`Failed to consume tickets for ${config.label}`)
    error.code = 'TICKET_CONSUMPTION_FAILED'
    throw error
  }
}
