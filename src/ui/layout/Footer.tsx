'use client';

import React from 'react';
import Link from 'next/link';
import { Sparkles } from 'lucide-react';

const footerGroups = [
  {
    title: 'Product',
    links: [
      { href: '/guru', label: 'Guru' },
      { href: '/kundali', label: 'Kundali' },
      { href: '/predictions', label: 'Predictions' },
      { href: '/reports', label: 'Reports' },
      { href: '/pricing', label: 'Pricing' },
    ],
  },
  {
    title: 'Company',
    links: [
      { href: '/company/about', label: 'About' },
      { href: '/company/contact', label: 'Contact' },
      { href: '/company/blog', label: 'Blog' },
      { href: '/status', label: 'Status' },
    ],
  },
  {
    title: 'Support',
    links: [
      { href: '/support', label: 'Help center' },
      { href: '/profile', label: 'Account' },
      { href: '/payments', label: 'Payments' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { href: '/legal/terms', label: 'Terms' },
      { href: '/legal/privacy', label: 'Privacy' },
      { href: '/legal/security', label: 'Security' },
      { href: '/legal/cookies', label: 'Cookies' },
    ],
  },
];

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative z-20 border-t border-border bg-surface-raised">
      <div className="page-container py-12 md:py-14">
        <div className="grid gap-10 lg:grid-cols-[1.15fr_2fr]">
          <div>
            <Link href="/" className="inline-flex items-center gap-3" aria-label="JyotiAI home">
              <span className="flex h-11 w-11 items-center justify-center rounded-full border border-jyoti-gold/50 bg-jyoti-gold/20 text-primary">
                <Sparkles className="h-5 w-5" aria-hidden="true" />
              </span>
              <span className="font-heading text-2xl font-semibold text-primary">JyotiAI</span>
            </Link>
            <p className="mt-4 max-w-sm text-sm leading-6 text-muted-foreground">
              Premium Vedic astrology guidance with a modern product experience.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {footerGroups.map((group) => (
              <div key={group.title}>
                <h3 className="text-sm font-semibold uppercase tracking-[0.12em] text-primary">
                  {group.title}
                </h3>
                <ul className="mt-4 space-y-3">
                  {group.links.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="text-sm text-muted-foreground transition-colors hover:text-primary"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-10 border-t border-border pt-6 text-sm text-muted-foreground">
          © {currentYear} JyotiAI. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
