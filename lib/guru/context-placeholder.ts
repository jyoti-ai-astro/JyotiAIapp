/**
 * Guru Context Placeholder Data
 * 
 * Phase 3 — Section 30: PAGES PHASE 15 (F30)
 * 
 * Placeholder data for Kundali, Numerology, and Aura context
 */

import { GuruContext } from '@/lib/ai/guruPrompt';

/**
 * Get placeholder context data
 * In production, this would fetch from user's actual data
 */
export function getPlaceholderContext(): GuruContext {
  return {
    kundali: {
      rashi: 'Scorpio',
      lagna: 'Leo',
      nakshatra: 'Anuradha',
      majorPlanets: [
        { name: 'Sun', position: '10th House' },
        { name: 'Moon', position: '4th House' },
        { name: 'Mars', position: '1st House' },
        { name: 'Mercury', position: '9th House' },
        { name: 'Jupiter', position: '5th House' },
        { name: 'Venus', position: '7th House' },
        { name: 'Saturn', position: '11th House' },
      ],
    },
    numerology: {
      lifePath: 7,
      destiny: 3,
      personality: 5,
    },
    aura: {
      dominantColor: 'Violet',
      chakraStrengths: [
        { name: 'Root', strength: 7 },
        { name: 'Sacral', strength: 6 },
        { name: 'Solar Plexus', strength: 8 },
        { name: 'Heart', strength: 7 },
        { name: 'Throat', strength: 6 },
        { name: 'Third Eye', strength: 9 },
        { name: 'Crown', strength: 8 },
      ],
    },
  };
}

