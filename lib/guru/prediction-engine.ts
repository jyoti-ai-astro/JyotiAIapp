/**
 * Prediction Engine
 * 
 * Phase 3 — Section 36: PAGES PHASE 21 (F36)
 * 
 * Generates probability-based predictions from multiple spiritual sources
 */

export type PredictionCategory = 'career' | 'money' | 'love' | 'health' | 'spiritual';

export interface Prediction {
  month: number; // 1-12 (relative to current month)
  prediction: string;
  probability: number; // 0-1
  energyScore: number; // 0-10
  cautionNotes?: string[];
  blessings?: string[];
  category: PredictionCategory;
}

export interface PredictionInputs {
  kundali?: {
    dashaPeriod?: string;
    nakshatra?: string;
    majorPlanets?: Array<{ name: string; position: string }>;
  };
  numerology?: {
    yearCycle?: number; // Current year in numerology cycle (1-9)
    lifePath?: number;
  };
  aura?: {
    dominantColor?: string;
    energyTrend?: 'rising' | 'stable' | 'declining';
  };
  emotion?: {
    primaryEmotion?: string;
    trend?: 'positive' | 'neutral' | 'negative';
  };
  pastLife?: {
    karmicPatterns?: Array<{ type: string; intensity: number }>;
    unresolvedLessons?: string[];
  };
  synergyScore?: number; // 0-1 from knowledge graph
}

export class PredictionEngine {
  /**
   * Generate predictions for a specific category
   */
  generateCategoryPrediction(
    category: PredictionCategory,
    month: number,
    inputs: PredictionInputs
  ): Prediction {
    const baseProbability = this.calculateBaseProbability(category, month, inputs);
    const energyScore = this.calculateEnergyScore(category, inputs);
    const prediction = this.generatePredictionText(category, month, baseProbability, inputs);
    const cautionNotes = this.generateCautionNotes(category, baseProbability, inputs);
    const blessings = this.generateBlessings(category, energyScore);

    return {
      month,
      prediction,
      probability: baseProbability,
      energyScore,
      cautionNotes: cautionNotes.length > 0 ? cautionNotes : undefined,
      blessings: blessings.length > 0 ? blessings : undefined,
      category,
    };
  }

  /**
   * Calculate base probability from multiple sources
   */
  private calculateBaseProbability(
    category: PredictionCategory,
    month: number,
    inputs: PredictionInputs
  ): number {
    let probability = 0.5; // Base 50%

    // Kundali Dasha period influence
    if (inputs.kundali?.dashaPeriod) {
      const dashaInfluence = this.getDashaInfluence(category, inputs.kundali.dashaPeriod);
      probability += dashaInfluence * 0.2; // Up to 20% influence
    }

    // Nakshatra energy
    if (inputs.kundali?.nakshatra) {
      const nakshatraInfluence = this.getNakshatraInfluence(category, inputs.kundali.nakshatra);
      probability += nakshatraInfluence * 0.15; // Up to 15% influence
    }

    // Numerology year cycle
    if (inputs.numerology?.yearCycle) {
      const yearCycleInfluence = this.getYearCycleInfluence(category, inputs.numerology.yearCycle, month);
      probability += yearCycleInfluence * 0.15; // Up to 15% influence
    }

    // Aura/emotion trends
    if (inputs.aura?.energyTrend) {
      const auraInfluence = inputs.aura.energyTrend === 'rising' ? 0.1 : 
                           inputs.aura.energyTrend === 'declining' ? -0.1 : 0;
      probability += auraInfluence;
    }

    if (inputs.emotion?.trend) {
      const emotionInfluence = inputs.emotion.trend === 'positive' ? 0.1 :
                              inputs.emotion.trend === 'negative' ? -0.1 : 0;
      probability += emotionInfluence;
    }

    // Past-life karmic patterns
    if (inputs.pastLife?.karmicPatterns) {
      const karmicInfluence = this.getKarmicInfluence(category, inputs.pastLife.karmicPatterns);
      probability += karmicInfluence * 0.1; // Up to 10% influence
    }

    // Knowledge Graph synergy
    if (inputs.synergyScore !== undefined) {
      const synergyInfluence = (inputs.synergyScore - 0.5) * 0.2; // -0.1 to +0.1
      probability += synergyInfluence;
    }

    // Clamp to 0-1 range
    return Math.max(0, Math.min(1, probability));
  }

  /**
   * Calculate energy score (0-10)
   */
  private calculateEnergyScore(category: PredictionCategory, inputs: PredictionInputs): number {
    let score = 5; // Base 5

    // Synergy score contributes
    if (inputs.synergyScore !== undefined) {
      score += (inputs.synergyScore - 0.5) * 4; // -2 to +2
    }

    // Aura energy trend
    if (inputs.aura?.energyTrend) {
      score += inputs.aura.energyTrend === 'rising' ? 1.5 :
               inputs.aura.energyTrend === 'declining' ? -1.5 : 0;
    }

    // Emotion trend
    if (inputs.emotion?.trend) {
      score += inputs.emotion.trend === 'positive' ? 1 :
               inputs.emotion.trend === 'negative' ? -1 : 0;
    }

    // Clamp to 0-10
    return Math.max(0, Math.min(10, Math.round(score * 10) / 10));
  }

  /**
   * Generate prediction text
   */
  private generatePredictionText(
    category: PredictionCategory,
    month: number,
    probability: number,
    inputs: PredictionInputs
  ): string {
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                       'July', 'August', 'September', 'October', 'November', 'December'];
    const monthName = monthNames[(new Date().getMonth() + month - 1) % 12];
    const probText = probability >= 0.7 ? 'high potential' :
                    probability >= 0.5 ? 'moderate potential' :
                    probability >= 0.3 ? 'some potential' : 'lower potential';

    const categoryTexts: { [key in PredictionCategory]: string } = {
      career: `Career opportunities show ${probText} in ${monthName}. The cosmic energies suggest favorable periods for professional growth and recognition.`,
      money: `Financial prospects indicate ${probText} in ${monthName}. The stars suggest periods of stability and potential gains.`,
      love: `Relationships show ${probText} in ${monthName}. The cosmic energies favor connection, harmony, and emotional growth.`,
      health: `Health and wellness indicate ${probText} in ${monthName}. The stars suggest focusing on balance and self-care.`,
      spiritual: `Spiritual growth shows ${probText} in ${monthName}. The cosmic energies favor inner transformation and divine connection.`,
    };

    return categoryTexts[category];
  }

  /**
   * Generate caution notes
   */
  private generateCautionNotes(
    category: PredictionCategory,
    probability: number,
    inputs: PredictionInputs
  ): string[] {
    const notes: string[] = [];

    if (probability < 0.4) {
      notes.push(`Exercise patience and avoid hasty decisions in this area.`);
    }

    if (inputs.pastLife?.unresolvedLessons && inputs.pastLife.unresolvedLessons.length > 0) {
      notes.push(`Karmic patterns may require attention. Focus on learning and growth.`);
    }

    if (inputs.synergyScore !== undefined && inputs.synergyScore < 0.5) {
      notes.push(`Your spiritual energies are still aligning. Trust the process.`);
    }

    return notes;
  }

  /**
   * Generate blessings
   */
  private generateBlessings(category: PredictionCategory, energyScore: number): string[] {
    const blessings: string[] = [];

    if (energyScore >= 7) {
      blessings.push(`High cosmic energy supports your journey in this area.`);
    }

    if (energyScore >= 5) {
      blessings.push(`The universe is aligning to support your growth.`);
    }

    return blessings;
  }

  /**
   * Get Dasha period influence
   */
  private getDashaInfluence(category: PredictionCategory, dashaPeriod: string): number {
    // Simplified: positive for favorable periods, negative for challenging
    const favorableDashas = ['Jupiter', 'Venus', 'Mercury'];
    const challengingDashas = ['Saturn', 'Rahu', 'Ketu'];
    
    if (favorableDashas.some(d => dashaPeriod.includes(d))) {
      return 0.3;
    } else if (challengingDashas.some(d => dashaPeriod.includes(d))) {
      return -0.2;
    }
    return 0;
  }

  /**
   * Get Nakshatra influence
   */
  private getNakshatraInfluence(category: PredictionCategory, nakshatra: string): number {
    // Simplified: some nakshatras favor certain categories
    const favorableNakshatras: { [key in PredictionCategory]?: string[] } = {
      career: ['Magha', 'Purva Phalguni', 'Uttara Phalguni'],
      love: ['Rohini', 'Purva Phalguni', 'Anuradha'],
      money: ['Pushya', 'Hasta', 'Dhanishta'],
      health: ['Ashwini', 'Shatabhisha'],
      spiritual: ['Revati', 'Uttara Bhadrapada', 'Purva Bhadrapada'],
    };

    const favorable = favorableNakshatras[category] || [];
    if (favorable.includes(nakshatra)) {
      return 0.2;
    }
    return 0;
  }

  /**
   * Get year cycle influence
   */
  private getYearCycleInfluence(category: PredictionCategory, yearCycle: number, month: number): number {
    // Numerology year cycles have different influences
    const cycleInfluences: { [key: number]: { [key in PredictionCategory]?: number } } = {
      1: { career: 0.2, money: 0.1 },
      2: { love: 0.2, health: 0.1 },
      3: { career: 0.1, spiritual: 0.2 },
      4: { money: 0.2, health: 0.1 },
      5: { career: 0.1, love: 0.1 },
      6: { love: 0.2, health: 0.1 },
      7: { spiritual: 0.3, health: 0.1 },
      8: { money: 0.2, career: 0.1 },
      9: { spiritual: 0.2, love: 0.1 },
    };

    return cycleInfluences[yearCycle]?.[category] || 0;
  }

  /**
   * Get karmic pattern influence
   */
  private getKarmicInfluence(
    category: PredictionCategory,
    patterns: Array<{ type: string; intensity: number }>
  ): number {
    const categoryPatterns: { [key in PredictionCategory]?: string[] } = {
      love: ['love'],
      career: ['power', 'service'],
      money: ['power', 'service'],
      spiritual: ['wisdom', 'service'],
    };

    const relevantPatterns = categoryPatterns[category] || [];
    let influence = 0;

    patterns.forEach(pattern => {
      if (relevantPatterns.includes(pattern.type)) {
        influence += pattern.intensity * 0.1;
      }
    });

    return influence;
  }
}

