/**
 * Global Loading Component
 * 
 * Phase 3 — Section 16: PAGES PHASE 1 (F16)
 */

export default function Loading() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-cosmic via-purple-900 to-cosmic">
      <div className="relative">
        <div className="w-64 h-64 rounded-full bg-gradient-to-r from-gold/20 via-white/10 to-gold/20 animate-pulse" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-white/60 text-sm font-heading">Loading...</div>
        </div>
      </div>
    </div>
  );
}

