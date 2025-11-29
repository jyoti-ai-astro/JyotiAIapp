/**
 * Astro Types - Central Type System for Astrology
 * 
 * MEGA BUILD 1 - Phase 7 Core
 * Reusable type system for all astrology computation
 */

/**
 * Birth data required for astrological calculations
 */
export interface AstroBirthData {
  dateOfBirth: string; // ISO string
  timeOfBirth: string; // HH:MM format
  timezone: string; // IANA timezone string
  placeName: string;
  latitude: number;
  longitude: number;
}

/**
 * Planet position in chart
 */
export interface PlanetPosition {
  planet: string; // Sun, Moon, Mars, Mercury, Jupiter, Venus, Saturn, Rahu, Ketu
  sign: string;
  degree: number; // degrees in sign (0-30)
  house: number; // 1-12
  nakshatra: string;
  pada: number; // 1-4
  retrograde: boolean;
  combust?: boolean; // for Sun/Moon proximity
  longitude: number; // absolute longitude
}

/**
 * House data in chart
 */
export interface HouseData {
  houseNumber: number; // 1-12
  sign: string;
  degree: number; // cusp degree
  lord: string; // ruling planet
}

/**
 * Core astrological chart data
 */
export interface AstroChartCore {
  houses: HouseData[]; // 12 houses
  planets: PlanetPosition[]; // all 9 planets
  ascendantSign: string;
  moonSign: string;
  sunSign: string;
}

/**
 * Dasha period information
 */
export interface DashaPeriod {
  planet: string;
  startDate: string; // ISO string
  endDate: string; // ISO string
  theme?: string; // optional theme description
}

/**
 * Dasha summary with current and upcoming periods
 */
export interface AstroDashaSummary {
  currentMahadasha: DashaPeriod;
  currentAntardasha: DashaPeriod;
  currentPratyantardasha?: DashaPeriod;
  next3Events: Array<{
    planet: string;
    from: string; // ISO string
    to: string; // ISO string
    theme: string;
  }>;
}

/**
 * Timeline event for future predictions
 */
export interface AstroTimelineEvent {
  dateRange: {
    from: string; // ISO string
    to: string; // ISO string
  };
  focusArea: 'career' | 'love' | 'health' | 'finance' | 'spiritual';
  intensity: 1 | 2 | 3 | 4 | 5; // 1-5 scale
  summary: string;
  advice: string;
}

/**
 * Complete astrological context for a user
 */
export interface AstroContext {
  birthData: AstroBirthData;
  coreChart: AstroChartCore;
  dasha: AstroDashaSummary;
  timeline: AstroTimelineEvent[];
  personalityTags: string[]; // e.g., ["creative", "leadership", "spiritual"]
  riskFlags: string[]; // e.g., ["health_caution", "financial_care"]
  cachedAt?: string; // ISO string - when this context was built
}

