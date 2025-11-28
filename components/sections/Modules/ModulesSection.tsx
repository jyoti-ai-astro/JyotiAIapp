/**
 * Modules Section Component
 * 
 * Batch 1 - Core Landing & Marketing
 * 
 * 6 spiritual modules: Palmistry, Face Reading, Aura Scan, Kundali Generator, Career & Business, Pregnancy Insights
 */

'use client';

import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Hand, User, Sparkles, Star, Briefcase, Baby, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Module {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
}

const modules: Module[] = [
  {
    id: 'palmistry',
    title: 'Palmistry',
    description: 'AI-powered hand reading with line detection and destiny analysis',
    icon: Hand,
    href: '/palmistry',
  },
  {
    id: 'face-reading',
    title: 'Face Reading',
    description: 'Ancient face reading techniques combined with modern AI vision',
    icon: User,
    href: '/face',
  },
  {
    id: 'aura-scan',
    title: 'Aura Scan',
    description: 'Dynamic energy field visualization with chakra balance analysis',
    icon: Sparkles,
    href: '/aura',
  },
  {
    id: 'kundali-generator',
    title: 'Kundali Generator',
    description: 'Interactive 3D birth chart with planetary positions and house analysis',
    icon: Star,
    href: '/kundali',
  },
  {
    id: 'career-business',
    title: 'Career & Business',
    description: 'Career destiny engine and business compatibility checker',
    icon: Briefcase,
    href: '/career',
  },
  {
    id: 'pregnancy-insights',
    title: 'Pregnancy Insights',
    description: 'Pregnancy predictions and timing with detailed explanations',
    icon: Baby,
    href: '/pregnancy',
  },
];

export function ModulesSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-100px' });

  return (
    <section
      ref={sectionRef}
      id="modules"
      className="relative py-20 md:py-32"
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
            Powerful Spiritual Modules
          </h2>
          <p className="text-xl md:text-2xl text-gold font-heading">
            Everything you need for complete spiritual guidance
          </p>
        </motion.div>

        {/* Modules Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {modules.map((module, index) => {
            const Icon = module.icon;
            return (
              <motion.div
                key={module.id}
                initial={{ opacity: 0, y: 50 }}
                animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card className="bg-cosmic-indigo/80 backdrop-blur-sm border border-cosmic-purple/30 text-white h-full group hover:border-gold/50 transition-all duration-300">
                  <CardHeader>
                    <div className="flex items-center gap-4 mb-4">
                      {/* Icon in circle aura */}
                      <motion.div
                        className="w-16 h-16 rounded-full bg-gold/20 border border-gold/40 flex items-center justify-center"
                        whileHover={{ scale: 1.1, rotate: 360 }}
                        transition={{ duration: 0.5 }}
                      >
                        <Icon className="h-8 w-8 text-gold" />
                      </motion.div>
                      <CardTitle className="text-2xl font-display text-gold">
                        {module.title}
                      </CardTitle>
                    </div>
                    <CardDescription className="text-white/70">
                      {module.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Link href={module.href}>
                      <Button
                        variant="ghost"
                        className="w-full text-gold hover:text-white hover:bg-gold/10 group-hover:bg-gold/20 transition-all duration-300"
                      >
                        Explore module
                        <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

