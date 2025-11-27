/**
 * Compatibility Report Component
 * 
 * Phase 3 — Section 38: PAGES PHASE 23 (F38)
 * 
 * Displays compatibility analysis report
 */

'use client';

import React from 'react';
import { ReportSection } from './ReportSection';
import { CompatibilityPanel } from '@/components/guru/CompatibilityPanel';
import { CompatibilityTimeline } from '@/components/guru/CompatibilityTimeline';
import { CompatibilityReport as CompatibilityReportType, CompatibilityType } from '@/lib/guru/compatibility-engine';
import { CompatibilityMonth } from '@/lib/guru/compatibility-timeline';

export interface CompatibilityReportProps {
  reports?: {
    love?: CompatibilityReportType;
    marriage?: CompatibilityReportType;
    friendship?: CompatibilityReportType;
    career?: CompatibilityReportType;
  };
  timeline?: CompatibilityMonth[] | null;
}

export function CompatibilityReport({ reports, timeline }: CompatibilityReportProps) {
  if (!reports || Object.keys(reports).length === 0) {
    return (
      <div className="text-center py-16 text-white/60">
        No Compatibility data available. Please generate compatibility analysis first.
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Love Compatibility */}
      {reports.love && (
        <ReportSection
          title="Love Compatibility"
          subtitle="Romantic relationship harmony"
          icon="💕"
        >
          <CompatibilityPanel report={reports.love} />
        </ReportSection>
      )}

      {/* Marriage Compatibility */}
      {reports.marriage && (
        <ReportSection
          title="Marriage Compatibility"
          subtitle="Long-term partnership potential"
          icon="💍"
        >
          <CompatibilityPanel report={reports.marriage} />
        </ReportSection>
      )}

      {/* Friendship Compatibility */}
      {reports.friendship && (
        <ReportSection
          title="Friendship Compatibility"
          subtitle="Platonic relationship harmony"
          icon="🤝"
        >
          <CompatibilityPanel report={reports.friendship} />
        </ReportSection>
      )}

      {/* Career Compatibility */}
      {reports.career && (
        <ReportSection
          title="Career Compatibility"
          subtitle="Professional partnership potential"
          icon="💼"
        >
          <CompatibilityPanel report={reports.career} />
        </ReportSection>
      )}

      {/* Compatibility Timeline */}
      {timeline && timeline.length > 0 && (
        <ReportSection
          title="Compatibility Timeline"
          subtitle="12-month relationship forecast"
          icon="📈"
        >
          <CompatibilityTimeline timeline={timeline} />
        </ReportSection>
      )}
    </div>
  );
}

