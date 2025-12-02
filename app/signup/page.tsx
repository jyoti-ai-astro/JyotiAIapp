/**
 * Signup Page
 * 
 * Batch 2 - Auth & Onboarding
 * 
 * Cosmic signup screen with Super Cosmic UI
 */

'use client';

import React, { useState } from 'react';
import { signInWithPopup, GoogleAuthProvider, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase/config';
import { useRouter } from 'next/navigation';
import { useUserStore } from '@/store/user-store';
import { useProtectedRoute } from '@/lib/hooks/useProtectedRoute';
import AuthLayout from '@/src/ui/sections/auth/AuthLayout';

export default function SignupPage() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  
  // Redirect if already authenticated (client-side only)
  useProtectedRoute({
    requireAuth: false,
    redirectIfAuthenticated: true,
    redirectTo: '/dashboard',
  });

  const handleGoogleSignup = async () => {
    try {
      setLoading(true);
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
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
        throw new Error('Signup failed');
      }
    } catch (error) {
      console.error('Google signup error:', error);
      alert('Signup failed. Please try again.');
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
      alert(error.message || 'Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      mode="signup"
      onSubmit={handleSignIn}
      onGoogleSignIn={handleGoogleSignup}
      onResetPassword={() => {
        router.push('/login');
      }}
      onCreateAccount={undefined}
    />
  );
}

