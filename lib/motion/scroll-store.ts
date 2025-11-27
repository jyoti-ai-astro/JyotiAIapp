/**
 * Scroll Progress Store
 * 
 * Phase 3 — Section 23: PAGES PHASE 8 (F23)
 * 
 * Global scroll position and velocity tracking
 */

'use client';

import { create } from 'zustand';

export interface ScrollState {
  scrollY: number;
  scrollVelocity: number;
  direction: 'up' | 'down' | 'none';
  sectionProgress: Record<string, number>;
  sectionActive: string | null;
  lastUpdate: number;
}

interface ScrollStore extends ScrollState {
  updateScroll: (scrollY: number) => void;
  setSectionProgress: (sectionId: string, progress: number) => void;
  setSectionActive: (sectionId: string | null) => void;
  reset: () => void;
}

const initialState: ScrollState = {
  scrollY: 0,
  scrollVelocity: 0,
  direction: 'none',
  sectionProgress: {},
  sectionActive: null,
  lastUpdate: Date.now(),
};

// Phase 27 - F42: Throttle to 60fps using requestAnimationFrame
let rafId: number | null = null;
let pendingScrollY: number | null = null;

export const useScrollStore = create<ScrollStore>((set, get) => ({
  ...initialState,
  
  updateScroll: (scrollY: number) => {
    // Phase 27 - F42: Throttle to 60fps
    pendingScrollY = scrollY;
    
    if (rafId === null) {
      rafId = requestAnimationFrame(() => {
        if (pendingScrollY === null) {
          rafId = null;
          return;
        }
        
        const state = get();
        const now = Date.now();
        const deltaTime = Math.max(now - state.lastUpdate, 1) / 1000;
        
        const deltaY = pendingScrollY - state.scrollY;
        
        // Phase 27 - F42: Smooth velocity calculation with exponential moving average
        const rawVelocity = Math.abs(deltaY) / deltaTime;
        const smoothedVelocity = state.scrollVelocity * 0.7 + rawVelocity * 0.3; // EMA smoothing
        
        const direction: ScrollState['direction'] = deltaY > 0 ? 'down' : deltaY < 0 ? 'up' : 'none';
        
        set({
          scrollY: pendingScrollY,
          scrollVelocity: smoothedVelocity,
          direction,
          lastUpdate: now,
        });
        
        pendingScrollY = null;
        rafId = null;
      });
    }
  },
  
  setSectionProgress: (sectionId: string, progress: number) => {
    set((state) => ({
      sectionProgress: {
        ...state.sectionProgress,
        [sectionId]: progress,
      },
    }));
  },
  
  setSectionActive: (sectionId: string | null) => {
    set({ sectionActive: sectionId });
  },
  
  reset: () => {
    set(initialState);
  },
}));

