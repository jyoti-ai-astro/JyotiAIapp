/**
 * Report Engine Index
 * 
 * Mega Build 3 - Report Engine + PDF Generator
 * High-level functions for generating PDF reports
 */

import { adminDb } from '@/lib/firebase/admin'
import { buildAstroContext } from '@/lib/engines/astro-context-builder'
import { runPredictionEngine } from '@/lib/engines/prediction-engine-v2'
import { runTimelineEngine } from '@/lib/engines/timeline-engine-v2'
import { generateKundaliReportDoc } from './kundali-report'
import { generatePredictionsReportDoc } from './predictions-report'
import { generateTimelineReportDoc } from './timeline-report'
import { createPdfStream, buildFileName } from './pdf-utils'

/**
 * Generate Kundali Report PDF
 */
export async function generateKundaliReportPdf(
  userId: string
): Promise<{ buffer: Buffer; fileName: string }> {
  if (!adminDb) {
    throw new Error('Firestore not initialized')
  }

  // Fetch user profile
  const userRef = adminDb.collection('users').doc(userId)
  const userSnap = await userRef.get()

  if (!userSnap.exists) {
    throw new Error('NO_USER')
  }

  const userData = userSnap.data()
  const userName = userData?.name || undefined

  // Fetch canonical AstroContext
  const astroContext = await buildAstroContext(userId)

  if (!astroContext) {
    throw new Error('NO_ASTRO_CONTEXT')
  }

  // Generate document
  const doc = generateKundaliReportDoc({
    user: {
      name: userName,
      email: userData?.email,
    },
    astroContext,
  })

  // Convert to PDF buffer
  const buffer = await createPdfStream(doc)

  // Build file name
  const fileName = buildFileName('kundali', userName)

  return { buffer, fileName }
}

/**
 * Generate Predictions Report PDF
 */
export async function generatePredictionsReportPdf(
  userId: string
): Promise<{ buffer: Buffer; fileName: string }> {
  if (!adminDb) {
    throw new Error('Firestore not initialized')
  }

  // Fetch user profile
  const userRef = adminDb.collection('users').doc(userId)
  const userSnap = await userRef.get()

  if (!userSnap.exists) {
    throw new Error('NO_USER')
  }

  const userData = userSnap.data()
  const userName = userData?.name || undefined

  // Fetch canonical AstroContext
  const astroContext = await buildAstroContext(userId)

  // Run Prediction Engine
  const predictionResult = await runPredictionEngine({
    astroContext,
    userQuestion: null,
    ragMode: 'light',
  })

  if (
    predictionResult.status === 'error' ||
    !predictionResult.usedAstroContext ||
    predictionResult.sections.length === 0
  ) {
    throw new Error('PREDICTION_REPORT_GENERATION_FAILED')
  }

  // Generate document
  const doc = generatePredictionsReportDoc({
    user: {
      name: userName,
      email: userData?.email,
    },
    astroContext,
    predictionResult,
  })

  // Convert to PDF buffer
  const buffer = await createPdfStream(doc)

  // Build file name
  const fileName = buildFileName('predictions', userName)

  return { buffer, fileName }
}

/**
 * Generate Timeline Report PDF
 */
export async function generateTimelineReportPdf(
  userId: string
): Promise<{ buffer: Buffer; fileName: string }> {
  if (!adminDb) {
    throw new Error('Firestore not initialized')
  }

  // Fetch user profile
  const userRef = adminDb.collection('users').doc(userId)
  const userSnap = await userRef.get()

  if (!userSnap.exists) {
    throw new Error('NO_USER')
  }

  const userData = userSnap.data()
  const userName = userData?.name || undefined

  // Fetch canonical AstroContext
  const astroContext = await buildAstroContext(userId)

  // Run Timeline Engine
  const timelineResult = await runTimelineEngine({
    astroContext,
    startDate: new Date(),
    months: 12,
    ragMode: 'light',
  })

  if (
    timelineResult.status === 'error' ||
    !timelineResult.usedAstroContext ||
    timelineResult.events.length === 0
  ) {
    throw new Error('TIMELINE_REPORT_GENERATION_FAILED')
  }

  // Generate document
  const doc = generateTimelineReportDoc({
    user: {
      name: userName,
      email: userData?.email,
    },
    astroContext,
    timelineResult,
  })

  // Convert to PDF buffer
  const buffer = await createPdfStream(doc)

  // Build file name
  const fileName = buildFileName('timeline', userName)

  return { buffer, fileName }
}
