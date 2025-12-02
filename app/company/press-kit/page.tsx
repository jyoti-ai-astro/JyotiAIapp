/**
 * Press Kit Page
 * 
 * Batch 5 - Company Pages
 * 
 * Download buttons for logos, brand assets
 */

'use client';

export const dynamic = 'force-dynamic';

import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Image, FileText } from 'lucide-react';
import CompanyPageShell from '@/src/ui/layout/CompanyPageShell';

export default function PressKitPage() {
  const assets = [
    {
      name: 'Logo - Light Background',
      type: 'Image',
      format: 'PNG',
      size: '2.5 MB',
      icon: Image,
    },
    {
      name: 'Logo - Dark Background',
      type: 'Image',
      format: 'PNG',
      size: '2.5 MB',
      icon: Image,
    },
    {
      name: 'Brand Guidelines',
      type: 'Document',
      format: 'PDF',
      size: '5.2 MB',
      icon: FileText,
    },
    {
      name: 'Icon Set',
      type: 'Image',
      format: 'SVG',
      size: '1.8 MB',
      icon: Image,
    },
  ];

  return (
    <CompanyPageShell
      eyebrow="Press Kit"
      title={
        <>
          Assets & facts about{' '}
          <span className="bg-gradient-to-r from-[#FFD57A] to-[#FFB347] bg-clip-text text-transparent">
            JyotiAI
          </span>
        </>
      }
      description="Download logos, brand guidelines, and press resources"
    >
      {/* Boilerplate Description */}
      <div className="mb-12">
        <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-[#0A0F1F]/80 to-[#1A2347]/60 backdrop-blur-sm p-8">
          <h2 className="text-2xl font-heading font-bold text-white mb-4">About JyotiAI</h2>
          <p className="text-white/70 leading-relaxed">
            JyotiAI is a spiritual guidance platform that combines ancient Vedic astrology, numerology, and
            palmistry with cutting-edge AI technology. We make personalized astrological insights accessible
            to everyone, helping millions discover their true purpose and navigate life's challenges with
            confidence.
          </p>
        </div>
      </div>

      {/* Assets Grid */}
      <div className="space-y-6">
        {assets.map((asset, index) => (
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
                  <div className="flex items-center gap-4">
                    <asset.icon className="h-8 w-8 text-gold" />
                    <div>
                      <CardTitle className="text-xl font-display text-gold">{asset.name}</CardTitle>
                      <CardDescription className="text-white/70">
                        {asset.type} • {asset.format} • {asset.size}
                      </CardDescription>
                    </div>
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
                      // Placeholder download
                      alert(`Downloading ${asset.name}...`);
                    }}
                  >
                    <Download className="inline-block mr-2 h-4 w-4" />
                    Download
                  </Button>
                </div>
              </CardHeader>
            </Card>
          </motion.div>
        ))}
      </div>
    </CompanyPageShell>
  );
}

