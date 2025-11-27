/**
 * Compatibility Engine
 * 
 * Phase 3 — Section 37: PAGES PHASE 22 (F37)
 * 
 * Calculates compatibility between two people across multiple dimensions
 */

import { GuruContext } from '@/lib/ai/guruPrompt';
import { PastLifeResult } from './past-life-engine';
import { KnowledgeGraph } from './knowledge-graph';

export type CompatibilityType = 'love' | 'marriage' | 'friendship' | 'career';

export interface CompatibilityInputs {
  user: {
    kundali?: {
      rashi?: string;
      lagna?: string;
      nakshatra?: string;
      majorPlanets?: Array<{ name: string; position: string }>;
    };
    numerology?: {
      lifePath?: number;
      destiny?: number;
      personality?: number;
    };
    aura?: {
      dominantColor?: string;
      energyTrend?: 'rising' | 'stable' | 'declining';
    };
    emotion?: {
      primaryEmotion?: string;
      trend?: 'positive' | 'neutral' | 'negative';
    };
    pastLife?: PastLifeResult | null;
    synergyScore?: number;
  };
  partner: {
    kundali?: {
      rashi?: string;
      lagna?: string;
      nakshatra?: string;
      majorPlanets?: Array<{ name: string; position: string }>;
    };
    numerology?: {
      lifePath?: number;
      destiny?: number;
      personality?: number;
    };
    aura?: {
      dominantColor?: string;
      energyTrend?: 'rising' | 'stable' | 'declining';
    };
    emotion?: {
      primaryEmotion?: string;
      trend?: 'positive' | 'neutral' | 'negative';
    };
    pastLife?: PastLifeResult | null;
    synergyScore?: number;
  };
}

export interface CompatibilityReport {
  type: CompatibilityType;
  rating: number; // 0-100
  synergyScore: number; // 0-1
  conflictScore: number; // 0-1
  strengths: string[];
  challenges: string[];
  guidance: string[];
  colorCode: 'gold' | 'violet' | 'red';
}

export class CompatibilityEngine {
  /**
   * Calculate comprehensive compatibility report
   */
  calculateCompatibility(
    type: CompatibilityType,
    inputs: CompatibilityInputs
  ): CompatibilityReport {
    const kundaliScore = this.calculateKundaliCompatibility(inputs);
    const nakshatraScore = this.calculateNakshatraMatch(inputs);
    const numerologyScore = this.calculateNumerologyMatch(inputs);
    const auraScore = this.calculateAuraSynergy(inputs);
    const pastLifeScore = this.calculatePastLifeIntersection(inputs);
    const combinedSynergy = this.calculateCombinedSynergy(inputs);

    // Weighted average
    const weights = {
      kundali: 0.25,
      nakshatra: 0.20,
      numerology: 0.15,
      aura: 0.15,
      pastLife: 0.10,
      combined: 0.15,
    };

    const overallRating = 
      kundaliScore * weights.kundali +
      nakshatraScore * weights.nakshatra +
      numerologyScore * weights.numerology +
      auraScore * weights.aura +
      pastLifeScore * weights.pastLife +
      combinedSynergy * weights.combined;

    const rating = Math.round(overallRating * 100);
    const synergyScore = combinedSynergy;
    const conflictScore = 1 - combinedSynergy;

    const strengths = this.generateStrengths(type, inputs, rating);
    const challenges = this.generateChallenges(type, inputs, rating);
    const guidance = this.generateGuidance(type, inputs, rating, challenges);
    const colorCode = rating >= 70 ? 'gold' : rating >= 50 ? 'violet' : 'red';

    return {
      type,
      rating,
      synergyScore,
      conflictScore,
      strengths,
      challenges,
      guidance,
      colorCode,
    };
  }

  /**
   * Calculate Kundali compatibility
   */
  private calculateKundaliCompatibility(inputs: CompatibilityInputs): number {
    const user = inputs.user.kundali;
    const partner = inputs.partner.kundali;

    if (!user || !partner) {
      return 0.5; // Neutral if no data
    }

    let score = 0.5;

    // Rashi compatibility (Moon signs)
    if (user.rashi && partner.rashi) {
      const rashiCompatibility = this.getRashiCompatibility(user.rashi, partner.rashi);
      score += (rashiCompatibility - 0.5) * 0.3;
    }

    // Lagna compatibility (Ascendants)
    if (user.lagna && partner.lagna) {
      const lagnaCompatibility = this.getLagnaCompatibility(user.lagna, partner.lagna);
      score += (lagnaCompatibility - 0.5) * 0.2;
    }

    // Planet compatibility
    if (user.majorPlanets && partner.majorPlanets) {
      const planetCompatibility = this.getPlanetCompatibility(user.majorPlanets, partner.majorPlanets);
      score += (planetCompatibility - 0.5) * 0.2;
    }

    return Math.max(0, Math.min(1, score));
  }

  /**
   * Calculate Nakshatra match
   */
  private calculateNakshatraMatch(inputs: CompatibilityInputs): number {
    const userNakshatra = inputs.user.kundali?.nakshatra;
    const partnerNakshatra = inputs.partner.kundali?.nakshatra;

    if (!userNakshatra || !partnerNakshatra) {
      return 0.5;
    }

    // Nakshatra compatibility rules (simplified)
    const compatiblePairs: { [key: string]: string[] } = {
      'Ashwini': ['Magha', 'Mula'],
      'Bharani': ['Purva Phalguni', 'Purva Ashadha'],
      'Krittika': ['Uttara Phalguni', 'Uttara Ashadha'],
      'Rohini': ['Hasta', 'Shravana'],
      'Mrigashira': ['Chitra', 'Dhanishta'],
      'Ardra': ['Swati', 'Shatabhisha'],
      'Punarvasu': ['Vishakha', 'Purva Bhadrapada'],
      'Pushya': ['Anuradha', 'Uttara Bhadrapada'],
      'Ashlesha': ['Jyeshta', 'Revati'],
      'Magha': ['Ashwini', 'Mula'],
      'Purva Phalguni': ['Bharani', 'Purva Ashadha'],
      'Uttara Phalguni': ['Krittika', 'Uttara Ashadha'],
      'Hasta': ['Rohini', 'Shravana'],
      'Chitra': ['Mrigashira', 'Dhanishta'],
      'Swati': ['Ardra', 'Shatabhisha'],
      'Vishakha': ['Punarvasu', 'Purva Bhadrapada'],
      'Anuradha': ['Pushya', 'Uttara Bhadrapada'],
      'Jyeshta': ['Ashlesha', 'Revati'],
      'Mula': ['Ashwini', 'Magha'],
      'Purva Ashadha': ['Bharani', 'Purva Phalguni'],
      'Uttara Ashadha': ['Krittika', 'Uttara Phalguni'],
      'Shravana': ['Rohini', 'Hasta'],
      'Dhanishta': ['Mrigashira', 'Chitra'],
      'Shatabhisha': ['Ardra', 'Swati'],
      'Purva Bhadrapada': ['Punarvasu', 'Vishakha'],
      'Uttara Bhadrapada': ['Pushya', 'Anuradha'],
      'Revati': ['Ashlesha', 'Jyeshta'],
    };

    const compatible = compatiblePairs[userNakshatra]?.includes(partnerNakshatra) || false;
    return compatible ? 0.8 : 0.5;
  }

  /**
   * Calculate Numerology match
   */
  private calculateNumerologyMatch(inputs: CompatibilityInputs): number {
    const userLifePath = inputs.user.numerology?.lifePath;
    const partnerLifePath = inputs.partner.numerology?.lifePath;

    if (!userLifePath || !partnerLifePath) {
      return 0.5;
    }

    // Life Path compatibility
    const compatiblePairs: { [key: number]: number[] } = {
      1: [1, 3, 5, 7, 9],
      2: [2, 4, 6, 8],
      3: [1, 3, 5, 6, 9],
      4: [2, 4, 6, 8],
      5: [1, 3, 5, 7, 9],
      6: [2, 3, 6, 8, 9],
      7: [1, 5, 7, 9],
      8: [2, 4, 6, 8],
      9: [1, 3, 6, 9],
    };

    const compatible = compatiblePairs[userLifePath]?.includes(partnerLifePath) || false;
    return compatible ? 0.75 : 0.5;
  }

  /**
   * Calculate Aura synergy
   */
  private calculateAuraSynergy(inputs: CompatibilityInputs): number {
    const userAura = inputs.user.aura?.dominantColor;
    const partnerAura = inputs.partner.aura?.dominantColor;

    if (!userAura || !partnerAura) {
      return 0.5;
    }

    // Aura color compatibility
    const compatiblePairs: { [key: string]: string[] } = {
      'Red': ['Orange', 'Yellow'],
      'Orange': ['Red', 'Yellow', 'Green'],
      'Yellow': ['Red', 'Orange', 'Green'],
      'Green': ['Orange', 'Yellow', 'Blue'],
      'Blue': ['Green', 'Indigo', 'Violet'],
      'Indigo': ['Blue', 'Violet'],
      'Violet': ['Blue', 'Indigo'],
    };

    const compatible = compatiblePairs[userAura]?.includes(partnerAura) || false;
    return compatible ? 0.7 : 0.5;
  }

  /**
   * Calculate Past Life intersection
   */
  private calculatePastLifeIntersection(inputs: CompatibilityInputs): number {
    const userPastLife = inputs.user.pastLife;
    const partnerPastLife = inputs.partner.pastLife;

    if (!userPastLife || !partnerPastLife) {
      return 0.5;
    }

    let score = 0.5;

    // Check for karmic connections
    const userLessons = userPastLife.unresolvedLessons || [];
    const partnerLessons = partnerPastLife.unresolvedLessons || [];
    const commonLessons = userLessons.filter(lesson => partnerLessons.includes(lesson));

    if (commonLessons.length > 0) {
      score += 0.2; // Shared karmic lessons indicate connection
    }

    // Check for complementary roles
    const userRole = userPastLife.pastLifeRole;
    const partnerRole = partnerPastLife.pastLifeRole;
    const complementaryRoles: { [key: string]: string[] } = {
      'Warrior': ['Healer', 'Sage'],
      'Healer': ['Warrior', 'Sage'],
      'Sage': ['Warrior', 'Healer', 'Scholar'],
      'Scholar': ['Sage', 'Teacher'],
      'Teacher': ['Scholar', 'Student'],
    };

    const complementary = complementaryRoles[userRole]?.includes(partnerRole) || false;
    if (complementary) {
      score += 0.15;
    }

    return Math.max(0, Math.min(1, score));
  }

  /**
   * Calculate combined synergy
   */
  private calculateCombinedSynergy(inputs: CompatibilityInputs): number {
    const userSynergy = inputs.user.synergyScore || 0.5;
    const partnerSynergy = inputs.partner.synergyScore || 0.5;

    // Average synergy with slight boost if both are high
    const avgSynergy = (userSynergy + partnerSynergy) / 2;
    if (userSynergy >= 0.7 && partnerSynergy >= 0.7) {
      return Math.min(1, avgSynergy + 0.1);
    }

    return avgSynergy;
  }

  /**
   * Generate strengths
   */
  private generateStrengths(
    type: CompatibilityType,
    inputs: CompatibilityInputs,
    rating: number
  ): string[] {
    const strengths: string[] = [];

    if (rating >= 70) {
      strengths.push('Strong cosmic alignment between both individuals');
      strengths.push('Complementary spiritual energies');
    }

    if (inputs.user.kundali?.nakshatra && inputs.partner.kundali?.nakshatra) {
      const nakshatraMatch = this.calculateNakshatraMatch(inputs);
      if (nakshatraMatch >= 0.7) {
        strengths.push('Favorable Nakshatra compatibility');
      }
    }

    if (inputs.user.numerology?.lifePath && inputs.partner.numerology?.lifePath) {
      const numerologyMatch = this.calculateNumerologyMatch(inputs);
      if (numerologyMatch >= 0.7) {
        strengths.push('Harmonious numerology alignment');
      }
    }

    const combinedSynergy = this.calculateCombinedSynergy(inputs);
    if (combinedSynergy >= 0.7) {
      strengths.push('High spiritual synergy');
    }

    return strengths;
  }

  /**
   * Generate challenges
   */
  private generateChallenges(
    type: CompatibilityType,
    inputs: CompatibilityInputs,
    rating: number
  ): string[] {
    const challenges: string[] = [];

    if (rating < 50) {
      challenges.push('Significant cosmic misalignment requires patience and understanding');
    }

    const conflictScore = 1 - this.calculateCombinedSynergy(inputs);
    if (conflictScore >= 0.4) {
      challenges.push('Different energy patterns may require conscious effort to harmonize');
    }

    if (inputs.user.pastLife?.karmicDebts && inputs.partner.pastLife?.karmicDebts) {
      const userDebts = inputs.user.pastLife.karmicDebts.length;
      const partnerDebts = inputs.partner.pastLife.karmicDebts.length;
      if (userDebts > 0 || partnerDebts > 0) {
        challenges.push('Karmic patterns may surface; focus on healing and growth');
      }
    }

    return challenges;
  }

  /**
   * Generate guidance
   */
  private generateGuidance(
    type: CompatibilityType,
    inputs: CompatibilityInputs,
    rating: number,
    challenges: string[]
  ): string[] {
    const guidance: string[] = [];

    if (rating >= 70) {
      guidance.push('Nurture this connection with gratitude and open communication');
      guidance.push('The cosmic energies favor this relationship; trust the journey');
    } else if (rating >= 50) {
      guidance.push('Focus on understanding and compromise to strengthen the bond');
      guidance.push('Practice patience and empathy during challenging times');
    } else {
      guidance.push('This relationship offers opportunities for growth and learning');
      guidance.push('Conscious effort and spiritual practices can help harmonize energies');
    }

    if (challenges.length > 0) {
      guidance.push('Consider joint meditation or spiritual practices to align energies');
    }

    return guidance;
  }

  /**
   * Helper: Get Rashi compatibility
   */
  private getRashiCompatibility(userRashi: string, partnerRashi: string): number {
    // Simplified: compatible signs
    const compatiblePairs: { [key: string]: string[] } = {
      'Aries': ['Leo', 'Sagittarius', 'Aquarius'],
      'Taurus': ['Virgo', 'Capricorn', 'Cancer'],
      'Gemini': ['Libra', 'Aquarius', 'Leo'],
      'Cancer': ['Scorpio', 'Pisces', 'Taurus'],
      'Leo': ['Aries', 'Sagittarius', 'Gemini'],
      'Virgo': ['Taurus', 'Capricorn', 'Scorpio'],
      'Libra': ['Gemini', 'Aquarius', 'Leo'],
      'Scorpio': ['Cancer', 'Pisces', 'Virgo'],
      'Sagittarius': ['Aries', 'Leo', 'Aquarius'],
      'Capricorn': ['Taurus', 'Virgo', 'Scorpio'],
      'Aquarius': ['Gemini', 'Libra', 'Aries'],
      'Pisces': ['Cancer', 'Scorpio', 'Taurus'],
    };

    const compatible = compatiblePairs[userRashi]?.includes(partnerRashi) || false;
    return compatible ? 0.75 : 0.5;
  }

  /**
   * Helper: Get Lagna compatibility
   */
  private getLagnaCompatibility(userLagna: string, partnerLagna: string): number {
    // Similar to Rashi compatibility
    return this.getRashiCompatibility(userLagna, partnerLagna);
  }

  /**
   * Helper: Get Planet compatibility
   */
  private getPlanetCompatibility(
    userPlanets: Array<{ name: string; position: string }>,
    partnerPlanets: Array<{ name: string; position: string }>
  ): number {
    // Simplified: check for compatible planetary positions
    let compatibleCount = 0;
    const totalPlanets = Math.max(userPlanets.length, partnerPlanets.length);

    userPlanets.forEach(userPlanet => {
      partnerPlanets.forEach(partnerPlanet => {
        if (userPlanet.name === partnerPlanet.name) {
          // Same planet - check if positions are compatible
          const userHouse = parseInt(userPlanet.position.match(/\d+/)?.[0] || '0');
          const partnerHouse = parseInt(partnerPlanet.position.match(/\d+/)?.[0] || '0');
          const houseDiff = Math.abs(userHouse - partnerHouse);
          if (houseDiff <= 2 || houseDiff >= 10) {
            compatibleCount++;
          }
        }
      });
    });

    return totalPlanets > 0 ? compatibleCount / totalPlanets : 0.5;
  }
}

