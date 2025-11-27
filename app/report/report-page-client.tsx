/**
 * Report Page Client Component
 * 
 * Phase 3 — Section 38: PAGES PHASE 23 (F38)
 * 
 * Client-side logic for report rendering
 */

'use client';

import React, { useEffect, useState } from 'react';
import { useGuruContext } from '@/components/guru/GuruContextProvider';
import { ReportContainer } from '@/components/reports/ReportContainer';
import { KundaliReport } from '@/components/reports/KundaliReport';
import { NumerologyReport } from '@/components/reports/NumerologyReport';
import { AuraChakraReport } from '@/components/reports/AuraChakraReport';
import { PastLifeReport } from '@/components/reports/PastLifeReport';
import { PredictionReport } from '@/components/reports/PredictionReport';
import { CompatibilityReport } from '@/components/reports/CompatibilityReport';
import { GuruChatEngine } from '@/lib/guru/GuruChatEngine';

export type ReportType = 'kundali' | 'numerology' | 'aura-chakra' | 'past-life' | 'prediction' | 'compatibility' | 'guru';

export interface ReportPageClientProps {
  reportType: ReportType;
}

export function ReportPageClient({ reportType }: ReportPageClientProps) {
  const { context } = useGuruContext();
  const [chatEngine] = useState(() => new GuruChatEngine());
  const [pdfContextData, setPdfContextData] = useState<any>(null);
  const [pastLife, setPastLife] = useState(null);
  const [timeline, setTimeline] = useState(null);
  const [timelineSummary, setTimelineSummary] = useState(null);
  const [compatibilityReport, setCompatibilityReport] = useState(null);
  const [compatibilityTimeline, setCompatibilityTimeline] = useState(null);

  // Initialize chat engine with context
  useEffect(() => {
    if (context) {
      chatEngine.attachContext(context);
      
      // Get past life analysis
      const pastLifeResult = chatEngine.getPastLifeResult();
      if (pastLifeResult) {
        setPastLife(pastLifeResult);
      }

      // Get prediction timeline
      const predictionTimeline = chatEngine.getPredictions();
      const predictionSummary = chatEngine.getTimelineSummary();
      if (predictionTimeline) {
        setTimeline(predictionTimeline);
      }
      if (predictionSummary) {
        setTimelineSummary(predictionSummary);
      }

      // Get compatibility data
      const compatReport = chatEngine.getCompatibilityReport();
      const compatTimeline = chatEngine.getCompatibilityTimeline();
      if (compatReport) {
        setCompatibilityReport(compatReport);
      }
      if (compatTimeline) {
        setCompatibilityTimeline(compatTimeline);
      }

      // Get PDF context data
      const pdfData = chatEngine.getPDFContext(reportType);
      setPdfContextData(pdfData);
    }
  }, [context, chatEngine, reportType]);

  const getReportTitle = (): string => {
    switch (reportType) {
      case 'kundali':
        return 'Kundali Birth Chart Report';
      case 'numerology':
        return 'Numerology Report';
      case 'aura-chakra':
        return 'Aura & Chakra Report';
      case 'past-life':
        return 'Past Life & Karmic Report';
      case 'prediction':
        return '12-Month Prediction Report';
      case 'compatibility':
        return 'Compatibility Report';
      case 'guru':
        return 'Complete Guru Report';
      default:
        return 'Cosmic Report';
    }
  };

  const getReportSubtitle = (): string => {
    switch (reportType) {
      case 'kundali':
        return 'Your complete Vedic astrology birth chart analysis';
      case 'numerology':
        return 'Deep insights from your numerology numbers';
      case 'aura-chakra':
        return 'Your energy field and chakra analysis';
      case 'past-life':
        return 'Past life roles and karmic patterns';
      case 'prediction':
        return '12-month cosmic forecast';
      case 'compatibility':
        return 'Relationship compatibility analysis';
      case 'guru':
        return 'Your complete spiritual profile';
      default:
        return 'Comprehensive spiritual insights';
    }
  };

  const getReportIcon = (): string => {
    switch (reportType) {
      case 'kundali':
        return '🌌';
      case 'numerology':
        return '🔢';
      case 'aura-chakra':
        return '🌈';
      case 'past-life':
        return '👑';
      case 'prediction':
        return '🌟';
      case 'compatibility':
        return '💕';
      case 'guru':
        return '🕉️';
      default:
        return '✨';
    }
  };

  const handleDownload = () => {
    // Placeholder for PDF generation (Phase 24 - F39)
    console.log('Download PDF - Coming in Phase 24');
  };

  const renderReportContent = () => {
    switch (reportType) {
      case 'kundali':
        return <KundaliReport kundali={context?.kundali} />;
      case 'numerology':
        return <NumerologyReport numerology={context?.numerology} />;
      case 'aura-chakra':
        return <AuraChakraReport aura={context?.aura} />;
      case 'past-life':
        return <PastLifeReport pastLife={pastLife} />;
      case 'prediction':
        return <PredictionReport timeline={timeline} summary={timelineSummary} />;
      case 'compatibility':
        return (
          <CompatibilityReport
            reports={compatibilityReport ? { [compatibilityReport.type]: compatibilityReport } : undefined}
            timeline={compatibilityTimeline}
          />
        );
      case 'guru':
        return (
          <div className="space-y-8">
            <KundaliReport kundali={context?.kundali} />
            <NumerologyReport numerology={context?.numerology} />
            <AuraChakraReport aura={context?.aura} />
            <PastLifeReport pastLife={pastLife} />
            <PredictionReport timeline={timeline} summary={timelineSummary} />
            {compatibilityReport && (
              <CompatibilityReport
                reports={{ [compatibilityReport.type]: compatibilityReport }}
                timeline={compatibilityTimeline}
              />
            )}
          </div>
        );
      default:
        return <div className="text-center py-16 text-white/60">Invalid report type</div>;
    }
  };

  return (
    <ReportContainer
      title={getReportTitle()}
      subtitle={getReportSubtitle()}
      icon={getReportIcon()}
      reportType={reportType}
      onDownload={handleDownload}
      pdfContextData={pdfContextData}
    >
      {renderReportContent()}
    </ReportContainer>
  );
}

