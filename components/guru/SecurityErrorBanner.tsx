/**
 * Security Error Banner Component (Phase 28 - F43)
 * 
 * Displays security-related error messages to users
 */

'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export type SecurityErrorType =
  | 'rate_limit'
  | 'validation_failure'
  | 'file_error'
  | 'video_error'
  | 'audio_error'
  | 'server_timeout'
  | 'pdf_failed'
  | 'cooldown'
  | 'suspicious_activity'
  | 'generic';

export interface SecurityErrorBannerProps {
  error: SecurityErrorType;
  message?: string;
  onDismiss?: () => void;
  show: boolean;
}

const errorMessages: Record<SecurityErrorType, string> = {
  rate_limit: 'You\'ve sent too many messages. Please wait a moment before trying again.',
  validation_failure: 'Your message couldn\'t be processed. Please check and try again.',
  file_error: 'File upload failed. Please check the file format and size, then try again.',
  video_error: 'Video stream error. Please check your camera permissions and try again.',
  audio_error: 'Audio recording error. Please check your microphone permissions and try again.',
  server_timeout: 'The server took too long to respond. Please try again in a moment.',
  pdf_failed: 'PDF generation failed. Please try again or contact support.',
  cooldown: 'Guru is meditating. Please wait a moment before sending another message.',
  suspicious_activity: 'Suspicious activity detected. Please try again later.',
  generic: 'An error occurred. Please try again.',
};

const errorIcons: Record<SecurityErrorType, string> = {
  rate_limit: '⏱️',
  validation_failure: '⚠️',
  file_error: '📁',
  video_error: '📹',
  audio_error: '🎤',
  server_timeout: '⏳',
  pdf_failed: '📄',
  cooldown: '🧘',
  suspicious_activity: '🔒',
  generic: '❌',
};

export function SecurityErrorBanner({
  error,
  message,
  onDismiss,
  show,
}: SecurityErrorBannerProps) {
  const displayMessage = message || errorMessages[error];
  const icon = errorIcons[error];

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="bg-red/20 border border-red/50 rounded-lg p-4 mb-4 flex items-start gap-3"
        >
          <span className="text-2xl flex-shrink-0">{icon}</span>
          <div className="flex-1">
            <p className="text-white/90 text-sm font-heading mb-1">
              {displayMessage}
            </p>
            {error === 'rate_limit' && (
              <p className="text-white/60 text-xs">
                This helps protect the Guru's energy and ensures everyone has a fair experience.
              </p>
            )}
            {error === 'cooldown' && (
              <p className="text-white/60 text-xs">
                The Guru needs time to process each message with care and wisdom.
              </p>
            )}
          </div>
          {onDismiss && (
            <button
              onClick={onDismiss}
              className="text-white/60 hover:text-white transition-colors flex-shrink-0"
              aria-label="Dismiss error"
            >
              ✕
            </button>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

