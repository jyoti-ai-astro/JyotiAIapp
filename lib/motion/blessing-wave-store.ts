/**
 * Blessing Wave Store
 * 
 * Phase 3 — Section 28: PAGES PHASE 13 (F28)
 * 
 * Zustand store for managing blessing wave state and progress
 */

'use client';

import { create } from 'zustand';

export interface BlessingWaveState {
  /** Blessing wave progress (0 → 1) */
  blessingProgress: number;
  
  /** Whether blessing wave is currently active */
  blessingActive: boolean;
  
  /** Start blessing wave animation */
  startBlessingWave: (intensity?: number) => void;
  
  /** Stop blessing wave animation */
  stopBlessingWave: () => void;
  
  /** Set blessing progress directly */
  setBlessingProgress: (progress: number) => void;
}

export const useBlessingWaveStore = create<BlessingWaveState>((set) => ({
  blessingProgress: 0,
  blessingActive: false,
  
  startBlessingWave: (intensity: number = 1.0) => {
    set({ blessingActive: true, blessingProgress: 0 });
    
    // Animate progress 0 → 1 (500ms)
    if (typeof window !== 'undefined') {
      import('gsap').then(({ gsap }) => {
        gsap.to({}, {
          duration: 0.5,
          ease: 'power2.out',
          onUpdate: function() {
            set({ blessingProgress: this.progress() * intensity });
          },
          onComplete: () => {
            // Then fade out 1 → 0 (800ms)
            gsap.to({}, {
              duration: 0.8,
              ease: 'power2.in',
              onUpdate: function() {
                set({ blessingProgress: intensity * (1 - this.progress()) });
              },
              onComplete: () => {
                set({ blessingActive: false, blessingProgress: 0 });
              },
            });
          },
        });
      });
    }
  },
  
  stopBlessingWave: () => {
    set({ blessingActive: false, blessingProgress: 0 });
  },
  
  setBlessingProgress: (progress: number) => {
    set({ blessingProgress: Math.max(0, Math.min(1, progress)) });
  },
}));

