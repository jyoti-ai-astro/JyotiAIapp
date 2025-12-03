/**
 * Professional Email Templates for Jyoti.ai
 * 
 * Beautiful, responsive email templates for all email types
 */

export interface MagicLinkEmailData {
  email: string
  loginUrl: string
  device?: string
}

export interface PaymentReceiptEmailData {
  email: string
  amount: number
  transactionId: string
  planName?: string
  expiryDate?: Date
  productName?: string
}

export interface WelcomeEmailData {
  email: string
  name: string
}

/**
 * Magic Link Sign-In Email Template
 */
export function getMagicLinkEmailTemplate(data: MagicLinkEmailData): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Sign in to Jyoti.ai</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f5f5f5;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" style="width: 100%; max-width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <!-- Header with Gradient -->
          <tr>
            <td style="background: linear-gradient(135deg, #0D0A33 0%, #5A3FEF 100%); padding: 40px 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: 700; letter-spacing: -0.5px;">Jyoti.ai</h1>
              <p style="margin: 10px 0 0 0; color: #ffffff; font-size: 16px; opacity: 0.9;">Your Spiritual Operating System</p>
            </td>
          </tr>
          
          <!-- Main Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <h2 style="margin: 0 0 20px 0; color: #0D0A33; font-size: 24px; font-weight: 600;">Sign in to your account</h2>
              <p style="margin: 0 0 30px 0; color: #666666; font-size: 16px; line-height: 1.6;">
                Click the button below to securely sign in to your Jyoti.ai account. This link will expire in 1 hour.
              </p>
              
              <!-- CTA Button -->
              <table role="presentation" style="width: 100%; border-collapse: collapse; margin: 30px 0;">
                <tr>
                  <td align="center" style="padding: 0;">
                    <a href="${data.loginUrl}" style="display: inline-block; background: linear-gradient(135deg, #5A3FEF 0%, #7C3AED 100%); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 12px rgba(90, 63, 239, 0.3); transition: all 0.3s ease;">
                      Sign In to Jyoti.ai
                    </a>
                  </td>
                </tr>
              </table>
              
              <!-- Alternative Link -->
              <p style="margin: 30px 0 0 0; color: #999999; font-size: 14px; line-height: 1.6;">
                Or copy and paste this link into your browser:
              </p>
              <p style="margin: 10px 0 0 0; color: #5A3FEF; font-size: 12px; word-break: break-all; line-height: 1.6;">
                ${data.loginUrl}
              </p>
              
              <!-- Security Notice -->
              <div style="margin-top: 40px; padding: 20px; background-color: #f9fafb; border-radius: 8px; border-left: 4px solid #5A3FEF;">
                <p style="margin: 0; color: #666666; font-size: 14px; line-height: 1.6;">
                  <strong style="color: #0D0A33;">Security Notice:</strong> If you didn't request this sign-in link, please ignore this email. Your account remains secure.
                </p>
              </div>
              
              ${data.device ? `
              <p style="margin: 20px 0 0 0; color: #999999; font-size: 12px;">
                Device: ${data.device}
              </p>
              ` : ''}
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 30px; background-color: #f9fafb; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0 0 10px 0; color: #999999; font-size: 14px;">
                © ${new Date().getFullYear()} Jyoti.ai. All rights reserved.
              </p>
              <p style="margin: 0; color: #999999; font-size: 12px;">
                Powered by cosmic wisdom and AI
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim()
}

/**
 * Payment Receipt Email Template
 */
export function getPaymentReceiptEmailTemplate(data: PaymentReceiptEmailData): string {
  const isSubscription = !!data.planName
  const isOneTime = !!data.productName
  
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Payment Confirmation - Jyoti.ai</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f5f5f5;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" style="width: 100%; max-width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <!-- Header with Gradient -->
          <tr>
            <td style="background: linear-gradient(135deg, #0D0A33 0%, #5A3FEF 100%); padding: 40px 30px; text-align: center;">
              <div style="width: 64px; height: 64px; background-color: rgba(255, 255, 255, 0.2); border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
                <span style="color: #ffffff; font-size: 32px;">✓</span>
              </div>
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">Payment Successful</h1>
              <p style="margin: 10px 0 0 0; color: #ffffff; font-size: 16px; opacity: 0.9;">Thank you for your purchase</p>
            </td>
          </tr>
          
          <!-- Main Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <p style="margin: 0 0 30px 0; color: #666666; font-size: 16px; line-height: 1.6;">
                Dear Seeker,
              </p>
              <p style="margin: 0 0 30px 0; color: #666666; font-size: 16px; line-height: 1.6;">
                Your payment has been successfully processed. We're excited to have you on this spiritual journey with us!
              </p>
              
              <!-- Payment Details Card -->
              <div style="background: linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%); padding: 30px; border-radius: 12px; margin: 30px 0; border: 1px solid #e5e7eb;">
                <table role="presentation" style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 8px 0;">
                      <span style="color: #666666; font-size: 14px;">Amount Paid:</span>
                    </td>
                    <td align="right" style="padding: 8px 0;">
                      <span style="color: #0D0A33; font-size: 20px; font-weight: 700;">₹${data.amount}</span>
                    </td>
                  </tr>
                  ${isSubscription ? `
                  <tr>
                    <td style="padding: 8px 0;">
                      <span style="color: #666666; font-size: 14px;">Plan:</span>
                    </td>
                    <td align="right" style="padding: 8px 0;">
                      <span style="color: #0D0A33; font-size: 16px; font-weight: 600;">${data.planName}</span>
                    </td>
                  </tr>
                  ${data.expiryDate ? `
                  <tr>
                    <td style="padding: 8px 0;">
                      <span style="color: #666666; font-size: 14px;">Valid Until:</span>
                    </td>
                    <td align="right" style="padding: 8px 0;">
                      <span style="color: #0D0A33; font-size: 14px;">${data.expiryDate.toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                    </td>
                  </tr>
                  ` : ''}
                  ` : ''}
                  ${isOneTime ? `
                  <tr>
                    <td style="padding: 8px 0;">
                      <span style="color: #666666; font-size: 14px;">Product:</span>
                    </td>
                    <td align="right" style="padding: 8px 0;">
                      <span style="color: #0D0A33; font-size: 16px; font-weight: 600;">${data.productName}</span>
                    </td>
                  </tr>
                  ` : ''}
                  <tr>
                    <td style="padding: 8px 0; border-top: 1px solid #e5e7eb; padding-top: 16px;">
                      <span style="color: #666666; font-size: 14px;">Transaction ID:</span>
                    </td>
                    <td align="right" style="padding: 8px 0; border-top: 1px solid #e5e7eb; padding-top: 16px;">
                      <span style="color: #5A3FEF; font-size: 12px; font-family: monospace;">${data.transactionId}</span>
                    </td>
                  </tr>
                </table>
              </div>
              
              <!-- Next Steps -->
              <div style="margin-top: 30px; padding: 20px; background-color: #f0f9ff; border-radius: 8px; border-left: 4px solid #5A3FEF;">
                <p style="margin: 0 0 10px 0; color: #0D0A33; font-size: 16px; font-weight: 600;">
                  What's Next?
                </p>
                <p style="margin: 0; color: #666666; font-size: 14px; line-height: 1.6;">
                  ${isSubscription 
                    ? 'Your subscription is now active! Enjoy unlimited access to Jyoti.ai features and cosmic insights.'
                    : 'Your credits have been added to your account. Start exploring your cosmic destiny now!'
                  }
                </p>
              </div>
              
              <!-- CTA Button -->
              <table role="presentation" style="width: 100%; border-collapse: collapse; margin: 30px 0;">
                <tr>
                  <td align="center" style="padding: 0;">
                    <a href="https://www.jyoti.app/dashboard" style="display: inline-block; background: linear-gradient(135deg, #5A3FEF 0%, #7C3AED 100%); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 12px rgba(90, 63, 239, 0.3);">
                      Go to Dashboard
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 30px; background-color: #f9fafb; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0 0 10px 0; color: #999999; font-size: 14px;">
                © ${new Date().getFullYear()} Jyoti.ai. All rights reserved.
              </p>
              <p style="margin: 0; color: #999999; font-size: 12px;">
                If you have any questions, contact us at support@jyoti.app
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim()
}

/**
 * Welcome Email Template
 */
export function getWelcomeEmailTemplate(data: WelcomeEmailData): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to Jyoti.ai</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f5f5f5;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" style="width: 100%; max-width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <!-- Header with Gradient -->
          <tr>
            <td style="background: linear-gradient(135deg, #0D0A33 0%, #5A3FEF 100%); padding: 40px 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: 700; letter-spacing: -0.5px;">Welcome to Jyoti.ai</h1>
              <p style="margin: 10px 0 0 0; color: #ffffff; font-size: 16px; opacity: 0.9;">Your Spiritual Journey Begins</p>
            </td>
          </tr>
          
          <!-- Main Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <p style="margin: 0 0 20px 0; color: #666666; font-size: 16px; line-height: 1.6;">
                Dear ${data.name || 'Seeker'},
              </p>
              <p style="margin: 0 0 20px 0; color: #666666; font-size: 16px; line-height: 1.6;">
                Welcome to Jyoti.ai! We're thrilled to have you join our community of seekers exploring the cosmic wisdom of Vedic astrology, numerology, and spiritual guidance.
              </p>
              
              <!-- Features -->
              <div style="margin: 30px 0;">
                <h3 style="margin: 0 0 20px 0; color: #0D0A33; font-size: 20px; font-weight: 600;">What You Can Explore:</h3>
                <ul style="margin: 0; padding-left: 20px; color: #666666; font-size: 14px; line-height: 2;">
                  <li>AI Guru - Get personalized spiritual guidance</li>
                  <li>Kundali Analysis - Discover your cosmic blueprint</li>
                  <li>Predictions - Unlock insights into your future</li>
                  <li>Numerology - Understand your life path numbers</li>
                  <li>And much more...</li>
                </ul>
              </div>
              
              <!-- CTA Button -->
              <table role="presentation" style="width: 100%; border-collapse: collapse; margin: 30px 0;">
                <tr>
                  <td align="center" style="padding: 0;">
                    <a href="https://www.jyoti.app/dashboard" style="display: inline-block; background: linear-gradient(135deg, #5A3FEF 0%, #7C3AED 100%); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 12px rgba(90, 63, 239, 0.3);">
                      Start Your Journey
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 30px; background-color: #f9fafb; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0 0 10px 0; color: #999999; font-size: 14px;">
                © ${new Date().getFullYear()} Jyoti.ai. All rights reserved.
              </p>
              <p style="margin: 0; color: #999999; font-size: 12px;">
                Powered by cosmic wisdom and AI
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim()
}

