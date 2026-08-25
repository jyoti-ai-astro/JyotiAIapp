/**
 * JyotiAI Transactional Email Design System
 *
 * Visual direction:
 * - Solar Observatory
 * - warm ivory / parchment surfaces
 * - deep observatory navy
 * - restrained solar gold
 * - no generic purple/neon AI gradients
 *
 * Email HTML intentionally uses tables + inline styles for compatibility.
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
  productName?: string
  expiryDate?: Date
}

export interface WelcomeEmailData {
  name?: string
  email: string
}

type EmailShellOptions = {
  eyebrow: string
  title: string
  intro?: string
  body: string
  footerNote?: string
}

const BRAND = {
  ink: '#121B2D',
  navy: '#17243A',
  gold: '#B8873B',
  goldDark: '#8C642A',
  ivory: '#F8F3E8',
  paper: '#FFFDF8',
  sand: '#E8DDC9',
  muted: '#6F6B63',
  soft: '#F3ECDF',
  success: '#2F6A50',
} as const

const SITE_URL = 'https://www.jyotiai.in'
const SUPPORT_EMAIL = 'support@jyotiai.in'

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

function emailShell({
  eyebrow,
  title,
  intro,
  body,
  footerNote,
}: EmailShellOptions): string {
  const year = new Date().getFullYear()

  return `<!doctype html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="color-scheme" content="light">
  <meta name="supported-color-schemes" content="light">
  <title>${escapeHtml(title)} — JyotiAI</title>
</head>
<body style="margin:0;padding:0;background:${BRAND.ivory};font-family:Georgia,'Times New Roman',serif;color:${BRAND.ink};">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width:100%;background:${BRAND.ivory};">
    <tr>
      <td align="center" style="padding:36px 14px;">
        <table role="presentation" width="620" cellspacing="0" cellpadding="0" border="0" style="width:100%;max-width:620px;background:${BRAND.paper};border:1px solid ${BRAND.sand};border-radius:18px;overflow:hidden;">

          <tr>
            <td style="background:${BRAND.navy};padding:30px 34px;text-align:center;">
              <div style="font-family:Arial,Helvetica,sans-serif;font-size:11px;line-height:16px;letter-spacing:3px;text-transform:uppercase;color:#D8BC83;">
                JYOTIAI
              </div>

              <div style="margin-top:10px;font-size:29px;line-height:35px;font-weight:normal;color:#FFFDF8;">
                Your Spiritual Operating System
              </div>

              <div style="width:46px;height:1px;background:${BRAND.gold};margin:18px auto 0 auto;"></div>
            </td>
          </tr>

          <tr>
            <td style="padding:42px 42px 20px 42px;">
              <div style="font-family:Arial,Helvetica,sans-serif;font-size:11px;line-height:16px;letter-spacing:2.2px;text-transform:uppercase;color:${BRAND.goldDark};font-weight:700;">
                ${escapeHtml(eyebrow)}
              </div>

              <h1 style="margin:10px 0 0 0;font-size:31px;line-height:39px;font-weight:normal;color:${BRAND.ink};">
                ${escapeHtml(title)}
              </h1>

              ${
                intro
                  ? `<p style="margin:17px 0 0 0;font-family:Arial,Helvetica,sans-serif;font-size:16px;line-height:26px;color:${BRAND.muted};">${intro}</p>`
                  : ''
              }
            </td>
          </tr>

          <tr>
            <td style="padding:0 42px 42px 42px;">
              ${body}
            </td>
          </tr>

          <tr>
            <td style="border-top:1px solid ${BRAND.sand};background:${BRAND.soft};padding:25px 34px;text-align:center;">
              ${
                footerNote
                  ? `<p style="margin:0 0 10px 0;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:19px;color:${BRAND.muted};">${footerNote}</p>`
                  : ''
              }

              <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:20px;color:${BRAND.muted};">
                © ${year} JyotiAI ·
                <a href="${SITE_URL}" style="color:${BRAND.goldDark};text-decoration:none;">jyotiai.in</a>
                ·
                <a href="mailto:${SUPPORT_EMAIL}" style="color:${BRAND.goldDark};text-decoration:none;">Support</a>
              </p>

              <p style="margin:7px 0 0 0;font-family:Arial,Helvetica,sans-serif;font-size:11px;line-height:18px;color:#8B867D;">
                Vedic wisdom, interpreted with modern intelligence.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}

function primaryButton(url: string, label: string): string {
  return `
<table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin:28px 0;">
  <tr>
    <td style="background:${BRAND.gold};border-radius:8px;">
      <a href="${escapeHtml(url)}"
         style="display:inline-block;padding:15px 26px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:20px;font-weight:700;color:${BRAND.navy};text-decoration:none;">
        ${escapeHtml(label)}
      </a>
    </td>
  </tr>
</table>`
}

function notice(title: string, copy: string): string {
  return `
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-top:28px;background:${BRAND.soft};border:1px solid ${BRAND.sand};border-radius:10px;">
  <tr>
    <td style="padding:18px 20px;">
      <div style="font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:17px;font-weight:700;text-transform:uppercase;letter-spacing:1.2px;color:${BRAND.goldDark};">
        ${escapeHtml(title)}
      </div>
      <div style="margin-top:7px;font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:21px;color:${BRAND.muted};">
        ${copy}
      </div>
    </td>
  </tr>
</table>`
}

export function getMagicLinkEmailTemplate(data: MagicLinkEmailData): string {
  const safeEmail = escapeHtml(data.email)
  const device = data.device ? escapeHtml(data.device) : undefined

  return emailShell({
    eyebrow: 'Secure account access',
    title: 'Your sign-in link is ready',
    intro:
      `We received a request to sign in to the JyotiAI account associated with <strong style="color:${BRAND.ink};">${safeEmail}</strong>.`,
    body: `
      <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:25px;color:${BRAND.muted};">
        Use the secure button below to continue. This link is intended only for you and expires after one hour.
      </p>

      ${primaryButton(data.loginUrl, 'Continue to JyotiAI')}

      ${
        device
          ? `<p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:20px;color:${BRAND.muted};">
               Request context: ${device}
             </p>`
          : ''
      }

      ${notice(
        'Security',
        `If you did not request this sign-in email, you can safely ignore it. Do not forward or share this link with anyone.`
      )}

      <p style="margin:25px 0 0 0;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:20px;color:${BRAND.muted};">
        Button not working? Copy this secure address into your browser:<br>
        <span style="word-break:break-all;color:${BRAND.goldDark};">${escapeHtml(data.loginUrl)}</span>
      </p>
    `,
    footerNote:
      'This is an automated security email sent because a sign-in link was requested.',
  })
}

export function getPaymentReceiptEmailTemplate(data: PaymentReceiptEmailData): string {
  const purchaseLabel = data.planName || data.productName || 'JyotiAI purchase'
  const expiry = data.expiryDate
    ? data.expiryDate.toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : undefined

  return emailShell({
    eyebrow: 'Payment confirmed',
    title: 'Thank you for your purchase',
    intro:
      `Your payment has been confirmed and your JyotiAI access has been updated.`,
    body: `
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:${BRAND.soft};border:1px solid ${BRAND.sand};border-radius:12px;">
        <tr>
          <td style="padding:24px;">
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">

              <tr>
                <td style="padding:0 0 14px 0;font-family:Arial,Helvetica,sans-serif;font-size:13px;color:${BRAND.muted};">
                  Amount
                </td>
                <td align="right" style="padding:0 0 14px 0;font-family:Arial,Helvetica,sans-serif;font-size:20px;font-weight:700;color:${BRAND.ink};">
                  ₹${escapeHtml(String(data.amount))}
                </td>
              </tr>

              <tr>
                <td style="padding:14px 0;border-top:1px solid ${BRAND.sand};font-family:Arial,Helvetica,sans-serif;font-size:13px;color:${BRAND.muted};">
                  Purchase
                </td>
                <td align="right" style="padding:14px 0;border-top:1px solid ${BRAND.sand};font-family:Arial,Helvetica,sans-serif;font-size:14px;font-weight:700;color:${BRAND.ink};">
                  ${escapeHtml(purchaseLabel)}
                </td>
              </tr>

              ${
                expiry
                  ? `<tr>
                       <td style="padding:14px 0;border-top:1px solid ${BRAND.sand};font-family:Arial,Helvetica,sans-serif;font-size:13px;color:${BRAND.muted};">
                         Access through
                       </td>
                       <td align="right" style="padding:14px 0;border-top:1px solid ${BRAND.sand};font-family:Arial,Helvetica,sans-serif;font-size:14px;color:${BRAND.ink};">
                         ${escapeHtml(expiry)}
                       </td>
                     </tr>`
                  : ''
              }

              <tr>
                <td style="padding:14px 0 0 0;border-top:1px solid ${BRAND.sand};font-family:Arial,Helvetica,sans-serif;font-size:13px;color:${BRAND.muted};">
                  Transaction
                </td>
                <td align="right" style="padding:14px 0 0 18px;border-top:1px solid ${BRAND.sand};font-family:Arial,Helvetica,sans-serif;font-size:12px;color:${BRAND.goldDark};word-break:break-all;">
                  ${escapeHtml(data.transactionId)}
                </td>
              </tr>

            </table>
          </td>
        </tr>
      </table>

      ${primaryButton(`${SITE_URL}/dashboard`, 'Open your dashboard')}

      ${notice(
        'Receipt',
        `Keep this email for your records. If you do not recognize this payment, contact <a href="mailto:${SUPPORT_EMAIL}" style="color:${BRAND.goldDark};">support@jyotiai.in</a>.`
      )}
    `,
    footerNote:
      'Transactional payment communication from JyotiAI.',
  })
}

export function getWelcomeEmailTemplate(data: WelcomeEmailData): string {
  const greeting = data.name
    ? `Welcome, ${escapeHtml(data.name)}`
    : 'Welcome to JyotiAI'

  return emailShell({
    eyebrow: 'Your journey begins',
    title: greeting,
    intro:
      'Your JyotiAI space is ready—a place to explore Vedic astrology, personal timing, reports and AI-guided interpretation.',
    body: `
      <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:25px;color:${BRAND.muted};">
        Start with your birth details and Kundali. The more accurate your foundational information is, the more useful your personalized JyotiAI experience can become.
      </p>

      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-top:26px;">
        <tr>
          <td style="padding:16px 18px;border-left:2px solid ${BRAND.gold};background:${BRAND.soft};font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:23px;color:${BRAND.ink};">
            <strong>Explore your JyotiAI:</strong><br>
            Kundali · Today · AI Guru · Predictions · Compatibility · Reports
          </td>
        </tr>
      </table>

      ${primaryButton(`${SITE_URL}/dashboard`, 'Enter JyotiAI')}

      ${notice(
        'A good first step',
        'Review your profile and birth information before generating important predictions or reports.'
      )}
    `,
    footerNote:
      `This welcome email was sent to ${escapeHtml(data.email)}.`,
  })
}
