/**
 * Compatibility Timeline
 * 
 * Phase 3 — Section 37: PAGES PHASE 22 (F37)
 * 
 * Builds 12-month compatibility timeline
 */

import { CompatibilityEngine, CompatibilityInputs, CompatibilityReport } from './compatibility-engine';
import { TimelineBuilder } from './timeline-builder';
import { PredictionEngine } from './prediction-engine';

export interface CompatibilityMonth {
  month: number;
  monthName: string;
  harmonyIndex: number; // 0-1
  energyScore: number; // 0-10
  cautionNotes?: string[];
  colorCode: 'gold' | 'violet' | 'red';
  report: CompatibilityReport;
}

export interface CompatibilityTimelineSummary {
  next30Days: {
    harmonyIndex: number;
    summary: string;
  };
  next90Days: {
    harmonyIndex: number;
    summary: string;
  };
  yearCycle: {
    harmonyIndex: number;
    summary: string;
  };
}

export class CompatibilityTimelineBuilder {
  private compatibilityEngine: CompatibilityEngine;
  private timelineBuilder: TimelineBuilder;
  private predictionEngine: PredictionEngine;

  constructor() {
    this.compatibilityEngine = new CompatibilityEngine();
    this.timelineBuilder = new TimelineBuilder();
    this.predictionEngine = new PredictionEngine();
  }

  /**
   * Build 12-month compatibility timeline
   */
  buildCompatibilityTimeline(
    type: 'love' | 'marriage' | 'friendship' | 'career',
    inputs: CompatibilityInputs
  ): CompatibilityMonth[] {
    const timeline: CompatibilityMonth[] = [];
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                       'July', 'August', 'September', 'October', 'November', 'December'];

    // Base compatibility report
    const baseReport = this.compatibilityEngine.calculateCompatibility(type, inputs);

    for (let month = 1; month <= 12; month++) {
      // Calculate monthly variations based on predictions
      const predictionInputs = {
        kundali: {
          dashaPeriod: inputs.user.kundali?.nakshatra ? 'Jupiter' : undefined,
          nakshatra: inputs.user.kundali?.nakshatra,
          majorPlanets: inputs.user.kundali?.majorPlanets,
        },
        numerology: {
          yearCycle: this.getYearCycle(inputs),
          lifePath: inputs.user.numerology?.lifePath,
        },
        aura: {
          dominantColor: inputs.user.aura?.dominantColor,
          energyTrend: inputs.user.aura?.energyTrend,
        },
        emotion: {
          primaryEmotion: inputs.user.emotion?.primaryEmotion,
          trend: inputs.user.emotion?.trend,
        },
        pastLife: {
          karmicPatterns: inputs.user.pastLife?.karmicPatterns,
          unresolvedLessons: inputs.user.pastLife?.unresolvedLessons,
        },
        synergyScore: inputs.user.synergyScore,
      };

      // Get prediction for this month (using love category as proxy)
      const prediction = this.predictionEngine.generateCategoryPrediction(
        'love',
        month,
        predictionInputs
      );

      // Adjust harmony index based on prediction probability
      const monthlyVariation = (prediction.probability - 0.5) * 0.2; // -0.1 to +0.1
      const harmonyIndex = Math.max(0, Math.min(1, baseReport.synergyScore + monthlyVariation));
      const energyScore = Math.max(0, Math.min(10, baseReport.rating / 10 + (prediction.energyScore - 5) * 0.2));

      // Determine color code
      const colorCode: 'gold' | 'violet' | 'red' = 
        harmonyIndex >= 0.7 ? 'gold' :
        harmonyIndex >= 0.5 ? 'violet' : 'red';

      // Generate caution notes if needed
      const cautionNotes: string[] = [];
      if (harmonyIndex < 0.5) {
        cautionNotes.push('Focus on communication and understanding during this period');
      }
      if (prediction.cautionNotes) {
        cautionNotes.push(...prediction.cautionNotes);
      }

      // Create monthly report (slightly adjusted from base)
      const monthlyReport: CompatibilityReport = {
        ...baseReport,
        synergyScore: harmonyIndex,
        conflictScore: 1 - harmonyIndex,
        colorCode,
      };

      timeline.push({
        month,
        monthName: monthNames[(new Date().getMonth() + month - 1) % 12],
        harmonyIndex,
        energyScore: Math.round(energyScore * 10) / 10,
        cautionNotes: cautionNotes.length > 0 ? cautionNotes : undefined,
        colorCode,
        report: monthlyReport,
      });
    }

    return timeline;
  }

  /**
   * Generate compatibility timeline summary
   */
  generateSummary(timeline: CompatibilityMonth[]): CompatibilityTimelineSummary {
    const next30Days = timeline.slice(0, 1);
    const next90Days = timeline.slice(0, 3);
    const yearCycle = timeline;

    return {
      next30Days: {
        harmonyIndex: next30Days.reduce((sum, m) => sum + m.harmonyIndex, 0) / next30Days.length,
        summary: this.generatePeriodSummary(next30Days, '30 days'),
      },
      next90Days: {
        harmonyIndex: next90Days.reduce((sum, m) => sum + m.harmonyIndex, 0) / next90Days.length,
        summary: this.generatePeriodSummary(next90Days, '90 days'),
      },
      yearCycle: {
        harmonyIndex: yearCycle.reduce((sum, m) => sum + m.harmonyIndex, 0) / yearCycle.length,
        summary: this.generatePeriodSummary(yearCycle, 'year'),
      },
    };
  }

  /**
   * Generate period summary
   */
  private generatePeriodSummary(months: CompatibilityMonth[], period: string): string {
    const avgHarmony = months.reduce((sum, m) => sum + m.harmonyIndex, 0) / months.length;
    const goldMonths = months.filter(m => m.colorCode === 'gold').length;
    const redMonths = months.filter(m => m.colorCode === 'red').length;

    if (avgHarmony >= 0.7) {
      return `The next ${period} show strong harmony. ${goldMonths} highly favorable periods ahead.`;
    } else if (avgHarmony >= 0.5) {
      return `The next ${period} show moderate harmony. ${goldMonths} favorable periods, ${redMonths} requiring attention.`;
    } else {
      return `The next ${period} require conscious effort and communication. Focus on understanding and growth.`;
    }
  }

  /**
   * Helper: Get year cycle from numerology
   */
  private getYearCycle(inputs: CompatibilityInputs): number {
    if (!inputs.user.numerology?.lifePath) {
      return 1;
    }

    const currentYear = new Date().getFullYear();
    const yearSum = currentYear.toString().split('').reduce((sum, digit) => sum + parseInt(digit), 0);
    return ((yearSum - 1) % 9) + 1;
  }
}

