/**
 * PDF Service
 * Part B - Section 6: Reports Engine
 * Milestone 6 - Step 4
 * 
 * Generates PDF from HTML content
 */

import { getStorage } from 'firebase-admin/storage'
import { adminDb } from '@/lib/firebase/admin'
import { reportToHTML, type StructuredReport } from '@/lib/engines/reports/report-generator'

// Using html-pdf-node for server-side PDF generation
// F48: Emitter dependency fixed via webpack alias in next.config.js
let htmlPdfNode: any = null

try {
  htmlPdfNode = require('html-pdf-node')
} catch (e) {
  console.warn('html-pdf-node not installed. PDF generation will use fallback.')
}

/**
 * Generate PDF from structured report
 */
export async function generatePDF(
  report: StructuredReport,
  userName: string,
  userId: string,
  reportId: string
): Promise<string> {
  // Convert report to HTML
  const html = reportToHTML(report, userName)
  
  // Generate PDF
  const pdfBuffer = await htmlToPDF(html)
  
  // Upload to Firebase Storage (Admin SDK)
  const storage = getStorage()
  const bucket = storage.bucket()
  const storagePath = `reports/${userId}/${reportId}.pdf`
  const file = bucket.file(storagePath)
  
  await file.save(pdfBuffer, {
    contentType: 'application/pdf',
    metadata: {
      contentType: 'application/pdf',
    },
  })
  
  // Make file publicly accessible
  await file.makePublic()
  
  // Get download URL
  const downloadUrl = `https://storage.googleapis.com/${bucket.name}/${storagePath}`
  
  return downloadUrl
}

/**
 * Convert HTML to PDF buffer
 */
async function htmlToPDF(html: string): Promise<Buffer> {
  if (htmlPdfNode) {
    // Use html-pdf-node
    const options = {
      format: 'A4',
      border: {
        top: '20mm',
        right: '15mm',
        bottom: '20mm',
        left: '15mm',
      },
      header: {
        height: '20mm',
        contents: '<div style="text-align: center; color: #8B4513;">Jyoti.ai</div>',
      },
      footer: {
        height: '20mm',
        contents: {
          first: '',
          2: 'Second page',
          default: '<span style="color: #666;">{{page}}</span>/<span>{{pages}}</span>',
          last: '',
        },
      },
    }
    
    const file = { content: html }
    const pdfBuffer = await new Promise<Buffer>((resolve, reject) => {
      htmlPdfNode.generatePdf(file, options, (err: Error, buffer: Buffer) => {
        if (err) reject(err)
        else resolve(buffer)
      })
    })
    
    return pdfBuffer
  } else {
    // Fallback: Return HTML as text (for development)
    // In production, ensure html-pdf-node is installed
    console.warn('PDF generation library not available. Returning HTML as fallback.')
    return Buffer.from(html, 'utf-8')
  }
}

/**
 * Generate PDF from HTML string (alternative method)
 */
export async function generatePDFFromHTML(
  html: string,
  userId: string,
  reportId: string
): Promise<string> {
  const pdfBuffer = await htmlToPDF(html)
  
  const storage = getStorage()
  const bucket = storage.bucket()
  const storagePath = `reports/${userId}/${reportId}.pdf`
  const file = bucket.file(storagePath)
  
  await file.save(pdfBuffer, {
    contentType: 'application/pdf',
    metadata: {
      contentType: 'application/pdf',
    },
  })
  
  await file.makePublic()
  const downloadUrl = `https://storage.googleapis.com/${bucket.name}/${storagePath}`
  
  return downloadUrl
}
