import { NextResponse } from 'next/server';
import { auth } from '@/lib/firebase/config';
import { envVars } from '@/lib/env/env.mjs';

export const dynamic = 'force-dynamic';

export async function GET() {
  const envVarsCheck = {
    'NEXT_PUBLIC_FIREBASE_API_KEY': !!envVars.firebase.apiKey,
    'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN': !!envVars.firebase.authDomain,
    'NEXT_PUBLIC_FIREBASE_PROJECT_ID': !!envVars.firebase.projectId,
    'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET': !!envVars.firebase.storageBucket,
    'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID': !!envVars.firebase.messagingSenderId,
    'NEXT_PUBLIC_FIREBASE_APP_ID': !!envVars.firebase.appId,
  };

  return NextResponse.json({
    authInitialized: !!auth,
    envVars: envVarsCheck,
    missing: Object.entries(envVarsCheck)
      .filter(([_, exists]) => !exists)
      .map(([key]) => key),
  });
}

