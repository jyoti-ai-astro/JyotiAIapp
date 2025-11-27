/**
 * Aura Chakra Report Component
 * 
 * Phase 3 — Section 38: PAGES PHASE 23 (F38)
 * 
 * Displays Aura and Chakra analysis report
 */

'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ReportSection } from './ReportSection';

export interface AuraChakraReportProps {
  aura?: {
    dominantColor?: string;
    chakraStrengths?: Array<{ name: string; strength: number }>;
  };
}

export function AuraChakraReport({ aura }: AuraChakraReportProps) {
  if (!aura) {
    return (
      <div className="text-center py-16 text-white/60">
        No Aura data available. Please perform an aura scan first.
      </div>
    );
  }

  const chakras = aura.chakraStrengths || [
    { name: 'Root', strength: 5 },
    { name: 'Sacral', strength: 5 },
    { name: 'Solar Plexus', strength: 5 },
    { name: 'Heart', strength: 5 },
    { name: 'Throat', strength: 5 },
    { name: 'Third Eye', strength: 5 },
    { name: 'Crown', strength: 5 },
  ];

  const getAuraColorMeaning = (color: string): string => {
    const meanings: { [key: string]: string } = {
      'Red': 'Grounding, physical energy, passion, survival instincts',
      'Orange': 'Creativity, sexuality, emotional expression, joy',
      'Yellow': 'Intellect, confidence, personal power, optimism',
      'Green': 'Love, healing, compassion, balance, growth',
      'Blue': 'Communication, truth, expression, calm',
      'Indigo': 'Intuition, perception, spiritual awareness',
      'Violet': 'Spirituality, connection to divine, transcendence',
    };
    return meanings[color] || 'Unique spiritual energy signature';
  };

  const getChakraColor = (chakraName: string): string => {
    const colors: { [key: string]: string } = {
      'Root': '#FF0000',
      'Sacral': '#FF8C00',
      'Solar Plexus': '#FFD700',
      'Heart': '#00FF00',
      'Throat': '#0000FF',
      'Third Eye': '#4B0082',
      'Crown': '#8B00FF',
    };
    return colors[chakraName] || '#FFFFFF';
  };

  const weakChakras = chakras.filter(c => c.strength < 4);
  const strongChakras = chakras.filter(c => c.strength >= 7);

  return (
    <div className="space-y-8">
      {/* Aura Color Meaning */}
      {aura.dominantColor && (
        <ReportSection
          title="Aura Color Meaning"
          subtitle={`Your Dominant Aura: ${aura.dominantColor}`}
          icon="🌈"
        >
          <div className="bg-white/5 rounded-lg p-6 border border-gold/20">
            <div className="flex items-center gap-4 mb-4">
              <div
                className="w-16 h-16 rounded-full border-2 border-gold/50"
                style={{
                  backgroundColor: aura.dominantColor === 'Red' ? '#FF0000' :
                                  aura.dominantColor === 'Orange' ? '#FF8C00' :
                                  aura.dominantColor === 'Yellow' ? '#FFD700' :
                                  aura.dominantColor === 'Green' ? '#00FF00' :
                                  aura.dominantColor === 'Blue' ? '#0000FF' :
                                  aura.dominantColor === 'Indigo' ? '#4B0082' :
                                  aura.dominantColor === 'Violet' ? '#8B00FF' : '#FFFFFF',
                }}
              />
              <div>
                <h4 className="text-gold font-heading text-xl mb-1">
                  {aura.dominantColor} Aura
                </h4>
                <p className="text-white/60 text-sm">
                  {getAuraColorMeaning(aura.dominantColor)}
                </p>
              </div>
            </div>
          </div>
        </ReportSection>
      )}

      {/* 7 Chakra Strengths with Animated Bars */}
      <ReportSection
        title="Chakra Strengths"
        subtitle="Energy centers and their current state"
        icon="🌀"
      >
        <div className="space-y-4">
          {chakras.map((chakra, index) => (
            <div key={index} className="bg-white/5 rounded-lg p-4 border border-white/10">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: getChakraColor(chakra.name) }}
                  />
                  <span className="text-white font-heading">{chakra.name} Chakra</span>
                </div>
                <span className={`text-sm font-heading ${
                  chakra.strength >= 7 ? 'text-gold' :
                  chakra.strength >= 4 ? 'text-violet' : 'text-red'
                }`}>
                  {chakra.strength}/10
                </span>
              </div>
              <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                <motion.div
                  className="h-full"
                  style={{ backgroundColor: getChakraColor(chakra.name) }}
                  initial={{ width: 0 }}
                  animate={{ width: `${(chakra.strength / 10) * 100}%` }}
                  transition={{ duration: 1, delay: index * 0.1 }}
                />
              </div>
            </div>
          ))}
        </div>
      </ReportSection>

      {/* Imbalance Warnings */}
      {weakChakras.length > 0 && (
        <ReportSection
          title="Imbalance Warnings"
          subtitle="Chakras requiring attention"
          icon="⚠️"
        >
          <div className="space-y-3">
            {weakChakras.map((chakra, index) => (
              <div
                key={index}
                className="bg-red/10 border border-red/30 rounded-lg p-4"
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-red">⚠️</span>
                  <span className="text-red font-heading">{chakra.name} Chakra</span>
                  <span className="text-red/60 text-sm">({chakra.strength}/10)</span>
                </div>
                <p className="text-white/70 text-sm">
                  This chakra is below optimal strength. Focus on healing practices, 
                  meditation, and energy work to restore balance.
                </p>
              </div>
            ))}
          </div>
        </ReportSection>
      )}

      {/* Chakra Remedies */}
      <ReportSection
        title="Chakra Remedies"
        subtitle="Practices to balance and strengthen your energy centers"
        icon="💎"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {chakras.map((chakra, index) => (
            <div
              key={index}
              className="bg-white/5 rounded-lg p-4 border border-white/10"
            >
              <h4 className="text-gold font-heading mb-2">{chakra.name} Chakra</h4>
              <ul className="space-y-1 text-white/70 text-sm">
                <li>• Meditation focusing on this energy center</li>
                <li>• Color therapy using {chakra.name === 'Root' ? 'red' :
                    chakra.name === 'Sacral' ? 'orange' :
                    chakra.name === 'Solar Plexus' ? 'yellow' :
                    chakra.name === 'Heart' ? 'green' :
                    chakra.name === 'Throat' ? 'blue' :
                    chakra.name === 'Third Eye' ? 'indigo' : 'violet'} tones</li>
                <li>• Mantra chanting for chakra activation</li>
                <li>• Yoga poses that target this area</li>
              </ul>
            </div>
          ))}
        </div>
      </ReportSection>
    </div>
  );
}

