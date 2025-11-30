/**
 * Send Report Email
 * 
 * Mega Build 3 - Report Engine + PDF Generator
 * Helper for sending report PDFs via email
 */

import { sendEmail } from './email-service'

interface SendReportEmailParams {
  to: string
  subject: string
  htmlBody: string
  pdfBuffer: Buffer
  fileName: string
}

/**
 * Send report email with PDF attachment
 */
export async function sendReportEmail({
  to,
  subject,
  htmlBody,
  pdfBuffer,
  fileName,
}: SendReportEmailParams): Promise<boolean> {
  try {
    // Convert buffer to base64 for email attachment
    const base64Content = pdfBuffer.toString('base64')

    return await sendEmail({
      to,
      subject,
      htmlBody,
      category: 'report',
      attachments: [
        {
          filename: fileName,
          content: base64Content,
          contentType: 'application/pdf',
        },
      ],
    })
  } catch (error) {
    console.error('Error sending report email:', error)
    return false
  }
}

