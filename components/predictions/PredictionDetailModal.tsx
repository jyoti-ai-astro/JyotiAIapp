/**
 * Prediction Detail Modal
 * 
 * Shows detailed breakdown of a prediction with remedies
 */

'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, TrendingUp, TrendingDown, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { Prediction } from '@/lib/engines/prediction-engine';
import { RemedyCard } from '@/components/remedies/RemedyCard';
import { useRemedies } from '@/lib/hooks/useRemedies';

interface PredictionDetailModalProps {
  prediction: Prediction | null;
  isOpen: boolean;
  onClose: () => void;
}

export const PredictionDetailModal: React.FC<PredictionDetailModalProps> = ({
  prediction,
  isOpen,
  onClose,
}) => {
  const { getRemediesForPrediction, loading: remediesLoading } = useRemedies();
  const [remedies, setRemedies] = React.useState<any>(null);

  React.useEffect(() => {
    if (prediction && isOpen) {
      getRemediesForPrediction(prediction.category, prediction.intensity).then(setRemedies);
    }
  }, [prediction, isOpen, getRemediesForPrediction]);

  if (!prediction) return null;

  const intensityColors = {
    high: 'text-green-400',
    medium: 'text-yellow-400',
    low: 'text-red-400',
  };

  const intensityBg = {
    high: 'bg-green-500/20 border-green-500/50',
    medium: 'bg-yellow-500/20 border-yellow-500/50',
    low: 'bg-red-500/20 border-red-500/50',
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
                <Sparkles className="h-6 w-6 text-gold" />
                <h2 className="text-2xl font-display font-bold text-gold capitalize">
                  {prediction.category} Prediction Details
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
              {/* Intensity Badge */}
              <div className={`p-4 rounded-lg border ${intensityBg[prediction.intensity]}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-white/70 mb-1">Cosmic Intensity</p>
                    <p className={`text-2xl font-bold ${intensityColors[prediction.intensity]}`}>
                      {prediction.intensity.toUpperCase()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-white/70 mb-1">Score</p>
                    <p className="text-2xl font-bold text-gold">{prediction.score}/100</p>
                  </div>
                </div>
              </div>

              {/* Prediction Text */}
              <Card className="bg-cosmic-indigo/80 backdrop-blur-sm border border-cosmic-purple/30">
                <CardHeader>
                  <CardTitle className="text-gold">Prediction</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-white/90 leading-relaxed">{prediction.prediction}</p>
                </CardContent>
              </Card>

              {/* Tags */}
              {prediction.tags && prediction.tags.length > 0 && (
                <div>
                  <p className="text-sm font-semibold text-gold mb-2">Tags</p>
                  <div className="flex flex-wrap gap-2">
                    {prediction.tags.map((tag, i) => (
                      <span
                        key={i}
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          tag.type === 'blessing'
                            ? 'bg-green-500/20 text-green-400 border border-green-500/50'
                            : tag.type === 'obstacle'
                            ? 'bg-red-500/20 text-red-400 border border-red-500/50'
                            : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/50'
                        }`}
                      >
                        {tag.label}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Detailed Breakdown */}
              {prediction.detailedBreakdown && (
                <div className="space-y-4">
                  {prediction.detailedBreakdown.strengths && prediction.detailedBreakdown.strengths.length > 0 && (
                    <Card className="bg-green-500/10 border-green-500/30">
                      <CardHeader>
                        <CardTitle className="text-green-400 flex items-center gap-2">
                          <TrendingUp className="h-5 w-5" />
                          Strengths
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2">
                          {prediction.detailedBreakdown.strengths.map((strength, i) => (
                            <li key={i} className="text-white/80 flex items-start gap-2">
                              <span className="text-green-400 mt-1">•</span>
                              <span>{strength}</span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  )}

                  {prediction.detailedBreakdown.challenges && prediction.detailedBreakdown.challenges.length > 0 && (
                    <Card className="bg-red-500/10 border-red-500/30">
                      <CardHeader>
                        <CardTitle className="text-red-400 flex items-center gap-2">
                          <AlertCircle className="h-5 w-5" />
                          Challenges
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2">
                          {prediction.detailedBreakdown.challenges.map((challenge, i) => (
                            <li key={i} className="text-white/80 flex items-start gap-2">
                              <span className="text-red-400 mt-1">•</span>
                              <span>{challenge}</span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  )}

                  {prediction.detailedBreakdown.opportunities && prediction.detailedBreakdown.opportunities.length > 0 && (
                    <Card className="bg-blue-500/10 border-blue-500/30">
                      <CardHeader>
                        <CardTitle className="text-blue-400 flex items-center gap-2">
                          <Sparkles className="h-5 w-5" />
                          Opportunities
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2">
                          {prediction.detailedBreakdown.opportunities.map((opportunity, i) => (
                            <li key={i} className="text-white/80 flex items-start gap-2">
                              <span className="text-blue-400 mt-1">•</span>
                              <span>{opportunity}</span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}

              {/* Advice */}
              <Card className="bg-cosmic-indigo/80 backdrop-blur-sm border border-cosmic-purple/30">
                <CardHeader>
                  <CardTitle className="text-gold">Advice</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-white/90">{prediction.advice}</p>
                </CardContent>
              </Card>

              {/* Lucky Elements */}
              {prediction.luckyElements && (
                <Card className="bg-cosmic-indigo/80 backdrop-blur-sm border border-cosmic-purple/30">
                  <CardHeader>
                    <CardTitle className="text-gold">Lucky Elements</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-4">
                      {prediction.luckyElements.color && (
                        <div>
                          <p className="text-xs text-white/60 mb-1">Color</p>
                          <p className="text-white font-semibold">{prediction.luckyElements.color}</p>
                        </div>
                      )}
                      {prediction.luckyElements.number && (
                        <div>
                          <p className="text-xs text-white/60 mb-1">Number</p>
                          <p className="text-white font-semibold">{prediction.luckyElements.number}</p>
                        </div>
                      )}
                      {prediction.luckyElements.direction && (
                        <div>
                          <p className="text-xs text-white/60 mb-1">Direction</p>
                          <p className="text-white font-semibold">{prediction.luckyElements.direction}</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Remedies */}
              {remedies && <RemedyCard remedies={remedies} />}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

