/**
 * Prediction Report Component
 * 
 * Phase 3 — Section 38: PAGES PHASE 23 (F38)
 * 
 * Displays 12-month prediction timeline report
 */

'use client';

import React from 'react';
import { ReportSection } from './ReportSection';
import { PredictionTimeline } from '@/components/guru/PredictionTimeline';
import { TimelineMonth, TimelineSummary } from '@/lib/guru/timeline-builder';

export interface PredictionReportProps {
  timeline?: TimelineMonth[] | null;
  summary?: TimelineSummary | null;
}

export function PredictionReport({ timeline, summary }: PredictionReportProps) {
  if (!timeline || !summary) {
    return (
      <div className="text-center py-16 text-white/60">
        No Prediction data available. Please generate your predictions first.
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Next 30-day Summary */}
      <ReportSection
        title="Next 30 Days"
        subtitle="Short-term cosmic insights"
        icon="📅"
      >
        <div className="bg-white/5 rounded-lg p-6 border border-gold/20">
          <p className="text-white/80 mb-4 leading-relaxed">
            {summary.next30Days.summary}
          </p>
          <div className="flex items-center gap-2">
            <span className="text-gold font-heading">Overall Energy:</span>
            <span className="text-white">{summary.next30Days.overallEnergy.toFixed(1)}/10</span>
          </div>
        </div>
      </ReportSection>

      {/* Next 90-day Summary */}
      <ReportSection
        title="Next 90 Days"
        subtitle="Quarterly cosmic forecast"
        icon="📆"
      >
        <div className="bg-white/5 rounded-lg p-6 border border-gold/20">
          <p className="text-white/80 mb-4 leading-relaxed">
            {summary.next90Days.summary}
          </p>
          <div className="flex items-center gap-2">
            <span className="text-gold font-heading">Overall Energy:</span>
            <span className="text-white">{summary.next90Days.overallEnergy.toFixed(1)}/10</span>
          </div>
        </div>
      </ReportSection>

      {/* Full 12-Month Timeline */}
      <ReportSection
        title="12-Month Timeline"
        subtitle="Complete cosmic forecast for the year"
        icon="🌟"
      >
        <PredictionTimeline timeline={timeline} />
      </ReportSection>

      {/* Per-category Predictions */}
      <ReportSection
        title="Category Breakdown"
        subtitle="Detailed predictions by life area"
        icon="📊"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {['career', 'money', 'love', 'health', 'spiritual'].map((category) => {
            const categoryPredictions = timeline
              .flatMap(month => month.predictions)
              .filter(p => p.category === category)
              .slice(0, 3);

            if (categoryPredictions.length === 0) return null;

            const avgProbability = categoryPredictions.reduce((sum, p) => sum + p.probability, 0) / categoryPredictions.length;

            return (
              <div
                key={category}
                className="bg-white/5 rounded-lg p-4 border border-white/10"
              >
                <h4 className="text-gold font-heading mb-2 capitalize">{category}</h4>
                <div className="mb-2">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-white/60">Average Potential</span>
                    <span className="text-xs text-gold">
                      {Math.round(avgProbability * 100)}%
                    </span>
                  </div>
                  <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gold"
                      style={{ width: `${avgProbability * 100}%` }}
                    />
                  </div>
                </div>
                <p className="text-white/70 text-xs">
                  {categoryPredictions[0]?.prediction.substring(0, 80)}...
                </p>
              </div>
            );
          })}
        </div>
      </ReportSection>
    </div>
  );
}

