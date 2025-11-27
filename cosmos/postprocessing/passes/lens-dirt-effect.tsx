/**
 * Lens Dirt Effect Component
 * 
 * Wrapper for LensDirtPass to work with @react-three/postprocessing
 */

'use client';

import React, { useEffect, useMemo } from 'react';
import { Effect } from '@react-three/postprocessing';
import { LensDirtPass } from './lens-dirt-pass';

export interface LensDirtEffectProps {
  intensity?: number;
  scroll?: number;
  high?: number;
}

export const LensDirtEffect: React.FC<LensDirtEffectProps> = ({
  intensity = 1.0,
  scroll = 0,
  high = 0,
}) => {
  const effect = useMemo(() => new LensDirtPass({ intensity, scroll, high }), []);
  
  useEffect(() => {
    effect.setIntensity(intensity);
    effect.setScroll(scroll);
    effect.setHigh(high);
  }, [effect, intensity, scroll, high]);
  
  return <Effect effect={effect} />;
};

