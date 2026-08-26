import { canonicalAdminFetch } from '@/lib/canonical-api'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function GrowthPage() {
  const me = await canonicalAdminFetch('/api/admin/me')
  if (me.status === 401) redirect('/login')

  const sources = [
    ['First-party attribution', 'Planned', 'UTM, referrer, landing page, device, session and conversion stitching'],
    ['Google Analytics 4', 'Ready to connect', 'Acquisition, engagement, funnels and campaign dimensions'],
    ['Google Ads', 'Ready to connect', 'Spend, clicks, campaigns, ad groups and conversion value'],
    ['Meta Ads', 'Ready to connect', 'Campaign/adset/ad performance and server-side conversion matching'],
    ['Search Console', 'Ready to connect', 'Organic queries, pages, impressions, clicks and CTR'],
    ['Email / CRM', 'Ready to connect', 'Campaign delivery, opens, clicks, unsubscribes and downstream revenue'],
  ]

  return <main className="module-page">
    <div className="module-header"><div><div className="eyebrow">Growth intelligence</div><h1>Growth & attribution</h1><p className="muted">Unify acquisition, behavior and verified JyotiAI revenue without letting ad platforms become the source of financial truth.</p></div></div>
    <section className="metric-grid">
      <article className="metric-card"><span>Attribution model</span><strong>First-party</strong><small>Canonical JyotiAI conversion events</small></article>
      <article className="metric-card"><span>Paid media</span><strong>0 connected</strong><small>Google Ads + Meta planned</small></article>
      <article className="metric-card"><span>Web analytics</span><strong>0 connected</strong><small>GA4 + Search Console planned</small></article>
      <article className="metric-card"><span>Revenue authority</span><strong>JyotiAI</strong><small>Provider-verified payments only</small></article>
    </section>
    <section className="panel-grid">
      <article className="card"><div className="section-title">Data connections</div><div className="connection-list">{sources.map(([name,status,detail]) => <div className="connection-row" key={name}><div><strong>{name}</strong><span>{detail}</span></div><span className="status-pill">{status}</span></div>)}</div></article>
      <article className="card"><div className="section-title">Launch attribution contract</div><div className="rows"><div><span>Acquisition</span><strong>utm_*, gclid, fbclid, referrer</strong></div><div><span>Journey</span><strong>landing page, session, device</strong></div><div><span>Identity</span><strong>anonymous → user UID</strong></div><div><span>Commerce</span><strong>checkout → payment → subscription</strong></div><div><span>Product</span><strong>report, Guru, Kundali conversion</strong></div></div></article>
    </section>
  </main>
}
