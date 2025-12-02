/**
 * Splash Screen
 * 
 * Batch 2 - Auth & Onboarding
 * 
 * Initial splash screen before login
 */

'use client';

export const dynamic = 'force-dynamic';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import Link from 'next/link';
import MarketingPageShell from '@/src/ui/layout/MarketingPageShell';

export default function SplashPage() {
  const router = useRouter();
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    // Auto-redirect after 3 seconds
    const timer = setTimeout(() => {
      setFadeOut(true);
      setTimeout(() => {
        router.push('/login');
      }, 500);
    }, 3000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <MarketingPageShell
      eyebrow="Welcome"
      title={
        <>
          <span className="bg-gradient-to-r from-[#FFD57A] to-[#FFB347] bg-clip-text text-transparent">
            JyotiAI
          </span>
        </>
      }
      description="Your Spiritual Operating System"
    >
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: fadeOut ? 0 : 1, scale: fadeOut ? 0.9 : 1 }}
          transition={{ duration: 0.5 }}
          className="text-center space-y-8"
        >
          <motion.div
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
          >
            <Sparkles className="h-24 w-24 text-[#FFD57A] mx-auto" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 0.8 }}
            className="pt-8"
          >
            <Link href="/login">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 bg-gradient-to-r from-[#FFD57A] to-[#FFB347] text-[#05050A] rounded-lg font-heading text-lg font-semibold hover:opacity-90 transition-opacity relative overflow-hidden"
                onClick={(e) => {
                  const button = e.currentTarget;
                  const ripple = document.createElement('span');
                  const rect = button.getBoundingClientRect();
                  const size = Math.max(rect.width, rect.height);
                  const x = e.clientX - rect.left - size / 2;
                  const y = e.clientY - rect.top - size / 2;
                  
                  ripple.style.width = ripple.style.height = `${size}px`;
                  ripple.style.left = `${x}px`;
                  ripple.style.top = `${y}px`;
                  ripple.className = 'absolute rounded-full bg-white/30 animate-ping pointer-events-none';
                  button.appendChild(ripple);
                  
                  setTimeout(() => ripple.remove(), 600);
                }}
              >
                Enter the Cosmos
              </motion.button>
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </MarketingPageShell>
  );
}

