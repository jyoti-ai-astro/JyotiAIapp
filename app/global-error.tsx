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
    console.error('Global error:', error);
  }, [error]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#050d11] px-6">
      <div className="w-full max-w-md rounded-2xl border border-[#d7aa57]/20 bg-[#091419] p-8 text-center shadow-[0_24px_80px_rgba(0,0,0,0.38)]">
        <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full border border-[#d7aa57]/25 bg-[#0d1a1f] shadow-[0_0_36px_rgba(229,154,59,0.08)]">
          <div className="h-2.5 w-2.5 rounded-full bg-[#e59a3b]" />
        </div>

        <div className="font-heading text-2xl text-[#f3ecdf]">
          Something interrupted this view
        </div>

        <p className="mt-3 text-sm leading-6 text-[#9ca6a3]">
          JyotiAI could not complete this screen. You can safely retry without leaving your session.
        </p>

        <button
          onClick={reset}
          className="mt-7 rounded-lg border border-[#d7aa57]/30 bg-[#e59a3b] px-6 py-3 font-medium text-[#071014] transition hover:bg-[#efaa4b]"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
