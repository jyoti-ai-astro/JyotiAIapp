/**
 * Firebase Admin SDK initialization
 * This file should only be used on the server-side
 */

// Phase 31 - F46: Use validated environment variables
import { initializeApp, getApps, cert, App } from 'firebase-admin/app'
import { getAuth, Auth } from 'firebase-admin/auth'
import { getFirestore, Firestore } from 'firebase-admin/firestore'
import { getStorage, Storage } from 'firebase-admin/storage'
import { envVars } from '@/lib/env/env.mjs'

let app: App | undefined
let adminAuth: Auth | undefined
let adminDb: Firestore | undefined
let adminStorage: Storage | undefined

if (typeof window === 'undefined') {
  // Server-side only
  if (!getApps().length) {
    const { projectId, privateKey, clientEmail } = envVars.firebaseAdmin
    
    if (!projectId || !privateKey || !clientEmail) {
      console.warn('Firebase Admin credentials not configured. Admin features will be disabled.')
    } else {
      try {
        app = initializeApp({
          credential: cert({
            projectId,
            privateKey,
            clientEmail,
          }),
        })
        
        adminAuth = getAuth(app)
        adminDb = getFirestore(app)
        adminStorage = getStorage(app)
      } catch (error) {
        console.error('Failed to initialize Firebase Admin:', error)
        console.warn('Admin features will be disabled.')
      }
    }
  } else {
    try {
      app = getApps()[0]
      adminAuth = getAuth(app)
      adminDb = getFirestore(app)
      adminStorage = getStorage(app)
    } catch (error) {
      console.error('Failed to get Firebase Admin instance:', error)
    }
  }
}

export { app, adminAuth, adminDb, adminStorage }

