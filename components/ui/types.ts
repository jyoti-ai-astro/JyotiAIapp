/**
 * Component Types
 * 
 * Phase 3 — Section 15: Component API Standards
 */

import { ReactNode } from 'react';

export interface MotionConfig {
  initial?: object;
  animate?: object;
  exit?: object;
  transition?: {
    duration?: number;
    ease?: string | number[];
    delay?: number;
  };
  hover?: object;
  tap?: object;
}

export interface ShaderProps {
  noiseStrength?: number;
  pulseSpeed?: number;
  glowIntensity?: number;
  color?: string;
  distort?: number;
  timeScale?: number;
}

export interface JyotiComponentProps {
  /** Theme variant: light | dark | cosmic */
  variant?: 'light' | 'dark' | 'cosmic';
  
  /** Size variant */
  size?: 'sm' | 'md' | 'lg' | 'xl';
  
  /** Whether the component is in loading state */
  loading?: boolean;
  
  /** Whether the component is disabled */
  disabled?: boolean;
  
  /** Optional animation override */
  motion?: MotionConfig;
  
  /** Optional shader override (for cosmic components) */
  shaderProps?: ShaderProps;
  
  /** Tailwind class overrides */
  className?: string;
  
  /** Additional props such as children */
  children?: ReactNode;
}

