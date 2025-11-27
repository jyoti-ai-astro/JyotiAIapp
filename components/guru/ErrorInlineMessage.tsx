/**
 * Error Inline Message Component (Phase 29 - F44)
 * 
 * Displays inline error messages in chat
 */

'use client';

import React from 'react';
import { motion } from 'framer-motion';

export interface ErrorInlineMessageProps {
  message: string;
  onRetry?: () => void;
  onDismiss?: () => void;
}

export function ErrorInlineMessage({
  message,
  onRetry,
  onDismiss,
}: ErrorInlineMessageProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="bg-red/10 border border-red/30 rounded-lg p-4 mb-4 flex items-start gap-3"
    >
      <span className="text-red-300 text-xl flex-shrink-0">⚠️</span>
      <div className="flex-1">
        <p className="text-white/90 text-sm font-heading mb-2">{message}</p>
        <div className="flex gap-2">
          {onRetry && (
            <button
              onClick={onRetry}
              className="px-4 py-2 bg-gold/10 hover:bg-gold/20 text-gold border border-gold/30 rounded-lg text-xs font-heading transition-colors"
            >
              Retry
            </button>
          )}
          {onDismiss && (
            <button
              onClick={onDismiss}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white border border-white/30 rounded-lg text-xs font-heading transition-colors"
            >
              Dismiss
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

