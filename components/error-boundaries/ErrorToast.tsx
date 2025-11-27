/**
 * Error Toast Component (Phase 29 - F44)
 * 
 * Displays temporary error notifications
 */

'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export interface ErrorToastProps {
  message: string;
  show: boolean;
  onDismiss: () => void;
  type?: 'error' | 'warning' | 'info';
  duration?: number;
}

export function ErrorToast({
  message,
  show,
  onDismiss,
  type = 'error',
  duration = 5000,
}: ErrorToastProps) {
  React.useEffect(() => {
    if (show && duration > 0) {
      const timer = setTimeout(() => {
        onDismiss();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [show, duration, onDismiss]);

  const typeStyles = {
    error: 'bg-red/20 border-red/50 text-red-300',
    warning: 'bg-amber/20 border-amber/50 text-amber-300',
    info: 'bg-blue/20 border-blue/50 text-blue-300',
  };

  const typeIcons = {
    error: '⚠️',
    warning: '⚡',
    info: 'ℹ️',
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          className={`fixed top-4 right-4 z-50 ${typeStyles[type]} border rounded-lg p-4 max-w-sm shadow-lg backdrop-blur-sm`}
        >
          <div className="flex items-start gap-3">
            <span className="text-xl flex-shrink-0">{typeIcons[type]}</span>
            <p className="text-sm font-heading flex-1">{message}</p>
            <button
              onClick={onDismiss}
              className="text-white/60 hover:text-white transition-colors flex-shrink-0"
              aria-label="Dismiss"
            >
              ✕
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

