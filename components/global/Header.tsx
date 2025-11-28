/**
 * Global Header Component
 * 
 * Production-quality responsive header with glassmorphism, mobile menu, and cosmic styling
 */

'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';

export interface HeaderProps {
  /** Additional className */
  className?: string;
}

export function Header({ className = '' }: HeaderProps) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Navigation links
  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/features', label: 'Features' },
    { href: '/pricing', label: 'Pricing' },
    { href: '/modules', label: 'Modules' },
    { href: '/company/blog', label: 'Blog' },
    { href: '/company/contact', label: 'Contact' },
  ];

  // Track scroll for header background opacity
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  // Prevent body scroll when mobile menu is open
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
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'backdrop-blur-md bg-cosmic/80' : 'backdrop-blur-sm bg-cosmic/40'
      } ${className}`}
      style={{
        borderBottom: `1px solid rgba(242, 201, 76, ${isScrolled ? 0.2 : 0.1})`,
      }}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
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
              {/* Logo placeholder - replace with actual logo */}
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-gradient-to-br from-gold via-purple to-cyan flex items-center justify-center border-2 border-gold/30">
                <span className="text-gold font-heading text-lg md:text-xl font-bold">J</span>
              </div>
              {/* Subtle glow on hover */}
              <motion.div
                className="absolute inset-0 rounded-full"
                style={{
                  boxShadow: '0 0 20px rgba(242, 201, 76, 0.3)',
                }}
                animate={{
                  opacity: [0.3, 0.6, 0.3],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              />
            </motion.div>
            <span className="text-gold font-heading text-xl md:text-2xl font-bold hidden sm:block">
              Jyoti
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
            {navLinks.map((link) => {
              const isActive = pathname === link.href || 
                (link.href !== '/' && pathname.startsWith(link.href));
              
              return (
                <NavLink
                  key={link.href}
                  href={link.href}
                  label={link.label}
                  isActive={isActive}
                />
              );
            })}
          </nav>

          {/* Right Side: Login Button + Mobile Menu Toggle */}
          <div className="flex items-center space-x-4">
            {/* Login Button - Desktop */}
            <Link href="/login" className="hidden md:block">
              <Button
                variant="ghost"
                className="border border-gold/30 text-gold hover:bg-gold/10 hover:border-gold/50 transition-all duration-300"
              >
                Login
              </Button>
            </Link>

            {/* Mobile Menu Toggle */}
            <button
              type="button"
              className="md:hidden p-2 rounded-lg text-gold hover:bg-gold/10 transition-colors duration-200"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle mobile menu"
              aria-expanded={isMobileMenuOpen}
            >
              <motion.div
                className="w-6 h-6 flex flex-col justify-center space-y-1.5"
                animate={isMobileMenuOpen ? 'open' : 'closed'}
              >
                <motion.span
                  className="block h-0.5 w-full bg-gold rounded"
                  variants={{
                    closed: { rotate: 0, y: 0 },
                    open: { rotate: 45, y: 6 },
                  }}
                  transition={{ duration: 0.3 }}
                />
                <motion.span
                  className="block h-0.5 w-full bg-gold rounded"
                  variants={{
                    closed: { opacity: 1 },
                    open: { opacity: 0 },
                  }}
                  transition={{ duration: 0.2 }}
                />
                <motion.span
                  className="block h-0.5 w-full bg-gold rounded"
                  variants={{
                    closed: { rotate: 0, y: 0 },
                    open: { rotate: -45, y: -6 },
                  }}
                  transition={{ duration: 0.3 }}
                />
              </motion.div>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Slide-Out */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setIsMobileMenuOpen(false)}
            />

            {/* Slide-Out Menu */}
            <motion.div
              className="fixed top-16 left-0 right-0 bottom-0 z-40 md:hidden overflow-y-auto"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.3, ease: 'easeInOut' }}
              style={{
                background: 'linear-gradient(to bottom, rgba(2, 9, 22, 0.98), rgba(10, 15, 43, 0.95))',
                backdropFilter: 'blur(20px)',
                borderTop: '1px solid rgba(242, 201, 76, 0.2)',
              }}
            >
              <div className="container mx-auto px-4 py-8">
                {/* Mobile Navigation Links */}
                <nav className="flex flex-col space-y-4">
                  {navLinks.map((link) => {
                    const isActive = pathname === link.href || 
                      (link.href !== '/' && pathname.startsWith(link.href));
                    
                    return (
                      <MobileNavLink
                        key={link.href}
                        href={link.href}
                        label={link.label}
                        isActive={isActive}
                        onClick={() => setIsMobileMenuOpen(false)}
                      />
                    );
                  })}
                </nav>

                {/* Mobile Login Button */}
                <div className="mt-8 pt-8 border-t border-gold/20">
                  <Link href="/login" className="block w-full">
                    <Button
                      variant="ghost"
                      className="w-full border border-gold/30 text-gold hover:bg-gold/10 hover:border-gold/50 transition-all duration-300"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Login
                    </Button>
                  </Link>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}

// Desktop Nav Link Component
interface NavLinkProps {
  href: string;
  label: string;
  isActive: boolean;
}

function NavLink({ href, label, isActive }: NavLinkProps) {
  return (
    <Link
      href={href}
      className={`relative px-3 py-2 text-sm lg:text-base font-medium transition-colors duration-300 ${
        isActive
          ? 'text-gold'
          : 'text-white/70 hover:text-gold'
      }`}
    >
      <span className="relative z-10">{label}</span>
      
      {/* Active indicator */}
      {isActive && (
        <motion.div
          className="absolute inset-0 rounded-lg"
          style={{
            background: 'rgba(242, 201, 76, 0.1)',
            border: '1px solid rgba(242, 201, 76, 0.2)',
          }}
          layoutId="activeNavLink"
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        />
      )}

      {/* Hover shimmer effect */}
      <motion.div
        className="absolute inset-0 rounded-lg opacity-0"
        style={{
          background: 'linear-gradient(90deg, transparent, rgba(242, 201, 76, 0.1), transparent)',
        }}
        whileHover={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      />
    </Link>
  );
}

// Mobile Nav Link Component
interface MobileNavLinkProps {
  href: string;
  label: string;
  isActive: boolean;
  onClick: () => void;
}

function MobileNavLink({ href, label, isActive, onClick }: MobileNavLinkProps) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`block px-4 py-3 rounded-lg text-base font-medium transition-all duration-300 ${
        isActive
          ? 'text-gold bg-gold/10 border border-gold/30'
          : 'text-white/70 hover:text-gold hover:bg-gold/5'
      }`}
    >
      <motion.div
        whileTap={{ scale: 0.98 }}
        className="flex items-center justify-between"
      >
        <span>{label}</span>
        {isActive && (
          <motion.div
            className="w-2 h-2 rounded-full bg-gold"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          />
        )}
      </motion.div>
    </Link>
  );
}

