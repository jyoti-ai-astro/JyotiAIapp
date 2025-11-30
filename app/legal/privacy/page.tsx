/**
 * Privacy Policy Page
 * 
 * Batch 5 - Legal Pages
 * 
 * Privacy policy and data protection
 */

'use client';

export const dynamic = 'force-dynamic';

import React from 'react';
import { PageTransitionWrapper } from '@/components/global/PageTransitionWrapper';
import { CosmicCursor } from '@/components/global/CosmicCursor';
import { SoundscapeController } from '@/components/global/SoundscapeController';
// Footer removed - using global FooterWrapper from app/layout.tsx from '@/components/sections/Footer/CosmicFooter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function PrivacyPage() {
  return (
    <PageTransitionWrapper>
      <CosmicCursor />
      <SoundscapeController />
      
      <div className="min-h-screen bg-cosmic-navy text-white">
        <div className="container mx-auto px-4 py-16 space-y-8">
          <div className="text-center mb-12">
            <h1 className="text-5xl font-display font-bold text-gold mb-4">Privacy Policy</h1>
            <p className="text-white/70 text-lg">Last updated: January 15, 2024</p>
          </div>

          <Card className="bg-cosmic-indigo/50 backdrop-blur-sm border border-cosmic-purple/30 text-white">
            <CardHeader>
              <CardTitle className="text-2xl text-gold">1. Introduction</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-white/80">
              <p>
                At Jyoti.ai, we are committed to protecting your privacy. This Privacy Policy explains how we collect,
                use, and safeguard your personal information when you use our Service.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-cosmic-indigo/50 backdrop-blur-sm border border-cosmic-purple/30 text-white">
            <CardHeader>
              <CardTitle className="text-2xl text-gold">2. Information We Collect</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-white/80">
              <p>We collect the following types of information:</p>
              <ul className="list-disc list-inside space-y-2">
                <li><strong>Personal Information:</strong> Name, email, date of birth, place of birth</li>
                <li><strong>Astrological Data:</strong> Birth details, kundali information, predictions</li>
                <li><strong>Usage Data:</strong> How you interact with our Service</li>
                <li><strong>Device Information:</strong> IP address, browser type, device type</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-cosmic-indigo/50 backdrop-blur-sm border border-cosmic-purple/30 text-white">
            <CardHeader>
              <CardTitle className="text-2xl text-gold">3. How We Use Your Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-white/80">
              <p>We use your information to:</p>
              <ul className="list-disc list-inside space-y-2">
                <li>Provide personalized astrological insights and guidance</li>
                <li>Generate your kundali and numerology reports</li>
                <li>Improve our Service and user experience</li>
                <li>Send you important updates and notifications</li>
                <li>Ensure security and prevent fraud</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-cosmic-indigo/50 backdrop-blur-sm border border-cosmic-purple/30 text-white">
            <CardHeader>
              <CardTitle className="text-2xl text-gold">4. Data Security</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-white/80">
              <p>
                We implement industry-standard security measures to protect your personal information, including
                encryption, secure servers, and access controls. However, no method of transmission over the internet
                is 100% secure.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-cosmic-indigo/50 backdrop-blur-sm border border-cosmic-purple/30 text-white">
            <CardHeader>
              <CardTitle className="text-2xl text-gold">5. Your Rights</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-white/80">
              <p>You have the right to:</p>
              <ul className="list-disc list-inside space-y-2">
                <li>Access your personal data</li>
                <li>Correct inaccurate information</li>
                <li>Request deletion of your data</li>
                <li>Opt-out of marketing communications</li>
                <li>Export your data</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-cosmic-indigo/50 backdrop-blur-sm border border-cosmic-purple/30 text-white">
            <CardHeader>
              <CardTitle className="text-2xl text-gold">6. Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-white/80">
              <p>
                For privacy-related inquiries, please contact us at:
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

