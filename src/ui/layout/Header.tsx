'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X, UserRound } from 'lucide-react'

import { SolarJyotiMark } from '@/src/ui/brand/SolarJyotiMark'
import { useUserStore } from '@/store/user-store'

const navItems = [
  { href: '/guru', label: 'Guru' },
  { href: '/kundali', label: 'Kundali' },
  { href: '/predictions', label: 'Predictions' },
  { href: '/pricing', label: 'Pricing' },
  { href: '/company/about', label: 'About' },
]

export function Header() {
  const pathname = usePathname()
  const user = useUserStore((state) => state.user)

  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 12)
    handleScroll()
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    setMenuOpen(false)
  }, [pathname])

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [menuOpen])

  const isActive = (href: string) =>
    pathname === href || (href !== '/' && pathname.startsWith(`${href}/`))

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 border-b transition-all duration-300 ${
        scrolled
          ? 'border-[#d7aa57]/24 bg-[#050c10]/92 shadow-[0_12px_36px_rgba(0,0,0,0.22)] backdrop-blur-xl'
          : 'border-[#d7aa57]/14 bg-[#050c10]/72 backdrop-blur-lg'
      }`}
    >
      <div className="mx-auto flex h-20 max-w-[1500px] items-center justify-between px-5 md:px-8">
        <Link
          href="/"
          className="flex items-center gap-3"
          aria-label="JyotiAI home"
        >
          <SolarJyotiMark className="h-9 w-9 text-[#f0c875]" />
          <div>
            <div className="font-heading text-xl text-[#fff7e8]">JyotiAI</div>
            <div className="hidden text-[9px] uppercase tracking-[0.24em] text-[#b9c2bf]/70 sm:block">
              Vedic Intelligence
            </div>
          </div>
        </Link>

        <nav
          className="hidden items-center gap-1 lg:flex"
          aria-label="Primary navigation"
        >
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`rounded-full px-4 py-2 text-sm transition ${
                isActive(item.href)
                  ? 'bg-[#f1c979]/10 text-[#f1c979]'
                  : 'text-[#c7ceca] hover:bg-white/5 hover:text-[#fff7e8]'
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          {user ? (
            <>
              <Link
                href="/profile"
                className="inline-flex min-h-11 items-center gap-2 rounded-full border border-[#d7aa57]/25 px-4 text-sm text-[#e9e3d8] hover:border-[#d7aa57]/50 hover:bg-[#f1c979]/8"
              >
                <UserRound className="h-4 w-4" />
                Account
              </Link>

              <Link
                href="/dashboard"
                className="inline-flex min-h-11 items-center rounded-full bg-[#e69a3a] px-5 text-sm font-semibold text-[#061014] transition hover:bg-[#f0ae55]"
              >
                Open Dashboard
              </Link>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="inline-flex min-h-11 items-center px-3 text-sm text-[#e9e3d8] hover:text-[#f1c979]"
              >
                Sign in
              </Link>

              <Link
                href="/signup"
                className="inline-flex min-h-11 items-center rounded-full bg-[#e69a3a] px-5 text-sm font-semibold text-[#061014] transition hover:bg-[#f0ae55]"
              >
                Begin free
              </Link>
            </>
          )}
        </div>

        <button
          type="button"
          className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[#d7aa57]/25 text-[#fff7e8] md:hidden"
          aria-label={menuOpen ? 'Close navigation' : 'Open navigation'}
          onClick={() => setMenuOpen((value) => !value)}
        >
          {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {menuOpen ? (
        <div className="border-t border-[#d7aa57]/18 bg-[#050c10]/98 px-5 pb-6 pt-4 shadow-2xl md:hidden">
          <nav className="mx-auto flex max-w-[1500px] flex-col gap-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-xl px-4 py-3 text-sm ${
                  isActive(item.href)
                    ? 'bg-[#f1c979]/10 text-[#f1c979]'
                    : 'text-[#d3d8d5]'
                }`}
              >
                {item.label}
              </Link>
            ))}

            <div className="mt-4 grid gap-2 border-t border-white/10 pt-4">
              {user ? (
                <>
                  <Link
                    href="/profile"
                    className="rounded-xl border border-[#d7aa57]/22 px-4 py-3 text-center text-sm text-[#fff7e8]"
                  >
                    Account
                  </Link>
                  <Link
                    href="/dashboard"
                    className="rounded-xl bg-[#e69a3a] px-4 py-3 text-center text-sm font-semibold text-[#061014]"
                  >
                    Open Dashboard
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="rounded-xl border border-[#d7aa57]/22 px-4 py-3 text-center text-sm text-[#fff7e8]"
                  >
                    Sign in
                  </Link>
                  <Link
                    href="/signup"
                    className="rounded-xl bg-[#e69a3a] px-4 py-3 text-center text-sm font-semibold text-[#061014]"
                  >
                    Begin free
                  </Link>
                </>
              )}
            </div>
          </nav>
        </div>
      ) : null}
    </header>
  )
}
