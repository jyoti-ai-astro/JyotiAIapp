/**
 * Retry Message Button Component (Phase 29 - F44)
 * 
 * Button to retry failed messages
 */

'use client';

import React from 'react';
import { motion } from 'framer-motion';

export interface RetryMessageButtonProps {
  onRetry: () => void;
  disabled?: boolean;
  label?: string;
}

export function RetryMessageButton({
  onRetry,
  disabled = false,
  label = 'Retry Message',
}: RetryMessageButtonProps) {
  return (
    <motion.button
      onClick={onRetry}
      disabled={disabled}
      className="px-4 py-2 bg-gold/10 hover:bg-gold/20 text-gold border border-gold/30 rounded-lg text-sm font-heading transition-all disabled:opacity-50 disabled:cursor-not-allowed backdrop-blur-sm"
      whileHover={disabled ? {} : { scale: 1.05 }}
      whileTap={disabled ? {} : { scale: 0.95 }}
    >
      <span className="flex items-center gap-2">
        <span>🔄</span>
        <span>{label}</span>
      </span>
    </motion.button>
  );
}

