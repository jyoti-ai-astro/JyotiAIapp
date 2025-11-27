/**
 * Godray Effect Component
 * 
 * Wrapper for GodrayPass to work with @react-three/postprocessing
 */

'use client';

import React, { useEffect, useMemo } from 'react';
import { Effect } from '@react-three/postprocessing';
import { GodrayPass } from './godray-pass';

export interface GodrayEffectProps {
  intensity?: number;
  scroll?: number;
  high?: number;
}

export const GodrayEffect: React.FC<GodrayEffectProps> = ({
  intensity = 0.3,
  scroll = 0,
  high = 0,
}) => {
  const effect = useMemo(() => new GodrayPass({ intensity, scroll, high }), []);
  
  useEffect(() => {
    effect.setIntensity(intensity);
    effect.setScroll(scroll);
    effect.setHigh(high);
  }, [effect, intensity, scroll, high]);
  
  return <Effect effect={effect} />;
};

