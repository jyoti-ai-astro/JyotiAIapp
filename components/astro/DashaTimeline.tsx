/**
 * Dasha Timeline Component
 * 
 * Batch 3 - Astro Components
 * 
 * GSAP scroll snap timeline for Dasha periods
 */

'use client';

import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { DashaCard } from './DashaCard';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export interface DashaPeriod {
  planet: string;
  startDate: string;
  endDate: string;
  type: 'mahadasha' | 'antardasha' | 'pratyantardasha';
}

interface DashaTimelineProps {
  dashaPeriods: DashaPeriod[];
  className?: string;
}

export const DashaTimeline: React.FC<DashaTimelineProps> = ({
  dashaPeriods,
  className = '',
}) => {
  const timelineRef = useRef<HTMLDivElement>(null);
  const itemsRef = useRef<HTMLDivElement[]>([]);

  useEffect(() => {
    if (timelineRef.current && itemsRef.current.length > 0) {
      const timeline = gsap.timeline({
        scrollTrigger: {
          trigger: timelineRef.current,
          start: 'top center',
          end: 'bottom center',
          scrub: 1,
        },
      });

      itemsRef.current.forEach((item, index) => {
        if (item) {
          timeline.fromTo(
            item,
            { opacity: 0, x: -50 },
            { opacity: 1, x: 0, duration: 0.5 },
            index * 0.1
          );
        }
      });
    }
  }, [dashaPeriods]);

  return (
    <div ref={timelineRef} className={`space-y-6 ${className}`}>
      {dashaPeriods.map((period, index) => (
        <div
          key={index}
          ref={(el) => {
            if (el) itemsRef.current[index] = el;
          }}
        >
          <DashaCard
            planet={period.planet}
            startDate={period.startDate}
            endDate={period.endDate}
            type={period.type}
          />
        </div>
      ))}
    </div>
  );
};

