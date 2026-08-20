'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, Sparkles, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const appEnv = (process.env.NEXT_PUBLIC_APP_ENV || process.env.NODE_ENV || 'development') as
  | 'development'
  | 'staging'
  | 'production';

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/guru', label: 'Guru' },
  { href: '/kundali', label: 'Kundali' },
  { href: '/pricing', label: 'Pricing' },
];

export function Header() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 12);
    handleScroll();
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  return (
    <header
      className={cn(
        'fixed left-0 right-0 top-0 z-50 border-b transition-colors duration-200',
        isScrolled
          ? 'border-border bg-surface-raised/95 shadow-[0_8px_26px_rgba(24,33,63,0.08)] backdrop-blur'
          : 'border-border/70 bg-surface-raised/80 backdrop-blur'
      )}
    >
      <div className="page-container py-0">
        <div className="flex min-h-20 items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-3" aria-label="JyotiAI home">
            <span className="flex h-11 w-11 items-center justify-center rounded-full border border-jyoti-gold/50 bg-jyoti-gold/20 text-primary">
              <Sparkles className="h-5 w-5" aria-hidden="true" />
            </span>
            <span className="font-heading text-2xl font-semibold tracking-normal text-primary">
              JyotiAI
            </span>
          </Link>

          <nav className="hidden items-center gap-1 md:flex" aria-label="Primary navigation">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    'rounded-lg px-4 py-3 text-sm font-medium transition-colors',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                    isActive ? 'bg-secondary text-primary' : 'text-muted-foreground hover:text-primary'
                  )}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <div className="hidden items-center gap-3 md:flex">
            {appEnv !== 'production' && (
              <span className="rounded-full border border-warning/30 bg-warning/10 px-3 py-1 text-xs font-medium text-primary">
                {appEnv.toUpperCase()}
              </span>
            )}
            <Link href="/login">
              <Button variant="ghost">Sign in</Button>
            </Link>
            <Link href="/onboarding">
              <Button>Get my free reading</Button>
            </Link>
          </div>

          <button
            className="inline-flex h-11 w-11 items-center justify-center rounded-lg border border-border bg-card text-primary md:hidden"
            onClick={() => setIsMobileMenuOpen((open) => !open)}
            aria-label="Toggle navigation menu"
            aria-expanded={isMobileMenuOpen}
          >
            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="border-t border-border bg-surface-raised md:hidden">
          <nav className="page-container flex flex-col gap-2 py-4" aria-label="Mobile navigation">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    'min-h-11 rounded-lg px-4 py-3 text-base font-medium',
                    isActive ? 'bg-secondary text-primary' : 'text-muted-foreground'
                  )}
                >
                  {link.label}
                </Link>
              );
            })}
            <div className="mt-3 grid grid-cols-2 gap-3">
              <Link href="/login">
                <Button variant="outline" fullWidth>
                  Sign in
                </Button>
              </Link>
              <Link href="/onboarding">
                <Button fullWidth>Free reading</Button>
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
