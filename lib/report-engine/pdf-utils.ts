/**
 * PDF Utilities
 * 
 * Mega Build 3 - Report Engine + PDF Generator
 * Shared utilities for PDF generation
 */

import { pdf } from '@react-pdf/renderer'
import type { ReactElement } from 'react'

/**
 * Create PDF stream from React-PDF document
 */
export async function createPdfStream(doc: ReactElement): Promise<Buffer> {
  try {
    // Use pdf() to create PDF instance, then convert to buffer
    const pdfInstance = pdf(doc)
    const buffer = await pdfInstance.toBuffer()
    return Buffer.from(buffer)
  } catch (error) {
    console.error('Error creating PDF stream:', error)
    throw new Error('Failed to generate PDF')
  }
}

/**
 * Build file name for report
 */
export function buildFileName(
  type: 'kundali' | 'predictions' | 'timeline',
  userName?: string,
  date?: Date
): string {
  const dateStr = (date || new Date()).toISOString().split('T')[0]
  const userStr = userName ? `_${userName.replace(/[^a-zA-Z0-9]/g, '_')}` : ''
  
  const typeMap = {
    kundali: 'Kundali-Report',
    predictions: '12-Month-Predictions',
    timeline: '12-Month-Timeline',
  }
  
  return `${typeMap[type]}${userStr}_${dateStr}.pdf`
}

/**
 * Format date for report display
 */
export function formatDateForReport(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

/**
 * Format date-time for report display
 */
export function formatDateTimeForReport(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

