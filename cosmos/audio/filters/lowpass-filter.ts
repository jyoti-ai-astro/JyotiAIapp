/**
 * Lowpass Filter
 * 
 * Phase 2 — Section 8: AUDIO ATMOSPHERE ENGINE v1.0
 * Spatial Audio Engine (E13)
 * 
 * Lowpass filter implementation
 */

import { getAudioContext } from '../audio-context';

export interface LowpassFilterConfig {
  frequency?: number;
  Q?: number;
}

/**
 * Create a lowpass biquad filter
 */
export function createLowpassFilter(config: LowpassFilterConfig = {}): BiquadFilterNode {
  const ctx = getAudioContext();
  const filter = ctx.createBiquadFilter();
  
  filter.type = 'lowpass';
  filter.frequency.value = config.frequency || 1000;
  filter.Q.value = config.Q || 1;
  
  return filter;
}

/**
 * Update lowpass filter frequency
 */
export function updateLowpassFilter(
  filter: BiquadFilterNode,
  frequency: number
): void {
  filter.frequency.value = frequency;
}

