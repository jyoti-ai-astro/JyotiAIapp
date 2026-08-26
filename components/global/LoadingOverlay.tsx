/**
 * Global Loading Overlay
 * 
 * Shows a loading state across the app
 */

'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

interface LoadingOverlayProps {
  message?: string;
  fullScreen?: boolean;
  active?: boolean;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  message = 'Loading...',
  fullScreen = true,
  active = false,
}) => {
  if (!active) {
    return null;
  }

  const containerClasses = fullScreen
    ? 'fixed inset-0'
    : 'absolute inset-0 pointer-events-none';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={`${containerClasses} bg-cosmic-navy/95 backdrop-blur-sm z-50 flex items-center justify-center`}
    >
      <div className={fullScreen ? 'text-center space-y-6' : 'pointer-events-auto text-center space-y-6'}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          className="inline-block"
        >
          <Sparkles className="h-16 w-16 text-gold mx-auto" />
        </motion.div>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-white/80 text-lg"
        >
          {message}
        </motion.p>
      </div>
    </motion.div>
  );
};
