/**
 * Cosmic Dashboard Component
 * 
 * Master Plan v1.0 - Section 3.1: Dashboard — The Cosmic Home
 * 
 * Central hub that shows everything the user needs today.
 * Features:
 * - Cosmic background (R3F stars + very light nebula)
 * - Top greeting with personalized message
 * - Quick info cards (Rashi, Lagna, Nakshatra, Dasha)
 * - Today's Horoscope Card
 * - Upcoming Transits
 * - Quick Actions Grid
 */

'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { HoroscopeCard } from '@/components/organisms/horoscope-card';
import { QuickActionsGrid, QuickAction } from '@/components/organisms/quick-actions-grid';
import { 
  Sparkles, 
  Calendar, 
  TrendingUp, 
  Heart, 
  DollarSign, 
  Activity,
  BookOpen,
  Zap,
  Users,
  Clock,
  Star
} from 'lucide-react';

interface DashboardData {
  user: {
    name: string;
    photo: string | null;
    rashi: string | null;
    nakshatra: string | null;
    lagna: string | null;
  };
  todayHoroscope: {
    rashi: string;
    general: string;
    love: string;
    career: string;
    money: string;
    health: string;
    luckyColor: string;
    luckyNumber: number;
  } | null;
  quickInfo: {
    rashi: string;
    lagna: string;
    nakshatra: string;
    dasha: string;
  };
  transits: Array<{
    planet: string;
    event: string;
    date: string;
    impact: string;
  }>;
}

interface CosmicDashboardProps {
  data?: DashboardData;
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
}

export const CosmicDashboard: React.FC<CosmicDashboardProps> = ({
  data,
  loading = false,
  error = null,
  onRetry,
}) => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const getCosmicMessage = () => {
    const messages = [
      "Today's cosmic energies favor clarity and intuition.",
      "The stars align to guide your spiritual journey.",
      "Cosmic forces are supporting your growth today.",
      "Divine energies are flowing through your path.",
    ];
    return messages[Math.floor(Math.random() * messages.length)];
  };

  const quickActions: QuickAction[] = [
    {
      id: 'kundali',
      label: 'Kundali',
      icon: <Sparkles className="w-6 h-6 text-aura-blue" />,
      onClick: () => window.location.href = '/kundali',
    },
    {
      id: 'predictions',
      label: 'Predictions',
      icon: <TrendingUp className="w-6 h-6 text-aura-green" />,
      onClick: () => window.location.href = '/predictions',
    },
    {
      id: 'guru',
      label: 'AI Guru',
      icon: <Sparkles className="w-6 h-6 text-aura-cyan" />,
      onClick: () => window.location.href = '/guru',
      variant: 'premium',
    },
    {
      id: 'career',
      label: 'Career Destiny',
      icon: <TrendingUp className="w-6 h-6 text-aura-green" />,
      onClick: () => window.location.href = '/career',
    },
    {
      id: 'business',
      label: 'Business',
      icon: <DollarSign className="w-6 h-6 text-aura-gold" />,
      onClick: () => window.location.href = '/business',
    },
    {
      id: 'compatibility',
      label: 'Compatibility',
      icon: <Users className="w-6 h-6 text-aura-orange" />,
      onClick: () => window.location.href = '/compatibility',
    },
    {
      id: 'palmistry',
      label: 'Palm Reading',
      icon: <BookOpen className="w-6 h-6 text-aura-violet" />,
      onClick: () => window.location.href = '/palmistry',
    },
    {
      id: 'face',
      label: 'Face Reading',
      icon: <Activity className="w-6 h-6 text-aura-violet" />,
      onClick: () => window.location.href = '/face',
    },
    {
      id: 'aura',
      label: 'Aura Scan',
      icon: <Zap className="w-6 h-6 text-aura-cyan" />,
      onClick: () => window.location.href = '/aura',
    },
    {
      id: 'numerology',
      label: 'Numerology',
      icon: <Star className="w-6 h-6 text-aura-gold" />,
      onClick: () => window.location.href = '/numerology',
    },
    {
      id: 'timeline',
      label: 'Timeline',
      icon: <Calendar className="w-6 h-6 text-aura-blue" />,
      onClick: () => window.location.href = '/timeline',
    },
    {
      id: 'rituals',
      label: 'Rituals',
      icon: <Heart className="w-6 h-6 text-aura-red" />,
      onClick: () => window.location.href = '/rituals',
    },
    {
      id: 'calendar',
      label: 'Calendar',
      icon: <Calendar className="w-6 h-6 text-aura-blue" />,
      onClick: () => window.location.href = '/calendar',
    },
    {
      id: 'reports',
      label: 'Reports',
      icon: <BookOpen className="w-6 h-6 text-aura-violet" />,
      onClick: () => window.location.href = '/reports',
    },
  ];

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center space-y-4">
          <motion.div
            className="h-12 w-12 rounded-full border-4 border-cosmic-purple border-t-transparent mx-auto"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          />
          <p className="text-aura-cyan">Loading your spiritual profile...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-aura-red">{error || 'Failed to load dashboard'}</p>
          {onRetry && (
            <Button onClick={onRetry} className="cosmic-button hover-glow">
              Retry
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cosmic-navy text-white relative overflow-hidden">
      {/* Subtle cosmic background effects */}
      <div className="fixed inset-0 pointer-events-none opacity-5">
        <div className="absolute inset-0 bg-gradient-to-br from-cosmic-purple via-cosmic-indigo to-cosmic-navy" />
      </div>

      <div className="container mx-auto px-4 py-8 space-y-8 relative z-10">
        {/* Top Greeting Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="cosmic-card border-cosmic-purple/30 bg-cosmic-indigo/20">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  {data.user.photo && (
                    <motion.div
                      className="relative"
                      whileHover={{ scale: 1.05 }}
                      transition={{ type: 'spring', stiffness: 300 }}
                    >
                      <img
                        src={data.user.photo}
                        alt={data.user.name}
                        className="h-16 w-16 rounded-full border-2 border-cosmic-gold/50"
                      />
                      <div className="absolute inset-0 rounded-full border-2 border-aura-cyan animate-pulse opacity-50" />
                    </motion.div>
                  )}
                  <div>
                    <CardTitle className="text-3xl font-display text-cosmic-gold">
                      {getGreeting()}, {data.user.name} 👋
                    </CardTitle>
                    <CardDescription className="text-aura-cyan mt-1">
                      {getCosmicMessage()}
                    </CardDescription>
                  </div>
                </div>
              </div>
            </CardHeader>
          </Card>
        </motion.div>

        {/* Quick Info Cards - Rashi, Lagna, Nakshatra, Dasha */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          <Card className="cosmic-card border-aura-blue/30 bg-cosmic-indigo/10 hover-glow">
            <CardContent className="pt-6 text-center">
              <div className="text-2xl mb-2">🌟</div>
              <p className="text-xs text-aura-cyan mb-1">Rashi</p>
              <p className="text-lg font-semibold text-white">{data.quickInfo.rashi}</p>
            </CardContent>
          </Card>

          <Card className="cosmic-card border-aura-violet/30 bg-cosmic-indigo/10 hover-glow">
            <CardContent className="pt-6 text-center">
              <div className="text-2xl mb-2">🌙</div>
              <p className="text-xs text-aura-violet mb-1">Lagna</p>
              <p className="text-lg font-semibold text-white">{data.quickInfo.lagna}</p>
            </CardContent>
          </Card>

          <Card className="cosmic-card border-aura-green/30 bg-cosmic-indigo/10 hover-glow">
            <CardContent className="pt-6 text-center">
              <div className="text-2xl mb-2">⭐</div>
              <p className="text-xs text-aura-green mb-1">Nakshatra</p>
              <p className="text-lg font-semibold text-white">{data.quickInfo.nakshatra}</p>
            </CardContent>
          </Card>

          <Card className="cosmic-card border-aura-orange/30 bg-cosmic-indigo/10 hover-glow">
            <CardContent className="pt-6 text-center">
              <div className="text-2xl mb-2">⏳</div>
              <p className="text-xs text-aura-orange mb-1">Dasha</p>
              <p className="text-lg font-semibold text-white">{data.quickInfo.dasha}</p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Today's Horoscope Card */}
        {data.todayHoroscope && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <HoroscopeCard
              rashi={data.todayHoroscope.rashi}
              horoscope={data.todayHoroscope.general}
              luckyNumber={data.todayHoroscope.luckyNumber}
              luckyColor={data.todayHoroscope.luckyColor}
              mood="positive"
              chakraColor="#6E2DEB"
            />
          </motion.div>
        )}

        {/* Quick Actions Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Card className="cosmic-card border-cosmic-purple/30 bg-cosmic-indigo/10">
            <CardHeader>
              <CardTitle className="text-cosmic-gold">Quick Actions</CardTitle>
              <CardDescription className="text-aura-cyan">
                Explore your spiritual profile
              </CardDescription>
            </CardHeader>
            <CardContent>
              <QuickActionsGrid actions={quickActions} />
            </CardContent>
          </Card>
        </motion.div>

        {/* Upcoming Transits */}
        {data.transits.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Card className="cosmic-card border-aura-blue/30 bg-cosmic-indigo/10">
              <CardHeader>
                <CardTitle className="text-aura-blue flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Upcoming Transits
                </CardTitle>
                <CardDescription className="text-aura-cyan">
                  Important planetary movements affecting you
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {data.transits.slice(0, 5).map((transit, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: 0.5 + index * 0.1 }}
                      className="flex items-center justify-between p-4 rounded-lg border border-cosmic-purple/20 bg-cosmic-navy/30 hover:bg-cosmic-navy/50 transition-colors"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-semibold text-white">{transit.planet}</p>
                          <Badge
                            variant={
                              transit.impact === 'strong'
                                ? 'destructive'
                                : transit.impact === 'medium'
                                ? 'default'
                                : 'secondary'
                            }
                            className="text-xs"
                          >
                            {transit.impact}
                          </Badge>
                        </div>
                        <p className="text-sm text-aura-cyan">{transit.event}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-white">
                          {new Date(transit.date).toLocaleDateString()}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
};

