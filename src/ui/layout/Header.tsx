'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { SolarJyotiMark } from '@/src/ui/brand/SolarJyotiMark';

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
          ? 'border-[#D8B56A]/35 bg-[#07131F]/94 shadow-[0_12px_34px_rgba(7,19,31,0.26)] backdrop-blur'
          : 'border-[#D8B56A]/20 bg-[#07131F]/82 backdrop-blur'
      )}
    >
      <div className="page-container py-0">
        <div className="flex min-h-20 items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-3" aria-label="JyotiAI home">
            <span className="flex h-11 w-11 items-center justify-center rounded-full border border-[#C9A24A]/45 bg-[#F28C28]/12 text-[#FFF7E8] shadow-[0_0_24px_rgba(242,140,40,0.16)]">
              <SolarJyotiMark className="h-6 w-6" />
            </span>
            <span className="font-heading text-2xl font-semibold tracking-normal text-[#FFF7E8]">
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
                    isActive ? 'bg-[#FFF8E6]/12 text-[#FFF7E8]' : 'text-[#B9C2BF] hover:text-[#FFF7E8]'
                  )}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <div className="hidden items-center gap-3 md:flex">
            {appEnv !== 'production' && (
              <span className="rounded-full border border-[#D9962E]/35 bg-[#D9962E]/12 px-3 py-1 text-xs font-medium text-[#FFF7E8]">
                {appEnv.toUpperCase()}
              </span>
            )}
            <Link href="/login">
              <Button variant="ghost" className="text-[#FFF7E8] hover:bg-[#FFF8E6]/10">
                Sign in
              </Button>
            </Link>
            <Link href="/onboarding">
              <Button className="bg-[#F28C28] text-[#07131F] hover:bg-[#F28C28]/90">
                Get my free reading
              </Button>
            </Link>
          </div>

          <button
            className="inline-flex h-11 w-11 items-center justify-center rounded-lg border border-[#D8B56A]/30 bg-[#FFF8E6]/10 text-[#FFF7E8] md:hidden"
            onClick={() => setIsMobileMenuOpen((open) => !open)}
            aria-label="Toggle navigation menu"
            aria-expanded={isMobileMenuOpen}
          >
            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="border-t border-[#D8B56A]/25 bg-[#07131F] md:hidden">
          <nav className="page-container flex flex-col gap-2 py-4" aria-label="Mobile navigation">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    'min-h-11 rounded-lg px-4 py-3 text-base font-medium',
                    isActive ? 'bg-[#FFF8E6]/12 text-[#FFF7E8]' : 'text-[#B9C2BF]'
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
