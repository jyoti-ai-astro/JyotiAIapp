/**
 * Cosmic Features Component
 * 
 * Phase 3 — Section 18: PAGES PHASE 3 (F18)
 * 
 * Shared features section component with 6 cosmic feature modules
 */

'use client';

import React, { useRef, useEffect } from 'react';
import { motion, useInView } from 'framer-motion';
import { FeatureCard, FeatureCardData } from './FeatureCard';
import { useMotionOrchestrator } from '@/components/providers/MotionProvider';

export interface FeatureModule {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  highlights?: string[];
  icon: string;
  href?: string;
  ctaLabel?: string;
  isPremium?: boolean;
  isLocked?: boolean;
}

export interface CosmicFeaturesProps {
  /** Features to display */
  features?: FeatureModule[];
  
  /** Section title */
  title?: string;
  
  /** Section subtitle */
  subtitle?: string;
  
  /** Maximum features to show (for previews) */
  maxFeatures?: number;
  
  /** Show premium badges */
  showPremium?: boolean;
  
  /** Variant for different page contexts */
  variant?: 'home' | 'cosmos' | 'astro' | 'premium' | 'about' | 'guru';
}

// Real content from Master Plan - Feature Card Data
const defaultFeatureCards: FeatureCardData[] = [
  {
    id: 'kundali',
    title: 'Kundali Engine',
    subtitle: 'Interactive 3D Birth Chart',
    highlights: [
      'Interactive 3D rotating birth chart wheel',
      'Planetary positions with degrees, house, nakshatra',
      'House-wise details for all 12 houses (Bhavas)',
      'Dasha + antar-dasha progression timeline',
      'Rashi, Lagna, Nakshatra highlights',
    ],
    icon: '/features/kundali.png',
    href: '/kundali',
  },
  {
    id: 'numerology',
    title: 'Numerology Engine',
    subtitle: 'Life Path & Destiny Numbers',
    highlights: [
      'Life Path, Destiny, Personality numbers',
      'Digit "fall-in" animation effects',
      'Compatibility scores calculation',
      'Soul, Expression, Mobile, Vehicle numbers',
    ],
    icon: '/features/numerology.png',
    href: '/numerology',
  },
  {
    id: 'aura-chakra',
    title: 'Aura & Chakra Scan',
    subtitle: 'Dynamic Energy Field Analysis',
    highlights: [
      'Dynamic aura field visualization (color-coded)',
      'Chakra bars animation (breathing rhythm)',
      'Energy imbalance detection & warnings',
      '7 chakras with pulsing energy visualization',
    ],
    icon: '/features/aura.png',
    href: '/aura',
  },
  {
    id: 'palmistry',
    title: 'Palmistry Scanner',
    subtitle: 'AI-Powered Hand Reading',
    highlights: [
      'Hand line detection with AI vision',
      'Fate, Heart, Life lines analysis',
      'Upload-based palm photo analysis',
      'Neon outline animations on hover',
    ],
    icon: '/features/palmistry.png',
    href: '/palmistry',
  },
  {
    id: 'ai-guru',
    title: 'AI Guru Chat',
    subtitle: 'Astro + Numerology + Aura Fused Insights',
    highlights: [
      'Astro + numerology + aura fused insights',
      'Context panel with all readings summary',
      'Floating messages with cosmic background',
      'RAG-powered spiritual guidance',
    ],
    icon: '/features/guru.png',
    href: '/guru',
  },
  {
    id: 'predictions',
    title: 'Reports + Predictions',
    subtitle: '12-Month Timeline Predictions',
    highlights: [
      '12-month timeline predictions engine',
      'Money, health, love, career, spiritual forecasts',
      'PDF generator with cosmic styling',
      'Page-turn effects on report preview',
    ],
    icon: '/features/reports.png',
    href: '/reports',
    isPremium: true,
  },
];

export function CosmicFeatures({
  features,
  title = 'Cosmic Features',
  subtitle = 'Powered by the Universe. Driven by Precision.',
  maxFeatures,
  showPremium = false,
  variant = 'cosmos',
}: CosmicFeaturesProps) {
  const { orchestrator } = useMotionOrchestrator();
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-100px' });
  
  // Re-animate features on route change
  useEffect(() => {
    const handleRouteChange = (data: any) => {
      if (data.trigger === 'onRouteChange' && data.data?.type?.includes('enter')) {
        // Reset in-view state to trigger re-animation
        if (sectionRef.current) {
          const cards = sectionRef.current.querySelectorAll('[data-feature-card]');
          cards.forEach((card) => {
            (card as HTMLElement).style.opacity = '0';
            (card as HTMLElement).style.transform = 'translateY(50px)';
          });
        }
      }
    };
    
    orchestrator.register('features-re-animate', handleRouteChange);
    
    return () => {
      orchestrator.unregister('features-re-animate');
    };
  }, [orchestrator]);
  
  // Use provided features or convert defaultFeatureCards to FeatureModule format
  const featureModules: FeatureModule[] = features || defaultFeatureCards.map(card => ({
    id: card.id,
    title: card.title,
    subtitle: card.subtitle,
    description: card.highlights.join('. '),
    highlights: card.highlights,
    icon: card.icon,
    href: card.href,
    isPremium: card.isPremium,
    isLocked: card.isLocked,
  }));
  
  // Filter features based on maxFeatures
  const displayFeatures = maxFeatures ? featureModules.slice(0, maxFeatures) : featureModules;
  
  // Variant-specific styling
  const variantStyles = {
    home: {
      container: 'py-20',
      grid: 'grid-cols-1 md:grid-cols-2 gap-8',
    },
    cosmos: {
      container: 'py-32',
      grid: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8',
    },
    astro: {
      container: 'py-24',
      grid: 'grid-cols-1 md:grid-cols-2 gap-8',
    },
    premium: {
      container: 'py-24',
      grid: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8',
    },
    about: {
      container: 'py-20',
      grid: 'grid-cols-1 md:grid-cols-2 gap-6',
    },
  };
  
  const styles = variantStyles[variant];
  
  return (
    <section
      ref={sectionRef}
      id="features"
      data-section-id="features"
      className={`relative ${styles.container}`}
    >
      {/* Section Header */}
      <motion.div
        className="text-center space-y-4 mb-16 px-4"
        initial={{ opacity: 0, y: 30 }}
        animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
        transition={{ duration: 0.8 }}
      >
        {subtitle && (
          <p className="text-xl md:text-2xl text-gold font-heading">{subtitle}</p>
        )}
        <h2 className="text-4xl md:text-6xl font-display font-bold text-white">
          {title}
        </h2>
      </motion.div>
      
      {/* Features Grid */}
      <div className={`container mx-auto px-4 grid ${styles.grid}`}>
        {displayFeatures.map((feature, index) => {
          // Convert FeatureModule to FeatureCardData
          const cardData: FeatureCardData = {
            id: feature.id,
            title: feature.title,
            subtitle: feature.subtitle,
            highlights: feature.highlights || [feature.description],
            icon: feature.icon,
            href: feature.href || '#',
            isPremium: feature.isPremium,
            isLocked: feature.isLocked,
          };
          
          return (
            <FeatureCard
              key={feature.id}
              feature={cardData}
              index={index}
              isInView={isInView}
              intensity={variant === 'premium' ? 1.2 : variant === 'about' ? 0.8 : 1.0}
            />
          );
        })}
      </div>
    </section>
  );
}


