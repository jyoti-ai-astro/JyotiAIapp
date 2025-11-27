/**
 * Firebase Admin Helper Functions
 * Safe wrappers for Firebase Admin operations
 */

import { adminAuth, adminDb, adminStorage, app } from './admin'

/**
 * Check if Firebase Admin is initialized
 */
export function isFirebaseAdminInitialized(): boolean {
  return !!(app && adminAuth && adminDb)
}

/**
 * Get Firebase Admin Auth (throws if not initialized)
 */
export function getAdminAuth() {
  if (!adminAuth) {
    throw new Error('Firebase Admin Auth is not initialized. Please configure FIREBASE_ADMIN_* environment variables.')
  }
  return adminAuth
}

/**
 * Get Firestore Admin (throws if not initialized)
 */
export function getAdminDb() {
  if (!adminDb) {
    throw new Error('Firebase Admin Firestore is not initialized. Please configure FIREBASE_ADMIN_* environment variables.')
  }
  return adminDb
}

/**
 * Get Firebase Admin Storage (throws if not initialized)
 */
export function getAdminStorage() {
  if (!adminStorage) {
    throw new Error('Firebase Admin Storage is not initialized. Please configure FIREBASE_ADMIN_* environment variables.')
  }
  return adminStorage
}

/**
 * Get Firebase Admin App (throws if not initialized)
 */
export function getAdminApp() {
  if (!app) {
    throw new Error('Firebase Admin App is not initialized. Please configure FIREBASE_ADMIN_* environment variables.')
  }
  return app
}

