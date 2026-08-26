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
          <div className="rounded-lg border border-[#D8B56A]/24 bg-[#07131F]/86 p-8 text-center shadow-[0_24px_70px_rgba(7,19,31,0.28)] backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring' }}
              className="mb-6"
            >
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#3D9B72]/16">
                <CheckCircle className="h-12 w-12 text-[#3D9B72]" />
              </div>
            </motion.div>

            <h1 className="mb-4 font-heading text-3xl font-semibold text-[#FFF7E8]">
              Check Your Email
            </h1>

            <div className="space-y-4 mb-6">
              <div className="flex items-center justify-center gap-2 text-[#B9C2BF]">
                <Mail className="h-5 w-5" />
                <p>
                  We&apos;ve sent a magic link to{' '}
                  <span className="font-semibold text-[#F1C979]">{email || 'your email'}</span>
                </p>
              </div>

              <p className="text-sm text-[#B9C2BF]">
                Click the link in the email to sign in. The link will expire in 1 hour.
              </p>
            </div>

            <div className="space-y-3">
              <Button
                onClick={() => router.push('/login')}
                className="w-full bg-[#F28C28] text-[#07131F] hover:bg-[#F28C28]/90"
              >
                Back to Login
              </Button>
              <Link href="/" className="block text-center text-sm text-[#F1C979] hover:underline">
                Go to Homepage
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </MarketingPageShell>
  );
}
