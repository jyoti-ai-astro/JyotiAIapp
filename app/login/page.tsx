/**
 * Login Page
 * 
 * Batch 2 - Auth & Onboarding
 * 
 * Cosmic login screen with SignInPage component and shader background
 */

'use client';

import React, { useState } from 'react';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth } from '@/lib/firebase/config';
import { useRouter } from 'next/navigation';
import { useUserStore } from '@/store/user-store';
import { SignInPage } from '@/components/auth/SignInPage';
import { LoginShaderBackground } from '@/components/ui/login-shader-background';
import { useProtectedRoute } from '@/lib/hooks/useProtectedRoute';

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  
  // Redirect if already authenticated (client-side only)
  useProtectedRoute({
    requireAuth: false,
    redirectIfAuthenticated: true,
    redirectTo: '/dashboard',
  });

  const handleGoogleLogin = async () => {
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
        throw new Error('Login failed');
      }
    } catch (error) {
      console.error('Google login error:', error);
      alert('Login failed. Please try again.');
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
      // TODO: Implement email/password login via API
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const data = await response.json();
        const { setUser } = useUserStore.getState();
        setUser(data.user);
        router.push(data.onboarded ? '/dashboard' : '/onboarding');
      } else {
        throw new Error('Login failed');
      }
    } catch (error) {
      console.error('Sign in error:', error);
      alert('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <LoginShaderBackground />
      <div className="relative z-10">
        <SignInPage
          title={
            <span className="font-light tracking-tight text-zinc-100">
              Welcome back to <span className="font-semibold">JyotiAI</span>
            </span>
          }
          description="Sign in to access your saved charts, predictions, and spiritual dashboard."
          heroImageSrc="/images/jyotai-login-hero.jpg"
          onSignIn={handleSignIn}
          onGoogleSignIn={handleGoogleLogin}
          onResetPassword={() => {
            router.push('/reset-password');
          }}
          onCreateAccount={() => {
            router.push('/signup');
          }}
        />
      </div>
    </>
  );
}
