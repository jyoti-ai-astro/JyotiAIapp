/**
 * Cosmic Footer Component
 * 
 * Phase 3 — Section 20: PAGES PHASE 5 (F20)
 * 
 * Shared cosmic footer component with sacred mandala, nebula gradient, and navigation
 */

'use client';

import React, { useRef, useState, useEffect } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useGlobalProgress } from '@/hooks/use-global-progress';
import { useMotionOrchestrator } from '@/components/providers/MotionProvider';
import { useSectionMotion } from '@/hooks/motion/useSectionMotion';
import { useScrollMotion } from '@/hooks/motion/useScrollMotion';

export interface CosmicFooterProps {
  /** Footer intensity multiplier (0-2) */
  intensity?: number;
  
  /** Additional className */
  className?: string;
}

export function CosmicFooter({ intensity = 1.0, className = '' }: CosmicFooterProps) {
  const { globalProgress } = useGlobalProgress();
  const { orchestrator } = useMotionOrchestrator();
  const scrollMotion = useScrollMotion();
  const footerRef = useRef<HTMLDivElement>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  
  // Section motion tracking with scroll features
  const sectionId = 'footer';
  const { sectionRef, smoothedProgress, scrollDirection, scrollVelocity } = useSectionMotion({
    sectionId,
    onEnter: () => {
      orchestrator?.onSectionEnter?.(sectionId);
    },
    onExit: () => {
      orchestrator?.onSectionExit?.(sectionId);
      // Emit scene event for footer exit (Phase 12 - F27)
      orchestrator?.emitSceneEvent?.('footer-exit');
    },
    onProgress: (progress) => {
      // Footer shimmer activates on scroll end (high progress)
      if (progress > 0.8) {
        orchestrator?.footerShimmer?.(progress);
        // Emit scene event for footer enter (Phase 12 - F27)
        orchestrator?.emitSceneEvent?.('footer-enter');
      }
      orchestrator?.scrollGlow?.(sectionId, progress);
    },
  });
  
  // Sync refs
  useEffect(() => {
    if (footerRef.current) {
      (sectionRef as React.MutableRefObject<HTMLElement | null>).current = footerRef.current;
    }
  }, [footerRef, sectionRef]);
  
  // Mouse parallax
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springX = useSpring(mouseX, { stiffness: 50, damping: 20 });
  const springY = useSpring(mouseY, { stiffness: 50, damping: 20 });
  
  React.useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (footerRef.current) {
        const rect = footerRef.current.getBoundingClientRect();
        const x = (e.clientX - rect.left - rect.width / 2) / rect.width;
        const y = (e.clientY - rect.top - rect.height / 2) / rect.height;
        mouseX.set(x * 30);
        mouseY.set(y * 30);
        setMousePosition({ x, y });
      }
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [mouseX, mouseY]);
  
  // Floating star particles (8-12)
  const stars = Array.from({ length: 10 }, (_, i) => ({
    id: i,
    x: (i * 10) % 100,
    y: (i * 8) % 100,
    delay: i * 0.3,
    duration: 4 + (i % 3),
  }));
  
  return (
    <footer
      ref={footerRef}
      id={sectionId}
      data-section-id={sectionId}
      className={`relative overflow-hidden ${className}`}
      style={{
        opacity: globalProgress * intensity,
      }}
    >
      {/* Sacred Mandala Glow Layer (rotating 0.1deg/sec) */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
        style={{
          x: springX,
          y: springY,
        }}
        animate={{
          rotate: [0, 360],
        }}
        transition={{
          duration: 3600, // 0.1deg/sec = 3600 seconds for full rotation
          repeat: Infinity,
          ease: 'linear',
        }}
      >
        <motion.div
          className="absolute w-96 h-96 rounded-full border-2"
          style={{
            borderColor: `rgba(242, 201, 76, ${0.15 * intensity})`,
            opacity: 0.3 * intensity,
          }}
        >
          <div className="absolute inset-0 flex items-center justify-center">
            <div
              className="absolute w-64 h-64 rounded-full border"
              style={{
                borderColor: `rgba(110, 45, 235, ${0.1 * intensity})`,
                opacity: 0.2 * intensity,
              }}
            />
          </div>
        </motion.div>
      </motion.div>
      
      {/* Nebula Fade Gradient (navy → violet → gold accents) */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `linear-gradient(to bottom, 
            rgba(2, 9, 22, 0.8) 0%, 
            rgba(10, 15, 43, 0.6) 30%, 
            rgba(110, 45, 235, 0.3) 60%, 
            rgba(242, 201, 76, 0.1) 100%)`,
          opacity: intensity,
        }}
      />
      
      {/* Gold Linework Grid (subtle, 12% opacity) */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(rgba(242, 201, 76, ${0.12 * intensity}) 1px, transparent 1px),
            linear-gradient(90deg, rgba(242, 201, 76, ${0.12 * intensity}) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
          opacity: intensity,
          x: springX * 0.3,
          y: springY * 0.3,
        }}
      />
      
      {/* Floating Star Particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {stars.map((star) => (
          <motion.div
            key={star.id}
            className="absolute w-1 h-1 rounded-full bg-gold"
            style={{
              left: `${star.x}%`,
              top: `${star.y}%`,
            }}
            animate={{
              y: [0, -20, 0],
              opacity: [0.3, 0.8, 0.3],
              scale: [1, 1.5, 1],
            }}
            transition={{
              duration: star.duration,
              repeat: Infinity,
              delay: star.delay,
              ease: 'easeInOut',
            }}
          />
        ))}
      </div>
      
      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8 mb-12">
          {/* Column 1: Brand */}
          <div>
            <h3 className="text-gold font-heading text-xl mb-4">Jyoti</h3>
            <p className="text-white/70 text-sm mb-4">
              Your Personal Spiritual OS. Combining ancient Indian sciences with modern AI technology.
            </p>
            {/* Social Icons */}
            <div className="flex gap-3 mt-4">
              <SocialIcon
                href="https://instagram.com/jyoti.ai"
                label="Instagram"
                icon="📷"
                intensity={intensity}
              />
              <SocialIcon
                href="https://youtube.com/@jyoti.ai"
                label="YouTube"
                icon="▶️"
                intensity={intensity}
              />
              <SocialIcon
                href="https://twitter.com/jyoti_ai"
                label="Twitter/X"
                icon="🐦"
                intensity={intensity}
              />
              <SocialIcon
                href="mailto:support@jyoti.ai"
                label="Email"
                icon="✉️"
                intensity={intensity}
              />
            </div>
          </div>
          
          {/* Column 2: Product */}
          <div>
            <h3 className="text-gold font-heading text-lg mb-4">Product</h3>
            <nav className="space-y-2">
              <FooterLink href="/features" label="Features" intensity={intensity} />
              <FooterLink href="/pricing" label="Pricing" intensity={intensity} />
              <FooterLink href="/guru" label="AI Guru" intensity={intensity} />
              <FooterLink href="/modules" label="Modules" intensity={intensity} />
              <FooterLink href="/updates" label="Updates" intensity={intensity} />
            </nav>
          </div>
          
          {/* Column 3: Company */}
          <div>
            <h3 className="text-gold font-heading text-lg mb-4">Company</h3>
            <nav className="space-y-2">
              <FooterLink href="/company/about" label="About" intensity={intensity} />
              <FooterLink href="/blog" label="Blog" intensity={intensity} />
              <FooterLink href="/company/careers" label="Careers" intensity={intensity} />
              <FooterLink href="/company/press-kit" label="Press Kit" intensity={intensity} />
              <FooterLink href="/company/contact" label="Contact" intensity={intensity} />
            </nav>
          </div>
          
          {/* Column 4: Resources */}
          <div>
            <h3 className="text-gold font-heading text-lg mb-4">Resources</h3>
            <nav className="space-y-2">
              <FooterLink href="/support" label="Help Center" intensity={intensity} />
              <FooterLink href="/support" label="Community" intensity={intensity} />
              <FooterLink href="/blog" label="Guides" intensity={intensity} />
              <FooterLink href="/status" label="Status" intensity={intensity} />
            </nav>
          </div>
          
          {/* Column 5: Legal */}
          <div>
            <h3 className="text-gold font-heading text-lg mb-4">Legal</h3>
            <nav className="space-y-2">
              <FooterLink href="/privacy" label="Privacy Policy" intensity={intensity} />
              <FooterLink href="/terms" label="Terms of Service" intensity={intensity} />
            </nav>
          </div>
        </div>
        
        {/* Copyright */}
        <div className="border-t border-white/10 pt-8 mt-8">
          <p className="text-center text-white/60 text-sm">
            © 2025 Jyoti.ai — Guided by Ancient Wisdom + AI
          </p>
        </div>
      </div>
    </footer>
  );
}

interface FooterLinkProps {
  href: string;
  label: string;
  intensity: number;
}

function FooterLink({ href, label, intensity }: FooterLinkProps) {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <Link
      href={href}
      className="block text-white/70 hover:text-gold transition-colors duration-300 relative group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <motion.span
        animate={{
          x: isHovered ? 4 : 0,
        }}
        transition={{ duration: 0.2 }}
      >
        {label}
      </motion.span>
      
      {/* Soft Gold Shimmer on Hover */}
      {isHovered && (
        <motion.div
          className="absolute -inset-1 rounded"
          style={{
            background: `linear-gradient(90deg, transparent, rgba(242, 201, 76, ${0.3 * intensity}), transparent)`,
            backgroundSize: '200% 100%',
          }}
          animate={{
            backgroundPosition: ['0% 0%', '200% 0%'],
          }}
          transition={{
            duration: 1,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
      )}
    </Link>
  );
}

interface SocialIconProps {
  href: string;
  label: string;
  icon: string;
  intensity: number;
}

function SocialIcon({ href, label, icon, intensity }: SocialIconProps) {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <motion.a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="block w-10 h-10 rounded-full border border-gold/30 bg-cosmic/50 flex items-center justify-center text-gold hover:bg-gold/10 transition-colors duration-300 relative group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      aria-label={label}
    >
      <span className="text-lg">{icon}</span>
      
      {/* Soft Gold Shimmer on Hover */}
      {isHovered && (
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{
            boxShadow: `0 0 ${15 * intensity}px rgba(242, 201, 76, ${0.5 * intensity})`,
          }}
          animate={{
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      )}
    </motion.a>
  );
}

