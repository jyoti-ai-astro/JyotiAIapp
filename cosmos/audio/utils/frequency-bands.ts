/**
 * Frequency Bands Utility
 * 
 * Phase 2 — Section 8: AUDIO ATMOSPHERE ENGINE v1.0
 * Spatial Audio Engine (E13)
 * 
 * Frequency band definitions and helpers
 */

export interface FrequencyBand {
  min: number;
  max: number;
  label: string;
}

/**
 * Standard frequency bands
 */
export const FREQUENCY_BANDS = {
  BASS: { min: 20, max: 150, label: 'Bass' },
  MID: { min: 150, max: 1200, label: 'Mid' },
  HIGH: { min: 1200, max: 7000, label: 'High' },
} as const;

/**
 * Get frequency band for a given frequency
 */
export function getFrequencyBand(frequency: number): FrequencyBand | null {
  if (frequency >= FREQUENCY_BANDS.BASS.min && frequency < FREQUENCY_BANDS.BASS.max) {
    return FREQUENCY_BANDS.BASS;
  }
  if (frequency >= FREQUENCY_BANDS.MID.min && frequency < FREQUENCY_BANDS.MID.max) {
    return FREQUENCY_BANDS.MID;
  }
  if (frequency >= FREQUENCY_BANDS.HIGH.min && frequency < FREQUENCY_BANDS.HIGH.max) {
    return FREQUENCY_BANDS.HIGH;
  }
  return null;
}

/**
 * Calculate frequency bin index for FFT
 */
export function frequencyToBinIndex(frequency: number, sampleRate: number, fftSize: number): number {
  return Math.floor((frequency / sampleRate) * fftSize);
}

/**
 * Calculate frequency from bin index
 */
export function binIndexToFrequency(binIndex: number, sampleRate: number, fftSize: number): number {
  return (binIndex * sampleRate) / fftSize;
}

