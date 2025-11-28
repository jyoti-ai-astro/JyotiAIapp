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
import { PageTransitionWrapper } from '@/components/global/PageTransitionWrapper';
import { CosmicCursor } from '@/components/global/CosmicCursor';
import { SoundscapeController } from '@/components/global/SoundscapeController';
import { Canvas } from '@react-three/fiber';
import { Suspense } from 'react';
import { NebulaShader } from '@/components/cosmic/NebulaShader';
import { ParticleField } from '@/components/cosmic/ParticleField';
import { RotatingMandala } from '@/components/cosmic/RotatingMandala';
import { Mail, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function MagicLinkPage() {
  const router = useRouter();
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    const storedEmail = window.localStorage.getItem('emailForSignIn');
    setEmail(storedEmail);
  }, []);

  return (
    <PageTransitionWrapper>
      {/* R3F Background */}
      <div className="fixed inset-0 z-0">
        <Canvas camera={{ position: [0, 0, 1], fov: 75 }}>
          <Suspense fallback={null}>
            <NebulaShader intensity={1.0} />
            <ParticleField count={3000} intensity={1.0} />
            <RotatingMandala speed={0.1} intensity={0.5} />
          </Suspense>
        </Canvas>
      </div>

      <CosmicCursor />
      <SoundscapeController />

      {/* Content */}
      <div className="relative z-10 flex min-h-screen items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          {/* Glassmorphism Card */}
          <div className="bg-cosmic-indigo/80 backdrop-blur-sm border border-cosmic-purple/30 rounded-2xl p-8 shadow-[0_0_30px_rgba(110,45,235,0.3)] text-center">
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
    </PageTransitionWrapper>
  );
}

