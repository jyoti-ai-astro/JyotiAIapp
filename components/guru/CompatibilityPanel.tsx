/**
 * Compatibility Panel Component
 * 
 * Phase 3 — Section 37: PAGES PHASE 22 (F37)
 * 
 * Displays compatibility report with synergy, conflict, strengths, challenges, and guidance
 */

'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { CompatibilityReport, CompatibilityType } from '@/lib/guru/compatibility-engine';
import { scrollParallaxY } from '@/lib/motion/gsap-motion-bridge';

export interface CompatibilityPanelProps {
  report: CompatibilityReport;
  onExpand?: () => void;
}

export const CompatibilityPanel = React.memo(function CompatibilityPanel({ report, onExpand }: CompatibilityPanelProps) {
  const panelRef = React.useRef<HTMLDivElement>(null);

  // Scroll parallax integration
  React.useEffect(() => {
    if (panelRef.current) {
      scrollParallaxY(panelRef.current, 0.1, {
        start: 'top bottom',
        end: 'bottom top',
      });
    }
  }, []);

  const getTypeGlow = (type: CompatibilityType): string => {
    switch (type) {
      case 'love':
        return 'shadow-[0_4px_24px_rgba(255,182,193,0.4),0_0_12px_rgba(255,182,193,0.2)] border-pink/50 bg-pink/10 hover:shadow-[0_4px_32px_rgba(255,182,193,0.5)]';
      case 'marriage':
        return 'shadow-[0_4px_24px_rgba(242,201,76,0.4),0_0_12px_rgba(242,201,76,0.2)] border-gold/50 bg-gold/10 hover:shadow-[0_4px_32px_rgba(242,201,76,0.5)]';
      case 'friendship':
        return 'shadow-[0_4px_24px_rgba(139,92,246,0.4),0_0_12px_rgba(139,92,246,0.2)] border-violet/50 bg-violet/10 hover:shadow-[0_4px_32px_rgba(139,92,246,0.5)]';
      case 'career':
        return 'shadow-[0_4px_24px_rgba(59,130,246,0.4),0_0_12px_rgba(59,130,246,0.2)] border-blue/50 bg-blue/10 hover:shadow-[0_4px_32px_rgba(59,130,246,0.5)]';
    }
  };

  const getTypeTitle = (type: CompatibilityType): string => {
    switch (type) {
      case 'love':
        return 'Love Compatibility';
      case 'marriage':
        return 'Marriage Compatibility';
      case 'friendship':
        return 'Friendship Compatibility';
      case 'career':
        return 'Career Compatibility';
    }
  };

  const colorClasses = 
    report.colorCode === 'gold' ? 'text-gold border-gold/30' :
    report.colorCode === 'violet' ? 'text-violet border-violet/30' :
    'text-red border-red/30';

  return (
    <motion.div
      ref={panelRef}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: 0.6,
        ease: [0.4, 0, 0.2, 1]
      }}
      className={`relative bg-cosmic/90 backdrop-blur-sm border-2 rounded-2xl p-6 md:p-8 cursor-pointer transition-all duration-300 ${getTypeGlow(report.type)}`}
      onClick={onExpand}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <h3 className="text-xl font-display font-bold text-white mb-4">
        {getTypeTitle(report.type)}
      </h3>

      {/* Rating */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-white/70">Compatibility Rating</span>
          <span className={`text-2xl font-heading ${colorClasses}`}>
            {report.rating}/100
          </span>
        </div>
        <div className="h-3 bg-white/10 rounded-full overflow-hidden">
          <motion.div
            className={`h-full ${report.colorCode === 'gold' ? 'bg-gold' : report.colorCode === 'violet' ? 'bg-violet' : 'bg-red'}`}
            initial={{ width: 0 }}
            animate={{ width: `${report.rating}%` }}
            transition={{ duration: 1, delay: 0.2 }}
          />
        </div>
      </div>

      {/* Synergy & Conflict Bars */}
      <div className="grid grid-cols-2 gap-4 mb-5">
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs md:text-sm text-white/60">Synergy</span>
            <span className="text-xs md:text-sm text-gold font-heading">
              {(report.synergyScore * 100).toFixed(0)}%
            </span>
          </div>
          <div className="h-2.5 bg-white/10 rounded-full overflow-hidden backdrop-blur-sm">
            <motion.div
              className="h-full bg-gold rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${report.synergyScore * 100}%` }}
              transition={{ 
                duration: 1.2, 
                delay: 0.3,
                ease: [0.4, 0, 0.2, 1]
              }}
            />
          </div>
        </div>
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs md:text-sm text-white/60">Conflict</span>
            <span className="text-xs md:text-sm text-red font-heading">
              {(report.conflictScore * 100).toFixed(0)}%
            </span>
          </div>
          <div className="h-2.5 bg-white/10 rounded-full overflow-hidden backdrop-blur-sm">
            <motion.div
              className="h-full bg-red rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${report.conflictScore * 100}%` }}
              transition={{ 
                duration: 1.2, 
                delay: 0.4,
                ease: [0.4, 0, 0.2, 1]
              }}
            />
          </div>
        </div>
      </div>

      {/* Strengths */}
      {report.strengths.length > 0 && (
        <div className="mb-5">
          <h4 className="text-sm md:text-base font-heading text-gold mb-3">Strengths</h4>
          <ul className="space-y-2">
            {report.strengths.map((strength, i) => (
              <motion.li 
                key={i} 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1, duration: 0.4 }}
                className="text-xs md:text-sm text-white/70 flex items-start group"
              >
                <span className="text-gold mr-2 group-hover:scale-110 transition-transform">✨</span>
                {strength}
              </motion.li>
            ))}
          </ul>
        </div>
      )}

      {/* Challenges */}
      {report.challenges.length > 0 && (
        <div className="mb-5">
          <h4 className="text-sm md:text-base font-heading text-red mb-3">Challenges</h4>
          <ul className="space-y-2">
            {report.challenges.map((challenge, i) => (
              <motion.li 
                key={i} 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1, duration: 0.4 }}
                className="text-xs md:text-sm text-white/70 flex items-start group"
              >
                <span className="text-red mr-2 group-hover:scale-110 transition-transform">⚠️</span>
                {challenge}
              </motion.li>
            ))}
          </ul>
        </div>
      )}

      {/* Guidance */}
      {report.guidance.length > 0 && (
        <div>
          <h4 className="text-sm font-heading text-violet mb-2">Guidance</h4>
          <ul className="space-y-1">
            {report.guidance.map((guidance, i) => (
              <li key={i} className="text-xs text-white/70 flex items-start">
                <span className="text-violet mr-2">💫</span>
                {guidance}
              </li>
            ))}
          </ul>
        </div>
      )}
    </motion.div>
  );
});

