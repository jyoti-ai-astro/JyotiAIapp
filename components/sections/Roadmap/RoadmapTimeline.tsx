/**
 * Roadmap Timeline Component
 * 
 * Batch 1 - Core Landing & Marketing
 * 
 * Horizontal timeline with scroll growth, each milestone glows and pulses with GSAP morph animations
 */

'use client';

import React, { useRef, useEffect } from 'react';
import { motion, useInView } from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Sparkles, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

interface Milestone {
  id: string;
  title: string;
  description: string;
  date: string;
  status: 'completed' | 'in-progress' | 'upcoming';
}

const milestones: Milestone[] = [
  {
    id: 'v1',
    title: 'Launch',
    description: 'Core features: Kundali, Numerology, AI Guru',
    date: 'Q1 2024',
    status: 'completed',
  },
  {
    id: 'v2',
    title: 'Expansion',
    description: 'Palmistry, Face Reading, Aura Scan',
    date: 'Q2 2024',
    status: 'completed',
  },
  {
    id: 'v3',
    title: 'Advanced',
    description: 'Career Engine, Business Compatibility',
    date: 'Q3 2024',
    status: 'in-progress',
  },
  {
    id: 'v4',
    title: 'Premium',
    description: 'Advanced Reports, Ritual Generator',
    date: 'Q4 2024',
    status: 'upcoming',
  },
  {
    id: 'v5',
    title: 'Future',
    description: 'Mobile App, API Access, Community Features',
    date: '2025',
    status: 'upcoming',
  },
];

export function RoadmapTimeline() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-100px' });

  useEffect(() => {
    if (!timelineRef.current || !isInView) return;

    const timeline = gsap.timeline({
      scrollTrigger: {
        trigger: timelineRef.current,
        start: 'top 80%',
        end: 'bottom 20%',
        scrub: 1,
      },
    });

    milestones.forEach((milestone, index) => {
      const element = timelineRef.current?.querySelector(`[data-milestone="${milestone.id}"]`);
      if (element) {
        timeline.to(
          element,
          {
            opacity: 1,
            scale: 1,
            duration: 0.5,
          },
          index * 0.2
        );
      }
    });

    return () => {
      timeline.kill();
    };
  }, [isInView]);

  return (
    <section
      ref={sectionRef}
      id="roadmap"
      className="relative py-20 md:py-32 overflow-hidden"
    >
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <motion.div
          className="text-center space-y-4 mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-4xl md:text-6xl font-display font-bold text-white">
            Our Journey
          </h2>
          <p className="text-xl md:text-2xl text-gold font-heading">
            Building the future of spiritual technology
          </p>
        </motion.div>

        {/* Timeline */}
        <div ref={timelineRef} className="relative">
          {/* Timeline Line */}
          <div className="absolute top-1/2 left-0 right-0 h-1 bg-gradient-to-r from-cosmic-purple via-gold to-cosmic-purple transform -translate-y-1/2" />

          {/* Milestones */}
          <div className="relative flex justify-between items-center py-16">
            {milestones.map((milestone, index) => (
              <motion.div
                key={milestone.id}
                data-milestone={milestone.id}
                initial={{ opacity: 0, scale: 0.5 }}
                className="flex flex-col items-center gap-4 flex-1"
              >
                {/* Milestone Dot */}
                <motion.div
                  className={cn(
                    'w-16 h-16 rounded-full flex items-center justify-center border-4 relative z-10',
                    milestone.status === 'completed'
                      ? 'bg-aura-green border-aura-green'
                      : milestone.status === 'in-progress'
                      ? 'bg-gold border-gold'
                      : 'bg-white/20 border-white/30'
                  )}
                  animate={{
                    scale: [1, 1.2, 1],
                    boxShadow: [
                      `0 0 0px ${milestone.status === 'completed' ? '#4ECB71' : milestone.status === 'in-progress' ? '#F2C94C' : 'rgba(255,255,255,0.3)'}`,
                      `0 0 20px ${milestone.status === 'completed' ? '#4ECB71' : milestone.status === 'in-progress' ? '#F2C94C' : 'rgba(255,255,255,0.3)'}`,
                      `0 0 0px ${milestone.status === 'completed' ? '#4ECB71' : milestone.status === 'in-progress' ? '#F2C94C' : 'rgba(255,255,255,0.3)'}`,
                    ],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                >
                  {milestone.status === 'completed' ? (
                    <CheckCircle className="h-8 w-8 text-white" />
                  ) : milestone.status === 'in-progress' ? (
                    <Sparkles className="h-8 w-8 text-cosmic-navy" />
                  ) : (
                    <div className="w-4 h-4 rounded-full bg-white/50" />
                  )}
                </motion.div>

                {/* Milestone Content */}
                <div className="text-center max-w-[200px]">
                  <h3 className="text-xl font-display font-bold text-white mb-2">
                    {milestone.title}
                  </h3>
                  <p className="text-sm text-white/70 mb-2">{milestone.description}</p>
                  <p className="text-xs text-gold">{milestone.date}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

