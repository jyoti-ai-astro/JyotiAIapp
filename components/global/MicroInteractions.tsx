/**
 * Micro Interactions Component
 * 
 * Provides soft hover glows, gold ripples, and subtle animations
 */

'use client';

import React, { useEffect } from 'react';
import { motion } from 'framer-motion';

interface MicroInteractionsProps {
  children: React.ReactNode;
  className?: string;
}

export function MicroInteractions({ children, className = '' }: MicroInteractionsProps) {
  return (
    <motion.div
      className={className}
      whileHover={{
        scale: 1.02,
        transition: { duration: 0.2 },
      }}
      whileTap={{
        scale: 0.98,
        transition: { duration: 0.1 },
      }}
    >
      {children}
    </motion.div>
  );
}

// Gold ripple effect on click
export function useGoldRipple() {
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest('[data-ripple]')) {
        const ripple = document.createElement('div');
        ripple.className = 'absolute rounded-full bg-gold/30 pointer-events-none';
        ripple.style.width = '20px';
        ripple.style.height = '20px';
        ripple.style.left = `${e.clientX - 10}px`;
        ripple.style.top = `${e.clientY - 10}px`;
        ripple.style.animation = 'ripple 0.6s ease-out';
        
        const container = target.closest('[data-ripple]') as HTMLElement;
        if (container) {
          container.style.position = 'relative';
          container.style.overflow = 'hidden';
          container.appendChild(ripple);
          
          setTimeout(() => ripple.remove(), 600);
        }
      }
    };

    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);
}

// Soft hover glow effect
export function HoverGlow({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div
      className={`${className} transition-all duration-300`}
      whileHover={{
        boxShadow: '0 0 20px rgba(242, 201, 76, 0.3)',
        transition: { duration: 0.3 },
      }}
    >
      {children}
    </motion.div>
  );
}

// Add CSS for ripple animation
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes ripple {
      to {
        transform: scale(4);
        opacity: 0;
      }
    }
  `;
  document.head.appendChild(style);
}

