/**
 * Admin Authentication Layer
 * Milestone 10 - Step 1
 */

import crypto from 'crypto'
import { adminDb } from '@/lib/firebase/admin'
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

export const ADMIN_PERMISSIONS: Record<AdminRole, string[]> = {
  SuperAdmin: [
    'users.read', 'users.write', 'users.delete',
    'reports.read', 'reports.write', 'reports.delete',
    'payments.read', 'payments.write', 'payments.refund',
    'tickets.read', 'tickets.adjust',
    'staff.read', 'staff.manage',
    'guru.read', 'guru.write',
    'knowledge.read', 'knowledge.write', 'knowledge.delete',
    'content.read', 'content.write',
    'logs.read', 'monitoring.read',
    'jobs.read', 'jobs.trigger',
    'settings.read', 'settings.write',
    'backup.read', 'backup.write',
  ],
  Astrologer: [
    'users.read', 'reports.read', 'reports.write', 'guru.read',
    'knowledge.read', 'knowledge.write',
  ],
  Support: [
    'users.read', 'users.write', 'reports.read', 'payments.read',
    'tickets.read', 'logs.read', 'monitoring.read', 'jobs.read',
  ],
  ContentManager: [
    'knowledge.read', 'knowledge.write', 'knowledge.delete',
    'content.read', 'content.write',
  ],
  Finance: [
    'users.read', 'payments.read', 'payments.write', 'payments.refund',
    'tickets.read', 'tickets.adjust', 'reports.read', 'monitoring.read',
  ],
}

function normalizeAdminRole(role: unknown): AdminRole {
  if (typeof role !== 'string') return 'Support'
  if (role in ADMIN_PERMISSIONS) return role as AdminRole

  const legacy = role.trim().toLowerCase()
  if (legacy === 'super' || legacy === 'superadmin' || legacy === 'super_admin' || legacy === 'admin') return 'SuperAdmin'
  if (legacy === 'astrologer') return 'Astrologer'
  if (legacy === 'support') return 'Support'
  if (legacy === 'contentmanager' || legacy === 'content_manager' || legacy === 'content') return 'ContentManager'
  if (legacy === 'finance') return 'Finance'
  return 'Support'
}

export async function isAdmin(uid: string): Promise<boolean> {
  if (!adminDb) return false
  try {
    const adminSnap = await adminDb.collection('admins').doc(uid).get()
    return adminSnap.exists
  } catch (error) {
    console.error('Error checking admin status:', error)
    return false
  }
}

export async function getAdminUser(uid: string): Promise<AdminUser | null> {
  if (!adminDb) return null
  try {
    const adminSnap = await adminDb.collection('admins').doc(uid).get()
    if (!adminSnap.exists) return null
    const data = adminSnap.data()
    const role = normalizeAdminRole(data?.role)
    return {
      uid,
      email: data?.email || '',
      role,
      name: data?.name || '',
      createdAt: data?.createdAt?.toDate?.() || new Date(),
      lastLogin: data?.lastLogin?.toDate?.(),
      permissions: ADMIN_PERMISSIONS[role],
    }
  } catch (error) {
    console.error('Error getting admin user:', error)
    return null
  }
}

const HASH_VERSION = 'scrypt-v1'

function getSessionSecret(): string {
  const secret = envVars.auth.adminSessionSecret
  if (!secret) throw new Error('ADMIN_SESSION_SECRET is not configured')
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
        if (version !== HASH_VERSION) return resolve(false)
        const derivedKey = crypto.scryptSync(password, stored.passwordSalt, 64).toString('hex')
        const derived = Buffer.from(derivedKey, 'hex')
        const expected = Buffer.from(stored.passwordHash, 'hex')
        if (derived.length !== expected.length) return resolve(false)
        return resolve(crypto.timingSafeEqual(derived, expected))
      }
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
    if (parts.length !== 3) return { valid: false }
    const [header, body, signature] = parts
    const expected = crypto.createHmac('sha256', secret).update(`${header}.${body}`).digest('base64url')
    const actualBuffer = Buffer.from(signature)
    const expectedBuffer = Buffer.from(expected)
    if (actualBuffer.length !== expectedBuffer.length || !crypto.timingSafeEqual(actualBuffer, expectedBuffer)) return { valid: false }
    const payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8'))
    if (payload.exp && Date.now() > payload.exp) return { valid: false }
    return { valid: true, payload }
  } catch (error) {
    console.error('Admin session verification error:', error)
    return { valid: false }
  }
}

export async function hasPermission(uid: string, permission: string): Promise<boolean> {
  const admin = await getAdminUser(uid)
  return !!admin && admin.permissions.includes(permission)
}

export async function createAdminSession(uid: string): Promise<string> {
  const admin = await getAdminUser(uid)
  if (!admin) throw new Error('Admin not found')
  const expiresIn = 60 * 60 * 24 * 5 * 1000
  return signAdminSession({ uid: admin.uid, email: admin.email, role: admin.role, exp: Date.now() + expiresIn })
}

export async function verifyAdminSession(sessionCookie: string): Promise<AdminUser | null> {
  try {
    const result = verifyAdminSessionToken(sessionCookie)
    if (!result.valid || !result.payload?.uid) return null
    return await getAdminUser(result.payload.uid)
  } catch (error) {
    console.error('Error verifying admin session:', error)
    return null
  }
}

export async function updateAdminLastLogin(uid: string): Promise<void> {
  if (!adminDb) return
  try {
    await adminDb.collection('admins').doc(uid).update({ lastLogin: new Date() })
  } catch (error) {
    console.error('Error updating admin last login:', error)
  }
}
