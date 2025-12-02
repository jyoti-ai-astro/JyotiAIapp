/**
 * Careers Page
 * 
 * Batch 5 - Company Pages
 * 
 * Role cards with apply button (placeholder)
 */

'use client';

export const dynamic = 'force-dynamic';

import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Briefcase } from 'lucide-react';
import CompanyPageShell from '@/src/ui/layout/CompanyPageShell';

export default function CareersPage() {
  const roles = [
    {
      title: 'Senior Full-Stack Developer',
      department: 'Engineering',
      location: 'Remote',
      description: 'Build and maintain our spiritual guidance platform using React, Next.js, and Node.js.',
    },
    {
      title: 'AI/ML Engineer',
      department: 'Engineering',
      location: 'Remote',
      description: 'Develop and improve our AI models for astrological predictions and spiritual guidance.',
    },
    {
      title: 'Astrology Content Writer',
      department: 'Content',
      location: 'Remote',
      description: 'Create engaging and accurate content about astrology, numerology, and spirituality.',
    },
    {
      title: 'Product Designer',
      department: 'Design',
      location: 'Remote',
      description: 'Design beautiful, intuitive interfaces for our cosmic spiritual platform.',
    },
  ];

  return (
    <CompanyPageShell
      eyebrow="Careers"
      title={
        <>
          Build the future of{' '}
          <span className="bg-gradient-to-r from-[#FFD57A] to-[#FFB347] bg-clip-text text-transparent">
            Vedic AI
          </span>{' '}
          with us
        </>
      }
      description="Join our mission to democratize access to ancient spiritual wisdom through modern AI technology."
    >
      {/* Culture Block */}
      <div className="mb-12">
        <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-[#0A0F1F]/80 to-[#1A2347]/60 backdrop-blur-sm p-8">
          <h2 className="text-2xl font-heading font-bold text-white mb-4">Our Culture</h2>
          <p className="text-white/70 leading-relaxed">
            We're building a platform that combines the timeless wisdom of Vedic astrology with cutting-edge AI.
            We value curiosity, spiritual growth, and technical excellence. If you're passionate about making
            spiritual guidance accessible to everyone, we'd love to hear from you.
          </p>
        </div>
      </div>

      {/* Jobs List */}
      <div className="space-y-6">
        {roles.map((role, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="bg-cosmic-indigo/80 backdrop-blur-sm border border-cosmic-purple/30 text-white shadow-[0_0_30px_rgba(110,45,235,0.3)]">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-2xl font-display text-gold">{role.title}</CardTitle>
                    <CardDescription className="text-white/70 mt-2">
                      {role.department} • {role.location}
                    </CardDescription>
                  </div>
                  <Button
                    className="spiritual-gradient relative overflow-hidden"
                    onClick={(e) => {
                      const button = e.currentTarget;
                      const ripple = document.createElement('span');
                      const rect = button.getBoundingClientRect();
                      const size = Math.max(rect.width, rect.height);
                      const x = e.clientX - rect.left - size / 2;
                      const y = e.clientY - rect.top - size / 2;
                      ripple.style.width = ripple.style.height = `${size}px`;
                      ripple.style.left = `${x}px`;
                      ripple.style.top = `${y}px`;
                      ripple.className = 'absolute rounded-full bg-gold/30 animate-ping pointer-events-none';
                      button.appendChild(ripple);
                      setTimeout(() => ripple.remove(), 600);
                    }}
                  >
                    Apply Now
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-white/80">{role.description}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </CompanyPageShell>
  );
}

