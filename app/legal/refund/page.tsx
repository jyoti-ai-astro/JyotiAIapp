/**
 * Refund Policy Page
 * 
 * Batch 5 - Legal Pages
 * 
 * Refund and cancellation policy
 */

'use client';

export const dynamic = 'force-dynamic';

import React from 'react';
import { PageTransitionWrapper } from '@/components/global/PageTransitionWrapper';
import { CosmicCursor } from '@/components/global/CosmicCursor';
import { SoundscapeController } from '@/components/global/SoundscapeController';
import { CosmicFooter } from '@/components/sections/Footer/CosmicFooter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function RefundPage() {
  return (
    <PageTransitionWrapper>
      <CosmicCursor />
      <SoundscapeController />
      
      <div className="min-h-screen bg-cosmic-navy text-white">
        <div className="container mx-auto px-4 py-16 space-y-8">
          <div className="text-center mb-12">
            <h1 className="text-5xl font-display font-bold text-gold mb-4">Refund Policy</h1>
            <p className="text-white/70 text-lg">Last updated: January 15, 2024</p>
          </div>

          <Card className="bg-cosmic-indigo/50 backdrop-blur-sm border border-cosmic-purple/30 text-white">
            <CardHeader>
              <CardTitle className="text-2xl text-gold">1. Introduction</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-white/80">
              <p>
                This Refund Policy outlines the terms and conditions for refunds and cancellations of subscriptions
                and services purchased through Jyoti.ai.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-cosmic-indigo/50 backdrop-blur-sm border border-cosmic-purple/30 text-white">
            <CardHeader>
              <CardTitle className="text-2xl text-gold">2. Refund Eligibility</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-white/80">
              <p>Refunds may be issued in the following circumstances:</p>
              <ul className="list-disc list-inside space-y-2">
                <li>Within 7 days of purchase for unused subscriptions</li>
                <li>If service is unavailable due to technical issues on our end</li>
                <li>If there is a billing error</li>
                <li>As required by applicable law</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-cosmic-indigo/50 backdrop-blur-sm border border-cosmic-purple/30 text-white">
            <CardHeader>
              <CardTitle className="text-2xl text-gold">3. Non-Refundable Items</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-white/80">
              <p>The following are not eligible for refunds:</p>
              <ul className="list-disc list-inside space-y-2">
                <li>Services that have been fully consumed or delivered</li>
                <li>Digital products that have been downloaded</li>
                <li>Subscriptions cancelled after the refund period</li>
                <li>Third-party fees or charges</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-cosmic-indigo/50 backdrop-blur-sm border border-cosmic-purple/30 text-white">
            <CardHeader>
              <CardTitle className="text-2xl text-gold">4. Refund Process</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-white/80">
              <p>To request a refund:</p>
              <ol className="list-decimal list-inside space-y-2">
                <li>Contact our support team at refunds@jyoti.ai</li>
                <li>Provide your order number and reason for refund</li>
                <li>Wait for our team to review your request (typically within 5 business days)</li>
                <li>Receive refund to your original payment method (5-10 business days)</li>
              </ol>
            </CardContent>
          </Card>

          <Card className="bg-cosmic-indigo/50 backdrop-blur-sm border border-cosmic-purple/30 text-white">
            <CardHeader>
              <CardTitle className="text-2xl text-gold">5. Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-white/80">
              <p>
                For refund inquiries, please contact us at:
              </p>
              <p className="text-gold">
                Email: refunds@jyoti.ai<br />
                Address: [Your Company Address]
              </p>
            </CardContent>
          </Card>
        </div>

        <CosmicFooter />
      </div>
    </PageTransitionWrapper>
  );
}

