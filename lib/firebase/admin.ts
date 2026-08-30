// lib/firebase/admin.ts
import * as admin from "firebase-admin";

/**
 * SERVER-SIDE ONLY
 * -----------------
 * This module is for Firebase Admin SDK.
 * Use ONLY in:
 *   - app/api/** route handlers
 *   - server utilities (lib/**.server.ts, jobs, etc.)
 *
 * Do NOT import in:
 *   - React components
 *   - client components
 *   - hooks
 *   - UI code
 */

// Use a global variable so dev hot reload doesn't create duplicate apps
declare global {
  // eslint-disable-next-line no-var
  var _jyotaiAdminApp: admin.app.App | undefined;
}

// Small helper to read env vars safely
function getAdminEnv() {
  const rawProjectId = process.env.FIREBASE_ADMIN_PROJECT_ID;
  const rawClientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
  const rawPrivateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY;
  const rawStorageBucket = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;

  return {
    rawProjectId,
    rawClientEmail,
    rawPrivateKey,
    rawStorageBucket,
  };
}

export function getFirebaseAdmin(): admin.app.App | undefined {
  // Reuse existing instance if already created (survives HMR via `global`)
  if (global._jyotaiAdminApp) {
    return global._jyotaiAdminApp;
  }

  const {
    rawProjectId,
    rawClientEmail,
    rawPrivateKey,
    rawStorageBucket,
  } = getAdminEnv();

  // Debug: presence only, never log full secrets
  console.log("[firebase-admin] Env presence:", {
    hasProjectId: !!rawProjectId,
    hasClientEmail: !!rawClientEmail,
    hasPrivateKey: !!rawPrivateKey,
    hasStorageBucket: !!rawStorageBucket,
  });

  if (!rawProjectId || !rawClientEmail || !rawPrivateKey) {
    console.warn("Firebase Admin credentials missing — admin features disabled.", {
      hasProjectId: !!rawProjectId,
      hasClientEmail: !!rawClientEmail,
      hasPrivateKey: !!rawPrivateKey,
    });
    return undefined;
  }

  const projectId = rawProjectId;
  const clientEmail = rawClientEmail;
  // Stored with \n in .env, convert back to real newlines
  const privateKey = rawPrivateKey.replace(/\\n/g, "\n");

  try {
    if (!admin.apps.length) {
      // First-time init
      global._jyotaiAdminApp = admin.initializeApp({
        credential: admin.credential.cert({
          projectId,
          clientEmail,
          privateKey,
        }),
        ...(rawStorageBucket
          ? { storageBucket: rawStorageBucket }
          : {}),
      });
      console.log("[firebase-admin] Admin app initialized for project:", projectId);
    } else {
      // Reuse existing app (handles dev hot reload / duplicate-app cases)
      global._jyotaiAdminApp = admin.app();
      console.log("[firebase-admin] Reusing existing Admin app for project:", projectId);
    }
  } catch (e: any) {
    if (e?.code === "app/duplicate-app") {
      // In dev, if we somehow race into initialize twice, just reuse
      console.warn("[firebase-admin] Duplicate app detected, reusing existing instance.");
      global._jyotaiAdminApp = admin.app();
    } else {
      console.error("[firebase-admin] Failed to initialize Firebase Admin", e);
      return undefined;
    }
  }

  return global._jyotaiAdminApp;
}

export function getAdminAuth() {
  return getFirebaseAdmin()?.auth();
}

export function getAdminDb() {
  return getFirebaseAdmin()?.firestore();
}

export function getAdminStorage() {
  return getFirebaseAdmin()?.storage();
}

// Lazy singletons for convenience
export const adminAuth = getAdminAuth();
export const adminDb = getAdminDb();
export const adminStorage = getAdminStorage();

// Backwards-compatible alias
export { getFirebaseAdmin as getApp };
