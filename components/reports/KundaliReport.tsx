/**
 * Kundali Report Component
 * 
 * Phase 3 — Section 38: PAGES PHASE 23 (F38)
 * 
 * Displays comprehensive Kundali birth chart report
 */

'use client';

import React from 'react';
import Image from 'next/image';
import { ReportSection } from './ReportSection';

export interface KundaliReportProps {
  kundali?: {
    rashi?: string;
    lagna?: string;
    nakshatra?: string;
    majorPlanets?: Array<{ name: string; position: string }>;
    houses?: Array<{ number: number; planet?: string; sign?: string }>;
    dashaPeriod?: string;
  };
}

export function KundaliReport({ kundali }: KundaliReportProps) {
  if (!kundali) {
    return (
      <div className="text-center py-16 text-white/60">
        No Kundali data available. Please generate your birth chart first.
      </div>
    );
  }

  const houses = kundali.houses || Array.from({ length: 12 }, (_, i) => ({ number: i + 1 }));

  return (
    <div className="space-y-8">
      {/* Birth Chart Summary */}
      <ReportSection
        title="Birth Chart Summary"
        subtitle="Your cosmic blueprint at the moment of birth"
        icon="🌌"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-white/10">
              <span className="text-white/70">Rashi (Moon Sign)</span>
              <span className="text-gold font-heading">{kundali.rashi || 'N/A'}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-white/10">
              <span className="text-white/70">Lagna (Ascendant)</span>
              <span className="text-gold font-heading">{kundali.lagna || 'N/A'}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-white/10">
              <span className="text-white/70">Nakshatra (Birth Star)</span>
              <span className="text-gold font-heading">{kundali.nakshatra || 'N/A'}</span>
            </div>
            {kundali.dashaPeriod && (
              <div className="flex justify-between items-center py-2 border-b border-white/10">
                <span className="text-white/70">Current Dasha</span>
                <span className="text-gold font-heading">{kundali.dashaPeriod}</span>
              </div>
            )}
          </div>
          <div className="relative h-64 rounded-lg overflow-hidden border border-gold/20">
            <Image
              src="/content/kundali-chart.png"
              alt="Birth Chart"
              fill
              className="object-cover opacity-50"
              onError={(e) => {
                // Fallback if image doesn't exist
                e.currentTarget.style.display = 'none';
              }}
            />
            <div className="absolute inset-0 flex items-center justify-center bg-cosmic/80">
              <p className="text-white/60 text-sm">Birth Chart Visualization</p>
            </div>
          </div>
        </div>
      </ReportSection>

      {/* Planetary Positions */}
      {kundali.majorPlanets && kundali.majorPlanets.length > 0 && (
        <ReportSection
          title="Planetary Positions"
          subtitle="Key planetary influences in your chart"
          icon="🪐"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {kundali.majorPlanets.map((planet, index) => (
              <div
                key={index}
                className="bg-white/5 rounded-lg p-4 border border-white/10"
              >
                <h4 className="text-gold font-heading mb-1">{planet.name}</h4>
                <p className="text-white/60 text-sm">{planet.position}</p>
              </div>
            ))}
          </div>
        </ReportSection>
      )}

      {/* Houses (12 sections) */}
      <ReportSection
        title="Houses Analysis"
        subtitle="The 12 houses of your birth chart"
        icon="🏛️"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {houses.map((house) => (
            <div
              key={house.number}
              className="bg-white/5 rounded-lg p-4 border border-white/10"
            >
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-gold font-heading">House {house.number}</h4>
                <span className="text-white/40 text-xs">
                  {house.number === 1 && 'Self'}
                  {house.number === 2 && 'Wealth'}
                  {house.number === 3 && 'Siblings'}
                  {house.number === 4 && 'Home'}
                  {house.number === 5 && 'Creativity'}
                  {house.number === 6 && 'Health'}
                  {house.number === 7 && 'Partnership'}
                  {house.number === 8 && 'Transformation'}
                  {house.number === 9 && 'Wisdom'}
                  {house.number === 10 && 'Career'}
                  {house.number === 11 && 'Gains'}
                  {house.number === 12 && 'Spirituality'}
                </span>
              </div>
              {house.planet && (
                <p className="text-white/60 text-sm">Planet: {house.planet}</p>
              )}
              {house.sign && (
                <p className="text-white/60 text-sm">Sign: {house.sign}</p>
              )}
            </div>
          ))}
        </div>
      </ReportSection>

      {/* Nakshatra Reading */}
      {kundali.nakshatra && (
        <ReportSection
          title="Nakshatra Reading"
          subtitle="Deep insights from your birth star"
          icon="⭐"
        >
          <div className="prose prose-invert max-w-none">
            <p className="text-white/80 leading-relaxed">
              Your Nakshatra, <span className="text-gold font-heading">{kundali.nakshatra}</span>, 
              carries profound spiritual significance. This birth star influences your personality, 
              life path, and karmic patterns. Each Nakshatra is ruled by a deity and has specific 
              qualities that shape your journey.
            </p>
          </div>
        </ReportSection>
      )}

      {/* Dasha Timeline Summary */}
      {kundali.dashaPeriod && (
        <ReportSection
          title="Dasha Timeline Summary"
          subtitle="Planetary periods and their influences"
          icon="⏳"
        >
          <div className="bg-white/5 rounded-lg p-6 border border-gold/20">
            <p className="text-white/80 mb-4">
              You are currently in the <span className="text-gold font-heading">{kundali.dashaPeriod}</span> Dasha period.
              This planetary period influences various aspects of your life, bringing specific 
              energies and opportunities for growth.
            </p>
            <p className="text-white/60 text-sm">
              Dasha periods follow a specific sequence and duration, each ruled by different planets 
              that activate different areas of your life chart.
            </p>
          </div>
        </ReportSection>
      )}

      {/* Strengths & Weaknesses */}
      <ReportSection
        title="Strengths & Weaknesses"
        subtitle="Key areas of power and growth opportunities"
        icon="⚖️"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-gold font-heading mb-3">Strengths</h4>
            <ul className="space-y-2">
              <li className="flex items-start gap-2 text-white/80">
                <span className="text-gold">✨</span>
                <span>Strong planetary alignments favor your natural talents</span>
              </li>
              <li className="flex items-start gap-2 text-white/80">
                <span className="text-gold">✨</span>
                <span>Favorable house placements enhance your life areas</span>
              </li>
              <li className="flex items-start gap-2 text-white/80">
                <span className="text-gold">✨</span>
                <span>Your Nakshatra provides spiritual protection and guidance</span>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-red font-heading mb-3">Areas for Growth</h4>
            <ul className="space-y-2">
              <li className="flex items-start gap-2 text-white/80">
                <span className="text-red">⚠️</span>
                <span>Challenging planetary aspects require conscious effort</span>
              </li>
              <li className="flex items-start gap-2 text-white/80">
                <span className="text-red">⚠️</span>
                <span>Weak house placements need strengthening through remedies</span>
              </li>
              <li className="flex items-start gap-2 text-white/80">
                <span className="text-red">⚠️</span>
                <span>Karmic patterns may surface during certain Dasha periods</span>
              </li>
            </ul>
          </div>
        </div>
      </ReportSection>
    </div>
  );
}

