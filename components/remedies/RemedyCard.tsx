/**
 * Remedy Card Component
 * 
 * Displays spiritual remedies (mantras, gemstones, colors, do's/don'ts)
 */

'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Gem, Palette, CheckCircle, XCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { RemedyPackage } from '@/lib/engines/remedy-engine';

interface RemedyCardProps {
  remedies: RemedyPackage;
}

export const RemedyCard: React.FC<RemedyCardProps> = ({ remedies }) => {
  return (
    <div className="space-y-4">
      <h3 className="text-xl font-display font-bold text-gold flex items-center gap-2">
        <Sparkles className="h-5 w-5" />
        Spiritual Remedies
      </h3>

      {/* Mantras */}
      {remedies.mantras && remedies.mantras.length > 0 && (
        <Card className="bg-cosmic-indigo/80 backdrop-blur-sm border border-cosmic-purple/30">
          <CardHeader>
            <CardTitle className="text-gold flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              Mantras
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {remedies.mantras.map((mantra, i) => (
              <div key={i} className="bg-white/5 p-4 rounded-lg">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-semibold text-white">{mantra.name}</p>
                    <p className="text-sm text-white/60">{mantra.deity}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-white/60">Count</p>
                    <p className="text-gold font-bold">{mantra.count}</p>
                  </div>
                </div>
                <p className="text-2xl font-display text-gold mb-2">{mantra.text}</p>
                <p className="text-sm text-white/70 mb-2">Timing: {mantra.timing}</p>
                <div>
                  <p className="text-xs text-white/60 mb-1">Benefits:</p>
                  <ul className="space-y-1">
                    {mantra.benefits.map((benefit, j) => (
                      <li key={j} className="text-sm text-white/80 flex items-start gap-2">
                        <span className="text-gold mt-1">•</span>
                        <span>{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Gemstones */}
      {remedies.gemstones && remedies.gemstones.length > 0 && (
        <Card className="bg-cosmic-indigo/80 backdrop-blur-sm border border-cosmic-purple/30">
          <CardHeader>
            <CardTitle className="text-gold flex items-center gap-2">
              <Gem className="h-5 w-5" />
              Gemstones
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {remedies.gemstones.map((gemstone, i) => (
              <div key={i} className="bg-white/5 p-4 rounded-lg">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-semibold text-white">{gemstone.name}</p>
                    <p className="text-sm text-white/60">Planet: {gemstone.planet}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-white/60">Color</p>
                    <p className="text-white font-semibold">{gemstone.color}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <div>
                    <p className="text-xs text-white/60">Finger</p>
                    <p className="text-white text-sm">{gemstone.finger}</p>
                  </div>
                  <div>
                    <p className="text-xs text-white/60">Metal</p>
                    <p className="text-white text-sm">{gemstone.metal}</p>
                  </div>
                </div>
                <div className="mt-3">
                  <p className="text-xs text-white/60 mb-1">Benefits:</p>
                  <ul className="space-y-1">
                    {gemstone.benefits.map((benefit, j) => (
                      <li key={j} className="text-sm text-white/80 flex items-start gap-2">
                        <span className="text-gold mt-1">•</span>
                        <span>{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                {gemstone.precautions && gemstone.precautions.length > 0 && (
                  <div className="mt-3 p-2 bg-yellow-500/10 border border-yellow-500/30 rounded">
                    <p className="text-xs text-yellow-400 font-semibold mb-1">Precautions:</p>
                    <ul className="space-y-1">
                      {gemstone.precautions.map((precaution, j) => (
                        <li key={j} className="text-xs text-yellow-300 flex items-start gap-2">
                          <span className="mt-1">⚠</span>
                          <span>{precaution}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Daily Colors */}
      {remedies.dailyColors && remedies.dailyColors.length > 0 && (
        <Card className="bg-cosmic-indigo/80 backdrop-blur-sm border border-cosmic-purple/30">
          <CardHeader>
            <CardTitle className="text-gold flex items-center gap-2">
              <Palette className="h-5 w-5" />
              Daily Colors
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {remedies.dailyColors.map((color, i) => (
              <div key={i} className="bg-white/5 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="font-semibold text-white">{color.color}</p>
                    <p className="text-sm text-white/60">{color.day} • {color.planet}</p>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-white/60 mb-1">Benefits:</p>
                  <ul className="space-y-1">
                    {color.benefits.map((benefit, j) => (
                      <li key={j} className="text-sm text-white/80 flex items-start gap-2">
                        <span className="text-gold mt-1">•</span>
                        <span>{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                {color.items && color.items.length > 0 && (
                  <div className="mt-2">
                    <p className="text-xs text-white/60 mb-1">Items:</p>
                    <div className="flex flex-wrap gap-2">
                      {color.items.map((item, j) => (
                        <span key={j} className="text-xs bg-gold/20 text-gold px-2 py-1 rounded">
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Do's and Don'ts */}
      {remedies.dosAndDonts && (
        <Card className="bg-cosmic-indigo/80 backdrop-blur-sm border border-cosmic-purple/30">
          <CardHeader>
            <CardTitle className="text-gold">Do's and Don'ts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-semibold text-green-400 flex items-center gap-2 mb-2">
                  <CheckCircle className="h-4 w-4" />
                  Do's
                </p>
                <ul className="space-y-2">
                  {remedies.dosAndDonts.dos.map((doItem, i) => (
                    <li key={i} className="text-sm text-white/80 flex items-start gap-2">
                      <span className="text-green-400 mt-1">✓</span>
                      <span>{doItem}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="text-sm font-semibold text-red-400 flex items-center gap-2 mb-2">
                  <XCircle className="h-4 w-4" />
                  Don'ts
                </p>
                <ul className="space-y-2">
                  {remedies.dosAndDonts.donts.map((dont, i) => (
                    <li key={i} className="text-sm text-white/80 flex items-start gap-2">
                      <span className="text-red-400 mt-1">✗</span>
                      <span>{dont}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Timing */}
      {remedies.timing && (
        <Card className="bg-cosmic-indigo/80 backdrop-blur-sm border border-cosmic-purple/30">
          <CardHeader>
            <CardTitle className="text-gold">Timing</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-semibold text-green-400 mb-2">Auspicious</p>
                <ul className="space-y-1">
                  {remedies.timing.auspicious.map((time, i) => (
                    <li key={i} className="text-sm text-white/80 flex items-start gap-2">
                      <span className="text-green-400 mt-1">•</span>
                      <span>{time}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="text-sm font-semibold text-red-400 mb-2">Inauspicious</p>
                <ul className="space-y-1">
                  {remedies.timing.inauspicious.map((time, i) => (
                    <li key={i} className="text-sm text-white/80 flex items-start gap-2">
                      <span className="text-red-400 mt-1">•</span>
                      <span>{time}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

