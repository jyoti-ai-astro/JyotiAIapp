/**
 * Cookie Policy Page
 * 
 * Batch 5 - Legal Pages
 * 
 * Cookie usage and preferences
 */

'use client';

export const dynamic = 'force-dynamic';

import React from 'react';
import { PageTransitionWrapper } from '@/components/global/PageTransitionWrapper';
import { CosmicCursor } from '@/components/global/CosmicCursor';
import { SoundscapeController } from '@/components/global/SoundscapeController';
// Footer removed - using global FooterWrapper from app/layout.tsx from '@/components/sections/Footer/CosmicFooter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function CookiesPage() {
  return (
    <PageTransitionWrapper>
      <CosmicCursor />
      <SoundscapeController />
      
      <div className="min-h-screen bg-cosmic-navy text-white">
        <div className="container mx-auto px-4 py-16 space-y-8">
          <div className="text-center mb-12">
            <h1 className="text-5xl font-display font-bold text-gold mb-4">Cookie Policy</h1>
            <p className="text-white/70 text-lg">Last updated: January 15, 2024</p>
          </div>

          <Card className="bg-cosmic-indigo/50 backdrop-blur-sm border border-cosmic-purple/30 text-white">
            <CardHeader>
              <CardTitle className="text-2xl text-gold">1. Introduction</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-white/80">
              <p>
                This Cookie Policy explains how Jyoti.ai uses cookies and similar technologies to recognize you when
                you visit our website and use our Service.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-cosmic-indigo/50 backdrop-blur-sm border border-cosmic-purple/30 text-white">
            <CardHeader>
              <CardTitle className="text-2xl text-gold">2. What Are Cookies</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-white/80">
              <p>
                Cookies are small text files that are placed on your device when you visit a website. They are widely
                used to make websites work more efficiently and provide information to website owners.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-cosmic-indigo/50 backdrop-blur-sm border border-cosmic-purple/30 text-white">
            <CardHeader>
              <CardTitle className="text-2xl text-gold">3. Types of Cookies We Use</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-white/80">
              <p>We use the following types of cookies:</p>
              <ul className="list-disc list-inside space-y-2">
                <li><strong>Essential Cookies:</strong> Required for the Service to function properly</li>
                <li><strong>Analytics Cookies:</strong> Help us understand how visitors use our Service</li>
                <li><strong>Preference Cookies:</strong> Remember your settings and preferences</li>
                <li><strong>Marketing Cookies:</strong> Used to deliver relevant advertisements</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-cosmic-indigo/50 backdrop-blur-sm border border-cosmic-purple/30 text-white">
            <CardHeader>
              <CardTitle className="text-2xl text-gold">4. Managing Cookies</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-white/80">
              <p>
                You can control and manage cookies through your browser settings. However, disabling certain cookies
                may affect the functionality of our Service.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-cosmic-indigo/50 backdrop-blur-sm border border-cosmic-purple/30 text-white">
            <CardHeader>
              <CardTitle className="text-2xl text-gold">5. Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-white/80">
              <p>
                For questions about our use of cookies, please contact us at:
              </p>
              <p className="text-gold">
                Email: privacy@jyoti.ai<br />
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

