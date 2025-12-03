/**
 * Login Page
 * 
 * Batch 2 - Auth & Onboarding
 * 
 * Cosmic login screen with Super Cosmic UI
 */

'use client';

import React, { useState } from 'react';
import { signInWithPopup, GoogleAuthProvider, FacebookAuthProvider, signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase/config';
import { useRouter } from 'next/navigation';
import { useUserStore } from '@/store/user-store';
import { useProtectedRoute } from '@/lib/hooks/useProtectedRoute';
import AuthLayout from '@/src/ui/sections/auth/AuthLayout';

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  
  // Redirect if already authenticated (client-side only)
  useProtectedRoute({
    requireAuth: false,
    redirectIfAuthenticated: true,
    redirectTo: '/dashboard',
  });

  const handleSocialLogin = async (provider: GoogleAuthProvider | FacebookAuthProvider, providerName: string) => {
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
          onboarded: data.onboarded || false,
        });

        // Redirect admin users to admin dashboard
        if (data.isAdmin) {
          router.push('/admin/dashboard');
        } else if (data.onboarded) {
          router.push('/dashboard');
        } else {
          router.push('/onboarding');
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Login failed');
      }
    } catch (error: any) {
      console.error(`${providerName} login error:`, error);
      const errorMessage = error.message || `${providerName} login failed. Please try again.`;
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

  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
    await handleSocialLogin(provider, 'Google');
  };

  const handleFacebookLogin = async () => {
    const provider = new FacebookAuthProvider();
    await handleSocialLogin(provider, 'Facebook');
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
      // First authenticate with Firebase
      const result = await signInWithEmailAndPassword(auth, email, password);
      const idToken = await result.user.getIdToken();

      // Then send idToken to backend to create session cookie
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
          onboarded: data.onboarded || false,
        });

        // Redirect admin users to admin dashboard
        if (data.isAdmin) {
          router.push('/admin/dashboard');
        } else if (data.onboarded) {
          router.push('/dashboard');
        } else {
          router.push('/onboarding');
        }
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Login failed');
      }
    } catch (error: any) {
      console.error('Sign in error:', error);
      let errorMessage = 'Login failed. Please check your email and password.';
      
      if (error.code === 'auth/user-not-found') {
        errorMessage = 'No account found with this email. Please sign up first.';
      } else if (error.code === 'auth/wrong-password') {
        errorMessage = 'Incorrect password. Please try again.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address. Please check and try again.';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Too many failed attempts. Please try again later.';
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
      mode="login"
      onSubmit={handleSignIn}
      onGoogleSignIn={handleGoogleLogin}
      onFacebookSignIn={handleFacebookLogin}
      onMagicLink={handleMagicLink}
      onResetPassword={() => {
        router.push('/reset-password');
      }}
      onCreateAccount={() => {
        router.push('/signup');
      }}
      error={error}
      onClearError={() => setError(null)}
    />
  );
}
