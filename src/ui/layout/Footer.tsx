'use client';

import React from 'react';
import Link from 'next/link';
import { SolarJyotiMark } from '@/src/ui/brand/SolarJyotiMark';

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
    <footer className="relative z-20 border-t border-[#D8B56A]/25 bg-[#07131F] text-[#FFF7E8]">
      <div className="page-container py-12 md:py-14">
        <div className="grid gap-10 lg:grid-cols-[1.15fr_2fr]">
          <div>
            <Link href="/" className="inline-flex items-center gap-3" aria-label="JyotiAI home">
              <span className="flex h-11 w-11 items-center justify-center rounded-full border border-[#C9A24A]/45 bg-[#F28C28]/12 text-[#FFF7E8]">
                <SolarJyotiMark className="h-6 w-6" />
              </span>
              <span className="font-heading text-2xl font-semibold text-[#FFF7E8]">JyotiAI</span>
            </Link>
            <p className="mt-4 max-w-sm text-sm leading-6 text-[#B9C2BF]">
              A celestial observatory for Kundali-based guidance, Guru questions, timelines, and saved reports.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {footerGroups.map((group) => (
              <div key={group.title}>
                <h3 className="text-sm font-semibold uppercase tracking-[0.12em] text-[#FFF7E8]">
                  {group.title}
                </h3>
                <ul className="mt-4 space-y-3">
                  {group.links.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="text-sm text-[#B9C2BF] transition-colors hover:text-[#FFF7E8]"
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

        <div className="mt-10 border-t border-[#D8B56A]/20 pt-6 text-sm text-[#B9C2BF]">
          © {currentYear} JyotiAI. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
