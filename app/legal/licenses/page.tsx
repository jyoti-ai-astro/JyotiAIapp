/**
 * Licenses Page
 * 
 * Batch 5 - Legal Pages
 * 
 * Open source licenses and attributions
 */

'use client';

export const dynamic = 'force-dynamic';

import React from 'react';
import { PageTransitionWrapper } from '@/components/global/PageTransitionWrapper';
import { CosmicCursor } from '@/components/global/CosmicCursor';
import { SoundscapeController } from '@/components/global/SoundscapeController';
// Footer removed - using global FooterWrapper from app/layout.tsx
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function LicensesPage() {
  return (
    <PageTransitionWrapper>
      <CosmicCursor />
      <SoundscapeController />
      
      <div className="min-h-screen bg-cosmic-navy text-white">
        <div className="container mx-auto px-4 py-16 space-y-8">
          <div className="text-center mb-12">
            <h1 className="text-5xl font-display font-bold text-gold mb-4">Open Source Licenses</h1>
            <p className="text-white/70 text-lg">Third-party libraries and attributions</p>
          </div>

          <Card className="bg-cosmic-indigo/50 backdrop-blur-sm border border-cosmic-purple/30 text-white">
            <CardHeader>
              <CardTitle className="text-2xl text-gold">1. Introduction</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-white/80">
              <p>
                Jyoti.ai uses various open-source libraries and frameworks. This page lists the licenses and
                attributions for third-party software used in our Service.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-cosmic-indigo/50 backdrop-blur-sm border border-cosmic-purple/30 text-white">
            <CardHeader>
              <CardTitle className="text-2xl text-gold">2. MIT License</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-white/80">
              <p>The following packages are licensed under the MIT License:</p>
              <ul className="list-disc list-inside space-y-2">
                <li>React & React DOM</li>
                <li>Next.js</li>
                <li>Three.js</li>
                <li>Framer Motion</li>
                <li>GSAP</li>
                <li>Tailwind CSS</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-cosmic-indigo/50 backdrop-blur-sm border border-cosmic-purple/30 text-white">
            <CardHeader>
              <CardTitle className="text-2xl text-gold">3. Apache License 2.0</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-white/80">
              <p>The following packages are licensed under the Apache License 2.0:</p>
              <ul className="list-disc list-inside space-y-2">
                <li>Firebase SDK</li>
                <li>Various utility libraries</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-cosmic-indigo/50 backdrop-blur-sm border border-cosmic-purple/30 text-white">
            <CardHeader>
              <CardTitle className="text-2xl text-gold">4. BSD License</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-white/80">
              <p>Some components use BSD-licensed software. Full license texts are available in the source code.</p>
            </CardContent>
          </Card>

          <Card className="bg-cosmic-indigo/50 backdrop-blur-sm border border-cosmic-purple/30 text-white">
            <CardHeader>
              <CardTitle className="text-2xl text-gold">5. Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-white/80">
              <p>
                For questions about licenses, please contact us at:
              </p>
              <p className="text-gold">
                Email: legal@jyoti.ai<br />
                Address: [Your Company Address]
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Footer removed - using global FooterWrapper from app/layout.tsx */}
      </div>
    </PageTransitionWrapper>
  );
}

