/**
 * Engine Results Store
 * 
 * Global store for engine results accessible by GuruChat
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { KundaliData } from '@/lib/engines/kundali-engine';
import type { NumerologyData } from '@/lib/engines/numerology-engine';
import type { BusinessAnalysis } from '@/lib/engines/business-engine';
import type { PregnancyInsight } from '@/lib/engines/pregnancy-engine';
import type { FaceReadingAnalysis } from '@/lib/engines/face-reading-engine';
import type { PalmistryAnalysis } from '@/lib/engines/palmistry-engine';
import type { AuraAnalysis } from '@/lib/engines/aura-engine';
import type { MonthTimeline } from '@/lib/engines/timeline-engine';
import type { DailyPrediction, WeeklyPrediction, MonthlyPrediction } from '@/lib/engines/prediction-engine';
import type { CompatibilityAnalysis } from '@/lib/engines/compatibility-engine';

interface EngineResults {
  kundali: KundaliData | null;
  numerology: NumerologyData | null;
  business: BusinessAnalysis | null;
  pregnancy: PregnancyInsight | null;
  faceReading: FaceReadingAnalysis | null;
  palmistry: PalmistryAnalysis | null;
  aura: AuraAnalysis | null;
  timeline: MonthTimeline[] | null;
  predictions: {
    daily: DailyPrediction | null;
    weekly: WeeklyPrediction | null;
    monthly: MonthlyPrediction | null;
  };
  compatibility: CompatibilityAnalysis | null;
}

interface EngineResultsState {
  results: EngineResults;
  setKundali: (kundali: KundaliData | null) => void;
  setNumerology: (numerology: NumerologyData | null) => void;
  setBusiness: (business: BusinessAnalysis | null) => void;
  setPregnancy: (pregnancy: PregnancyInsight | null) => void;
  setFaceReading: (faceReading: FaceReadingAnalysis | null) => void;
  setPalmistry: (palmistry: PalmistryAnalysis | null) => void;
  setAura: (aura: AuraAnalysis | null) => void;
  setTimeline: (timeline: MonthTimeline[] | null) => void;
  setPredictions: (predictions: { daily?: DailyPrediction | null; weekly?: WeeklyPrediction | null; monthly?: MonthlyPrediction | null }) => void;
  setCompatibility: (compatibility: CompatibilityAnalysis | null) => void;
  clearResults: () => void;
}

const initialResults: EngineResults = {
  kundali: null,
  numerology: null,
  business: null,
  pregnancy: null,
  faceReading: null,
  palmistry: null,
  aura: null,
  timeline: null,
  predictions: {
    daily: null,
    weekly: null,
    monthly: null,
  },
  compatibility: null,
};

export const useEngineResultsStore = create<EngineResultsState>()(
  persist(
    (set) => ({
      results: initialResults,
      setKundali: (kundali) =>
        set((state) => ({
          results: { ...state.results, kundali },
        })),
      setNumerology: (numerology) =>
        set((state) => ({
          results: { ...state.results, numerology },
        })),
      setBusiness: (business) =>
        set((state) => ({
          results: { ...state.results, business },
        })),
      setPregnancy: (pregnancy) =>
        set((state) => ({
          results: { ...state.results, pregnancy },
        })),
      setFaceReading: (faceReading) =>
        set((state) => ({
          results: { ...state.results, faceReading },
        })),
      setPalmistry: (palmistry) =>
        set((state) => ({
          results: { ...state.results, palmistry },
        })),
      setAura: (aura) =>
        set((state) => ({
          results: { ...state.results, aura },
        })),
      setTimeline: (timeline) =>
        set((state) => ({
          results: { ...state.results, timeline },
        })),
      setPredictions: (predictions) =>
        set((state) => ({
          results: {
            ...state.results,
            predictions: {
              ...state.results.predictions,
              ...predictions,
            },
          },
        })),
      setCompatibility: (compatibility) =>
        set((state) => ({
          results: { ...state.results, compatibility },
        })),
      clearResults: () => set({ results: initialResults }),
    }),
    {
      name: 'jyoti-engine-results',
    }
  )
);

