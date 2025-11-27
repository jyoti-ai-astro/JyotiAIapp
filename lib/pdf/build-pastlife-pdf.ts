/**
 * Past Life PDF Builder
 * 
 * Phase 3 — Section 39: PAGES PHASE 24 (F39)
 */

import { PDFEngine } from './pdf-engine';

export interface PastLifePDFData {
  pastLifeRole?: string;
  unresolvedLessons?: string[];
  karmicDebts?: string[];
  repeatingCycles?: string[];
  soulStrength?: number;
}

export async function buildPastLifePDF(data: PastLifePDFData): Promise<Uint8Array> {
  const pdf = await PDFEngine.create();

  // Front cover
  pdf.addPage();
  await pdf.addMandalaWatermark();
  pdf.addHeader('Past Life & Karmic Report', 'Your Soul\'s Journey Across Lifetimes');

  // Past Life Role
  if (data.pastLifeRole) {
    pdf.addSectionTitle('Past Life Role', '👑');
    pdf.addParagraph(`Your Past Life Role: ${data.pastLifeRole}`);
    pdf.addParagraph('This role shapes your current life\'s purpose and talents.');
  }

  // Unresolved Lessons
  if (data.unresolvedLessons && data.unresolvedLessons.length > 0) {
    pdf.addSectionTitle('Unresolved Karmic Lessons', '📜');
    data.unresolvedLessons.forEach((lesson, index) => {
      pdf.addParagraph(`${index + 1}. ${lesson}`);
    });
  }

  // Repeating Cycles
  if (data.repeatingCycles && data.repeatingCycles.length > 0) {
    pdf.addSectionTitle('Repeating Cycles', '🔄');
    data.repeatingCycles.forEach((cycle, index) => {
      pdf.addParagraph(`${index + 1}. ${cycle}`);
    });
  }

  // Soul Strength
  if (data.soulStrength !== undefined) {
    pdf.addSectionTitle('Soul Strength', '💫');
    pdf.addParagraph(`Your Soul Strength: ${data.soulStrength}/5`);
    pdf.addParagraph('This indicates your spiritual resilience and capacity for growth.');
  }

  // Karmic Debts
  if (data.karmicDebts && data.karmicDebts.length > 0) {
    pdf.addSectionTitle('Karmic Debts', '⚖️');
    data.karmicDebts.forEach((debt, index) => {
      pdf.addParagraph(`${index + 1}. ${debt}`);
    });
  }

  return await pdf.generatePDF();
}

