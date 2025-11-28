/**
 * Global Progress Store
 * 
 * Shared Zustand store for globalProgress to prevent multiple state instances
 * and infinite re-render loops
 */

'use client';

import { create } from 'zustand';

interface GlobalProgressState {
  globalProgress: number;
  isTransitioning: boolean;
  setGlobalProgress: (progress: number) => void;
  setIsTransitioning: (transitioning: boolean) => void;
}

export const useGlobalProgressStore = create<GlobalProgressState>((set) => ({
  globalProgress: 1.0,
  isTransitioning: false,
  setGlobalProgress: (progress: number) => {
    set((state) => {
      // Only update if value actually changed to prevent unnecessary re-renders
      if (state.globalProgress === progress) {
        return state;
      }
      return { globalProgress: progress };
    });
  },
  setIsTransitioning: (transitioning: boolean) => {
    set((state) => {
      if (state.isTransitioning === transitioning) {
        return state;
      }
      return { isTransitioning: transitioning };
    });
  },
}));

