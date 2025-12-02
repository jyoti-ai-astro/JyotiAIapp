/**
 * Admin Authentication Layer
 * Milestone 10 - Step 1
 * 
 * Admin authentication and role management
 */

import { adminAuth, adminDb } from '@/lib/firebase/admin'

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
    return {
      uid,
      email: data?.email || '',
      role: data?.role || 'Support',
      name: data?.name || '',
      createdAt: data?.createdAt?.toDate() || new Date(),
      lastLogin: data?.lastLogin?.toDate(),
      permissions: ADMIN_PERMISSIONS[data?.role || 'Support'] || [],
    }
  } catch (error) {
    console.error('Error getting admin user:', error)
    return null
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
  if (!adminAuth) {
    throw new Error('Admin auth not initialized')
  }

  // Create custom token for admin
  const customToken = await adminAuth.createCustomToken(uid, {
    admin: true,
  })

  return customToken
}

/**
 * Verify admin session
 */
export async function verifyAdminSession(sessionCookie: string): Promise<AdminUser | null> {
  if (!adminAuth) {
    return null
  }

  try {
    // Try to verify as Firebase session cookie first
    try {
      const decodedClaims = await adminAuth.verifySessionCookie(sessionCookie, true)
      const admin = await getAdminUser(decodedClaims.uid)
      return admin
    } catch (firebaseError) {
      // If Firebase session cookie verification fails, try our simplified session token
      try {
        const sessionPayload = JSON.parse(Buffer.from(sessionCookie, 'base64').toString())
        
        // Check expiration
        if (sessionPayload.exp && sessionPayload.exp < Date.now()) {
          return null
        }
        
        const admin = await getAdminUser(sessionPayload.uid)
        return admin
      } catch (tokenError) {
        console.error('Error verifying admin session token:', tokenError)
        return null
      }
    }
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

