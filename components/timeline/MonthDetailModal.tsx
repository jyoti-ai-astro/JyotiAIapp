/**
 * Month Detail Modal
 * 
 * Shows detailed breakdown of a month's timeline events
 */

'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, Sparkles, AlertTriangle, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { MonthTimeline } from '@/lib/engines/timeline-engine';

interface MonthDetailModalProps {
  month: MonthTimeline | null;
  isOpen: boolean;
  onClose: () => void;
}

export const MonthDetailModal: React.FC<MonthDetailModalProps> = ({
  month,
  isOpen,
  onClose,
}) => {
  if (!month) return null;

  const getEventColor = (type: string, impact: string) => {
    if (type === 'auspicious' || impact === 'positive') return 'text-green-400 border-green-500/50 bg-green-500/10';
    if (type === 'challenging' || impact === 'challenging') return 'text-red-400 border-red-500/50 bg-red-500/10';
    return 'text-yellow-400 border-yellow-500/50 bg-yellow-500/10';
  };

  const energyColors = {
    high: 'text-green-400',
    medium: 'text-yellow-400',
    low: 'text-red-400',
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed inset-4 md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-3xl max-h-[90vh] overflow-y-auto z-50 bg-cosmic-navy border border-cosmic-purple/30 rounded-lg p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Calendar className="h-6 w-6 text-gold" />
                <h2 className="text-2xl font-display font-bold text-gold">
                  {month.month} {month.year}
                </h2>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="text-white hover:bg-white/10"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            <div className="space-y-6">
              {/* Overall Energy */}
              <div className="p-4 rounded-lg border border-cosmic-purple/30 bg-cosmic-indigo/80">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-white/70 mb-1">Overall Energy</p>
                    <p className={`text-2xl font-bold ${energyColors[month.overallEnergy]}`}>
                      {month.overallEnergy.toUpperCase()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-white/70 mb-1">Focus Areas</p>
                    <p className="text-white font-semibold">{month.focusAreas.join(', ')}</p>
                  </div>
                </div>
              </div>

              {/* Prediction */}
              <Card className="bg-cosmic-indigo/80 backdrop-blur-sm border border-cosmic-purple/30">
                <CardHeader>
                  <CardTitle className="text-gold">Monthly Prediction</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-white/90 leading-relaxed">{month.prediction}</p>
                </CardContent>
              </Card>

              {/* Events */}
              {month.events && month.events.length > 0 && (
                <div>
                  <h3 className="text-lg font-display font-bold text-gold mb-4">Key Events</h3>
                  <div className="space-y-3">
                    {month.events.map((event) => (
                      <Card
                        key={event.id}
                        className={`border ${getEventColor(event.type, event.impact)}`}
                      >
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div>
                              <CardTitle className="text-white flex items-center gap-2">
                                {event.planet && <Sparkles className="h-4 w-4" />}
                                {event.event}
                              </CardTitle>
                              <p className="text-xs text-white/60 mt-1">
                                {new Date(event.date).toLocaleDateString()} • {event.category}
                              </p>
                            </div>
                            <div className={`px-2 py-1 rounded text-xs font-medium ${getEventColor(event.type, event.impact)}`}>
                              {event.type}
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <p className="text-white/80 text-sm mb-2">{event.description}</p>
                          {event.significance && (
                            <p className="text-xs text-white/60 italic">Significance: {event.significance}</p>
                          )}
                          {event.remedies && event.remedies.length > 0 && (
                            <div className="mt-2">
                              <p className="text-xs text-white/60 mb-1">Remedies:</p>
                              <ul className="space-y-1">
                                {event.remedies.map((remedy, i) => (
                                  <li key={i} className="text-xs text-white/70 flex items-start gap-2">
                                    <span className="text-gold mt-1">•</span>
                                    <span>{remedy}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* Auspicious Periods */}
              {month.auspiciousPeriods && month.auspiciousPeriods.length > 0 && (
                <Card className="bg-green-500/10 border-green-500/30">
                  <CardHeader>
                    <CardTitle className="text-green-400 flex items-center gap-2">
                      <TrendingUp className="h-5 w-5" />
                      Auspicious Periods
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {month.auspiciousPeriods.map((period, i) => (
                      <div key={i} className="bg-white/5 p-3 rounded-lg">
                        <p className="text-sm text-white font-semibold mb-1">
                          {new Date(period.start).toLocaleDateString()} - {new Date(period.end).toLocaleDateString()}
                        </p>
                        <p className="text-sm text-white/80">{period.description}</p>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              {/* Challenging Periods */}
              {month.challengingPeriods && month.challengingPeriods.length > 0 && (
                <Card className="bg-red-500/10 border-red-500/30">
                  <CardHeader>
                    <CardTitle className="text-red-400 flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5" />
                      Challenging Periods
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {month.challengingPeriods.map((period, i) => (
                      <div key={i} className="bg-white/5 p-3 rounded-lg">
                        <p className="text-sm text-white font-semibold mb-1">
                          {new Date(period.start).toLocaleDateString()} - {new Date(period.end).toLocaleDateString()}
                        </p>
                        <p className="text-sm text-white/80">{period.description}</p>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              {/* Major Transits */}
              {month.majorTransits && month.majorTransits.length > 0 && (
                <Card className="bg-cosmic-indigo/80 backdrop-blur-sm border border-cosmic-purple/30">
                  <CardHeader>
                    <CardTitle className="text-gold">Major Transits</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {month.majorTransits.map((transit, i) => (
                        <li key={i} className="text-white/80 flex items-start gap-2">
                          <span className="text-gold mt-1">•</span>
                          <span>{transit}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {/* Personal Milestones */}
              {month.personalMilestones && month.personalMilestones.length > 0 && (
                <Card className="bg-cosmic-indigo/80 backdrop-blur-sm border border-cosmic-purple/30">
                  <CardHeader>
                    <CardTitle className="text-gold">Personal Milestones</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {month.personalMilestones.map((milestone, i) => (
                        <li key={i} className="text-white/80 flex items-start gap-2">
                          <span className="text-gold mt-1">•</span>
                          <span>{milestone}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

