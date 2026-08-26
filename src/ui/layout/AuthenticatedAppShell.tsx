'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Activity,
  BriefcaseBusiness,
  CalendarDays,
  CreditCard,
  FileText,
  Hand,
  HeartHandshake,
  HelpCircle,
  Home,
  LogOut,
  MoonStar,
  ScanFace,
  ScrollText,
  Settings,
  Sparkles,
  User,
  WandSparkles,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUserStore } from '@/store/user-store';

const primaryNav = [
  { href: '/dashboard', label: 'Today', icon: Home },
  { href: '/kundali', label: 'Kundali', icon: MoonStar },
  { href: '/guru', label: 'Guru', icon: Sparkles },
  { href: '/predictions', label: 'Predictions', icon: ScrollText },
  { href: '/reports', label: 'Reports', icon: FileText },
];

const insightNav = [
  { href: '/career', label: 'Career', icon: BriefcaseBusiness },
  { href: '/business', label: 'Business', icon: Activity },
  { href: '/compatibility', label: 'Compatibility', icon: HeartHandshake },
  { href: '/numerology', label: 'Numerology', icon: WandSparkles },
  { href: '/palmistry', label: 'Palmistry', icon: Hand },
  { href: '/aura', label: 'Aura', icon: Sparkles },
  { href: '/face', label: 'Face Reading', icon: ScanFace },
];

const secondaryNav = [
  { href: '/timeline', label: 'Timeline', icon: ScrollText },
  { href: '/calendar', label: 'Calendar', icon: CalendarDays },
  { href: '/rituals', label: 'Rituals', icon: Sparkles },
  { href: '/profile', label: 'Profile', icon: User },
  { href: '/settings', label: 'Settings', icon: Settings },
  { href: '/payments', label: 'Payments/Plan', icon: CreditCard },
  { href: '/support', label: 'Support', icon: HelpCircle },
];

const mobileNav = [
  { href: '/dashboard', label: 'Today', icon: Home },
  { href: '/kundali', label: 'Kundali', icon: MoonStar },
  { href: '/guru', label: 'Guru', icon: Sparkles },
  { href: '/reports', label: 'Reports', icon: FileText },
  { href: '/profile', label: 'Account', icon: User },
];

function NavLink({ href, label, icon: Icon }: { href: string; label: string; icon: React.ElementType }) {
  const pathname = usePathname();
  const isActive = pathname === href || pathname.startsWith(`${href}/`);

  return (
    <Link
      href={href}
      aria-current={isActive ? 'page' : undefined}
      className={cn(
        'flex min-h-11 items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        isActive ? 'bg-secondary text-primary' : 'text-muted-foreground hover:bg-secondary/70 hover:text-primary'
      )}
    >
      <Icon className="h-4 w-4" aria-hidden="true" />
      <span>{label}</span>
    </Link>
  );
}

export function AuthenticatedAppShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { clearUser } = useUserStore();

  const handleSignOut = async () => {
    await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' }).catch(() => {});
    clearUser();
    router.push('/login');
  };

  return (
    <div className="grid gap-6 md:grid-cols-[16rem_minmax(0,1fr)]">
      <aside
        data-dashboard-sidebar="true"
        className="hidden self-start md:block md:pt-10"
      >
        <div
          data-dashboard-sidebar-surface="true"
          className="sticky top-28 max-h-[calc(100vh-8rem)] space-y-5 overflow-y-auto rounded-xl border border-border bg-surface-raised p-3 shadow-[0_8px_24px_rgba(24,33,63,0.08)]"
        >
          <nav className="space-y-1" aria-label="Primary app navigation">
            {primaryNav.map((item) => (
              <NavLink key={item.href} {...item} />
            ))}
          </nav>

          <div className="border-t border-border pt-4">
            <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground/70">
              Insights
            </p>
            <nav className="space-y-1" aria-label="Insight navigation">
              {insightNav.map((item) => (
                <NavLink key={item.href} {...item} />
              ))}
            </nav>
          </div>

          <div className="border-t border-border pt-4">
            <nav className="space-y-1" aria-label="Account and secondary navigation">
              {secondaryNav.map((item) => (
                <NavLink key={item.href} {...item} />
              ))}
              <button
                type="button"
                onClick={handleSignOut}
                className="flex min-h-11 w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary/70 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <LogOut className="h-4 w-4" aria-hidden="true" />
                <span>Sign out</span>
              </button>
            </nav>
          </div>
        </div>
      </aside>

      <div className="min-w-0 pb-20 md:pb-0">{children}</div>

      <nav
        className="fixed bottom-0 left-0 right-0 z-50 grid grid-cols-5 border-t border-border bg-surface-raised/95 px-2 py-2 shadow-[0_-8px_24px_rgba(24,33,63,0.08)] backdrop-blur md:hidden"
        aria-label="Mobile app navigation"
      >
        {mobileNav.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex min-h-12 flex-col items-center justify-center gap-1 rounded-lg text-[11px] font-medium text-muted-foreground hover:bg-secondary hover:text-primary"
            >
              <Icon className="h-4 w-4" aria-hidden="true" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
