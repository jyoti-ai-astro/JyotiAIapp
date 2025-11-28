import * as admin from "firebase-admin";

// ⚠️ SERVER-SIDE ONLY ⚠️
// This file must NEVER be imported in:
// - Client components
// - React components
// - Hooks
// - UI elements
// - Cosmos / postfx / shaders
// Allowed imports only in:
// - API routes (app/api/**)
// - Server utilities (lib/services, lib/workers)
// - Logging / security modules

let app: admin.app.App | undefined;

export function getFirebaseAdmin() {
  if (app) return app;

  const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID;
  const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, "\n");
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;

  if (!projectId || !privateKey || !clientEmail) {
    console.warn("Firebase Admin credentials missing — admin features disabled.");
    return undefined;
  }

  try {
    app = admin.initializeApp({
      credential: admin.credential.cert({
        projectId,
        privateKey,
        clientEmail,
      }),
    });
  } catch (e) {
    console.warn("Failed to initialize Firebase Admin", e);
    return undefined;
  }

  return app;
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

// Lazy exports for backward compatibility
export const adminAuth = getAdminAuth();
export const adminDb = getAdminDb();
export const adminStorage = getAdminStorage();
export { getFirebaseAdmin as getApp };
