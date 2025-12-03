'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Sparkles } from 'lucide-react';
import { fadeIn, scaleIn } from '@/src/ui/theme/global-motion';

// Get app environment for client-side display
const appEnv = (process.env.NEXT_PUBLIC_APP_ENV || process.env.NODE_ENV || 'development') as 'development' | 'staging' | 'production';

export function Header() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/features', label: 'Features' },
    { href: '/modules', label: 'Modules' },
    { href: '/guru', label: 'Guru' },
    { href: '/pricing', label: 'Pricing' },
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/company/about', label: 'About' },
    { href: '/support', label: 'Support' },
  ];

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  return (
    <motion.header
      initial="hidden"
      animate="visible"
      variants={fadeIn}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'backdrop-blur-xl bg-[#0A0F1F]/90'
          : 'backdrop-blur-md bg-[#0A0F1F]/60'
      }`}
      style={{
        borderBottom: `1px solid rgba(255, 213, 122, ${isScrolled ? 0.25 : 0.15})`,
      }}
    >
      <div className="page-container">
        <div className="flex items-center justify-between h-16 md:h-20 py-3 md:py-4">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center space-x-2 group"
            aria-label="Jyoti.ai Home"
          >
            <motion.div
              className="relative"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-gradient-to-br from-[#FFD57A] via-[#FFB347] to-[#4B1E92] flex items-center justify-center border-2 border-[#FFD57A]/40 shadow-[0_0_20px_rgba(255,213,122,0.3)]">
                <Sparkles className="w-5 h-5 md:w-6 md:h-6 text-[#FFD57A]" />
              </div>
            </motion.div>
            <span className="text-xl md:text-2xl font-heading font-bold bg-gradient-to-r from-[#FFD57A] to-[#FFB347] bg-clip-text text-transparent">
              JyotiAI
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`relative px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'text-[#FFD57A]'
                      : 'text-white/80 hover:text-[#FFD57A]'
                  }`}
                >
                  {link.label}
                  {isActive && (
                    <motion.div
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#FFD57A] to-[#FFB347]"
                      layoutId="activeTab"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                  <motion.div
                    className="absolute inset-0 rounded-lg bg-gradient-to-r from-[#FFD57A]/10 to-[#FFB347]/10 opacity-0 hover:opacity-100 transition-opacity duration-200"
                    whileHover={{ scale: 1.05 }}
                  />
                </Link>
              );
            })}
          </nav>

          {/* CTA Button + Environment Badge */}
          <div className="hidden md:flex items-center space-x-4">
            {appEnv !== 'production' && (
              <span
                className={`rounded-full border px-3 py-1 text-xs font-medium ${
                  appEnv === 'development'
                    ? 'border-purple-500/40 bg-purple-500/10 text-purple-300'
                    : 'border-blue-500/40 bg-blue-500/10 text-blue-300'
                }`}
              >
                {appEnv.toUpperCase()} MODE
              </span>
            )}
            <Link href="/guru">
              <motion.button
                className="px-6 py-2.5 rounded-lg bg-gradient-to-r from-[#FFD57A] to-[#FFB347] text-[#0A0F1F] font-semibold text-sm shadow-[0_4px_20px_rgba(255,213,122,0.25)] hover:shadow-[0_8px_32px_rgba(255,213,122,0.35)] transition-all duration-200"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Ask The Guru
              </motion.button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 text-white/80 hover:text-[#FFD57A] transition-colors"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden backdrop-blur-xl bg-[#0A0F1F]/95 border-t border-[#FFD57A]/20"
          >
            <nav className="page-container py-4 space-y-2">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`block px-4 py-3 rounded-lg text-base font-medium transition-all ${
                      isActive
                        ? 'text-[#FFD57A] bg-gradient-to-r from-[#FFD57A]/10 to-[#FFB347]/10'
                        : 'text-white/80 hover:text-[#FFD57A] hover:bg-[#FFD57A]/5'
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {link.label}
                  </Link>
                );
              })}
              <Link
                href="/guru"
                className="block mt-4 px-4 py-3 rounded-lg bg-gradient-to-r from-[#FFD57A] to-[#FFB347] text-[#0A0F1F] font-semibold text-center shadow-[0_4px_20px_rgba(255,213,122,0.25)]"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Ask The Guru
              </Link>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}

