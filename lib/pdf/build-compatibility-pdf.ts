/**
 * Compatibility PDF Builder
 * 
 * Phase 3 — Section 39: PAGES PHASE 24 (F39)
 */

import { PDFEngine } from './pdf-engine';

export interface CompatibilityPDFData {
  type: string;
  rating: number;
  synergyScore: number;
  conflictScore: number;
  strengths?: string[];
  challenges?: string[];
  guidance?: string[];
}

export async function buildCompatibilityPDF(data: CompatibilityPDFData): Promise<Uint8Array> {
  const pdf = await PDFEngine.create();

  // Front cover
  pdf.addPage();
  await pdf.addMandalaWatermark();
  pdf.addHeader(`${data.type.charAt(0).toUpperCase() + data.type.slice(1)} Compatibility Report`, 'Relationship Harmony Analysis');

  // Rating
  pdf.addSectionTitle('Compatibility Rating', '💕');
  pdf.addParagraph(`Overall Rating: ${data.rating}/100`);
  pdf.addParagraph(`Synergy Score: ${(data.synergyScore * 100).toFixed(0)}%`);
  pdf.addParagraph(`Conflict Score: ${(data.conflictScore * 100).toFixed(0)}%`);

  // Strengths
  if (data.strengths && data.strengths.length > 0) {
    pdf.addSectionTitle('Strengths', '✨');
    data.strengths.forEach((strength) => {
      pdf.addParagraph(`• ${strength}`);
    });
  }

  // Challenges
  if (data.challenges && data.challenges.length > 0) {
    pdf.addSectionTitle('Challenges', '⚠️');
    data.challenges.forEach((challenge) => {
      pdf.addParagraph(`• ${challenge}`);
    });
  }

  // Guidance
  if (data.guidance && data.guidance.length > 0) {
    pdf.addSectionTitle('Guidance', '💫');
    data.guidance.forEach((guidance) => {
      pdf.addParagraph(`• ${guidance}`);
    });
  }

  return await pdf.generatePDF();
}

