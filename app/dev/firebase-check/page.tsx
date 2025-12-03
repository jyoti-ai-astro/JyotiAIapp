/**
 * Firebase Configuration Checker
 * 
 * Dev tool to check if Firebase is properly configured
 */

'use client';

import { useEffect, useState } from 'react';
import { auth } from '@/lib/firebase/config';

export default function FirebaseCheckPage() {
  const [checks, setChecks] = useState<{
    auth: boolean;
    envVars: Record<string, boolean>;
    errors: string[];
  }>({
    auth: false,
    envVars: {},
    errors: [],
  });

  useEffect(() => {
    const envVars = {
      'NEXT_PUBLIC_FIREBASE_API_KEY': !!process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
      'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN': !!process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      'NEXT_PUBLIC_FIREBASE_PROJECT_ID': !!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET': !!process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID': !!process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      'NEXT_PUBLIC_FIREBASE_APP_ID': !!process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    };

    const missing = Object.entries(envVars)
      .filter(([_, exists]) => !exists)
      .map(([key]) => key);

    setChecks({
      auth: !!auth,
      envVars,
      errors: missing,
    });
  }, []);

  return (
    <div className="min-h-screen bg-black p-8 text-white">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Firebase Configuration Check</h1>

        <div className="space-y-6">
          <div className="bg-zinc-900 rounded-lg p-6 border border-zinc-800">
            <h2 className="text-xl font-semibold mb-4">Firebase Auth Status</h2>
            <div className="flex items-center gap-3">
              {checks.auth ? (
                <>
                  <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                  <span className="text-green-400">✓ Firebase Auth is initialized</span>
                </>
              ) : (
                <>
                  <div className="w-4 h-4 bg-red-500 rounded-full"></div>
                  <span className="text-red-400">✗ Firebase Auth is NOT initialized</span>
                </>
              )}
            </div>
          </div>

          <div className="bg-zinc-900 rounded-lg p-6 border border-zinc-800">
            <h2 className="text-xl font-semibold mb-4">Environment Variables</h2>
            <div className="space-y-2">
              {Object.entries(checks.envVars).map(([key, exists]) => (
                <div key={key} className="flex items-center gap-3">
                  {exists ? (
                    <>
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span className="text-green-400 text-sm">{key}</span>
                    </>
                  ) : (
                    <>
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      <span className="text-red-400 text-sm">{key} - MISSING</span>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>

          {checks.errors.length > 0 && (
            <div className="bg-red-900/20 border border-red-500 rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4 text-red-400">Missing Variables</h2>
              <p className="text-red-300 mb-4">
                The following Firebase environment variables are missing. Add them to Vercel:
              </p>
              <ul className="list-disc list-inside space-y-2 text-red-200">
                {checks.errors.map((key) => (
                  <li key={key} className="font-mono text-sm">{key}</li>
                ))}
              </ul>
              <div className="mt-6 p-4 bg-zinc-800 rounded">
                <p className="text-sm text-zinc-300 mb-2">Steps to fix:</p>
                <ol className="list-decimal list-inside space-y-1 text-sm text-zinc-400">
                  <li>Go to Vercel Dashboard → Your Project → Settings → Environment Variables</li>
                  <li>Add each missing variable from your .env.local file</li>
                  <li>Select "Production", "Preview", and "Development"</li>
                  <li>Redeploy your application</li>
                </ol>
              </div>
            </div>
          )}

          {checks.auth && checks.errors.length === 0 && (
            <div className="bg-green-900/20 border border-green-500 rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4 text-green-400">✓ All Good!</h2>
              <p className="text-green-300">
                Firebase is properly configured. Authentication should work.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

