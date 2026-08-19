import { initializeApp, getApps, FirebaseApp } from 'firebase/app'
import { getAuth, Auth } from 'firebase/auth'
import { getFirestore, Firestore } from 'firebase/firestore'
import { getStorage, FirebaseStorage } from 'firebase/storage'
import { publicEnv } from '@/lib/env/client'

// Check if Firebase config is complete
const isFirebaseConfigComplete = () => {
  return !!(
    publicEnv.firebase.apiKey &&
    publicEnv.firebase.authDomain &&
    publicEnv.firebase.projectId &&
    publicEnv.firebase.storageBucket &&
    publicEnv.firebase.messagingSenderId &&
    publicEnv.firebase.appId
  )
}

const firebaseConfig = {
  apiKey: publicEnv.firebase.apiKey || 'dummy-key',
  authDomain: publicEnv.firebase.authDomain || 'dummy-domain',
  projectId: publicEnv.firebase.projectId || 'dummy-project',
  storageBucket: publicEnv.firebase.storageBucket || 'dummy-bucket',
  messagingSenderId: publicEnv.firebase.messagingSenderId || 'dummy-sender',
  appId: publicEnv.firebase.appId || 'dummy-app',
}

let app: FirebaseApp | undefined
let auth: Auth | undefined
let db: Firestore | undefined
let storage: FirebaseStorage | undefined
let initializationAttempted = false

// Initialize Firebase on client-side (lazy initialization)
function initializeFirebase() {
  if (typeof window === 'undefined') {
    return; // Server-side, skip
  }

  // Prevent multiple initialization attempts
  if (initializationAttempted) {
    console.log('🔄 Firebase initialization already attempted, skipping...');
    return;
  }
  initializationAttempted = true;

  // Check if already initialized
  if (app && auth) {
    console.log('✅ Firebase already initialized');
    return;
  }

  // Debug: Check both publicEnv and process.env directly
  console.log('🔍 Checking Firebase config...');
  const directEnv = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  };
  
  console.log('🔍 Direct process.env check:', {
    hasApiKey: !!directEnv.apiKey,
    hasAuthDomain: !!directEnv.authDomain,
    hasProjectId: !!directEnv.projectId,
  });
  
  console.log('🔍 publicEnv.firebase check:', {
    hasApiKey: !!publicEnv.firebase.apiKey,
    hasAuthDomain: !!publicEnv.firebase.authDomain,
    hasProjectId: !!publicEnv.firebase.projectId,
  });

  // Use direct process.env as fallback if publicEnv is missing values
  const effectiveConfig = {
    apiKey: publicEnv.firebase.apiKey || directEnv.apiKey || 'dummy-key',
    authDomain: publicEnv.firebase.authDomain || directEnv.authDomain || 'dummy-domain',
    projectId: publicEnv.firebase.projectId || directEnv.projectId || 'dummy-project',
    storageBucket: publicEnv.firebase.storageBucket || directEnv.storageBucket || 'dummy-bucket',
    messagingSenderId: publicEnv.firebase.messagingSenderId || directEnv.messagingSenderId || 'dummy-sender',
    appId: publicEnv.firebase.appId || directEnv.appId || 'dummy-app',
  };

  // Check if config values are valid (not dummy values)
  const hasValidConfig = 
    effectiveConfig.apiKey !== 'dummy-key' &&
    effectiveConfig.authDomain !== 'dummy-domain' &&
    effectiveConfig.projectId !== 'dummy-project' &&
    effectiveConfig.storageBucket !== 'dummy-bucket' &&
    effectiveConfig.messagingSenderId !== 'dummy-sender' &&
    effectiveConfig.appId !== 'dummy-app';

  if (hasValidConfig) {
    try {
      // Use effective config (with fallback to process.env)
      const configToUse = {
        apiKey: effectiveConfig.apiKey,
        authDomain: effectiveConfig.authDomain,
        projectId: effectiveConfig.projectId,
        storageBucket: effectiveConfig.storageBucket,
        messagingSenderId: effectiveConfig.messagingSenderId,
        appId: effectiveConfig.appId,
      };
      
      // Check if Firebase is already initialized
      const existingApps = getApps();
      if (existingApps.length > 0) {
        app = existingApps[0];
        console.log('✅ Using existing Firebase app');
      } else {
        console.log('🔄 Initializing Firebase app...', {
          projectId: configToUse.projectId,
          authDomain: configToUse.authDomain,
        });
        app = initializeApp(configToUse);
        console.log('✅ Firebase app initialized');
      }
      
      auth = getAuth(app);
      db = getFirestore(app);
      storage = getStorage(app);
      
      console.log('✅ Firebase initialized successfully', {
        projectId: configToUse.projectId,
        authDomain: configToUse.authDomain,
        hasAuth: !!auth,
        hasDb: !!db,
        hasStorage: !!storage,
      });
    } catch (error: any) {
      console.error('❌ Firebase initialization error:', error);
      console.error('❌ Error details:', {
        code: error.code,
        message: error.message,
        name: error.name,
        stack: error.stack?.substring(0, 500),
      });
      console.warn('⚠️ Firebase config may be invalid. Check your environment variables.');
      console.warn('⚠️ Config values used:', {
        apiKey: effectiveConfig.apiKey?.substring(0, 15) + '...',
        authDomain: effectiveConfig.authDomain,
        projectId: effectiveConfig.projectId,
        storageBucket: effectiveConfig.storageBucket,
        messagingSenderId: effectiveConfig.messagingSenderId,
        appId: effectiveConfig.appId?.substring(0, 20) + '...',
      });
    }
  } else {
    // More detailed warning with missing variables
    const missing = []
    if (!publicEnv.firebase.apiKey || publicEnv.firebase.apiKey === 'dummy-key') missing.push('NEXT_PUBLIC_FIREBASE_API_KEY')
    if (!publicEnv.firebase.authDomain || publicEnv.firebase.authDomain === 'dummy-domain') missing.push('NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN')
    if (!publicEnv.firebase.projectId || publicEnv.firebase.projectId === 'dummy-project') missing.push('NEXT_PUBLIC_FIREBASE_PROJECT_ID')
    if (!publicEnv.firebase.storageBucket || publicEnv.firebase.storageBucket === 'dummy-bucket') missing.push('NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET')
    if (!publicEnv.firebase.messagingSenderId || publicEnv.firebase.messagingSenderId === 'dummy-sender') missing.push('NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID')
    if (!publicEnv.firebase.appId || publicEnv.firebase.appId === 'dummy-app') missing.push('NEXT_PUBLIC_FIREBASE_APP_ID')
    
    if (missing.length > 0) {
      console.warn('⚠️ Firebase environment variables are missing or invalid. Authentication features will not work.');
      console.warn('⚠️ Missing/invalid variables:', missing.join(', '));
      console.warn('⚠️ Please add these to Vercel: Settings → Environment Variables');
      console.warn('⚠️ Visit /dev/firebase-check to see detailed status');
    } else {
      console.warn('⚠️ Firebase config check failed but no variables are missing. This may be a configuration issue.');
      console.warn('⚠️ Env vars:', {
        apiKey: publicEnv.firebase.apiKey?.substring(0, 10),
        authDomain: publicEnv.firebase.authDomain,
        projectId: publicEnv.firebase.projectId,
      });
    }
  }
}

// Initialize immediately if on client
if (typeof window !== 'undefined') {
  // Try multiple initialization strategies
  const tryInitialize = () => {
    try {
      initializeFirebase();
    } catch (error) {
      console.error('Failed to initialize Firebase:', error);
    }
  };

  // Strategy 1: If DOM is ready, initialize immediately
  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    // Use setTimeout to ensure other modules are loaded
    setTimeout(tryInitialize, 0);
  } else {
    // Strategy 2: Wait for DOMContentLoaded
    document.addEventListener('DOMContentLoaded', tryInitialize);
    // Strategy 3: Also try after a short delay as fallback
    setTimeout(tryInitialize, 100);
  }
}

// Export getters that trigger initialization if needed
export function getFirebaseApp(): FirebaseApp | undefined {
  if (typeof window !== 'undefined' && !app) {
    initializeFirebase();
  }
  return app;
}

export function getFirebaseAuth(): Auth | undefined {
  if (typeof window !== 'undefined' && !auth) {
    initializeFirebase();
  }
  return auth;
}

export function getFirebaseDb(): Firestore | undefined {
  if (typeof window !== 'undefined' && !db) {
    initializeFirebase();
  }
  return db;
}

export function getFirebaseStorage(): FirebaseStorage | undefined {
  if (typeof window !== 'undefined' && !storage) {
    initializeFirebase();
  }
  return storage;
}

// Export direct references (for backward compatibility)
// These will be undefined until initialization happens
export { app, auth, db, storage }
