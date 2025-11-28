/**
 * Page Transition Wrapper Component
 * 
 * Batch 1 - Core Landing & Marketing
 * 
 * Cosmic mist fade in, particle dissolve fade out, mandala rotation fade
 */

'use client';

import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { usePathname } from 'next/navigation';

interface PageTransitionWrapperProps {
  children: React.ReactNode;
}

export function PageTransitionWrapper({ children }: PageTransitionWrapperProps) {
  const pathname = usePathname();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname}
        initial={{ opacity: 0, filter: 'blur(10px)' }}
        animate={{ opacity: 1, filter: 'blur(0px)' }}
        exit={{ opacity: 0, filter: 'blur(10px)' }}
        transition={{
          duration: 0.5,
          ease: [0.4, 0, 0.2, 1],
        }}
        className="relative"
      >
        {/* Cosmic mist overlay on enter */}
        <motion.div
          className="fixed inset-0 pointer-events-none z-[10000]"
          initial={{ opacity: 1 }}
          animate={{ opacity: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          style={{
            background: 'radial-gradient(circle at center, rgba(110, 45, 235, 0.3) 0%, transparent 70%)',
          }}
        />

        {/* Mandala rotation fade */}
        <motion.div
          className="fixed inset-0 pointer-events-none z-[9999] flex items-center justify-center"
          initial={{ opacity: 0.5, rotate: 0, scale: 0.8 }}
          animate={{ opacity: 0, rotate: 180, scale: 1.2 }}
          transition={{ duration: 1, delay: 0.1 }}
        >
          <div className="w-96 h-96 rounded-full border-2 border-gold/20" />
        </motion.div>

        {children}
      </motion.div>
    </AnimatePresence>
  );
}

