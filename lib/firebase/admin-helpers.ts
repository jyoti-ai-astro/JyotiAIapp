/**
 * Firebase Admin Helper Functions
 * Safe wrappers for Firebase Admin operations
 */

import { getFirebaseAdmin, getAdminAuth, getAdminDb, getAdminStorage, adminAuth, adminDb, adminStorage } from './admin'

/**
 * Check if Firebase Admin is initialized
 */
export function isFirebaseAdminInitialized(): boolean {
  return !!getFirebaseAdmin()
}

/**
 * Get Firebase Admin Auth (throws if not initialized)
 */
export function getAdminAuthSafe() {
  const auth = getAdminAuth()
  if (!auth) {
    throw new Error('Firebase Admin Auth is not initialized. Please configure FIREBASE_ADMIN_* environment variables.')
  }
  return auth
}

/**
 * Get Firestore Admin (throws if not initialized)
 */
export function getAdminDbSafe() {
  const db = getAdminDb()
  if (!db) {
    throw new Error('Firebase Admin Firestore is not initialized. Please configure FIREBASE_ADMIN_* environment variables.')
  }
  return db
}

/**
 * Get Firebase Admin Storage (throws if not initialized)
 */
export function getAdminStorageSafe() {
  const storage = getAdminStorage()
  if (!storage) {
    throw new Error('Firebase Admin Storage is not initialized. Please configure FIREBASE_ADMIN_* environment variables.')
  }
  return storage
}

/**
 * Get Firebase Admin App (throws if not initialized)
 */
export function getAdminApp() {
  const firebaseApp = getFirebaseAdmin()
  if (!firebaseApp) {
    throw new Error('Firebase Admin App is not initialized. Please configure FIREBASE_ADMIN_* environment variables.')
  }
  return firebaseApp
}

