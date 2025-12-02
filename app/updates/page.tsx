/**
 * Updates Page
 * 
 * Batch 5 - Marketing Pages
 * 
 * Product updates and changelog
 */

'use client';

export const dynamic = 'force-dynamic';

import React from 'react';
import { motion } from 'framer-motion';
import { Calendar } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import MarketingPageShell from '@/src/ui/layout/MarketingPageShell';

export default function UpdatesPage() {

  const updates = [
    {
      version: 'v6.1',
      date: '2024-01-15',
      title: 'Cosmic UI Redesign',
      description: 'Complete redesign with R3F backgrounds, cosmic animations, and enhanced user experience.',
      features: ['New cosmic color palette', 'R3F nebula backgrounds', 'Enhanced animations'],
    },
    {
      version: 'v6.0',
      date: '2023-12-01',
      title: 'AI Guru Enhancement',
      description: 'Improved AI Guru with better context understanding and spiritual guidance.',
      features: ['Enhanced AI responses', 'Better context awareness', 'Improved accuracy'],
    },
    {
      version: 'v5.9',
      date: '2023-11-15',
      title: 'Palmistry & Face Reading',
      description: 'Added AI-powered palmistry and face reading analysis features.',
      features: ['Palmistry analysis', 'Face reading', 'AI vision integration'],
    },
  ];

  return (
    <MarketingPageShell
      eyebrow="Product Updates"
      title="What's new in JyotiAI"
      description="Stay updated with the latest features, improvements, and cosmic enhancements"
    >
      <div className="space-y-6">
        {updates.map((update, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="bg-cosmic-indigo/80 backdrop-blur-sm border border-cosmic-purple/30 text-white shadow-[0_0_30px_rgba(110,45,235,0.3)]">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-3xl font-display text-gold">{update.title}</CardTitle>
                  <div className="flex items-center gap-2 text-white/60">
                    <Calendar className="h-5 w-5" />
                    <span>{new Date(update.date).toLocaleDateString()}</span>
                  </div>
                </div>
                <CardDescription className="text-gold text-lg">{update.version}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-white/80 text-lg">{update.description}</p>
                <div>
                  <p className="text-gold font-semibold mb-2">New Features:</p>
                  <ul className="list-disc list-inside space-y-1 text-white/70">
                    {update.features.map((feature, i) => (
                      <li key={i}>{feature}</li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </MarketingPageShell>
  );
}

