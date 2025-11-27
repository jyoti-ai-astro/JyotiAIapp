/**
 * Firebase Admin SDK initialization
 * This file should only be used on the server-side
 */

// Phase 31 - F46: Use validated environment variables
import { initializeApp, getApps, cert, App } from 'firebase-admin/app'
import { getAuth, Auth } from 'firebase-admin/auth'
import { getFirestore, Firestore } from 'firebase-admin/firestore'
import { envVars } from '@/lib/env/env.mjs'

let app: App
let adminAuth: Auth
let adminDb: Firestore

if (typeof window === 'undefined') {
  // Server-side only
  if (!getApps().length) {
    const { projectId, privateKey, clientEmail } = envVars.firebaseAdmin
    
    if (!projectId || !privateKey || !clientEmail) {
      console.warn('Firebase Admin credentials not configured. Admin features will be disabled.')
    } else {
      app = initializeApp({
        credential: cert({
          projectId,
          privateKey,
          clientEmail,
        }),
      })
      
      adminAuth = getAuth(app)
      adminDb = getFirestore(app)
    }
  } else {
    app = getApps()[0]
    adminAuth = getAuth(app)
    adminDb = getFirestore(app)
  }
}

export { app, adminAuth, adminDb }

