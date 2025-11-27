/**
 * Past Life Card Component
 * 
 * Phase 3 — Section 35: PAGES PHASE 20 (F35)
 * 
 * Displays past life role, karmic lessons, and soul strength
 */

'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PastLifeResult } from '@/lib/guru/past-life-engine';
import { scrollParallaxY } from '@/lib/motion/gsap-motion-bridge';

export interface PastLifeCardProps {
  pastLifeResult: PastLifeResult;
  onExpand?: () => void;
}

export function PastLifeCard({ pastLifeResult, onExpand }: PastLifeCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const cardRef = React.useRef<HTMLDivElement>(null);

  // Scroll parallax integration
  React.useEffect(() => {
    if (cardRef.current) {
      scrollParallaxY(cardRef.current, 0.1, {
        start: 'top bottom',
        end: 'bottom top',
      });
    }
  }, []);

  const handleClick = () => {
    setIsExpanded(!isExpanded);
    onExpand?.();
  };

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
      className="relative bg-cosmic/90 backdrop-blur-sm border-2 border-gold/30 rounded-2xl p-6 overflow-hidden"
      style={{
        boxShadow: '0 8px 32px rgba(242, 201, 76, 0.2)',
      }}
    >
      {/* Mandala Rotation Background */}
      <motion.div
        className="absolute inset-0 opacity-10 pointer-events-none"
        animate={{ rotate: 360 }}
        transition={{ duration: 60, repeat: Infinity, ease: 'linear' }}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-64 h-64 border-4 border-gold/30 rounded-full" />
        </div>
      </motion.div>

      {/* Golden Border Glow */}
      <motion.div
        className="absolute inset-0 rounded-2xl pointer-events-none"
        animate={{
          boxShadow: [
            '0 0 20px rgba(242, 201, 76, 0.3)',
            '0 0 40px rgba(242, 201, 76, 0.5)',
            '0 0 20px rgba(242, 201, 76, 0.3)',
          ],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* Content */}
      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-2xl font-display font-bold text-gold">
            Past Life Insights
          </h3>
          <motion.button
            onClick={handleClick}
            className="text-gold/60 hover:text-gold transition-colors"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            {isExpanded ? '▼' : '▶'}
          </motion.button>
        </div>

        {/* Past Life Role */}
        <div className="mb-4">
          <p className="text-sm text-gold/60 mb-1">Your Past Life Role</p>
          <p className="text-xl font-heading text-white">{pastLifeResult.pastLifeRole}</p>
        </div>

        {/* Soul Strength Rating */}
        <div className="mb-4">
          <p className="text-sm text-gold/60 mb-2">Soul Strength</p>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((level) => (
              <motion.div
                key={level}
                className={`w-8 h-8 rounded-full border-2 ${
                  level <= pastLifeResult.soulStrength
                    ? 'bg-gold border-gold'
                    : 'bg-transparent border-gold/30'
                }`}
                animate={
                  level <= pastLifeResult.soulStrength
                    ? {
                        scale: [1, 1.2, 1],
                        opacity: [0.7, 1, 0.7],
                      }
                    : {}
                }
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: level * 0.1,
                }}
              />
            ))}
          </div>
        </div>

        {/* Expanded Content */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="pt-4 border-t border-gold/20 space-y-4">
                {/* Karmic Lessons */}
                {pastLifeResult.unresolvedLessons.length > 0 && (
                  <div>
                    <h4 className="text-sm font-heading text-gold mb-2">Unresolved Lessons</h4>
                    <ul className="space-y-1">
                      {pastLifeResult.unresolvedLessons.map((lesson, index) => (
                        <li key={index} className="text-white/70 text-sm flex items-start gap-2">
                          <span className="text-gold mt-1">•</span>
                          <span>{lesson}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Karmic Debts */}
                {pastLifeResult.karmicDebts.length > 0 && (
                  <div>
                    <h4 className="text-sm font-heading text-gold mb-2">Karmic Debts</h4>
                    <ul className="space-y-1">
                      {pastLifeResult.karmicDebts.map((debt, index) => (
                        <li key={index} className="text-white/70 text-sm flex items-start gap-2">
                          <span className="text-gold mt-1">•</span>
                          <span>{debt}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Repeating Cycles */}
                {pastLifeResult.repeatingCycles.length > 0 && (
                  <div>
                    <h4 className="text-sm font-heading text-gold mb-2">Repeating Cycles</h4>
                    <ul className="space-y-1">
                      {pastLifeResult.repeatingCycles.map((cycle, index) => (
                        <li key={index} className="text-white/70 text-sm flex items-start gap-2">
                          <span className="text-gold mt-1">•</span>
                          <span>{cycle}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Karmic Patterns */}
                {pastLifeResult.karmicPatterns.length > 0 && (
                  <div>
                    <h4 className="text-sm font-heading text-gold mb-2">Karmic Patterns</h4>
                    <div className="space-y-2">
                      {pastLifeResult.karmicPatterns.map((pattern, index) => (
                        <div key={index} className="bg-gold/5 rounded-lg p-3 border border-gold/20">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-gold text-sm font-heading capitalize">
                              {pattern.type}
                            </span>
                            <span className="text-gold/60 text-xs">
                              {Math.round(pattern.intensity * 100)}%
                            </span>
                          </div>
                          <p className="text-white/70 text-xs">{pattern.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

