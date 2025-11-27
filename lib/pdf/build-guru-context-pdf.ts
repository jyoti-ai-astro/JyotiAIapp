/**
 * Complete Guru Context PDF Builder
 * 
 * Phase 3 — Section 39: PAGES PHASE 24 (F39)
 */

import { PDFEngine } from './pdf-engine';
import { buildKundaliPDF, KundaliPDFData } from './build-kundali-pdf';
import { buildNumerologyPDF, NumerologyPDFData } from './build-numerology-pdf';
import { buildAuraPDF, AuraChakraPDFData } from './build-aura-pdf';
import { buildPastLifePDF, PastLifePDFData } from './build-pastlife-pdf';
import { buildPredictionPDF, PredictionPDFData } from './build-prediction-pdf';
import { buildCompatibilityPDF, CompatibilityPDFData } from './build-compatibility-pdf';
import { PDFDocument } from 'pdf-lib';

export interface GuruContextPDFData {
  kundali?: KundaliPDFData;
  numerology?: NumerologyPDFData;
  aura?: AuraChakraPDFData;
  pastLife?: PastLifePDFData;
  prediction?: PredictionPDFData;
  compatibility?: CompatibilityPDFData;
}

export async function buildGuruContextPDF(data: GuruContextPDFData): Promise<Uint8Array> {
  // Create main PDF
  const mainPDF = await PDFEngine.create();
  mainPDF.addPage();
  await mainPDF.addMandalaWatermark();
  mainPDF.addHeader('Complete Guru Report', 'Your Comprehensive Spiritual Profile');
  mainPDF.addParagraph('This report contains all aspects of your spiritual analysis.');

  // Merge all sub-reports
  const mergedPDF = await PDFDocument.create();
  
  // Add main cover
  const mainBytes = await mainPDF.generatePDF();
  const mainDoc = await PDFDocument.load(mainBytes);
  const mainPages = await mergedPDF.copyPages(mainDoc, mainDoc.getPageIndices());
  mainPages.forEach((page) => mergedPDF.addPage(page));

  // Add Kundali report
  if (data.kundali) {
    const kundaliBytes = await buildKundaliPDF(data.kundali);
    const kundaliDoc = await PDFDocument.load(kundaliBytes);
    const kundaliPages = await mergedPDF.copyPages(kundaliDoc, kundaliDoc.getPageIndices());
    kundaliPages.forEach((page) => mergedPDF.addPage(page));
  }

  // Add Numerology report
  if (data.numerology) {
    const numerologyBytes = await buildNumerologyPDF(data.numerology);
    const numerologyDoc = await PDFDocument.load(numerologyBytes);
    const numerologyPages = await mergedPDF.copyPages(numerologyDoc, numerologyDoc.getPageIndices());
    numerologyPages.forEach((page) => mergedPDF.addPage(page));
  }

  // Add Aura report
  if (data.aura) {
    const auraBytes = await buildAuraPDF(data.aura);
    const auraDoc = await PDFDocument.load(auraBytes);
    const auraPages = await mergedPDF.copyPages(auraDoc, auraDoc.getPageIndices());
    auraPages.forEach((page) => mergedPDF.addPage(page));
  }

  // Add Past Life report
  if (data.pastLife) {
    const pastLifeBytes = await buildPastLifePDF(data.pastLife);
    const pastLifeDoc = await PDFDocument.load(pastLifeBytes);
    const pastLifePages = await mergedPDF.copyPages(pastLifeDoc, pastLifeDoc.getPageIndices());
    pastLifePages.forEach((page) => mergedPDF.addPage(page));
  }

  // Add Prediction report
  if (data.prediction) {
    const predictionBytes = await buildPredictionPDF(data.prediction);
    const predictionDoc = await PDFDocument.load(predictionBytes);
    const predictionPages = await mergedPDF.copyPages(predictionDoc, predictionDoc.getPageIndices());
    predictionPages.forEach((page) => mergedPDF.addPage(page));
  }

  // Add Compatibility report
  if (data.compatibility) {
    const compatibilityBytes = await buildCompatibilityPDF(data.compatibility);
    const compatibilityDoc = await PDFDocument.load(compatibilityBytes);
    const compatibilityPages = await mergedPDF.copyPages(compatibilityDoc, compatibilityDoc.getPageIndices());
    compatibilityPages.forEach((page) => mergedPDF.addPage(page));
  }

  // Add back cover
  const backPage = mergedPDF.addPage();
  const font = await mergedPDF.embedFont('Helvetica');
  backPage.drawText('Guided by Ancient Wisdom + AI', {
    x: 297.5 - 100,
    y: 421,
    size: 20,
    font: font,
  });

  return await mergedPDF.save();
}

