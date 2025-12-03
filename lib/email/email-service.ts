/**
 * ZeptoMail Email Service
 * Part C - Chunk 16: ZeptoMail Email Delivery Module
 */

// Phase 31 - F46: Use validated environment variables
import { adminDb } from '@/lib/firebase/admin'
import { envVars } from '@/lib/env/env.mjs'

// Get ZeptoMail config (may be undefined if not configured)
const getZeptoConfig = () => {
  return {
    apiKey: envVars.zepto.apiKey,
    domain: envVars.zepto.domain,
    from: envVars.zepto.from,
    apiUrl: 'https://api.zeptomail.com/v1.1/email',
  }
}

interface EmailOptions {
  to: string
  subject: string
  htmlBody: string
  category: 'login' | 'payment' | 'report' | 'alert' | 'festival' | 'security' | 'admin'
  replyTo?: string
  attachments?: Array<{
    filename: string
    content: string
    contentType: string
  }>
}

interface EmailLog {
  emailId: string
  email: string
  category: string
  timestamp: Date
  status: 'sent' | 'failed' | 'queued'
  retries: number
  errorMessage?: string
}

/**
 * Send email via ZeptoMail API
 */
async function sendViaZeptoMail(options: EmailOptions): Promise<boolean> {
  try {
    const zeptoConfig = getZeptoConfig()
    
    // Check if ZeptoMail is configured
    if (!zeptoConfig.apiKey) {
      console.error('ZeptoMail API key not configured. Please set ZEPTO_API_KEY environment variable in Vercel.')
      throw new Error('Email service not configured. Please contact support.')
    }

    const zeptoConfig = getZeptoConfig()
    
    const response = await fetch(zeptoConfig.apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Zoho-enczapikey ${zeptoConfig.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: {
          address: zeptoConfig.from,
          name: 'Jyoti.ai',
        },
        to: [
          {
            email_address: {
              address: options.to,
            },
          },
        ],
        subject: options.subject,
        htmlbody: options.htmlBody,
        reply_to: options.replyTo ? [{ address: options.replyTo }] : undefined,
        attachments: options.attachments,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`ZeptoMail API error: ${response.status} - ${errorText}`)
    }

    return true
  } catch (error) {
    console.error('ZeptoMail send error:', error)
    throw error
  }
}

/**
 * Log email to Firestore
 */
async function logEmail(options: EmailOptions, status: 'sent' | 'failed', errorMessage?: string): Promise<void> {
  if (!adminDb) {
    console.warn('Firestore not initialized, skipping email log')
    return
  }

  try {
    const logId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    const log: EmailLog = {
      emailId: logId,
      email: options.to,
      category: options.category,
      timestamp: new Date(),
      status,
      retries: 0,
      errorMessage,
    }

    await adminDb.collection('email_logs').doc(logId).set(log)
  } catch (error) {
    console.error('Failed to log email:', error)
  }
}

/**
 * Queue email for retry
 */
async function queueEmailForRetry(options: EmailOptions, errorMessage: string): Promise<void> {
  if (!adminDb) {
    return
  }

  try {
    const queueId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    await adminDb.collection('email_queue').doc(queueId).set({
      ...options,
      errorMessage,
      retries: 0,
      createdAt: new Date(),
      nextRetryAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
    })
  } catch (error) {
    console.error('Failed to queue email:', error)
  }
}

/**
 * Main email sending function with retry logic
 */
export async function sendEmail(options: EmailOptions): Promise<boolean> {
  try {
    const success = await sendViaZeptoMail(options)
    await logEmail(options, 'sent')
    return success
  } catch (error: any) {
    await logEmail(options, 'failed', error.message)
    await queueEmailForRetry(options, error.message)
    return false
  }
}

/**
 * Send magic link email for authentication
 */
export async function sendMagicLink(email: string, loginUrl: string, device?: string): Promise<boolean> {
  const subject = 'Sign in to Jyoti.ai'
  const htmlBody = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #0D0A33 0%, #5A3FEF 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="color: #fff; margin: 0; font-size: 28px;">Jyoti.ai</h1>
        <p style="color: #fff; margin: 10px 0 0 0; opacity: 0.9;">Your Spiritual Operating System</p>
      </div>
      <div style="background: #fff; padding: 30px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 10px 10px;">
        <h2 style="color: #0D0A33; margin-top: 0;">Sign in to your account</h2>
        <p>Click the button below to securely sign in to your Jyoti.ai account:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${loginUrl}" style="background: #5A3FEF; color: #fff; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">Sign In</a>
        </div>
        <p style="color: #666; font-size: 14px;">Or copy and paste this link into your browser:</p>
        <p style="color: #5A3FEF; font-size: 12px; word-break: break-all;">${loginUrl}</p>
        <p style="color: #666; font-size: 14px; margin-top: 30px;">
          This link will expire in 1 hour. If you didn't request this, please ignore this email.
        </p>
        ${device ? `<p style="color: #666; font-size: 12px;">Device: ${device}</p>` : ''}
      </div>
      <div style="text-align: center; margin-top: 20px; color: #999; font-size: 12px;">
        <p>© ${new Date().getFullYear()} Jyoti.ai. All rights reserved.</p>
      </div>
    </body>
    </html>
  `

  return sendEmail({
    to: email,
    subject,
    htmlBody,
    category: 'login',
  })
}

/**
 * Send payment receipt email
 */
export async function sendPaymentReceipt(
  email: string,
  amount: number,
  transactionId: string,
  planName?: string,
  expiryDate?: Date
): Promise<boolean> {
  const subject = 'Payment Confirmation - Jyoti.ai'
  const htmlBody = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #0D0A33 0%, #5A3FEF 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="color: #fff; margin: 0; font-size: 28px;">Payment Successful</h1>
      </div>
      <div style="background: #fff; padding: 30px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 10px 10px;">
        <p>Thank you for your payment!</p>
        <div style="background: #f5f5f5; padding: 20px; border-radius: 5px; margin: 20px 0;">
          <p style="margin: 5px 0;"><strong>Amount:</strong> ₹${amount}</p>
          ${planName ? `<p style="margin: 5px 0;"><strong>Plan:</strong> ${planName}</p>` : ''}
          <p style="margin: 5px 0;"><strong>Transaction ID:</strong> ${transactionId}</p>
          ${expiryDate ? `<p style="margin: 5px 0;"><strong>Expires:</strong> ${expiryDate.toLocaleDateString()}</p>` : ''}
        </div>
        <p>Your subscription is now active. Enjoy unlimited access to Jyoti.ai!</p>
      </div>
    </body>
    </html>
  `

  return sendEmail({
    to: email,
    subject,
    htmlBody,
    category: 'payment',
  })
}

/**
 * Send prediction report email
 */
export async function sendPredictionReport(email: string, reportUrl: string, reportType: string): Promise<boolean> {
  const subject = `Your ${reportType} Report is Ready - Jyoti.ai`
  const htmlBody = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background: #f5f5f5;">
      <div style="background: linear-gradient(135deg, #0D0A33 0%, #5A3FEF 100%); padding: 40px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="color: #fff; margin: 0; font-size: 28px; font-weight: 600;">📊 Your Report is Ready</h1>
        <p style="color: #fff; margin: 10px 0 0 0; opacity: 0.9;">${reportType}</p>
      </div>
      <div style="background: #fff; padding: 40px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 10px 10px;">
        <p style="font-size: 16px; margin-bottom: 20px;">Dear Seeker,</p>
        <p style="font-size: 16px; margin-bottom: 20px;">Your personalized ${reportType} report has been generated and is ready for download.</p>
        <div style="text-align: center; margin: 40px 0;">
          <a href="${reportUrl}" style="background: #5A3FEF; color: #fff; padding: 14px 35px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600; font-size: 16px; box-shadow: 0 4px 6px rgba(90, 63, 239, 0.3);">Download Report</a>
        </div>
        <div style="background: #f9f9f9; padding: 20px; border-radius: 6px; margin-top: 30px;">
          <p style="margin: 0; font-size: 14px; color: #666;"><strong>Note:</strong> This download link will remain valid for 30 days.</p>
        </div>
        <p style="font-size: 14px; color: #666; margin-top: 30px;">If you have any questions, feel free to reach out to our support team.</p>
      </div>
      <div style="text-align: center; margin-top: 20px; color: #999; font-size: 12px;">
        <p>© ${new Date().getFullYear()} Jyoti.ai. All rights reserved.</p>
        <p>Your Spiritual Operating System</p>
      </div>
    </body>
    </html>
  `

  return sendEmail({
    to: email,
    subject,
    htmlBody,
    category: 'report',
  })
}

/**
 * Send daily horoscope email (Polished)
 */
export async function sendDailyHoroscopeEmail(
  email: string,
  horoscope: {
    rashi: string
    general: string
    love: string
    career: string
    money: string
    health: string
    luckyColor: string
    luckyNumber: number
  }
): Promise<boolean> {
  const subject = `🌟 Your Daily Horoscope - ${horoscope.rashi} - Jyoti.ai`
  const htmlBody = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background: #f5f5f5;">
      <div style="background: linear-gradient(135deg, #0D0A33 0%, #5A3FEF 100%); padding: 40px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="color: #fff; margin: 0; font-size: 28px; font-weight: 600;">🌟 Daily Horoscope</h1>
        <p style="color: #fff; margin: 10px 0 0 0; opacity: 0.9; font-size: 18px;">${horoscope.rashi}</p>
      </div>
      <div style="background: #fff; padding: 40px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 10px 10px;">
        <div style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); padding: 20px; border-radius: 8px; margin-bottom: 30px;">
          <h2 style="margin: 0 0 10px 0; color: #92400e; font-size: 20px;">General</h2>
          <p style="margin: 0; color: #78350f; font-size: 16px;">${horoscope.general}</p>
        </div>
        
        <div style="display: grid; gap: 20px; margin-bottom: 30px;">
          <div style="border-left: 4px solid #ec4899; padding-left: 15px;">
            <h3 style="margin: 0 0 8px 0; color: #ec4899; font-size: 18px;">💕 Love</h3>
            <p style="margin: 0; color: #666; font-size: 15px;">${horoscope.love}</p>
          </div>
          
          <div style="border-left: 4px solid #3b82f6; padding-left: 15px;">
            <h3 style="margin: 0 0 8px 0; color: #3b82f6; font-size: 18px;">💼 Career</h3>
            <p style="margin: 0; color: #666; font-size: 15px;">${horoscope.career}</p>
          </div>
          
          <div style="border-left: 4px solid #10b981; padding-left: 15px;">
            <h3 style="margin: 0 0 8px 0; color: #10b981; font-size: 18px;">💰 Money</h3>
            <p style="margin: 0; color: #666; font-size: 15px;">${horoscope.money}</p>
          </div>
          
          <div style="border-left: 4px solid #f59e0b; padding-left: 15px;">
            <h3 style="margin: 0 0 8px 0; color: #f59e0b; font-size: 18px;">🏥 Health</h3>
            <p style="margin: 0; color: #666; font-size: 15px;">${horoscope.health}</p>
          </div>
        </div>
        
        <div style="background: #f9f9f9; padding: 20px; border-radius: 8px; text-align: center;">
          <p style="margin: 0 0 15px 0; font-size: 14px; color: #666;">Your Lucky Elements Today</p>
          <div style="display: flex; justify-content: center; gap: 30px;">
            <div>
              <p style="margin: 0; font-size: 12px; color: #999;">Color</p>
              <p style="margin: 5px 0 0 0; font-size: 18px; font-weight: 600; color: #5A3FEF;">${horoscope.luckyColor}</p>
            </div>
            <div>
              <p style="margin: 0; font-size: 12px; color: #999;">Number</p>
              <p style="margin: 5px 0 0 0; font-size: 18px; font-weight: 600; color: #5A3FEF;">${horoscope.luckyNumber}</p>
            </div>
          </div>
        </div>
      </div>
      <div style="text-align: center; margin-top: 20px; color: #999; font-size: 12px;">
        <p>© ${new Date().getFullYear()} Jyoti.ai. All rights reserved.</p>
      </div>
    </body>
    </html>
  `

  return sendEmail({
    to: email,
    subject,
    htmlBody,
    category: 'alert',
  })
}

/**
 * Send transit alert email (Polished)
 */
export async function sendTransitAlertEmail(
  email: string,
  transit: {
    planet: string
    event: string
    date: string
    impact: string
    description: string
    recommendation: string
  }
): Promise<boolean> {
  const subject = `🔮 ${transit.planet} Transit Alert - Jyoti.ai`
  const htmlBody = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background: #f5f5f5;">
      <div style="background: linear-gradient(135deg, #0D0A33 0%, #5A3FEF 100%); padding: 40px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="color: #fff; margin: 0; font-size: 28px; font-weight: 600;">🔮 Transit Alert</h1>
        <p style="color: #fff; margin: 10px 0 0 0; opacity: 0.9; font-size: 18px;">${transit.planet} - ${transit.event}</p>
      </div>
      <div style="background: #fff; padding: 40px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 10px 10px;">
        <div style="background: ${getImpactColor(transit.impact)}; padding: 15px; border-radius: 6px; margin-bottom: 20px; text-align: center;">
          <p style="margin: 0; color: #fff; font-weight: 600; font-size: 16px;">Impact Level: ${transit.impact.toUpperCase()}</p>
        </div>
        
        <p style="font-size: 16px; margin-bottom: 20px;"><strong>Date:</strong> ${new Date(transit.date).toLocaleDateString()}</p>
        
        <div style="background: #f9f9f9; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h3 style="margin: 0 0 10px 0; font-size: 18px; color: #333;">What This Means</h3>
          <p style="margin: 0; color: #666; font-size: 15px;">${transit.description}</p>
        </div>
        
        <div style="background: #e0f2fe; padding: 20px; border-radius: 8px; border-left: 4px solid #0ea5e9;">
          <h3 style="margin: 0 0 10px 0; font-size: 18px; color: #0c4a6e;">💡 Recommendation</h3>
          <p style="margin: 0; color: #075985; font-size: 15px;">${transit.recommendation}</p>
        </div>
      </div>
      <div style="text-align: center; margin-top: 20px; color: #999; font-size: 12px;">
        <p>© ${new Date().getFullYear()} Jyoti.ai. All rights reserved.</p>
      </div>
    </body>
    </html>
  `

  return sendEmail({
    to: email,
    subject,
    htmlBody,
    category: 'alert',
  })
}

/**
 * Send festival alert email (Polished)
 */
export async function sendFestivalAlertEmail(
  email: string,
  festival: {
    name: string
    description: string
    energy: string
    remedies: string[]
    mantras: string[]
  }
): Promise<boolean> {
  const subject = `🎉 ${festival.name} - Festival Energy Alert - Jyoti.ai`
  const htmlBody = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background: #f5f5f5;">
      <div style="background: linear-gradient(135deg, #0D0A33 0%, #5A3FEF 100%); padding: 40px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="color: #fff; margin: 0; font-size: 28px; font-weight: 600;">🎉 ${festival.name}</h1>
        <p style="color: #fff; margin: 10px 0 0 0; opacity: 0.9;">Festival Energy Alert</p>
      </div>
      <div style="background: #fff; padding: 40px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 10px 10px;">
        <p style="font-size: 16px; margin-bottom: 20px;">${festival.description}</p>
        
        <div style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h3 style="margin: 0 0 10px 0; color: #92400e; font-size: 18px;">✨ Energy Influence</h3>
          <p style="margin: 0; color: #78350f; font-size: 15px;">${festival.energy}</p>
        </div>
        
        ${festival.remedies.length > 0 ? `
        <div style="margin-bottom: 20px;">
          <h3 style="margin: 0 0 15px 0; font-size: 18px; color: #333;">🕉️ Recommended Practices</h3>
          <ul style="margin: 0; padding-left: 20px; color: #666;">
            ${festival.remedies.map((remedy) => `<li style="margin-bottom: 8px; font-size: 15px;">${remedy}</li>`).join('')}
          </ul>
        </div>
        ` : ''}
        
        ${festival.mantras.length > 0 ? `
        <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; border-left: 4px solid #0ea5e9;">
          <h3 style="margin: 0 0 10px 0; font-size: 18px; color: #0c4a6e;">📿 Mantras</h3>
          ${festival.mantras.map((mantra) => `<p style="margin: 5px 0; color: #075985; font-size: 15px; font-style: italic;">${mantra}</p>`).join('')}
        </div>
        ` : ''}
      </div>
      <div style="text-align: center; margin-top: 20px; color: #999; font-size: 12px;">
        <p>© ${new Date().getFullYear()} Jyoti.ai. All rights reserved.</p>
      </div>
    </body>
    </html>
  `

  return sendEmail({
    to: email,
    subject,
    htmlBody,
    category: 'alert',
  })
}

/**
 * Get impact color
 */
function getImpactColor(impact: string): string {
  const colors: Record<string, string> = {
    strong: '#dc2626',
    medium: '#f59e0b',
    low: '#10b981',
  }
  return colors[impact] || '#6b7280'
}

