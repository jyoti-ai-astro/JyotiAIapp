/**
 * Guru Context Store (Zustand)
 * 
 * Phase 3 — Section 31: PAGES PHASE 16 (F31)
 * 
 * Cached context for session persistence
 */

'use client';

import { create } from 'zustand';
import { GuruContext } from '@/lib/ai/guruPrompt';

interface GuruContextStore {
  context: GuruContext | null;
  lastUpdated: Date | null;
  setContext: (context: GuruContext) => void;
  clearContext: () => void;
  isStale: () => boolean; // Check if context is older than 1 hour
}

const STALE_THRESHOLD = 60 * 60 * 1000; // 1 hour

export const useGuruContextStore = create<GuruContextStore>((set, get) => ({
  context: null,
  lastUpdated: null,

  setContext: (context: GuruContext) => {
    set({
      context,
      lastUpdated: new Date(),
    });
  },

  clearContext: () => {
    set({
      context: null,
      lastUpdated: null,
    });
  },

  isStale: () => {
    const { lastUpdated } = get();
    if (!lastUpdated) return true;
    return Date.now() - lastUpdated.getTime() > STALE_THRESHOLD;
  },
}));

