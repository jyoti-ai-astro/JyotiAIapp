/**
 * Global Error Component
 * 
 * Phase 3 — Section 16: PAGES PHASE 1 (F16)
 */

'use client';

import { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error to monitoring service
    console.error('Global error:', error);
  }, [error]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-cosmic via-purple-900 to-cosmic">
      <div className="text-center space-y-4 max-w-md mx-auto p-8">
        <h1 className="text-4xl font-display text-white mb-4">Something went wrong</h1>
        <p className="text-white/80 mb-6">{error.message || 'An unexpected error occurred'}</p>
        <button
          onClick={reset}
          className="px-6 py-3 bg-gold text-cosmic rounded-lg font-heading hover:bg-gold-light transition-colors"
        >
          Try again
        </button>
      </div>
    </div>
  );
}

