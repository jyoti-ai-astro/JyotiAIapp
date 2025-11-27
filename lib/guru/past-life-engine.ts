/**
 * Past Life Engine
 * 
 * Phase 3 — Section 35: PAGES PHASE 20 (F35)
 * 
 * Analyzes karmic patterns and past life connections
 */

export interface PastLifeResult {
  pastLifeRole: string;
  unresolvedLessons: string[];
  karmicDebts: string[];
  repeatingCycles: string[];
  soulStrength: number; // 1-5
  karmicPatterns: {
    type: 'love' | 'power' | 'wisdom' | 'service' | 'creativity';
    intensity: number; // 0-1
    description: string;
  }[];
}

export class PastLifeEngine {
  /**
   * Analyze past life from Kundali
   */
  pastLifeFromKundali(kundali: {
    rashi?: string;
    lagna?: string;
    nakshatra?: string;
    majorPlanets?: Array<{ name: string; position: string }>;
  }): Partial<PastLifeResult> {
    const roles: string[] = [];
    const lessons: string[] = [];
    const debts: string[] = [];

    // Analyze based on nakshatra
    if (kundali.nakshatra) {
      const nakshatraRoles: { [key: string]: string } = {
        'Ashwini': 'Healer',
        'Bharani': 'Warrior',
        'Krittika': 'Scholar',
        'Rohini': 'Artist',
        'Mrigashira': 'Explorer',
        'Ardra': 'Mystic',
        'Punarvasu': 'Teacher',
        'Pushya': 'Nurturer',
        'Ashlesha': 'Mystic',
        'Magha': 'Royal',
        'Purva Phalguni': 'Lover',
        'Uttara Phalguni': 'Leader',
        'Hasta': 'Craftsman',
        'Chitra': 'Creator',
        'Swati': 'Wanderer',
        'Vishakha': 'Seeker',
        'Anuradha': 'Friend',
        'Jyeshta': 'Elder',
        'Mula': 'Destroyer',
        'Purva Ashadha': 'Warrior',
        'Uttara Ashadha': 'Conqueror',
        'Shravana': 'Listener',
        'Dhanishta': 'Musician',
        'Shatabhisha': 'Healer',
        'Purva Bhadrapada': 'Mystic',
        'Uttara Bhadrapada': 'Sage',
        'Revati': 'Protector',
      };
      const role = nakshatraRoles[kundali.nakshatra] || 'Seeker';
      roles.push(role);
    }

    // Analyze based on planets
    if (kundali.majorPlanets) {
      const planetLessons: { [key: string]: string } = {
        'Sun': 'Learn to lead with humility',
        'Moon': 'Balance emotions and logic',
        'Mars': 'Channel aggression into action',
        'Mercury': 'Communicate truthfully',
        'Jupiter': 'Share wisdom generously',
        'Venus': 'Love unconditionally',
        'Saturn': 'Accept karmic responsibilities',
        'Rahu': 'Transcend material desires',
        'Ketu': 'Seek spiritual liberation',
      };

      kundali.majorPlanets.forEach(planet => {
        const lesson = planetLessons[planet.name];
        if (lesson) {
          lessons.push(lesson);
        }
      });
    }

    // Analyze based on lagna
    if (kundali.lagna) {
      const lagnaDebts: { [key: string]: string } = {
        'Aries': 'Karmic debt: Assertiveness without aggression',
        'Taurus': 'Karmic debt: Stability without stagnation',
        'Gemini': 'Karmic debt: Communication without deception',
        'Cancer': 'Karmic debt: Nurturing without smothering',
        'Leo': 'Karmic debt: Leadership without ego',
        'Virgo': 'Karmic debt: Service without criticism',
        'Libra': 'Karmic debt: Balance without indecision',
        'Scorpio': 'Karmic debt: Transformation without destruction',
        'Sagittarius': 'Karmic debt: Wisdom without arrogance',
        'Capricorn': 'Karmic debt: Achievement without isolation',
        'Aquarius': 'Karmic debt: Innovation without rebellion',
        'Pisces': 'Karmic debt: Compassion without escapism',
      };
      const debt = lagnaDebts[kundali.lagna];
      if (debt) {
        debts.push(debt);
      }
    }

    return {
      pastLifeRole: roles[0] || 'Seeker',
      unresolvedLessons: lessons,
      karmicDebts: debts,
    };
  }

  /**
   * Analyze past life from Nakshatra
   */
  pastLifeFromNakshatra(nakshatra: string): Partial<PastLifeResult> {
    const cycles: string[] = [];
    const patterns: PastLifeResult['karmicPatterns'] = [];

    const nakshatraCycles: { [key: string]: string } = {
      'Ashwini': 'Cycle of healing and service',
      'Bharani': 'Cycle of creation and destruction',
      'Krittika': 'Cycle of purification and renewal',
      'Rohini': 'Cycle of material and spiritual balance',
      'Mrigashira': 'Cycle of seeking and finding',
      'Ardra': 'Cycle of transformation through storms',
      'Punarvasu': 'Cycle of return and renewal',
      'Pushya': 'Cycle of nurturing and growth',
      'Ashlesha': 'Cycle of hidden knowledge',
      'Magha': 'Cycle of royal duty and legacy',
      'Purva Phalguni': 'Cycle of love and relationships',
      'Uttara Phalguni': 'Cycle of leadership and service',
      'Hasta': 'Cycle of skill and craftsmanship',
      'Chitra': 'Cycle of creation and artistry',
      'Swati': 'Cycle of independence and freedom',
      'Vishakha': 'Cycle of seeking truth',
      'Anuradha': 'Cycle of friendship and loyalty',
      'Jyeshta': 'Cycle of elder wisdom',
      'Mula': 'Cycle of root transformation',
      'Purva Ashadha': 'Cycle of warrior spirit',
      'Uttara Ashadha': 'Cycle of victory and achievement',
      'Shravana': 'Cycle of listening and learning',
      'Dhanishta': 'Cycle of rhythm and harmony',
      'Shatabhisha': 'Cycle of healing and protection',
      'Purva Bhadrapada': 'Cycle of spiritual awakening',
      'Uttara Bhadrapada': 'Cycle of ultimate transformation',
      'Revati': 'Cycle of completion and new beginnings',
    };

    const cycle = nakshatraCycles[nakshatra];
    if (cycle) {
      cycles.push(cycle);
    }

    return {
      repeatingCycles: cycles,
      karmicPatterns: patterns,
    };
  }

  /**
   * Analyze past life from Numerology
   */
  pastLifeFromNumerology(numerology: {
    lifePath?: number;
    destiny?: number;
    personality?: number;
  }): Partial<PastLifeResult> {
    const roles: string[] = [];
    const patterns: PastLifeResult['karmicPatterns'] = [];

    const lifePathRoles: { [key: number]: string } = {
      1: 'Leader',
      2: 'Diplomat',
      3: 'Artist',
      4: 'Builder',
      5: 'Explorer',
      6: 'Nurturer',
      7: 'Mystic',
      8: 'Executive',
      9: 'Humanitarian',
    };

    if (numerology.lifePath) {
      const role = lifePathRoles[numerology.lifePath];
      if (role) {
        roles.push(role);
      }

      // Add karmic patterns based on life path
      if (numerology.lifePath === 1) {
        patterns.push({
          type: 'power',
          intensity: 0.8,
          description: 'Past life as a leader, learning to use power wisely',
        });
      } else if (numerology.lifePath === 2) {
        patterns.push({
          type: 'love',
          intensity: 0.7,
          description: 'Past life focused on relationships and harmony',
        });
      } else if (numerology.lifePath === 3) {
        patterns.push({
          type: 'creativity',
          intensity: 0.9,
          description: 'Past life as an artist or creative soul',
        });
      } else if (numerology.lifePath === 7) {
        patterns.push({
          type: 'wisdom',
          intensity: 0.8,
          description: 'Past life as a seeker of truth and wisdom',
        });
      } else if (numerology.lifePath === 9) {
        patterns.push({
          type: 'service',
          intensity: 0.9,
          description: 'Past life dedicated to serving humanity',
        });
      }
    }

    return {
      pastLifeRole: roles[0] || 'Seeker',
      karmicPatterns: patterns,
    };
  }

  /**
   * Analyze past life from Aura
   */
  pastLifeFromAura(aura: {
    dominantColor?: string;
    chakraStrengths?: Array<{ name: string; strength: number }>;
  }): Partial<PastLifeResult> {
    const roles: string[] = [];
    const soulStrength = this.calculateSoulStrength(aura.chakraStrengths || []);

    const auraRoles: { [key: string]: string } = {
      'Red': 'Warrior',
      'Orange': 'Creator',
      'Yellow': 'Teacher',
      'Green': 'Healer',
      'Blue': 'Communicator',
      'Indigo': 'Mystic',
      'Violet': 'Sage',
    };

    if (aura.dominantColor) {
      const role = auraRoles[aura.dominantColor];
      if (role) {
        roles.push(role);
      }
    }

    return {
      pastLifeRole: roles[0] || 'Seeker',
      soulStrength,
    };
  }

  /**
   * Calculate soul strength from chakra strengths
   */
  private calculateSoulStrength(chakras: Array<{ name: string; strength: number }>): number {
    if (chakras.length === 0) return 3;

    const avgStrength = chakras.reduce((sum, chakra) => sum + chakra.strength, 0) / chakras.length;
    
    // Map 0-10 scale to 1-5 scale
    if (avgStrength >= 8) return 5;
    if (avgStrength >= 6) return 4;
    if (avgStrength >= 4) return 3;
    if (avgStrength >= 2) return 2;
    return 1;
  }

  /**
   * Analyze karmic patterns
   */
  pastLifeKarmicPatterns(context: {
    kundali?: any;
    numerology?: any;
    aura?: any;
  }): PastLifeResult['karmicPatterns'] {
    const patterns: PastLifeResult['karmicPatterns'] = [];

    // Combine patterns from all sources
    if (context.kundali) {
      const kundaliResult = this.pastLifeFromKundali(context.kundali);
      if (kundaliResult.karmicPatterns) {
        patterns.push(...kundaliResult.karmicPatterns);
      }
    }

    if (context.numerology) {
      const numerologyResult = this.pastLifeFromNumerology(context.numerology);
      if (numerologyResult.karmicPatterns) {
        patterns.push(...numerologyResult.karmicPatterns);
      }
    }

    return patterns;
  }

  /**
   * Comprehensive past life analysis
   */
  analyzePastLife(context: {
    kundali?: any;
    numerology?: any;
    aura?: any;
  }): PastLifeResult {
    const results: Partial<PastLifeResult>[] = [];

    if (context.kundali) {
      results.push(this.pastLifeFromKundali(context.kundali));
      if (context.kundali.nakshatra) {
        results.push(this.pastLifeFromNakshatra(context.kundali.nakshatra));
      }
    }

    if (context.numerology) {
      results.push(this.pastLifeFromNumerology(context.numerology));
    }

    if (context.aura) {
      results.push(this.pastLifeFromAura(context.aura));
    }

    // Merge results
    const merged: PastLifeResult = {
      pastLifeRole: results.find(r => r.pastLifeRole)?.pastLifeRole || 'Seeker',
      unresolvedLessons: results.flatMap(r => r.unresolvedLessons || []),
      karmicDebts: results.flatMap(r => r.karmicDebts || []),
      repeatingCycles: results.flatMap(r => r.repeatingCycles || []),
      soulStrength: results.find(r => r.soulStrength)?.soulStrength || 3,
      karmicPatterns: this.pastLifeKarmicPatterns(context),
    };

    return merged;
  }
}

