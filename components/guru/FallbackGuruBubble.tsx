/**
 * Fallback Guru Bubble Component (Phase 29 - F44)
 * 
 * Displays fallback Guru message when primary response fails
 */

'use client';

import React from 'react';
import { motion } from 'framer-motion';

export interface FallbackGuruBubbleProps {
  message?: string;
}

const DEFAULT_FALLBACK_MESSAGE = "Beloved one, cosmic signals were interrupted. Shall we try again? The divine energies are realigning, and I'm here to guide you.";

export function FallbackGuruBubble({ message = DEFAULT_FALLBACK_MESSAGE }: FallbackGuruBubbleProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
      className="flex items-start gap-4"
    >
      {/* Guru Avatar */}
      <motion.div
        className="w-10 h-10 rounded-full bg-gold/20 flex items-center justify-center flex-shrink-0"
        animate={{
          boxShadow: [
            '0 0 10px rgba(242, 201, 76, 0.3)',
            '0 0 20px rgba(242, 201, 76, 0.5)',
            '0 0 10px rgba(242, 201, 76, 0.3)',
          ],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      >
        <span className="text-gold text-xl">✨</span>
      </motion.div>

      {/* Message Bubble */}
      <motion.div
        className="flex-1 rounded-xl p-4 md:p-5 bg-white/5 border border-white/10 relative"
        style={{
          boxShadow: '0 8px 32px rgba(255, 255, 255, 0.08), 0 2px 8px rgba(255, 255, 255, 0.04)',
        }}
      >
        <p className="text-white/80 text-sm md:text-base leading-relaxed">
          {message}
        </p>

        {/* Fallback Indicator */}
        <div className="mt-3 pt-3 border-t border-white/10">
          <span className="text-xs text-white/40 italic">
            * Fallback response - cosmic connection restored
          </span>
        </div>
      </motion.div>
    </motion.div>
  );
}

