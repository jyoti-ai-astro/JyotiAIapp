/**
 * Prediction PDF Builder
 * 
 * Phase 3 — Section 39: PAGES PHASE 24 (F39)
 */

import { PDFEngine } from './pdf-engine';

export interface PredictionPDFData {
  next30Days?: { summary: string; overallEnergy: number };
  next90Days?: { summary: string; overallEnergy: number };
  yearCycle?: { summary: string; overallEnergy: number };
  timeline?: Array<{ month: string; overallEnergy: number; colorCode: string }>;
}

export async function buildPredictionPDF(data: PredictionPDFData): Promise<Uint8Array> {
  const pdf = await PDFEngine.create();

  // Front cover
  pdf.addPage();
  await pdf.addMandalaWatermark();
  pdf.addHeader('12-Month Prediction Report', 'Your Cosmic Forecast');

  // Next 30 Days
  if (data.next30Days) {
    pdf.addSectionTitle('Next 30 Days', '📅');
    pdf.addParagraph(data.next30Days.summary);
    pdf.addParagraph(`Overall Energy: ${data.next30Days.overallEnergy.toFixed(1)}/10`);
  }

  // Next 90 Days
  if (data.next90Days) {
    pdf.addSectionTitle('Next 90 Days', '📆');
    pdf.addParagraph(data.next90Days.summary);
    pdf.addParagraph(`Overall Energy: ${data.next90Days.overallEnergy.toFixed(1)}/10`);
  }

  // Timeline
  if (data.timeline && data.timeline.length > 0) {
    pdf.addSectionTitle('12-Month Timeline', '🌟');
    const timelineData = data.timeline.map(month => ({
      month: month.month,
      energy: month.overallEnergy,
      color: month.colorCode,
    }));
    pdf.addTimelineGrid(timelineData);
  }

  return await pdf.generatePDF();
}

