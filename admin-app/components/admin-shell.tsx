'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  Activity,
  BadgeIndianRupee,
  BookOpenText,
  Boxes,
  ChartNoAxesCombined,
  ChevronRight,
  CircleGauge,
  FileText,
  Gauge,
  HardDriveDownload,
  LifeBuoy,
  ListChecks,
  LogOut,
  Megaphone,
  Menu,
  MessageCircleMore,
  Search,
  Settings,
  ShieldCheck,
  Sparkles,
  TicketCheck,
  Users,
  UsersRound,
  X,
} from 'lucide-react'
import { FormEvent, useState } from 'react'

const groups = [
  {
    label: 'Operate',
    items: [
      ['Overview', '/', CircleGauge],
      ['Users', '/users', Users],
      ['Payments', '/payments', BadgeIndianRupee],
      ['Subscriptions', '/subscriptions', ShieldCheck],
      ['Tickets', '/tickets', TicketCheck],
      ['Reports', '/reports', FileText],
    ],
  },
  {
    label: 'Intelligence',
    items: [
      ['AI Guru', '/guru', MessageCircleMore],
      ['Knowledge', '/knowledge', BookOpenText],
      ['Growth', '/growth', ChartNoAxesCombined],
    ],
  },
  {
    label: 'System',
    items: [
      ['Jobs', '/jobs', ListChecks],
      ['Monitoring', '/monitoring', Activity],
      ['Audit', '/audit', Boxes],
      ['Backups', '/backups', HardDriveDownload],
    ],
  },
  {
    label: 'Administration',
    items: [
      ['Staff', '/staff', UsersRound],
      ['Settings', '/settings', Settings],
    ],
  },
] as const

function isActive(pathname: string, href: string) {
  if (href === '/') return pathname === '/'
  return pathname === href || pathname.startsWith(`${href}/`)
}

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [query, setQuery] = useState('')

  if (pathname === '/login') return <>{children}</>

  function globalSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const q = query.trim()
    if (!q) return
    router.push(`/users?q=${encodeURIComponent(q)}`)
    setMobileOpen(false)
  }

  async function signOut() {
    await fetch('/api/auth/logout', { method: 'POST' }).catch(() => null)
    window.location.href = '/login'
  }

  return (
    <div className="mission-shell">
      <aside className={`mission-sidebar ${mobileOpen ? 'open' : ''}`}>
        <div className="brand-lockup">
          <div className="brand-mark" aria-hidden="true"><Sparkles size={19} /></div>
          <div><strong>JyotiAI</strong><span>Mission Control</span></div>
          <button className="icon-button mobile-only" onClick={() => setMobileOpen(false)} aria-label="Close navigation"><X size={18} /></button>
        </div>

        <div className="sidebar-scroll">
          {groups.map((group) => (
            <section className="nav-group" key={group.label}>
              <div className="nav-label">{group.label}</div>
              <nav>
                {group.items.map(([label, href, Icon]) => (
                  <Link className={isActive(pathname, href) ? 'nav-link active' : 'nav-link'} href={href} key={href} onClick={() => setMobileOpen(false)}>
                    <Icon size={17} strokeWidth={1.8} /><span>{label}</span>{isActive(pathname, href) ? <ChevronRight className="nav-chevron" size={15} /> : null}
                  </Link>
                ))}
              </nav>
            </section>
          ))}
        </div>

        <div className="sidebar-footer">
          <div className="environment-chip"><span className="live-dot" /> Production control plane</div>
          <button className="nav-link signout" onClick={signOut}><LogOut size={17} /><span>Sign out</span></button>
        </div>
      </aside>

      {mobileOpen ? <button className="sidebar-scrim" aria-label="Close navigation" onClick={() => setMobileOpen(false)} /> : null}

      <div className="mission-workspace">
        <header className="mission-topbar">
          <button className="icon-button mobile-only" onClick={() => setMobileOpen(true)} aria-label="Open navigation"><Menu size={19} /></button>
          <form className="global-search" onSubmit={globalSearch}>
            <Search size={17} />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search users, email, IDs…" aria-label="Global search" />
            <kbd>↵</kbd>
          </form>
          <div className="topbar-actions">
            <Link href="/growth" className="topbar-action"><Megaphone size={17} /><span>Growth</span></Link>
            <Link href="/monitoring" className="topbar-action"><Gauge size={17} /><span>Health</span></Link>
            <div className="operator-chip"><div className="avatar">JA</div><div><strong>Administrator</strong><span>Secure session</span></div></div>
          </div>
        </header>
        <div className="mission-content">{children}</div>
      </div>
    </div>
  )
}
