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
    // Check via API to get server-side values (most accurate)
    fetch('/api/dev/firebase-env-check')
      .then(res => res.json())
      .then(data => {
        const serverEnvVars = data.envVars || {};
        const missing = Object.entries(serverEnvVars)
          .filter(([_, exists]) => !exists)
          .map(([key]) => key);

        // Check client-side auth status (this is the real check)
        const clientAuthInitialized = !!auth;
        
        // Use client-side check (auth is only initialized on client)
        const authStatus = clientAuthInitialized;

        setChecks({
          auth: authStatus,
          envVars: serverEnvVars,
          errors: missing,
        });

        // Log debug info if auth is not initialized but vars are present
        if (!authStatus && missing.length === 0 && data.configValid) {
          console.warn('⚠️ Firebase variables are present but auth is not initialized.');
          console.warn('⚠️ This means Firebase initialization failed on the client side.');
          console.warn('⚠️ Check browser console for Firebase initialization errors.');
          console.warn('⚠️ Variable values:', data.envVarValues);
          
          // Try to manually trigger Firebase initialization
          if (typeof window !== 'undefined' && !auth) {
            console.warn('⚠️ Attempting to manually initialize Firebase...');
            // Re-import to trigger initialization
            import('@/lib/firebase/config').then((module) => {
              const { auth: newAuth, getFirebaseAuth } = module;
              
              // Try using the getter function which triggers initialization
              const authFromGetter = getFirebaseAuth ? getFirebaseAuth() : newAuth;
              
              if (authFromGetter) {
                console.log('✅ Firebase initialized after manual import');
                setChecks(prev => ({ ...prev, auth: true }));
              } else {
                console.error('❌ Firebase still not initialized after manual import');
                console.error('❌ Env vars check:', {
                  apiKey: data.envVarValues?.['NEXT_PUBLIC_FIREBASE_API_KEY']?.substring(0, 10),
                  authDomain: data.envVarValues?.['NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN'],
                  projectId: data.envVarValues?.['NEXT_PUBLIC_FIREBASE_PROJECT_ID'],
                });
                console.error('❌ Check for errors above in the console');
                
                // Try one more time with a direct initialization attempt
                setTimeout(() => {
                  const { getFirebaseAuth: retryGetAuth } = require('@/lib/firebase/config');
                  const retryAuth = retryGetAuth();
                  if (retryAuth) {
                    console.log('✅ Firebase initialized on retry');
                    setChecks(prev => ({ ...prev, auth: true }));
                  }
                }, 500);
              }
            }).catch((err) => {
              console.error('❌ Failed to import Firebase config:', err);
            });
          }
        }
      })
      .catch((error) => {
        console.error('Failed to fetch Firebase check:', error);
        // Fallback: check client-side (less accurate but better than nothing)
        const envVars = {
          'NEXT_PUBLIC_FIREBASE_API_KEY': !!(process.env.NEXT_PUBLIC_FIREBASE_API_KEY),
          'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN': !!(process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN),
          'NEXT_PUBLIC_FIREBASE_PROJECT_ID': !!(process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID),
          'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET': !!(process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET),
          'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID': !!(process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID),
          'NEXT_PUBLIC_FIREBASE_APP_ID': !!(process.env.NEXT_PUBLIC_FIREBASE_APP_ID),
        };

        const missing = Object.entries(envVars)
          .filter(([_, exists]) => !exists)
          .map(([key]) => key);

        setChecks({
          auth: !!auth,
          envVars,
          errors: missing,
        });
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
            {Object.keys(checks.envVars).length === 0 ? (
              <div className="text-yellow-400 text-sm">Loading...</div>
            ) : (
              <div className="space-y-2">
                {Object.entries(checks.envVars).map(([key, exists]) => (
                  <div key={key} className="flex items-center gap-3 p-2 rounded bg-zinc-800/50">
                    {exists ? (
                      <>
                        <div className="w-4 h-4 bg-green-500 rounded-full flex-shrink-0"></div>
                        <span className="text-green-400 text-sm font-mono">{key}</span>
                        <span className="text-green-500 text-xs ml-auto">✓ Set</span>
                      </>
                    ) : (
                      <>
                        <div className="w-4 h-4 bg-red-500 rounded-full flex-shrink-0 animate-pulse"></div>
                        <span className="text-red-400 text-sm font-mono">{key}</span>
                        <span className="text-red-500 text-xs ml-auto font-semibold">✗ MISSING</span>
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}
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

          {!checks.auth && checks.errors.length === 0 && (
            <div className="bg-yellow-900/20 border border-yellow-500 rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4 text-yellow-400">⚠️ Variables Present But Auth Not Initialized</h2>
              <p className="text-yellow-300 mb-4">
                All Firebase environment variables are present, but Firebase Auth is not initializing.
              </p>
              <div className="space-y-2 text-sm text-yellow-200">
                <p><strong>Possible causes:</strong></p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Firebase initialization error (check browser console)</li>
                  <li>Invalid Firebase configuration values</li>
                  <li>Client-side code not executing properly</li>
                  <li>Browser blocking Firebase initialization</li>
                </ul>
                <div className="mt-4 p-3 bg-zinc-800 rounded">
                  <p className="text-xs text-zinc-300 mb-2"><strong>Debug steps:</strong></p>
                  <ol className="list-decimal list-inside space-y-1 text-xs text-zinc-400">
                    <li>Open browser console (F12)</li>
                    <li>Look for Firebase initialization errors</li>
                    <li>Check if variables are being read correctly</li>
                    <li>Try hard refresh (Ctrl+Shift+R or Cmd+Shift+R)</li>
                    <li>Clear browser cache and try again</li>
                  </ol>
                </div>
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

