/**
 * Magic Link Page
 * 
 * Batch 2 - Auth & Onboarding
 * 
 * Confirmation page after sending magic link
 */

'use client';

export const dynamic = 'force-dynamic';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Mail, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import MarketingPageShell from '@/src/ui/layout/MarketingPageShell';

export default function MagicLinkPage() {
  const router = useRouter();
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    const storedEmail = window.localStorage.getItem('emailForSignIn');
    setEmail(storedEmail);
  }, []);

  return (
    <MarketingPageShell
      eyebrow="Magic Link"
      title="Check Your Email"
      description="We've sent a magic link to sign in. Click the link in the email to continue."
    >
      <div className="flex items-center justify-center min-h-[60vh]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-[#0A0F1F]/80 to-[#1A2347]/60 backdrop-blur-sm p-8 shadow-[0_8px_32px_rgba(255,213,122,0.15)] text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring' }}
              className="mb-6"
            >
              <div className="mx-auto w-20 h-20 rounded-full bg-aura-green/20 flex items-center justify-center">
                <CheckCircle className="h-12 w-12 text-aura-green" />
              </div>
            </motion.div>

            <h1 className="text-3xl font-display font-bold text-white mb-4">
              Check Your Email
            </h1>

            <div className="space-y-4 mb-6">
              <div className="flex items-center justify-center gap-2 text-white/80">
                <Mail className="h-5 w-5" />
                <p>
                  We&apos;ve sent a magic link to{' '}
                  <span className="text-gold font-semibold">{email || 'your email'}</span>
                </p>
              </div>

              <p className="text-white/60 text-sm">
                Click the link in the email to sign in. The link will expire in 1 hour.
              </p>
            </div>

            <div className="space-y-3">
              <Button
                onClick={() => router.push('/login')}
                className="w-full bg-cosmic-purple/50 text-white hover:bg-cosmic-purple/70"
              >
                Back to Login
              </Button>
              <Link href="/" className="block text-center text-gold hover:underline text-sm">
                Go to Homepage
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </MarketingPageShell>
  );
}

