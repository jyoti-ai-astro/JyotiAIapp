/**
 * Beta Testing System (Invite-Only Mode)
 * Milestone 9 - Step 9
 * 
 * Manages beta testing and invite-only access
 */

import { adminDb } from '@/lib/firebase/admin'

export interface BetaInvite {
  email: string
  code: string
  invitedBy?: string
  invitedAt: Date
  usedAt?: Date
  usedBy?: string
  expiresAt: Date
  status: 'pending' | 'used' | 'expired' | 'revoked'
}

/**
 * Check if email is in beta whitelist
 */
export async function isBetaUser(email: string): Promise<boolean> {
  if (!adminDb) {
    return false
  }

  try {
    const betaUserRef = adminDb.collection('beta_users').doc(email.toLowerCase())
    const betaUserSnap = await betaUserRef.get()

    if (!betaUserSnap.exists) {
      return false
    }

    const data = betaUserSnap.data()
    return data?.status === 'active'
  } catch (error) {
    console.error('Error checking beta user:', error)
    return false
  }
}

/**
 * Check if invite code is valid
 */
export async function validateInviteCode(code: string): Promise<{
  valid: boolean
  email?: string
  error?: string
}> {
  if (!adminDb) {
    return { valid: false, error: 'Database not initialized' }
  }

  try {
    const inviteRef = adminDb.collection('beta_invites').doc(code)
    const inviteSnap = await inviteRef.get()

    if (!inviteSnap.exists) {
      return { valid: false, error: 'Invalid invite code' }
    }

    const invite = inviteSnap.data() as BetaInvite

    // Check if expired
    if (new Date(invite.expiresAt) < new Date()) {
      return { valid: false, error: 'Invite code has expired' }
    }

    // Check if already used
    if (invite.status === 'used') {
      return { valid: false, error: 'Invite code has already been used' }
    }

    // Check if revoked
    if (invite.status === 'revoked') {
      return { valid: false, error: 'Invite code has been revoked' }
    }

    return { valid: true, email: invite.email }
  } catch (error: any) {
    return { valid: false, error: error.message }
  }
}

/**
 * Create beta invite
 */
export async function createBetaInvite(
  email: string,
  invitedBy?: string,
  expiresInDays: number = 30
): Promise<{ success: boolean; code?: string; error?: string }> {
  if (!adminDb) {
    return { success: false, error: 'Database not initialized' }
  }

  try {
    const code = generateInviteCode()
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + expiresInDays)

    const invite: BetaInvite = {
      email: email.toLowerCase(),
      code,
      invitedBy,
      invitedAt: new Date(),
      expiresAt,
      status: 'pending',
    }

    await adminDb.collection('beta_invites').doc(code).set(invite)

    return { success: true, code }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

/**
 * Use invite code
 */
export async function useInviteCode(
  code: string,
  userId: string
): Promise<{ success: boolean; error?: string }> {
  if (!adminDb) {
    return { success: false, error: 'Database not initialized' }
  }

  try {
    const validation = await validateInviteCode(code)
    if (!validation.valid) {
      return { success: false, error: validation.error }
    }

    // Mark invite as used
    await adminDb.collection('beta_invites').doc(code).update({
      status: 'used',
      usedAt: new Date(),
      usedBy: userId,
    })

    // Add user to beta_users
    if (validation.email) {
      await adminDb.collection('beta_users').doc(validation.email).set({
        email: validation.email,
        userId,
        status: 'active',
        activatedAt: new Date(),
      })
    }

    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

/**
 * Generate invite code
 */
function generateInviteCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' // Exclude confusing characters
  let code = ''
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}

/**
 * Check if beta mode is enabled
 */
// Phase 31 - F46: Use validated environment variables
import { envVars } from '@/lib/env/env.mjs'

export function isBetaModeEnabled(): boolean {
  return envVars.app.betaMode || envVars.app.publicBetaMode
}

