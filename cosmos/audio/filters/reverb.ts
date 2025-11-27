/**
 * Reverb Filter
 * 
 * Phase 2 — Section 8: AUDIO ATMOSPHERE ENGINE v1.0
 * Spatial Audio Engine (E13)
 * 
 * Reverb implementation using ConvolverNode
 */

import { getAudioContext } from '../audio-context';

export interface ReverbConfig {
  roomSize?: number;
  dampening?: number;
  wet?: number;
}

/**
 * Create a reverb effect using ConvolverNode
 * Generates impulse response for reverb
 */
export function createReverb(config: ReverbConfig = {}): {
  convolver: ConvolverNode;
  wetGain: GainNode;
  dryGain: GainNode;
} {
  const ctx = getAudioContext();
  const roomSize = config.roomSize || 0.5;
  const dampening = config.dampening || 0.3;
  const wet = config.wet || 0.3;
  
  // Create impulse response
  const length = ctx.sampleRate * roomSize;
  const impulse = ctx.createBuffer(2, length, ctx.sampleRate);
  
  for (let channel = 0; channel < 2; channel++) {
    const channelData = impulse.getChannelData(channel);
    for (let i = 0; i < length; i++) {
      const n = length - i;
      channelData[i] = (Math.random() * 2 - 1) * Math.pow(n / length, dampening);
    }
  }
  
  const convolver = ctx.createConvolver();
  convolver.buffer = impulse;
  
  const wetGain = ctx.createGain();
  wetGain.gain.value = wet;
  
  const dryGain = ctx.createGain();
  dryGain.gain.value = 1 - wet;
  
  return { convolver, wetGain, dryGain };
}

