/**
 * Signup Page
 * 
 * Batch 2 - Auth & Onboarding
 * 
 * Cosmic signup screen with R3F nebula background
 */

'use client';

export const dynamic = 'force-dynamic';

import { useState } from 'react';
import { signInWithPopup, GoogleAuthProvider, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase/config';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useRouter } from 'next/navigation';
import { useUserStore } from '@/store/user-store';
import { PageTransitionWrapper } from '@/components/global/PageTransitionWrapper';
import { SignupCard } from '@/components/auth/SignupCard';
import { useProtectedRoute } from '@/lib/hooks/useProtectedRoute';
import Link from 'next/link';

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  
  // Redirect if already authenticated (client-side only)
  const { isAuthenticated, isOnboarded } = useProtectedRoute({
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

  const handleEmailSignup = async (e: React.FormEvent) => {
    e.preventDefault();
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
          name: name || result.user.email?.split('@')[0] || 'User',
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

  const createRipple = (e: React.MouseEvent<HTMLButtonElement>) => {
    const button = e.currentTarget;
    const ripple = document.createElement('span');
    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;
    
    ripple.style.width = ripple.style.height = `${size}px`;
    ripple.style.left = `${x}px`;
    ripple.style.top = `${y}px`;
    ripple.className = 'absolute rounded-full bg-gold/30 animate-ping pointer-events-none';
    button.appendChild(ripple);
    
    setTimeout(() => ripple.remove(), 600);
  };

  return (
    <PageTransitionWrapper>
      <div className="cosmic-page flex min-h-screen items-center justify-center px-4">
        <div className="w-full max-w-md">
          <SignupCard />
          <p className="mt-4 text-center text-xs text-slate-400">
            By continuing, you agree to our{' '}
            <Link href="/terms" className="text-gold hover:underline">Terms</Link>
            {' '}and{' '}
            <Link href="/privacy" className="text-gold hover:underline">Privacy Policy</Link>.
          </p>
        </div>
      </div>
    </PageTransitionWrapper>
  );
}

