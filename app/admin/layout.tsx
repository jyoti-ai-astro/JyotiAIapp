'use client'

/**
 * Admin Layout
 * Milestone 10 - Step 1
 * 
 * Protected admin layout with navigation
 */

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface AdminUser {
  uid: string
  email: string
  role: string
  name: string
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [admin, setAdmin] = useState<AdminUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkAdminSession()
  }, [])

  const checkAdminSession = async () => {
    try {
      const response = await fetch('/api/admin/me')
      const data = await response.json()

      if (data.success) {
        setAdmin(data.admin)
      } else {
        router.push('/admin/login')
      }
    } catch (error) {
      router.push('/admin/login')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' })
    router.push('/admin/login')
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div>Loading...</div>
      </div>
    )
  }

  if (!admin) {
    return null
  }

  const navItems = [
    { href: '/admin/dashboard', label: 'Dashboard' },
    { href: '/admin/users', label: 'Users' },
    { href: '/admin/tickets', label: 'Tickets' },
    { href: '/admin/one-time-purchases', label: 'One-Time Purchases' },
    { href: '/admin/reports', label: 'Reports' },
    { href: '/admin/payments', label: 'Payments' },
    { href: '/admin/guru', label: 'AI Guru' },
    { href: '/admin/knowledge', label: 'Knowledge Base' },
    { href: '/admin/content', label: 'Content' },
    { href: '/admin/logs', label: 'Logs' },
    { href: '/admin/jobs', label: 'Jobs' },
    { href: '/admin/backup', label: 'Backup' },
    { href: '/admin/settings', label: 'Settings' },
  ]

  return (
    <div className="flex min-h-screen cosmic-page">
      {/* Sidebar */}
      <aside className="w-64 border-r border-white/10 bg-[#020617]/90 p-4">
        <div className="mb-6">
          <h2 className="text-xl font-bold">Jyoti.ai Admin</h2>
          <p className="text-sm text-muted-foreground">{admin.role}</p>
        </div>

        <nav className="space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`block rounded-lg px-3 py-2 text-sm transition-colors ${
                  isActive
                    ? 'bg-gold/15 text-gold border-l-2 border-l-gold'
                    : 'hover:bg-white/5 text-white/70'
                }`}
              >
                {item.label}
              </Link>
            )
          })}
        </nav>

        <div className="mt-6 border-t pt-4">
          <Button variant="outline" onClick={handleLogout} className="w-full">
            Logout
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="border-b border-white/10 bg-[#020617]/90 p-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-white">Admin Panel</h1>
            <div className="text-sm text-white/70">
              {admin.name} ({admin.email})
            </div>
          </div>
        </div>
        <div className="cosmic-section-inner p-6">{children}</div>
      </main>
    </div>
  )
}

