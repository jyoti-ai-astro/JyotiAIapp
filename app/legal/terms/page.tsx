/**
 * Terms of Service Page
 * 
 * Batch 5 - Legal Pages
 * 
 * Terms and conditions
 */

'use client';

export const dynamic = 'force-dynamic';

import React from 'react';
import { PageTransitionWrapper } from '@/components/global/PageTransitionWrapper';
import { CosmicCursor } from '@/components/global/CosmicCursor';
import { SoundscapeController } from '@/components/global/SoundscapeController';
// Footer removed - using global FooterWrapper from app/layout.tsx
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function TermsPage() {
  return (
    <PageTransitionWrapper>
      <CosmicCursor />
      <SoundscapeController />
      
      <div className="min-h-screen bg-cosmic-navy text-white">
        <div className="container mx-auto px-4 py-16 space-y-8">
          <div className="text-center mb-12">
            <h1 className="text-5xl font-display font-bold text-gold mb-4">Terms of Service</h1>
            <p className="text-white/70 text-lg">Last updated: January 15, 2024</p>
          </div>

          <Card className="bg-cosmic-indigo/50 backdrop-blur-sm border border-cosmic-purple/30 text-white">
            <CardHeader>
              <CardTitle className="text-2xl text-gold">1. Introduction</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-white/80">
              <p>
                Welcome to Jyoti.ai. These Terms of Service (&quot;Terms&quot;) govern your access to and use of our
                spiritual guidance platform. By using our services, you agree to be bound by these Terms.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-cosmic-indigo/50 backdrop-blur-sm border border-cosmic-purple/30 text-white">
            <CardHeader>
              <CardTitle className="text-2xl text-gold">2. Definitions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-white/80">
              <ul className="list-disc list-inside space-y-2">
                <li><strong>&quot;Service&quot;</strong> refers to the Jyoti.ai platform and all associated features.</li>
                <li><strong>&quot;User&quot;</strong> refers to any individual who accesses or uses our Service.</li>
                <li><strong>&quot;Content&quot;</strong> refers to all data, text, images, and other materials on our platform.</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-cosmic-indigo/50 backdrop-blur-sm border border-cosmic-purple/30 text-white">
            <CardHeader>
              <CardTitle className="text-2xl text-gold">3. User Rights</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-white/80">
              <p>You have the right to:</p>
              <ul className="list-disc list-inside space-y-2">
                <li>Access and use our Service in accordance with these Terms</li>
                <li>Create and manage your spiritual profile</li>
                <li>Receive astrological insights and guidance</li>
                <li>Cancel your subscription at any time</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-cosmic-indigo/50 backdrop-blur-sm border border-cosmic-purple/30 text-white">
            <CardHeader>
              <CardTitle className="text-2xl text-gold">4. Limitations</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-white/80">
              <p>You agree not to:</p>
              <ul className="list-disc list-inside space-y-2">
                <li>Use our Service for any illegal or unauthorized purpose</li>
                <li>Attempt to gain unauthorized access to our systems</li>
                <li>Share your account credentials with others</li>
                <li>Reproduce or distribute our Content without permission</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-cosmic-indigo/50 backdrop-blur-sm border border-cosmic-purple/30 text-white">
            <CardHeader>
              <CardTitle className="text-2xl text-gold">5. Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-white/80">
              <p>
                If you have any questions about these Terms, please contact us at:
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

