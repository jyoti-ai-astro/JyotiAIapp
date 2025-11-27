/**
 * Guru Context Engine
 * 
 * Phase 3 — Section 31: PAGES PHASE 16 (F31)
 * 
 * Functions to fetch and build full context for Guru Chat
 */

import { GuruContext } from '@/lib/ai/guruPrompt';

export interface BirthDetails {
  dateOfBirth: string; // YYYY-MM-DD
  placeOfBirth: string;
  timeOfBirth: string; // HH:MM
}

export interface NumerologyInput {
  name: string;
  dateOfBirth: string; // YYYY-MM-DD
}

export interface AuraData {
  dominantColor: string;
  chakraStrengths: Array<{ name: string; strength: number }>;
  energyLevel: number; // 0-10
  auraImage?: string;
}

/**
 * Get Kundali context from birth details
 * In production, this would call the actual Kundali API
 */
export async function getKundaliContext(
  dob: string,
  pob: string,
  tob: string
): Promise<GuruContext['kundali']> {
  try {
    // In production, call: /api/kundali/generate
    // For now, return placeholder based on input
    const date = new Date(dob);
    const month = date.getMonth() + 1;
    
    // Simple placeholder logic (replace with actual API call)
    const rashis = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
    const rashi = rashis[month % 12] || 'Scorpio';
    
    return {
      rashi,
      lagna: rashi, // Simplified
      nakshatra: 'Anuradha', // Placeholder
      majorPlanets: [
        { name: 'Sun', position: '10th House' },
        { name: 'Moon', position: '4th House' },
        { name: 'Mars', position: '1st House' },
        { name: 'Mercury', position: '9th House' },
        { name: 'Jupiter', position: '5th House' },
        { name: 'Venus', position: '7th House' },
        { name: 'Saturn', position: '11th House' },
      ],
    };
  } catch (error) {
    console.error('Error fetching Kundali context:', error);
    return undefined;
  }
}

/**
 * Get Numerology context from name and date of birth
 * In production, this would call the actual Numerology API
 */
export async function getNumerologyContext(
  name: string,
  dob: string
): Promise<GuruContext['numerology']> {
  try {
    // In production, call: /api/numerology/calculate
    // For now, return placeholder based on input
    const date = new Date(dob);
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    
    // Simple placeholder calculation (replace with actual API call)
    const lifePath = calculateLifePath(day, month, year);
    const destiny = calculateDestiny(name);
    const personality = calculatePersonality(name);
    
    return {
      lifePath,
      destiny,
      personality,
    };
  } catch (error) {
    console.error('Error fetching Numerology context:', error);
    return undefined;
  }
}

/**
 * Get Aura context from aura data
 * In production, this would call the actual Aura API
 */
export async function getAuraContext(
  auraData: AuraData
): Promise<GuruContext['aura']> {
  try {
    // In production, call: /api/aura/analyze
    // For now, return the provided data
    return {
      dominantColor: auraData.dominantColor,
      chakraStrengths: auraData.chakraStrengths,
    };
  } catch (error) {
    console.error('Error fetching Aura context:', error);
    return undefined;
  }
}

/**
 * Build full context combining all sources
 */
export async function buildFullContext(options: {
  birthDetails?: BirthDetails;
  numerologyInput?: NumerologyInput;
  auraData?: AuraData;
}): Promise<GuruContext> {
  const context: GuruContext = {};

  // Fetch Kundali context
  if (options.birthDetails) {
    const kundali = await getKundaliContext(
      options.birthDetails.dateOfBirth,
      options.birthDetails.placeOfBirth,
      options.birthDetails.timeOfBirth
    );
    if (kundali) {
      context.kundali = kundali;
    }
  }

  // Fetch Numerology context
  if (options.numerologyInput) {
    const numerology = await getNumerologyContext(
      options.numerologyInput.name,
      options.numerologyInput.dateOfBirth
    );
    if (numerology) {
      context.numerology = numerology;
    }
  }

  // Fetch Aura context
  if (options.auraData) {
    const aura = await getAuraContext(options.auraData);
    if (aura) {
      context.aura = aura;
    }
  }

  return context;
}

/**
 * Helper: Calculate Life Path number
 */
function calculateLifePath(day: number, month: number, year: number): number {
  const sum = day + month + year;
  return reduceToSingleDigit(sum);
}

/**
 * Helper: Calculate Destiny number from name
 */
function calculateDestiny(name: string): number {
  const letterValues: { [key: string]: number } = {
    a: 1, b: 2, c: 3, d: 4, e: 5, f: 6, g: 7, h: 8, i: 9,
    j: 1, k: 2, l: 3, m: 4, n: 5, o: 6, p: 7, q: 8, r: 9,
    s: 1, t: 2, u: 3, v: 4, w: 5, x: 6, y: 7, z: 8,
  };
  
  const sum = name
    .toLowerCase()
    .replace(/[^a-z]/g, '')
    .split('')
    .reduce((acc, char) => acc + (letterValues[char] || 0), 0);
  
  return reduceToSingleDigit(sum);
}

/**
 * Helper: Calculate Personality number from name
 */
function calculatePersonality(name: string): number {
  // Simplified: use consonants only
  const consonants = name.toLowerCase().replace(/[aeiou\s]/g, '');
  return calculateDestiny(consonants);
}

/**
 * Helper: Reduce number to single digit (1-9)
 */
function reduceToSingleDigit(num: number): number {
  while (num > 9 && num !== 11 && num !== 22 && num !== 33) {
    num = num.toString().split('').reduce((acc, digit) => acc + parseInt(digit, 10), 0);
  }
  return num;
}

