/**
 * Admin Authentication Layer
 * Milestone 10 - Step 1
 *
 * Admin authentication and role management
 */

import crypto from 'crypto'
import { adminAuth, adminDb } from '@/lib/firebase/admin'
import { envVars } from '@/lib/env/env.mjs'

export type AdminRole = 'SuperAdmin' | 'Astrologer' | 'Support' | 'ContentManager' | 'Finance'

export interface AdminUser {
  uid: string
  email: string
  role: AdminRole
  name: string
  createdAt: Date
  lastLogin?: Date
  permissions: string[]
}

/**
 * Admin permissions by role
 */
export const ADMIN_PERMISSIONS: Record<AdminRole, string[]> = {
  SuperAdmin: [
    'users.read',
    'users.write',
    'users.delete',
    'reports.read',
    'reports.write',
    'reports.delete',
    'payments.read',
    'payments.write',
    'payments.refund',
    'guru.read',
    'guru.write',
    'knowledge.read',
    'knowledge.write',
    'knowledge.delete',
    'content.read',
    'content.write',
    'logs.read',
    'jobs.trigger',
    'settings.read',
    'settings.write',
    'backup.read',
    'backup.write',
  ],
  Astrologer: [
    'users.read',
    'reports.read',
    'reports.write',
    'guru.read',
    'knowledge.read',
    'knowledge.write',
  ],
  Support: [
    'users.read',
    'users.write',
    'reports.read',
    'payments.read',
    'logs.read',
  ],
  ContentManager: [
    'knowledge.read',
    'knowledge.write',
    'knowledge.delete',
    'content.read',
    'content.write',
  ],
  Finance: [
    'users.read',
    'payments.read',
    'payments.write',
    'payments.refund',
    'reports.read',
  ],
}

function isAdminRole(role: unknown): role is AdminRole {
  return typeof role === 'string' && role in ADMIN_PERMISSIONS
}

/**
 * Check if user is admin
 */
export async function isAdmin(uid: string): Promise<boolean> {
  if (!adminDb) {
    return false
  }

  try {
    const adminRef = adminDb.collection('admins').doc(uid)
    const adminSnap = await adminRef.get()
    return adminSnap.exists
  } catch (error) {
    console.error('Error checking admin status:', error)
    return false
  }
}

/**
 * Get admin user
 */
export async function getAdminUser(uid: string): Promise<AdminUser | null> {
  if (!adminDb) {
    return null
  }

  try {
    const adminRef = adminDb.collection('admins').doc(uid)
    const adminSnap = await adminRef.get()

    if (!adminSnap.exists) {
      return null
    }

    const data = adminSnap.data()
    const role: AdminRole = isAdminRole(data?.role) ? data.role : 'Support'
    return {
      uid,
      email: data?.email || '',
      role,
      name: data?.name || '',
      createdAt: data?.createdAt?.toDate() || new Date(),
      lastLogin: data?.lastLogin?.toDate(),
      permissions: ADMIN_PERMISSIONS[role],
    }
  } catch (error) {
    console.error('Error getting admin user:', error)
    return null
  }
}

/**
 * Password hashing helpers (HMAC-scrypt)
 */
const HASH_VERSION = 'scrypt-v1'

function getSessionSecret(): string {
  const secret = envVars.auth.adminSessionSecret
  if (!secret) {
    throw new Error('ADMIN_SESSION_SECRET is not configured')
  }
  return secret
}

export function hashPassword(password: string): { hash: string; salt: string; version: string } {
  const salt = crypto.randomBytes(16).toString('hex')
  const derivedKey = crypto.scryptSync(password, salt, 64).toString('hex')
  return { hash: derivedKey, salt, version: HASH_VERSION }
}

export function verifyPassword(
  password: string,
  stored: { passwordHash?: string; passwordSalt?: string; passwordVersion?: string; password?: string },
  onRehash?: (hash: { hash: string; salt: string; version: string }) => Promise<void>
): Promise<boolean> {
  return new Promise(async (resolve) => {
    try {
      if (stored.passwordHash && stored.passwordSalt) {
        const version = stored.passwordVersion || HASH_VERSION
        if (version !== HASH_VERSION) {
          return resolve(false)
        }
        const derivedKey = crypto.scryptSync(password, stored.passwordSalt, 64).toString('hex')
        if (crypto.timingSafeEqual(Buffer.from(derivedKey, 'hex'), Buffer.from(stored.passwordHash, 'hex'))) {
          return resolve(true)
        }
        return resolve(false)
      }

      // Transitional: if legacy plaintext exists, verify then immediately rehash and store
      if (stored.password && stored.password === password && onRehash) {
        const newHash = hashPassword(password)
        await onRehash(newHash)
        return resolve(true)
      }

      resolve(false)
    } catch (error) {
      console.error('Password verification error:', error)
      resolve(false)
    }
  })
}

/**
 * Signed admin session tokens (HMAC SHA-256)
 */
export function signAdminSession(payload: { uid: string; email: string; role: AdminRole; exp: number }): string {
  const secret = getSessionSecret()
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url')
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url')
  const signature = crypto.createHmac('sha256', secret).update(`${header}.${body}`).digest('base64url')
  return `${header}.${body}.${signature}`
}

export function verifyAdminSessionToken(token: string): { valid: boolean; payload?: any } {
  try {
    const secret = getSessionSecret()
    const parts = token.split('.')
    if (parts.length !== 3) {
      return { valid: false }
    }
    const [header, body, signature] = parts
    const expected = crypto.createHmac('sha256', secret).update(`${header}.${body}`).digest('base64url')
    const matches = crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))
    if (!matches) {
      return { valid: false }
    }
    const payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8'))
    if (payload.exp && Date.now() > payload.exp) {
      return { valid: false }
    }
    return { valid: true, payload }
  } catch (error) {
    console.error('Admin session verification error:', error)
    return { valid: false }
  }
}

/**
 * Check if admin has permission
 */
export async function hasPermission(uid: string, permission: string): Promise<boolean> {
  const admin = await getAdminUser(uid)
  if (!admin) {
    return false
  }

  return admin.permissions.includes(permission)
}

/**
 * Create admin session
 */
export async function createAdminSession(uid: string): Promise<string> {
  const admin = await getAdminUser(uid)
  if (!admin) {
    throw new Error('Admin not found')
  }

  const expiresIn = 60 * 60 * 24 * 5 * 1000 // 5 days
  const payload = {
    uid: admin.uid,
    email: admin.email,
    role: admin.role,
    exp: Date.now() + expiresIn,
  }

  return signAdminSession(payload)
}

/**
 * Verify admin session
 */
export async function verifyAdminSession(sessionCookie: string): Promise<AdminUser | null> {
  try {
    const result = verifyAdminSessionToken(sessionCookie)
    if (!result.valid || !result.payload?.uid) {
      return null
    }

    const admin = await getAdminUser(result.payload.uid)
    return admin
  } catch (error) {
    console.error('Error verifying admin session:', error)
    return null
  }
}

/**
 * Update admin last login
 */
export async function updateAdminLastLogin(uid: string): Promise<void> {
  if (!adminDb) {
    return
  }

  try {
    await adminDb.collection('admins').doc(uid).update({
      lastLogin: new Date(),
    })
  } catch (error) {
    console.error('Error updating admin last login:', error)
  }
}
