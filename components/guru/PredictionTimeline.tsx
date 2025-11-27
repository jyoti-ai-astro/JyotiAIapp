/**
 * Prediction Timeline Component
 * 
 * Phase 3 — Section 36: PAGES PHASE 21 (F36)
 * 
 * Displays 12-month prediction timeline with glowing month cards
 */

'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TimelineMonth, Prediction } from '@/lib/guru/timeline-builder';
import { scrollParallaxY } from '@/lib/motion/gsap-motion-bridge';

export interface PredictionTimelineProps {
  timeline: TimelineMonth[];
  onMonthClick?: (month: TimelineMonth) => void;
}

export const PredictionTimeline = React.memo(function PredictionTimeline({ timeline, onMonthClick }: PredictionTimelineProps) {
  const [expandedMonth, setExpandedMonth] = useState<number | null>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);

  // Scroll parallax integration
  React.useEffect(() => {
    if (containerRef.current) {
      scrollParallaxY(containerRef.current, 0.1, {
        start: 'top bottom',
        end: 'bottom top',
      });
    }
  }, []);

  const handleMonthClick = (month: TimelineMonth) => {
    setExpandedMonth(expandedMonth === month.month ? null : month.month);
    onMonthClick?.(month);
  };

  const getColorClasses = (colorCode: 'gold' | 'violet' | 'red') => {
    switch (colorCode) {
      case 'gold':
        return {
          border: 'border-gold/50',
          bg: 'bg-gold/10',
          text: 'text-gold',
          glow: 'shadow-[0_4px_24px_rgba(242,201,76,0.4),0_0_12px_rgba(242,201,76,0.2)]',
        };
      case 'violet':
        return {
          border: 'border-violet/50',
          bg: 'bg-violet/10',
          text: 'text-violet',
          glow: 'shadow-[0_4px_24px_rgba(139,92,246,0.35),0_0_12px_rgba(139,92,246,0.15)]',
        };
      case 'red':
        return {
          border: 'border-red/50',
          bg: 'bg-red/10',
          text: 'text-red',
          glow: 'shadow-[0_4px_24px_rgba(239,68,68,0.35),0_0_12px_rgba(239,68,68,0.15)]',
        };
    }
  };

  return (
    <div ref={containerRef} className="space-y-4">
      <h3 className="text-2xl font-display font-bold text-gold mb-6">
        12-Month Cosmic Timeline
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {timeline.map((month, index) => {
          const colors = getColorClasses(month.colorCode);
          const topPrediction = month.predictions
            .sort((a, b) => b.probability - a.probability)[0];

          return (
            <motion.div
              key={month.month}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ 
                delay: index * 0.05,
                duration: 0.5,
                ease: [0.4, 0, 0.2, 1]
              }}
              className={`relative rounded-xl border-2 ${colors.border} ${colors.bg} p-4 md:p-5 cursor-pointer transition-all duration-300 ${colors.glow} backdrop-blur-sm`}
              onClick={() => handleMonthClick(month)}
              whileHover={{ 
                scale: 1.03,
                transition: { duration: 0.2, ease: [0.4, 0, 0.2, 1] }
              }}
              whileTap={{ scale: 0.98 }}
            >
              {/* Month Header */}
              <div className="flex items-center justify-between mb-3">
                <h4 className={`text-lg font-heading ${colors.text}`}>
                  {month.monthName}
                </h4>
                <div className={`w-3 h-3 rounded-full ${colors.bg} border ${colors.border}`} />
              </div>

              {/* Energy Bar */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs md:text-sm text-white/60">Energy</span>
                  <span className={`text-xs md:text-sm font-heading ${colors.text}`}>
                    {month.overallEnergy}/10
                  </span>
                </div>
                <div className="h-2.5 bg-white/10 rounded-full overflow-hidden backdrop-blur-sm">
                  <motion.div
                    className={`h-full ${colors.bg} rounded-full`}
                    initial={{ width: 0 }}
                    animate={{ width: `${(month.overallEnergy / 10) * 100}%` }}
                    transition={{ 
                      duration: 0.8, 
                      delay: index * 0.05,
                      ease: [0.4, 0, 0.2, 1]
                    }}
                  />
                </div>
              </div>

              {/* Probability Ring */}
              {topPrediction && (
                <div className="mb-4 flex items-center gap-3">
                  <div className="relative w-14 h-14 md:w-16 md:h-16 flex-shrink-0">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle
                        cx="50%"
                        cy="50%"
                        r="45%"
                        fill="none"
                        stroke="rgba(255,255,255,0.1)"
                        strokeWidth="3"
                      />
                      <motion.circle
                        cx="50%"
                        cy="50%"
                        r="45%"
                        fill="none"
                        stroke={month.colorCode === 'gold' ? '#F2C94C' : month.colorCode === 'violet' ? '#8B5CF6' : '#EF4444'}
                        strokeWidth="3"
                        strokeLinecap="round"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: topPrediction.probability }}
                        transition={{ 
                          duration: 0.8, 
                          delay: index * 0.05,
                          ease: [0.4, 0, 0.2, 1]
                        }}
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className={`text-xs md:text-sm font-heading ${colors.text}`}>
                        {Math.round(topPrediction.probability * 100)}%
                      </span>
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs md:text-sm text-white/70 capitalize font-heading mb-1">
                      {topPrediction.category}
                    </p>
                    <p className="text-xs text-white/50 line-clamp-2">
                      {topPrediction.prediction.substring(0, 60)}...
                    </p>
                  </div>
                </div>
              )}

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
                    <p className="text-xs text-white/70 mb-2">{month.summary}</p>
                    
                    <div className="space-y-2">
                      {month.predictions.map((prediction, pIndex) => (
                        <div key={pIndex} className="bg-white/5 rounded p-2">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-heading text-white capitalize">
                              {prediction.category}
                            </span>
                            <span className={`text-xs ${colors.text}`}>
                              {Math.round(prediction.probability * 100)}%
                            </span>
                          </div>
                          <p className="text-xs text-white/60">{prediction.prediction}</p>
                          
                          {prediction.cautionNotes && prediction.cautionNotes.length > 0 && (
                            <div className="mt-1">
                              {prediction.cautionNotes.map((note, nIndex) => (
                                <p key={nIndex} className="text-xs text-red/60">⚠️ {note}</p>
                              ))}
                            </div>
                          )}
                          
                          {prediction.blessings && prediction.blessings.length > 0 && (
                            <div className="mt-1">
                              {prediction.blessings.map((blessing, bIndex) => (
                                <p key={bIndex} className="text-xs text-gold/60">✨ {blessing}</p>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
});

