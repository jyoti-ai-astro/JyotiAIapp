/**
 * Guru Context Provider
 * 
 * Phase 3 — Section 30: PAGES PHASE 15 (F30)
 * 
 * Provides user context (Kundali, Numerology, Aura) to Guru Chat
 */

'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { GuruContext } from '@/lib/ai/guruPrompt';
import { getPlaceholderContext } from '@/lib/guru/context-placeholder';

interface GuruContextValue {
  context: GuruContext | null;
  isLoading: boolean;
  refreshContext: () => Promise<void>;
}

const GuruContextContext = createContext<GuruContextValue | undefined>(undefined);

export function useGuruContext() {
  const context = useContext(GuruContextContext);
  if (!context) {
    throw new Error('useGuruContext must be used within GuruContextProvider');
  }
  return context;
}

interface GuruContextProviderProps {
  children: ReactNode;
}

export function GuruContextProvider({ children }: GuruContextProviderProps) {
  const [context, setContext] = useState<GuruContext | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadContext = async () => {
    setIsLoading(true);
    try {
      // In production, fetch from actual user data API
      // For now, use placeholder data
      const placeholderContext = getPlaceholderContext();
      setContext(placeholderContext);
    } catch (error) {
      console.error('Failed to load guru context:', error);
      setContext(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadContext();
  }, []);

  const refreshContext = async () => {
    await loadContext();
  };

  return (
    <GuruContextContext.Provider
      value={{
        context,
        isLoading,
        refreshContext,
      }}
    >
      {children}
    </GuruContextContext.Provider>
  );
}

