/**
 * Highpass Filter
 * 
 * Phase 2 — Section 8: AUDIO ATMOSPHERE ENGINE v1.0
 * Spatial Audio Engine (E13)
 * 
 * Highpass filter implementation
 */

import { getAudioContext } from '../audio-context';

export interface HighpassFilterConfig {
  frequency?: number;
  Q?: number;
}

/**
 * Create a highpass biquad filter
 */
export function createHighpassFilter(config: HighpassFilterConfig = {}): BiquadFilterNode {
  const ctx = getAudioContext();
  const filter = ctx.createBiquadFilter();
  
  filter.type = 'highpass';
  filter.frequency.value = config.frequency || 200;
  filter.Q.value = config.Q || 1;
  
  return filter;
}

/**
 * Update highpass filter frequency
 */
export function updateHighpassFilter(
  filter: BiquadFilterNode,
  frequency: number
): void {
  filter.frequency.value = frequency;
}

