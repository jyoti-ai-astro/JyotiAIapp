/**
 * Signup Page
 * 
 * Batch 2 - Auth & Onboarding
 * 
 * Cosmic signup screen with Super Cosmic UI
 */

'use client';

import React, { useState } from 'react';
import { signInWithPopup, GoogleAuthProvider, FacebookAuthProvider, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase/config';
import { useRouter } from 'next/navigation';
import { useUserStore } from '@/store/user-store';
import { useProtectedRoute } from '@/lib/hooks/useProtectedRoute';
import AuthLayout from '@/src/ui/sections/auth/AuthLayout';

export default function SignupPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  
  // Redirect if already authenticated (client-side only)
  useProtectedRoute({
    requireAuth: false,
    redirectIfAuthenticated: true,
    redirectTo: '/dashboard',
  });

  const handleSocialSignup = async (provider: GoogleAuthProvider | FacebookAuthProvider, providerName: string) => {
    try {
      setLoading(true);
      setError(null);
      
      if (!auth) {
        throw new Error('Firebase authentication is not configured. Please add Firebase environment variables to Vercel.');
      }
      
      // Add error handling for popup blockers
      const result = await signInWithPopup(auth, provider).catch((error: any) => {
        console.error(`${providerName} popup error:`, error);
        
        // Handle specific Firebase auth errors
        if (error.code === 'auth/popup-closed-by-user') {
          throw new Error('Sign-in popup was closed. Please try again.');
        } else if (error.code === 'auth/popup-blocked') {
          throw new Error('Popup was blocked. Please allow popups for this site and try again.');
        } else if (error.code === 'auth/unauthorized-domain') {
          throw new Error(`${providerName} sign-in is not authorized for this domain. Please contact support.`);
        } else if (error.code === 'auth/operation-not-allowed') {
          throw new Error(`${providerName} sign-in is not enabled. Please contact support.`);
        } else if (error.message) {
          throw new Error(error.message);
        } else {
          throw new Error(`${providerName} sign-in failed. Please try again.`);
        }
      });
      const idToken = await result.user.getIdToken();

      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken }),
      });

      if (response.ok) {
        const data = await response.json();
        const { setUser } = useUserStore.getState();
        setUser({
          uid: data.uid,
          name: result.user.displayName,
          email: result.user.email,
          photo: result.user.photoURL,
          dob: null,
          tob: null,
          pob: null,
          rashi: null,
          nakshatra: null,
          subscription: 'free',
          subscriptionExpiry: null,
          onboarded: false,
        });

        router.push('/onboarding');
      } else {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Signup failed');
      }
    } catch (error: any) {
      console.error(`${providerName} signup error:`, error);
      const errorMessage = error.message || `${providerName} signup failed. Please try again.`;
      setError(errorMessage);
      
      // Show more detailed error in console for debugging
      if (process.env.NODE_ENV === 'development') {
        console.error('Full error details:', {
          code: error.code,
          message: error.message,
          auth: !!auth,
          provider: providerName,
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    const provider = new GoogleAuthProvider();
    await handleSocialSignup(provider, 'Google');
  };

  const handleFacebookSignup = async () => {
    const provider = new FacebookAuthProvider();
    await handleSocialSignup(provider, 'Facebook');
  };

  const handleMagicLink = async (email: string) => {
    try {
      setLoading(true);
      setError(null);
      
      // Validate email
      if (!email || !email.includes('@')) {
        throw new Error('Please enter a valid email address.');
      }
      
      // Store email in localStorage for callback
      if (typeof window !== 'undefined') {
        window.localStorage.setItem('emailForSignIn', email);
      }

      const response = await fetch('/api/auth/magic-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to send magic link' }));
        throw new Error(errorData.error || `Failed to send magic link (${response.status})`);
      }

      const data = await response.json();
      
      // Redirect to magic link confirmation page
      router.push('/magic-link');
    } catch (error: any) {
      console.error('Magic link error:', error);
      const errorMessage = error.message || 'Failed to send magic link. Please try again.';
      setError(errorMessage);
      
      // Show more detailed error in console for debugging
      if (process.env.NODE_ENV === 'development') {
        console.error('Magic link error details:', {
          message: error.message,
          email: email,
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    try {
      setLoading(true);
      if (!auth) {
        throw new Error('Firebase is not configured. Please contact support.');
      }
      const result = await createUserWithEmailAndPassword(auth, email, password);
      const idToken = await result.user.getIdToken();

      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken }),
      });

      if (response.ok) {
        const data = await response.json();
        const { setUser } = useUserStore.getState();
        setUser({
          uid: data.uid,
          name: result.user.email?.split('@')[0] || 'User',
          email: result.user.email,
          photo: null,
          dob: null,
          tob: null,
          pob: null,
          rashi: null,
          nakshatra: null,
          subscription: 'free',
          subscriptionExpiry: null,
          onboarded: false,
        });

        router.push('/onboarding');
      } else {
        throw new Error('Signup failed');
      }
    } catch (error: any) {
      console.error('Email signup error:', error);
      let errorMessage = 'Signup failed. Please try again.';
      
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'This email is already registered. Please sign in instead.';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Password is too weak. Please use at least 6 characters.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address. Please check and try again.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      mode="signup"
      onSubmit={handleSignIn}
      onGoogleSignIn={handleGoogleSignup}
      onFacebookSignIn={handleFacebookSignup}
      onMagicLink={handleMagicLink}
      onResetPassword={() => {
        router.push('/login');
      }}
      onCreateAccount={undefined}
      error={error}
      onClearError={() => setError(null)}
    />
  );
}

