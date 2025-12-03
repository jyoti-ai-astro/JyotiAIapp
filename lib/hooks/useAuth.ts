/**
 * Auth Hook
 * 
 * Centralized authentication state and flow management
 */

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUserStore } from '@/store/user-store';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { auth } from '@/lib/firebase/config';

interface UseAuthOptions {
  redirectTo?: string;
  requireAuth?: boolean;
}

export function useAuth(options: UseAuthOptions = {}) {
  const { redirectTo, requireAuth = false } = options;
  const router = useRouter();
  const { user, setUser, clearUser } = useUserStore();
  const [loading, setLoading] = useState(true);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);

  useEffect(() => {
    // Only run on client
    if (typeof window === 'undefined') {
      setLoading(false);
      return;
    }
    
    // Check if auth is available before subscribing
    if (!auth) {
      console.warn('⚠️ Firebase auth is not initialized. Authentication features will not work.');
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setFirebaseUser(firebaseUser);
      
      if (firebaseUser) {
        try {
          const idToken = await firebaseUser.getIdToken();
          const response = await fetch('/api/auth/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ idToken }),
            credentials: 'include',
          });

          if (response.ok) {
            const data = await response.json();
            setUser({
              uid: data.uid || firebaseUser.uid,
              name: data.name || firebaseUser.displayName,
              email: data.email || firebaseUser.email,
              photo: data.photo || firebaseUser.photoURL,
              dob: data.dob || null,
              tob: data.tob || null,
              pob: data.pob || null,
              rashi: data.rashi || null,
              nakshatra: data.nakshatra || null,
              subscription: data.subscription || 'free',
              subscriptionExpiry: data.subscriptionExpiry || null,
              onboarded: data.onboarded || false,
            });
          } else {
            clearUser();
          }
        } catch (error) {
          console.error('Auth verification error:', error);
          clearUser();
        }
      } else {
        clearUser();
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, [router, setUser, clearUser]);

  useEffect(() => {
    if (!loading && requireAuth && !firebaseUser) {
      router.push(redirectTo || '/login');
    }
  }, [loading, requireAuth, firebaseUser, redirectTo, router]);

  return {
    user,
    firebaseUser,
    loading,
    isAuthenticated: !!firebaseUser && !!user,
    isOnboarded: user?.onboarded ?? false,
  };
}

