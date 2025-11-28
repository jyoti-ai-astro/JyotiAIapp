/**
 * Timeline 12 Month Component
 * 
 * Batch 4 - Intelligence Engines
 * 
 * GSAP horizontal scroll timeline
 */

'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from 'lucide-react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

interface Timeline12MonthProps {
  onTimelineLoaded?: (timeline: any[]) => void;
}

export const Timeline12Month: React.FC<Timeline12MonthProps> = ({ onTimelineLoaded }) => {
  const [loading, setLoading] = useState(false);
  const [timeline, setTimeline] = useState<any[]>([]);
  const timelineRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchTimeline();
  }, []);

  useEffect(() => {
    if (timeline.length > 0 && timelineRef.current) {
      // GSAP horizontal scroll
      const items = timelineRef.current.querySelectorAll('.timeline-item');
      items.forEach((item, index) => {
        gsap.fromTo(
          item,
          { opacity: 0, x: -50 },
          {
            opacity: 1,
            x: 0,
            duration: 0.8,
            scrollTrigger: {
              trigger: item,
              start: 'top 80%',
              end: 'top 20%',
              scrub: 1,
            },
          }
        );
      });
    }
  }, [timeline]);

  const fetchTimeline = async () => {
    try {
      setLoading(true);
      // Placeholder - fetch from API
      setTimeout(() => {
        const months = [];
        for (let i = 0; i < 12; i++) {
          const date = new Date();
          date.setMonth(date.getMonth() + i);
          months.push({
            month: date.toLocaleString('default', { month: 'long', year: 'numeric' }),
            events: [`Event ${i + 1}`, `Event ${i + 2}`],
            prediction: `Month ${i + 1} prediction...`,
          });
        }
        setTimeline(months);
        onTimelineLoaded?.(months);
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Fetch timeline error:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card className="bg-cosmic-indigo/80 backdrop-blur-sm border border-cosmic-purple/30 text-white">
        <CardContent className="pt-6 text-center">
          <p className="text-white/70">Loading timeline...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div ref={timelineRef} className="space-y-4">
      {timeline.map((month, index) => (
        <motion.div
          key={index}
          className="timeline-item"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <Card className="bg-cosmic-indigo/80 backdrop-blur-sm border border-cosmic-purple/30 text-white">
            <CardHeader>
              <CardTitle className="text-gold flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                {month.month}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-white/80">{month.prediction}</p>
              {month.events && month.events.length > 0 && (
                <div>
                  <p className="text-sm font-semibold text-gold mb-1">Key Events:</p>
                  <ul className="list-disc list-inside space-y-1 text-sm text-white/70">
                    {month.events.map((event: string, i: number) => (
                      <li key={i}>{event}</li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}

