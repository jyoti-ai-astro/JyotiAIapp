/**
 * Security Policy Page
 * 
 * Batch 5 - Legal Pages
 * 
 * Security measures and practices
 */

'use client';

export const dynamic = 'force-dynamic';

import React from 'react';
import { PageTransitionWrapper } from '@/components/global/PageTransitionWrapper';
import { CosmicCursor } from '@/components/global/CosmicCursor';
import { SoundscapeController } from '@/components/global/SoundscapeController';
// Footer removed - using global FooterWrapper from app/layout.tsx
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function SecurityPage() {
  return (
    <PageTransitionWrapper>
      <CosmicCursor />
      <SoundscapeController />
      
      <div className="min-h-screen bg-cosmic-navy text-white">
        <div className="container mx-auto px-4 py-16 space-y-8">
          <div className="text-center mb-12">
            <h1 className="text-5xl font-display font-bold text-gold mb-4">Security Policy</h1>
            <p className="text-white/70 text-lg">Last updated: January 15, 2024</p>
          </div>

          <Card className="bg-cosmic-indigo/50 backdrop-blur-sm border border-cosmic-purple/30 text-white">
            <CardHeader>
              <CardTitle className="text-2xl text-gold">1. Introduction</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-white/80">
              <p>
                At Jyoti.ai, we take security seriously. This Security Policy outlines the measures we implement to
                protect your data and ensure the security of our Service.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-cosmic-indigo/50 backdrop-blur-sm border border-cosmic-purple/30 text-white">
            <CardHeader>
              <CardTitle className="text-2xl text-gold">2. Data Encryption</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-white/80">
              <p>We use industry-standard encryption to protect your data:</p>
              <ul className="list-disc list-inside space-y-2">
                <li>SSL/TLS encryption for data in transit</li>
                <li>AES-256 encryption for data at rest</li>
                <li>Encrypted database connections</li>
                <li>Secure API endpoints</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-cosmic-indigo/50 backdrop-blur-sm border border-cosmic-purple/30 text-white">
            <CardHeader>
              <CardTitle className="text-2xl text-gold">3. Access Controls</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-white/80">
              <p>We implement strict access controls:</p>
              <ul className="list-disc list-inside space-y-2">
                <li>Multi-factor authentication for admin accounts</li>
                <li>Role-based access control</li>
                <li>Regular security audits</li>
                <li>Employee security training</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-cosmic-indigo/50 backdrop-blur-sm border border-cosmic-purple/30 text-white">
            <CardHeader>
              <CardTitle className="text-2xl text-gold">4. Incident Response</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-white/80">
              <p>
                In the event of a security incident, we will:
              </p>
              <ul className="list-disc list-inside space-y-2">
                <li>Immediately investigate and contain the threat</li>
                <li>Notify affected users within 72 hours</li>
                <li>Work with security experts to resolve the issue</li>
                <li>Implement measures to prevent future incidents</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-cosmic-indigo/50 backdrop-blur-sm border border-cosmic-purple/30 text-white">
            <CardHeader>
              <CardTitle className="text-2xl text-gold">5. Reporting Security Issues</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-white/80">
              <p>
                If you discover a security vulnerability, please report it to:
              </p>
              <p className="text-gold">
                Email: security@jyoti.ai<br />
                We appreciate responsible disclosure and will respond promptly.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Footer removed - using global FooterWrapper from app/layout.tsx */}
      </div>
    </PageTransitionWrapper>
  );
}

