/**
 * Numerology Report Component
 * 
 * Phase 3 — Section 38: PAGES PHASE 23 (F38)
 * 
 * Displays comprehensive Numerology report
 */

'use client';

import React from 'react';
import { ReportSection } from './ReportSection';

export interface NumerologyReportProps {
  numerology?: {
    lifePath?: number;
    destiny?: number;
    personality?: number;
    soulNumber?: number;
    yearCycle?: number;
  };
}

export function NumerologyReport({ numerology }: NumerologyReportProps) {
  if (!numerology) {
    return (
      <div className="text-center py-16 text-white/60">
        No Numerology data available. Please calculate your numbers first.
      </div>
    );
  }

  const getNumberMeaning = (number: number, type: string): string => {
    const meanings: { [key: number]: string } = {
      1: 'Leadership, independence, pioneering spirit',
      2: 'Cooperation, diplomacy, sensitivity',
      3: 'Creativity, expression, joy',
      4: 'Stability, organization, practicality',
      5: 'Freedom, adventure, versatility',
      6: 'Responsibility, nurturing, service',
      7: 'Spirituality, introspection, wisdom',
      8: 'Material success, authority, power',
      9: 'Humanitarianism, completion, wisdom',
    };
    return meanings[number] || 'Unique spiritual path';
  };

  return (
    <div className="space-y-8">
      {/* Life Path */}
      {numerology.lifePath && (
        <ReportSection
          title="Life Path Number"
          subtitle={`Your Life Path: ${numerology.lifePath}`}
          icon="🛤️"
        >
          <div className="bg-white/5 rounded-lg p-6 border border-gold/20">
            <p className="text-white/80 mb-4 leading-relaxed">
              Your Life Path Number <span className="text-gold font-heading text-2xl">{numerology.lifePath}</span> represents 
              the core purpose and direction of your life journey. It reveals your natural talents, 
              challenges, and the lessons you're here to learn.
            </p>
            <p className="text-white/60 text-sm">
              {getNumberMeaning(numerology.lifePath, 'lifePath')}
            </p>
          </div>
        </ReportSection>
      )}

      {/* Destiny */}
      {numerology.destiny && (
        <ReportSection
          title="Destiny Number"
          subtitle={`Your Destiny: ${numerology.destiny}`}
          icon="⭐"
        >
          <div className="bg-white/5 rounded-lg p-6 border border-gold/20">
            <p className="text-white/80 mb-4 leading-relaxed">
              Your Destiny Number <span className="text-gold font-heading text-2xl">{numerology.destiny}</span> indicates 
              what you are meant to achieve in this lifetime. It shows your potential for success 
              and the opportunities that await you.
            </p>
            <p className="text-white/60 text-sm">
              {getNumberMeaning(numerology.destiny, 'destiny')}
            </p>
          </div>
        </ReportSection>
      )}

      {/* Personality */}
      {numerology.personality && (
        <ReportSection
          title="Personality Number"
          subtitle={`Your Personality: ${numerology.personality}`}
          icon="👤"
        >
          <div className="bg-white/5 rounded-lg p-6 border border-gold/20">
            <p className="text-white/80 mb-4 leading-relaxed">
              Your Personality Number <span className="text-gold font-heading text-2xl">{numerology.personality}</span> reveals 
              how others perceive you and the impression you make on the world. It reflects your 
              outer expression and social interactions.
            </p>
            <p className="text-white/60 text-sm">
              {getNumberMeaning(numerology.personality, 'personality')}
            </p>
          </div>
        </ReportSection>
      )}

      {/* Soul Number */}
      {numerology.soulNumber && (
        <ReportSection
          title="Soul Number"
          subtitle={`Your Soul: ${numerology.soulNumber}`}
          icon="💫"
        >
          <div className="bg-white/5 rounded-lg p-6 border border-gold/20">
            <p className="text-white/80 mb-4 leading-relaxed">
              Your Soul Number <span className="text-gold font-heading text-2xl">{numerology.soulNumber}</span> represents 
              your inner desires, motivations, and what truly drives you at a soul level. It reveals 
              your deepest needs and aspirations.
            </p>
            <p className="text-white/60 text-sm">
              {getNumberMeaning(numerology.soulNumber, 'soul')}
            </p>
          </div>
        </ReportSection>
      )}

      {/* Compatibility Matrix */}
      <ReportSection
        title="Compatibility Matrix"
        subtitle="Numbers that harmonize with yours"
        icon="🔗"
      >
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => {
            const isCompatible = numerology.lifePath 
              ? [1, 3, 5, 7, 9].includes(numerology.lifePath) 
                ? [1, 3, 5, 7, 9].includes(num)
                : [2, 4, 6, 8].includes(num)
              : false;
            
            return (
              <div
                key={num}
                className={`rounded-lg p-4 border ${
                  isCompatible
                    ? 'bg-gold/10 border-gold/30 text-gold'
                    : 'bg-white/5 border-white/10 text-white/60'
                }`}
              >
                <div className="text-2xl font-heading text-center mb-1">{num}</div>
                <div className="text-xs text-center">
                  {isCompatible ? 'Compatible' : 'Neutral'}
                </div>
              </div>
            );
          })}
        </div>
      </ReportSection>

      {/* Year Cycle Summary */}
      {numerology.yearCycle && (
        <ReportSection
          title="Year Cycle Summary"
          subtitle={`Current Year Cycle: ${numerology.yearCycle}`}
          icon="📅"
        >
          <div className="bg-white/5 rounded-lg p-6 border border-gold/20">
            <p className="text-white/80 mb-4 leading-relaxed">
              You are in a <span className="text-gold font-heading">{numerology.yearCycle}</span> year cycle. 
              This cycle influences the themes and opportunities you'll experience throughout the year. 
              Each number brings its own unique energy and lessons.
            </p>
            <p className="text-white/60 text-sm">
              {getNumberMeaning(numerology.yearCycle, 'yearCycle')}
            </p>
          </div>
        </ReportSection>
      )}
    </div>
  );
}

