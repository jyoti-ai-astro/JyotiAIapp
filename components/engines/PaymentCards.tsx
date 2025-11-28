/**
 * Payment Cards Component
 * 
 * Batch 4 - Intelligence Engines
 * 
 * Subscription and payment management
 */

'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CreditCard, Sparkles } from 'lucide-react';

interface PaymentCardsProps {
  currentSubscription?: {
    plan: string;
    expiry?: string | null;
  };
  onUpgrade?: () => void;
}

export const PaymentCards: React.FC<PaymentCardsProps> = ({
  currentSubscription,
  onUpgrade,
}) => {
  const [subscription, setSubscription] = useState<any>(currentSubscription || {
    plan: 'free',
    expiry: null,
  });

  useEffect(() => {
    if (currentSubscription) {
      setSubscription(currentSubscription);
    }
  }, [currentSubscription]);

  const createRipple = (e: React.MouseEvent<HTMLButtonElement>) => {
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
  };

  return (
    <Card className="bg-cosmic-indigo/80 backdrop-blur-sm border border-cosmic-purple/30 text-white shadow-cosmic-glow">
      <CardHeader>
        <CardTitle className="text-2xl font-display text-aura-cyan flex items-center gap-2">
          <CreditCard className="h-6 w-6" />
          Current Subscription
        </CardTitle>
        <CardDescription className="text-white/70">Your active subscription plan</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-white/80">Plan:</span>
          <span className="text-gold font-semibold capitalize">{subscription.plan || 'Free'}</span>
        </div>
        {subscription.expiry && (
          <div className="flex items-center justify-between">
            <span className="text-white/80">Expires:</span>
            <span className="text-white/80">
              {new Date(subscription.expiry).toLocaleDateString()}
            </span>
          </div>
        )}
        <Button
          onClick={(e) => {
            createRipple(e);
            onUpgrade?.();
          }}
          className="w-full spiritual-gradient relative overflow-hidden"
        >
          <Sparkles className="inline-block mr-2 h-4 w-4" />
          Upgrade Plan
        </Button>
      </CardContent>
    </Card>
  );
};

