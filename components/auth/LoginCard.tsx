/**
 * Login Card Component
 * 
 * Batch 2 - Auth Components
 * 
 * Glassmorphism login card with gold ripple effects
 */

'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth } from '@/lib/firebase/config';
import { useRouter } from 'next/navigation';
import { useUserStore } from '@/store/user-store';
import { useAuthFlow } from '@/lib/utils/auth-flow';
import { Mail, Sparkles } from 'lucide-react';
import Link from 'next/link';

interface LoginCardProps {
  onSuccess?: () => void;
}

export const LoginCard: React.FC<LoginCardProps> = ({ onSuccess }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { handleLoginSuccess } = useAuthFlow();

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

        handleLoginSuccess(data.onboarded || false);
        onSuccess?.();
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

  const handleEmailLink = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      window.localStorage.setItem('emailForSignIn', email);
      
      const response = await fetch('/api/auth/magic-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        throw new Error('Failed to send magic link');
      }

      router.push('/magic-link');
    } catch (error: any) {
      console.error('Email link error:', error);
      alert(error.message || 'Failed to send email link. Please try again.');
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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-md"
    >
      <div className="bg-cosmic-indigo/80 backdrop-blur-sm border border-cosmic-purple/30 rounded-2xl p-8 shadow-[0_0_30px_rgba(110,45,235,0.3)]">
        <div className="text-center mb-8">
          <motion.div
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
            className="inline-block mb-4"
          >
            <Sparkles className="h-12 w-12 text-gold" />
          </motion.div>
          <h1 className="text-4xl font-display font-bold text-white mb-2">Jyoti.ai</h1>
          <p className="text-white/80">Sign in to your spiritual journey</p>
        </div>

        <div className="space-y-4">
          <Button
            onClick={(e) => {
              createRipple(e);
              handleGoogleLogin();
            }}
            disabled={loading}
            className="w-full bg-white text-cosmic-navy hover:bg-white/90 relative overflow-hidden"
            size="lg"
          >
            Continue with Google
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-white/20" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-cosmic-indigo/80 px-2 text-white/60">Or continue with email</span>
            </div>
          </div>

          <form onSubmit={handleEmailLink} className="space-y-4">
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-white/60" />
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                className="w-full pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/60 focus:ring-2 focus:ring-gold"
              />
            </div>
            <Button
              type="submit"
              onClick={createRipple}
              disabled={loading}
              className="w-full bg-cosmic-purple/50 text-white hover:bg-cosmic-purple/70 relative overflow-hidden"
              size="lg"
            >
              Send Magic Link
            </Button>
          </form>

          <div className="text-center text-sm text-white/60 mt-6">
            <p>
              By continuing, you agree to our{' '}
              <Link href="/legal/terms" className="text-gold hover:underline">
                Terms
              </Link>{' '}
              and{' '}
              <Link href="/legal/privacy" className="text-gold hover:underline">
                Privacy Policy
              </Link>
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

