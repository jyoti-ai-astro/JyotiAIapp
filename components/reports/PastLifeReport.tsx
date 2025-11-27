/**
 * Past Life Report Component
 * 
 * Phase 3 — Section 38: PAGES PHASE 23 (F38)
 * 
 * Displays Past Life and Karmic analysis report
 */

'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ReportSection } from './ReportSection';
import { PastLifeResult } from '@/lib/guru/past-life-engine';

export interface PastLifeReportProps {
  pastLife?: PastLifeResult | null;
}

export function PastLifeReport({ pastLife }: PastLifeReportProps) {
  if (!pastLife) {
    return (
      <div className="text-center py-16 text-white/60">
        No Past Life data available. Please generate your past life analysis first.
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Past Life Role */}
      <ReportSection
        title="Past Life Role"
        subtitle="Your soul's previous incarnation"
        icon="👑"
      >
        <div className="bg-white/5 rounded-lg p-6 border border-gold/20">
          <div className="text-center mb-4">
            <motion.div
              className="text-6xl mb-4"
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
            >
              👑
            </motion.div>
            <h3 className="text-3xl font-display font-bold text-gold mb-2">
              {pastLife.pastLifeRole}
            </h3>
          </div>
          <p className="text-white/80 text-center leading-relaxed">
            In your past life, you carried the essence of a <span className="text-gold font-heading">{pastLife.pastLifeRole}</span>. 
            This role shapes your current life's purpose, talents, and the lessons you're here to learn.
          </p>
        </div>
      </ReportSection>

      {/* Unresolved Karmic Lessons */}
      {pastLife.unresolvedLessons && pastLife.unresolvedLessons.length > 0 && (
        <ReportSection
          title="Unresolved Karmic Lessons"
          subtitle="Lessons carried forward from past lives"
          icon="📜"
        >
          <div className="space-y-3">
            {pastLife.unresolvedLessons.map((lesson, index) => (
              <div
                key={index}
                className="bg-white/5 rounded-lg p-4 border border-violet/30"
              >
                <div className="flex items-start gap-3">
                  <span className="text-violet text-xl">📜</span>
                  <div>
                    <h4 className="text-violet font-heading mb-1">Lesson {index + 1}</h4>
                    <p className="text-white/80">{lesson}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ReportSection>
      )}

      {/* Repeating Cycles */}
      {pastLife.repeatingCycles && pastLife.repeatingCycles.length > 0 && (
        <ReportSection
          title="Repeating Cycles"
          subtitle="Karmic patterns that surface in your life"
          icon="🔄"
        >
          <div className="space-y-3">
            {pastLife.repeatingCycles.map((cycle, index) => (
              <div
                key={index}
                className="bg-white/5 rounded-lg p-4 border border-gold/30"
              >
                <div className="flex items-start gap-3">
                  <span className="text-gold text-xl">🔄</span>
                  <div>
                    <h4 className="text-gold font-heading mb-1">Cycle {index + 1}</h4>
                    <p className="text-white/80">{cycle}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ReportSection>
      )}

      {/* Soul Strength */}
      <ReportSection
        title="Soul Strength"
        subtitle={`Rating: ${pastLife.soulStrength}/5`}
        icon="💫"
      >
        <div className="bg-white/5 rounded-lg p-6 border border-gold/20">
          <div className="flex items-center justify-center gap-2 mb-4">
            {[...Array(5)].map((_, i) => (
              <motion.span
                key={i}
                className={`w-8 h-8 rounded-full ${
                  i < pastLife.soulStrength ? 'bg-gold' : 'bg-white/20'
                }`}
                animate={{
                  scale: i < pastLife.soulStrength ? [1, 1.2, 1] : 1,
                  opacity: i < pastLife.soulStrength ? [0.8, 1, 0.8] : 0.5,
                }}
                transition={{ duration: 1, repeat: Infinity, delay: i * 0.1 }}
              />
            ))}
          </div>
          <p className="text-white/80 text-center leading-relaxed">
            Your soul strength of <span className="text-gold font-heading">{pastLife.soulStrength}/5</span> indicates 
            your spiritual resilience and capacity for growth. This strength helps you navigate 
            karmic challenges and fulfill your soul's purpose.
          </p>
        </div>
      </ReportSection>

      {/* Karmic Debts */}
      {pastLife.karmicDebts && pastLife.karmicDebts.length > 0 && (
        <ReportSection
          title="Karmic Debts"
          subtitle="Responsibilities from past actions"
          icon="⚖️"
        >
          <div className="space-y-3">
            {pastLife.karmicDebts.map((debt, index) => (
              <div
                key={index}
                className="bg-white/5 rounded-lg p-4 border border-red/30"
              >
                <div className="flex items-start gap-3">
                  <span className="text-red text-xl">⚖️</span>
                  <div>
                    <h4 className="text-red font-heading mb-1">Debt {index + 1}</h4>
                    <p className="text-white/80">{debt}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ReportSection>
      )}

      {/* Karmic Remedies */}
      <ReportSection
        title="Karmic Remedies"
        subtitle="Practices to heal and balance karmic patterns"
        icon="🕉️"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white/5 rounded-lg p-4 border border-gold/20">
            <h4 className="text-gold font-heading mb-2">Meditation Practices</h4>
            <ul className="space-y-1 text-white/70 text-sm">
              <li>• Daily meditation on karmic lessons</li>
              <li>• Chanting mantras for karmic release</li>
              <li>• Visualization of past life healing</li>
            </ul>
          </div>
          <div className="bg-white/5 rounded-lg p-4 border border-gold/20">
            <h4 className="text-gold font-heading mb-2">Spiritual Actions</h4>
            <ul className="space-y-1 text-white/70 text-sm">
              <li>• Service to others (seva)</li>
              <li>• Forgiveness practices</li>
              <li>• Conscious intention setting</li>
            </ul>
          </div>
        </div>
      </ReportSection>
    </div>
  );
}

