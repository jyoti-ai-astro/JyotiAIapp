'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Sparkles, Github, Twitter, Linkedin, Mail } from 'lucide-react';
import { fadeIn } from '@/src/ui/theme/global-motion';

const footerLinks = {
  product: [
    { href: '/guru', label: 'AI Guru' },
    { href: '/pricing', label: 'Pricing' },
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/features', label: 'Features' },
  ],
  company: [
    { href: '/company/about', label: 'About' },
    { href: '/company/contact', label: 'Contact' },
    { href: '/company/blog', label: 'Blog' },
    { href: '/company/careers', label: 'Careers' },
  ],
  legal: [
    { href: '/legal/terms', label: 'Terms' },
    { href: '/legal/privacy', label: 'Privacy' },
    { href: '/legal/security', label: 'Security' },
    { href: '/legal/cookies', label: 'Cookies' },
  ],
};

const socialLinks = [
  { href: 'https://github.com', icon: Github, label: 'GitHub' },
  { href: 'https://twitter.com', icon: Twitter, label: 'Twitter' },
  { href: 'https://linkedin.com', icon: Linkedin, label: 'LinkedIn' },
  { href: 'mailto:hello@jyoti.ai', icon: Mail, label: 'Email' },
];

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <motion.footer
      initial="hidden"
      animate="visible"
      variants={fadeIn}
      className="relative z-20 border-t border-[#FFD57A]/20 bg-[#0A0F1F]/80 backdrop-blur-xl"
    >
      <div className="page-container py-8 md:py-10">
        {/* Row 1: Logo + Cosmic Message */}
        <div className="mb-12 text-center">
          <Link
            href="/"
            className="inline-flex items-center space-x-2 mb-4 group"
          >
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#FFD57A] via-[#FFB347] to-[#4B1E92] flex items-center justify-center border-2 border-[#FFD57A]/40 shadow-[0_0_20px_rgba(255,213,122,0.3)]">
              <Sparkles className="w-6 h-6 text-[#FFD57A]" />
            </div>
            <span className="text-2xl font-heading font-bold bg-gradient-to-r from-[#FFD57A] to-[#FFB347] bg-clip-text text-transparent">
              JyotiAI
            </span>
          </Link>
          <p className="text-white/60 text-sm md:text-base max-w-2xl mx-auto">
            Your destiny, decoded by AI + ancient wisdom. Experience the cosmic
            convergence of Vedic astrology, numerology, and spiritual guidance.
          </p>
        </div>

        {/* Row 2: Navigation Links */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          <div>
            <h3 className="text-[#FFD57A] font-semibold text-sm mb-4 uppercase tracking-wider">
              Product
            </h3>
            <ul className="space-y-3">
              {footerLinks.product.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-white/60 hover:text-[#FFD57A] text-sm transition-colors duration-200 group"
                  >
                    <span className="group-hover:opacity-100 opacity-0 transition-opacity duration-200">
                      →
                    </span>{' '}
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-[#FFD57A] font-semibold text-sm mb-4 uppercase tracking-wider">
              Company
            </h3>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-white/60 hover:text-[#FFD57A] text-sm transition-colors duration-200 group"
                  >
                    <span className="group-hover:opacity-100 opacity-0 transition-opacity duration-200">
                      →
                    </span>{' '}
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-[#FFD57A] font-semibold text-sm mb-4 uppercase tracking-wider">
              Legal
            </h3>
            <ul className="space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-white/60 hover:text-[#FFD57A] text-sm transition-colors duration-200 group"
                  >
                    <span className="group-hover:opacity-100 opacity-0 transition-opacity duration-200">
                      →
                    </span>{' '}
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-[#FFD57A] font-semibold text-sm mb-4 uppercase tracking-wider">
              Connect
            </h3>
            <ul className="space-y-3">
              {socialLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-white/60 hover:text-[#FFD57A] text-sm transition-colors duration-200 flex items-center space-x-2 group"
                    >
                      <Icon className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" />
                      <span>{link.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>

        {/* Row 3: Copyright + Social Icons */}
        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
          <p className="text-white/40 text-xs md:text-sm">
            © {currentYear} JyotiAI. All rights reserved. Powered by cosmic
            wisdom and AI.
          </p>
          <div className="flex items-center space-x-4">
            {socialLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white/40 hover:text-[#FFD57A] transition-colors duration-200"
                  aria-label={link.label}
                >
                  <Icon className="w-5 h-5 hover:scale-110 transition-transform duration-200" />
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </motion.footer>
  );
}

