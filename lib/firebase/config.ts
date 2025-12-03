// Phase 31 - F46: Use validated environment variables
import { initializeApp, getApps, FirebaseApp } from 'firebase/app'
import { getAuth, Auth } from 'firebase/auth'
import { getFirestore, Firestore } from 'firebase/firestore'
import { getStorage, FirebaseStorage } from 'firebase/storage'
import { envVars } from '@/lib/env/env.mjs'

// Check if Firebase config is complete
const isFirebaseConfigComplete = () => {
  return !!(
    envVars.firebase.apiKey &&
    envVars.firebase.authDomain &&
    envVars.firebase.projectId &&
    envVars.firebase.storageBucket &&
    envVars.firebase.messagingSenderId &&
    envVars.firebase.appId
  )
}

const firebaseConfig = {
  apiKey: envVars.firebase.apiKey || 'dummy-key',
  authDomain: envVars.firebase.authDomain || 'dummy-domain',
  projectId: envVars.firebase.projectId || 'dummy-project',
  storageBucket: envVars.firebase.storageBucket || 'dummy-bucket',
  messagingSenderId: envVars.firebase.messagingSenderId || 'dummy-sender',
  appId: envVars.firebase.appId || 'dummy-app',
}

let app: FirebaseApp | undefined
let auth: Auth | undefined
let db: Firestore | undefined
let storage: FirebaseStorage | undefined

if (typeof window !== 'undefined') {
  // Check if config values are valid (not dummy values)
  const hasValidConfig = isFirebaseConfigComplete() && 
    envVars.firebase.apiKey !== 'dummy-key' &&
    envVars.firebase.authDomain !== 'dummy-domain' &&
    envVars.firebase.projectId !== 'dummy-project' &&
    envVars.firebase.storageBucket !== 'dummy-bucket' &&
    envVars.firebase.messagingSenderId !== 'dummy-sender' &&
    envVars.firebase.appId !== 'dummy-app';

  if (hasValidConfig) {
    try {
      app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]
      auth = getAuth(app)
      db = getFirestore(app)
      storage = getStorage(app)
      console.log('✅ Firebase initialized successfully')
    } catch (error) {
      console.error('❌ Firebase initialization error:', error)
      console.warn('⚠️ Firebase config may be invalid. Check your environment variables.')
    }
  } else {
    // More detailed warning with missing variables
    const missing = []
    if (!envVars.firebase.apiKey || envVars.firebase.apiKey === 'dummy-key') missing.push('NEXT_PUBLIC_FIREBASE_API_KEY')
    if (!envVars.firebase.authDomain || envVars.firebase.authDomain === 'dummy-domain') missing.push('NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN')
    if (!envVars.firebase.projectId || envVars.firebase.projectId === 'dummy-project') missing.push('NEXT_PUBLIC_FIREBASE_PROJECT_ID')
    if (!envVars.firebase.storageBucket || envVars.firebase.storageBucket === 'dummy-bucket') missing.push('NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET')
    if (!envVars.firebase.messagingSenderId || envVars.firebase.messagingSenderId === 'dummy-sender') missing.push('NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID')
    if (!envVars.firebase.appId || envVars.firebase.appId === 'dummy-app') missing.push('NEXT_PUBLIC_FIREBASE_APP_ID')
    
    if (missing.length > 0) {
      console.warn('⚠️ Firebase environment variables are missing or invalid. Authentication features will not work.')
      console.warn('⚠️ Missing/invalid variables:', missing.join(', '))
      console.warn('⚠️ Please add these to Vercel: Settings → Environment Variables')
      console.warn('⚠️ Visit /dev/firebase-check to see detailed status')
    } else {
      console.warn('⚠️ Firebase config check failed but no variables are missing. This may be a configuration issue.')
    }
  }
}

export { app, auth, db, storage }

