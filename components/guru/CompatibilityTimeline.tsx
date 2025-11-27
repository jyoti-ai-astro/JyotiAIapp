/**
 * Compatibility Timeline Component
 * 
 * Phase 3 — Section 37: PAGES PHASE 22 (F37)
 * 
 * Displays 12-month compatibility timeline with harmony index
 */

'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CompatibilityMonth } from '@/lib/guru/compatibility-timeline';
import { scrollParallaxY } from '@/lib/motion/gsap-motion-bridge';
import { useMotionOrchestrator } from '@/components/providers/MotionProvider';

export interface CompatibilityTimelineProps {
  timeline: CompatibilityMonth[];
  onMonthClick?: (month: CompatibilityMonth) => void;
}

export function CompatibilityTimeline({ timeline, onMonthClick }: CompatibilityTimelineProps) {
  const [expandedMonth, setExpandedMonth] = useState<number | null>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const { orchestrator } = useMotionOrchestrator();

  // Scroll parallax integration
  React.useEffect(() => {
    if (containerRef.current) {
      scrollParallaxY(containerRef.current, 0.1, {
        start: 'top bottom',
        end: 'bottom top',
      });
    }
  }, []);

  const handleMonthClick = (month: CompatibilityMonth) => {
    setExpandedMonth(expandedMonth === month.month ? null : month.month);
    
    // Emit scene events (Phase 22 - F37)
    if (month.harmonyIndex >= 0.7) {
      orchestrator.emitSceneEvent('guru-harmony', { harmony: month.harmonyIndex });
    } else if (month.harmonyIndex < 0.5) {
      orchestrator.emitSceneEvent('guru-conflict', { conflict: 1 - month.harmonyIndex });
    } else {
      orchestrator.emitSceneEvent('guru-synergy', { score: month.harmonyIndex });
    }
    
    onMonthClick?.(month);
  };

  const getColorClasses = (colorCode: 'gold' | 'violet' | 'red') => {
    switch (colorCode) {
      case 'gold':
        return {
          border: 'border-gold/50',
          bg: 'bg-gold/10',
          text: 'text-gold',
          glow: 'shadow-[0_0_20px_rgba(242,201,76,0.5)]',
        };
      case 'violet':
        return {
          border: 'border-violet/50',
          bg: 'bg-violet/10',
          text: 'text-violet',
          glow: 'shadow-[0_0_20px_rgba(139,92,246,0.3)]',
        };
      case 'red':
        return {
          border: 'border-red/50',
          bg: 'bg-red/10',
          text: 'text-red',
          glow: 'shadow-[0_0_20px_rgba(239,68,68,0.3)]',
        };
    }
  };

  return (
    <div ref={containerRef} className="space-y-4">
      <h3 className="text-2xl font-display font-bold text-gold mb-6">
        12-Month Compatibility Timeline
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {timeline.map((month, index) => {
          const colors = getColorClasses(month.colorCode);

          return (
            <motion.div
              key={month.month}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`relative rounded-lg border-2 ${colors.border} ${colors.bg} p-4 cursor-pointer transition-all ${colors.glow}`}
              onClick={() => handleMonthClick(month)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {/* Month Header */}
              <div className="flex items-center justify-between mb-3">
                <h4 className={`text-lg font-heading ${colors.text}`}>
                  {month.monthName}
                </h4>
                <div className={`w-3 h-3 rounded-full ${colors.bg} border ${colors.border}`} />
              </div>

              {/* Harmony Meter */}
              <div className="mb-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-white/60">Harmony</span>
                  <span className={`text-xs font-heading ${colors.text}`}>
                    {(month.harmonyIndex * 100).toFixed(0)}%
                  </span>
                </div>
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <motion.div
                    className={`h-full ${colors.bg}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${month.harmonyIndex * 100}%` }}
                    transition={{ duration: 0.5, delay: index * 0.05 }}
                  />
                </div>
              </div>

              {/* Energy Score */}
              <div className="mb-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-white/60">Energy</span>
                  <span className={`text-xs font-heading ${colors.text}`}>
                    {month.energyScore}/10
                  </span>
                </div>
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <motion.div
                    className={`h-full ${colors.bg}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${(month.energyScore / 10) * 100}%` }}
                    transition={{ duration: 0.5, delay: index * 0.05 + 0.1 }}
                  />
                </div>
              </div>

              {/* Expanded Details */}
              <AnimatePresence>
                {expandedMonth === month.month && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden mt-3 pt-3 border-t border-white/10"
                  >
                    {month.cautionNotes && month.cautionNotes.length > 0 && (
                      <div className="mb-2">
                        <h5 className="text-xs font-heading text-red mb-1">Caution Notes</h5>
                        {month.cautionNotes.map((note, nIndex) => (
                          <p key={nIndex} className="text-xs text-red/60">⚠️ {note}</p>
                        ))}
                      </div>
                    )}

                    {month.report.strengths.length > 0 && (
                      <div className="mb-2">
                        <h5 className="text-xs font-heading text-gold mb-1">Strengths</h5>
                        {month.report.strengths.slice(0, 2).map((strength, sIndex) => (
                          <p key={sIndex} className="text-xs text-white/60">✨ {strength}</p>
                        ))}
                      </div>
                    )}

                    {month.report.guidance.length > 0 && (
                      <div>
                        <h5 className="text-xs font-heading text-violet mb-1">Guidance</h5>
                        <p className="text-xs text-white/60">💫 {month.report.guidance[0]}</p>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

