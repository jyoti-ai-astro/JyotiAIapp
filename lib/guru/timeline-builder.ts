/**
 * Timeline Builder
 * 
 * Phase 3 — Section 36: PAGES PHASE 21 (F36)
 * 
 * Builds 12-month prediction timeline with color coding
 */

import { PredictionEngine, Prediction, PredictionInputs, PredictionCategory } from './prediction-engine';

export interface TimelineMonth {
  month: number; // 1-12
  monthName: string;
  predictions: Prediction[];
  overallEnergy: number; // 0-10
  colorCode: 'gold' | 'violet' | 'red';
  summary: string;
}

export interface TimelineSummary {
  next30Days: {
    predictions: Prediction[];
    overallEnergy: number;
    summary: string;
  };
  next90Days: {
    predictions: Prediction[];
    overallEnergy: number;
    summary: string;
  };
  yearCycle: {
    predictions: Prediction[];
    overallEnergy: number;
    summary: string;
  };
}

export class TimelineBuilder {
  private predictionEngine: PredictionEngine;

  constructor() {
    this.predictionEngine = new PredictionEngine();
  }

  /**
   * Build 12-month timeline
   */
  buildTimeline(inputs: PredictionInputs): TimelineMonth[] {
    const categories: PredictionCategory[] = ['career', 'money', 'love', 'health', 'spiritual'];
    const timeline: TimelineMonth[] = [];
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                       'July', 'August', 'September', 'October', 'November', 'December'];

    for (let month = 1; month <= 12; month++) {
      const monthPredictions: Prediction[] = [];

      // Generate predictions for each category
      categories.forEach(category => {
        const prediction = this.predictionEngine.generateCategoryPrediction(
          category,
          month,
          inputs
        );
        monthPredictions.push(prediction);
      });

      // Calculate overall energy (average of all predictions)
      const overallEnergy = monthPredictions.reduce((sum, p) => sum + p.energyScore, 0) / monthPredictions.length;

      // Determine color code
      const colorCode: 'gold' | 'violet' | 'red' = 
        overallEnergy >= 7 ? 'gold' :
        overallEnergy >= 4 ? 'violet' : 'red';

      // Generate summary
      const summary = this.generateMonthSummary(monthPredictions, overallEnergy);

      timeline.push({
        month,
        monthName: monthNames[(new Date().getMonth() + month - 1) % 12],
        predictions: monthPredictions,
        overallEnergy: Math.round(overallEnergy * 10) / 10,
        colorCode,
        summary,
      });
    }

    return timeline;
  }

  /**
   * Generate summary for next 30, 90 days, and year cycle
   */
  generateSummary(timeline: TimelineMonth[]): TimelineSummary {
    const next30Days = timeline.slice(0, 1); // First month
    const next90Days = timeline.slice(0, 3); // First 3 months
    const yearCycle = timeline; // All 12 months

    return {
      next30Days: {
        predictions: next30Days.flatMap(m => m.predictions),
        overallEnergy: next30Days.reduce((sum, m) => sum + m.overallEnergy, 0) / next30Days.length,
        summary: this.generatePeriodSummary(next30Days, '30 days'),
      },
      next90Days: {
        predictions: next90Days.flatMap(m => m.predictions),
        overallEnergy: next90Days.reduce((sum, m) => sum + m.overallEnergy, 0) / next90Days.length,
        summary: this.generatePeriodSummary(next90Days, '90 days'),
      },
      yearCycle: {
        predictions: yearCycle.flatMap(m => m.predictions),
        overallEnergy: yearCycle.reduce((sum, m) => sum + m.overallEnergy, 0) / yearCycle.length,
        summary: this.generatePeriodSummary(yearCycle, 'year'),
      },
    };
  }

  /**
   * Generate month summary
   */
  private generateMonthSummary(predictions: Prediction[], overallEnergy: number): string {
    const highEnergyCount = predictions.filter(p => p.energyScore >= 7).length;
    const categories = predictions.map(p => p.category).join(', ');

    if (overallEnergy >= 7) {
      return `High cosmic energy across ${categories}. Favorable period for growth and manifestation.`;
    } else if (overallEnergy >= 4) {
      return `Moderate cosmic energy. Focus on balance and patience. ${highEnergyCount} areas show strong potential.`;
    } else {
      return `Lower cosmic energy. Time for reflection and inner work. Trust the divine timing.`;
    }
  }

  /**
   * Generate period summary
   */
  private generatePeriodSummary(months: TimelineMonth[], period: string): string {
    const avgEnergy = months.reduce((sum, m) => sum + m.overallEnergy, 0) / months.length;
    const goldMonths = months.filter(m => m.colorCode === 'gold').length;
    const redMonths = months.filter(m => m.colorCode === 'red').length;

    if (avgEnergy >= 7) {
      return `The next ${period} show strong cosmic alignment. ${goldMonths} highly favorable periods ahead.`;
    } else if (avgEnergy >= 4) {
      return `The next ${period} show moderate cosmic energy. ${goldMonths} favorable periods, ${redMonths} requiring caution.`;
    } else {
      return `The next ${period} require patience and inner work. Focus on spiritual growth and karmic healing.`;
    }
  }
}

