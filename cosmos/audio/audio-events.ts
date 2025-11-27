/**
 * Audio Events
 * 
 * Phase 2 — Section 8: AUDIO ATMOSPHERE ENGINE v1.0
 * Spatial Audio Engine (E13)
 * 
 * Audio event triggers for cosmic interactions
 */

import { getAudioContext } from './audio-context';
import { createReverb } from './filters/reverb';
import { createDelay } from './filters/delay';

export type AudioEventType =
  | 'chakra-pulse'
  | 'shockwave-trigger'
  | 'orb-spark'
  | 'ribbon-surge';

export interface AudioEventConfig {
  duration: number;
  frequency: number;
  threshold: number;
  adsr?: {
    attack: number;
    decay: number;
    sustain: number;
    release: number;
  };
}

export const AUDIO_EVENTS: Record<AudioEventType, AudioEventConfig> = {
  'chakra-pulse': {
    duration: 0.2,
    frequency: 2000, // High-frequency shimmer
    threshold: 0.3,
    adsr: {
      attack: 0.01,
      decay: 0.05,
      sustain: 0.3,
      release: 0.15,
    },
  },
  'shockwave-trigger': {
    duration: 0.5,
    frequency: 60, // Bass drop
    threshold: 0.4,
    adsr: {
      attack: 0.01,
      decay: 0.1,
      sustain: 0.5,
      release: 0.4,
    },
  },
  'orb-spark': {
    duration: 0.15,
    frequency: 5000, // High-frequency sparkle
    threshold: 0.5,
    adsr: {
      attack: 0.005,
      decay: 0.03,
      sustain: 0.2,
      release: 0.12,
    },
  },
  'ribbon-surge': {
    duration: 0.3,
    frequency: 800, // Midband resonant sweep
    threshold: 0.35,
    adsr: {
      attack: 0.02,
      decay: 0.08,
      sustain: 0.4,
      release: 0.2,
    },
  },
};

export class AudioEvent {
  private oscillator: OscillatorNode | null = null;
  private gainNode: GainNode;
  private reverb: ReturnType<typeof createReverb> | null = null;
  private delay: ReturnType<typeof createDelay> | null = null;
  private config: AudioEventConfig;
  private type: AudioEventType;

  constructor(type: AudioEventType, config?: Partial<AudioEventConfig>) {
    const ctx = getAudioContext();
    this.type = type;
    this.config = { ...AUDIO_EVENTS[type], ...config };
    
    // Create gain node for ADSR envelope
    this.gainNode = ctx.createGain();
    this.gainNode.gain.value = 0;
    
    // Create effects based on event type
    if (type === 'shockwave-trigger') {
      this.reverb = createReverb({ roomSize: 0.8, wet: 0.5 });
      this.delay = createDelay({ delayTime: 0.2, feedback: 0.3, wet: 0.4 });
    }
  }

  /**
   * Trigger audio event
   */
  trigger(fftData?: { bass: number; mid: number; high: number }): void {
    // Check threshold
    if (fftData) {
      const threshold = this.config.threshold;
      let value = 0;
      
      if (this.type === 'chakra-pulse' || this.type === 'orb-spark') {
        value = fftData.high;
      } else if (this.type === 'shockwave-trigger') {
        value = fftData.bass;
      } else if (this.type === 'ribbon-surge') {
        value = fftData.mid;
      }
      
      if (value < threshold) {
        return; // Don't trigger if below threshold
      }
    }
    
    const ctx = getAudioContext();
    
    // Create oscillator
    const oscillator = ctx.createOscillator();
    oscillator.type = this.type === 'ribbon-surge' ? 'sine' : 'sine';
    oscillator.frequency.value = this.config.frequency;
    
    // Apply ADSR envelope
    const adsr = this.config.adsr || {
      attack: 0.01,
      decay: 0.05,
      sustain: 0.3,
      release: 0.15,
    };
    
    const now = ctx.currentTime;
    const duration = this.config.duration;
    
    // Attack
    this.gainNode.gain.setValueAtTime(0, now);
    this.gainNode.gain.linearRampToValueAtTime(1, now + adsr.attack);
    
    // Decay
    this.gainNode.gain.linearRampToValueAtTime(
      adsr.sustain,
      now + adsr.attack + adsr.decay
    );
    
    // Sustain (held until release)
    const sustainEnd = now + duration - adsr.release;
    this.gainNode.gain.setValueAtTime(adsr.sustain, sustainEnd);
    
    // Release
    this.gainNode.gain.linearRampToValueAtTime(0, now + duration);
    
    // Connect oscillator
    oscillator.connect(this.gainNode);
    
    // Connect through effects
    let output: AudioNode = this.gainNode;
    
    if (this.reverb) {
      output.connect(this.reverb.convolver);
      this.reverb.convolver.connect(this.reverb.wetGain);
      this.reverb.wetGain.connect(ctx.destination);
      output.connect(this.reverb.dryGain);
      output = this.reverb.dryGain;
    }
    
    if (this.delay) {
      output.connect(this.delay.delay);
      this.delay.delay.connect(this.delay.wetGain);
      this.delay.wetGain.connect(ctx.destination);
      output.connect(this.delay.dryGain);
      output = this.delay.dryGain;
    }
    
    // Connect to destination
    output.connect(ctx.destination);
    
    // Start and stop
    oscillator.start(now);
    oscillator.stop(now + duration);
    
    this.oscillator = oscillator;
  }

  /**
   * Stop event
   */
  stop(): void {
    if (this.oscillator) {
      this.oscillator.stop();
      this.oscillator = null;
    }
  }
}

