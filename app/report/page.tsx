/**
 * Report Page
 * 
 * Phase 3 — Section 38: PAGES PHASE 23 (F38)
 * 
 * Server component for report generation
 */

import { Metadata } from 'next';
import { ReportPageClient } from './report-page-client';

export const metadata: Metadata = {
  title: 'Cosmic Reports | Jyoti.ai',
  description: 'Comprehensive spiritual reports: Kundali, Numerology, Aura Chakra, Past Life, Predictions, and Compatibility',
};

export default function ReportPage({
  searchParams,
}: {
  searchParams: { type?: string };
}) {
  const reportType = searchParams.type || 'guru';

  return <ReportPageClient reportType={reportType as any} />;
}

