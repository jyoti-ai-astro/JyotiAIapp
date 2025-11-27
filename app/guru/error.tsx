/**
 * Guru Page Error Boundary (Phase 29 - F44)
 * 
 * Catches errors specific to the Guru Chat page
 */

'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function GuruError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-cosmic via-mystic to-cosmic flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="max-w-md w-full bg-cosmic/90 backdrop-blur-sm border border-gold/30 rounded-2xl p-8 text-center"
      >
        {/* Cosmic Mandala Spinner */}
        <motion.div
          className="w-20 h-20 mx-auto mb-6 border-4 border-gold/50 border-t-gold rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
        />

        <h1 className="text-2xl font-display font-bold text-gold mb-4">
          The Guru's cosmic connection was interrupted
        </h1>

        <p className="text-white/70 mb-6">
          The divine energies are realigning. The Guru will reconnect shortly.
        </p>

        <div className="flex gap-4 justify-center">
          <motion.button
            onClick={reset}
            className="px-6 py-3 bg-gold/10 hover:bg-gold/20 text-gold border border-gold/30 rounded-lg font-heading transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Reconnect
          </motion.button>

          <Link href="/">
            <motion.button
              className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white border border-white/30 rounded-lg font-heading transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Return Home
            </motion.button>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}

