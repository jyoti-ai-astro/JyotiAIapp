// Phase 31 - F46: Use validated environment variables
import { initializeApp, getApps, FirebaseApp } from 'firebase/app'
import { getAuth, Auth } from 'firebase/auth'
import { getFirestore, Firestore } from 'firebase/firestore'
import { getStorage, FirebaseStorage } from 'firebase/storage'
import { envVars } from '@/lib/env/env.mjs'

const firebaseConfig = {
  apiKey: envVars.firebase.apiKey,
  authDomain: envVars.firebase.authDomain,
  projectId: envVars.firebase.projectId,
  storageBucket: envVars.firebase.storageBucket,
  messagingSenderId: envVars.firebase.messagingSenderId,
  appId: envVars.firebase.appId,
}

let app: FirebaseApp
let auth: Auth
let db: Firestore
let storage: FirebaseStorage

if (typeof window !== 'undefined') {
  try {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]
    auth = getAuth(app)
    db = getFirestore(app)
    storage = getStorage(app)
  } catch (error) {
    console.error('Firebase initialization error:', error)
    // In development, log warning but don't crash
    if (process.env.NODE_ENV === 'development') {
      console.warn('⚠️ Firebase config may be missing. Check your environment variables.')
    }
  }
}

export { app, auth, db, storage }

