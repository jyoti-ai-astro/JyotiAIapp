/**
 * Delay Filter
 * 
 * Phase 2 — Section 8: AUDIO ATMOSPHERE ENGINE v1.0
 * Spatial Audio Engine (E13)
 * 
 * Delay effect implementation
 */

import { getAudioContext } from '../audio-context';

export interface DelayConfig {
  delayTime?: number;
  feedback?: number;
  wet?: number;
}

/**
 * Create a delay effect
 */
export function createDelay(config: DelayConfig = {}): {
  delay: DelayNode;
  feedbackGain: GainNode;
  wetGain: GainNode;
  dryGain: GainNode;
} {
  const ctx = getAudioContext();
  const delayTime = config.delayTime || 0.3;
  const feedback = config.feedback || 0.3;
  const wet = config.wet || 0.5;
  
  const delay = ctx.createDelay();
  delay.delayTime.value = delayTime;
  
  const feedbackGain = ctx.createGain();
  feedbackGain.gain.value = feedback;
  
  const wetGain = ctx.createGain();
  wetGain.gain.value = wet;
  
  const dryGain = ctx.createGain();
  dryGain.gain.value = 1 - wet;
  
  // Connect feedback loop
  delay.connect(feedbackGain);
  feedbackGain.connect(delay);
  
  return { delay, feedbackGain, wetGain, dryGain };
}

