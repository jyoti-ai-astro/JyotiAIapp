export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { checkAdminSession } from '@/lib/middleware/admin-middleware'
import {
  exchangeZohoAuthorizationCode,
  getZohoMailingLists,
  getZohoTopics,
} from '@/lib/integrations/zoho-campaigns'

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;')
}

function htmlPage(title: string, body: string, status = 200) {
  return new NextResponse(
    `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeHtml(title)}</title><style>body{font-family:system-ui,-apple-system,sans-serif;max-width:900px;margin:48px auto;padding:0 24px;line-height:1.55;color:#172033}code,pre{background:#f4f6f8;border-radius:8px}code{padding:2px 6px}pre{padding:16px;overflow:auto}.ok{color:#147a3d}.warn{color:#9a5a00}</style></head><body>${body}</body></html>`,
    { status, headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' } }
  )
}

export async function GET(request: NextRequest) {
  const { admin, error: authError } = await checkAdminSession(request)
  if (authError || !admin) {
    return htmlPage('Zoho authorization', '<h1>Admin sign-in required</h1><p>Sign in to the JyotiAI admin panel, then start the Zoho authorization again.</p>', 401)
  }

  const search = request.nextUrl.searchParams
  const zohoError = search.get('error')
  const code = search.get('code')
  const returnedState = search.get('state')
  const expectedState = request.cookies.get('zoho_oauth_state')?.value

  if (zohoError) {
    return htmlPage('Zoho authorization failed', `<h1>Zoho authorization failed</h1><p>${escapeHtml(zohoError)}</p>`, 400)
  }

  if (!code || !returnedState || !expectedState || returnedState !== expectedState) {
    return htmlPage('Invalid OAuth callback', '<h1>Invalid OAuth callback</h1><p>The authorization state could not be verified. Start the authorization again from JyotiAI.</p>', 400)
  }

  try {
    const tokens = await exchangeZohoAuthorizationCode(code)
    const accessToken = tokens.access_token!

    const [listsResult, topicsResult] = await Promise.allSettled([
      getZohoMailingLists(accessToken),
      getZohoTopics(accessToken),
    ])

    const lists = listsResult.status === 'fulfilled' ? listsResult.value : []
    const topics = topicsResult.status === 'fulfilled' ? topicsResult.value : []
    const targetList = lists.find((item) => item.listname?.trim().toLowerCase() === 'jyotiai marketing subscribers')
    const targetTopic = topics.find((item) => item.topicName?.trim().toLowerCase() === 'jyotiai updates and offers')

    const refreshTokenBlock = tokens.refresh_token
      ? `<p class="warn"><strong>One-time setup:</strong> copy the refresh token below into Vercel as <code>ZOHO_CAMPAIGNS_REFRESH_TOKEN</code>. Do not put it in GitHub or share it in chat.</p><pre>${escapeHtml(tokens.refresh_token)}</pre>`
      : '<p class="warn"><strong>No refresh token was returned.</strong> Revoke the previous grant in Zoho Accounts and authorize again with consent.</p>'

    const listBlock = targetList?.listkey
      ? `<p class="ok">Mailing list found: <strong>${escapeHtml(targetList.listname || '')}</strong></p><p>Add this Vercel variable:</p><pre>ZOHO_CAMPAIGNS_LIST_KEY=${escapeHtml(targetList.listkey)}</pre>`
      : `<p class="warn">The mailing list “JyotiAI Marketing Subscribers” was not found automatically.</p><pre>${escapeHtml(JSON.stringify(lists, null, 2))}</pre>`

    const topicBlock = targetTopic?.topicId
      ? `<p class="ok">Topic found: <strong>${escapeHtml(targetTopic.topicName || '')}</strong></p><p>Add this Vercel variable:</p><pre>ZOHO_CAMPAIGNS_TOPIC_ID=${escapeHtml(targetTopic.topicId)}</pre>`
      : `<p class="warn">The topic “JyotiAI Updates and Offers” was not found automatically.</p><pre>${escapeHtml(JSON.stringify(topics, null, 2))}</pre>`

    const response = htmlPage(
      'JyotiAI Zoho Campaigns connected',
      `<h1 class="ok">Zoho Campaigns authorization succeeded</h1><p>The OAuth code was exchanged successfully. Access tokens are intentionally not displayed.</p>${refreshTokenBlock}<h2>JyotiAI mailing list</h2>${listBlock}<h2>JyotiAI topic</h2>${topicBlock}<p>After the required Vercel variables are saved, redeploy JyotiAI before testing subscription sync.</p>`
    )

    response.cookies.set('zoho_oauth_state', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0,
      path: '/api/integrations/zoho',
    })
    return response
  } catch (err: any) {
    console.error('Zoho callback error:', err)
    return htmlPage(
      'Zoho authorization failed',
      `<h1>Zoho authorization failed</h1><p>${escapeHtml(err?.message || 'Unknown error')}</p>`,
      500
    )
  }
}
