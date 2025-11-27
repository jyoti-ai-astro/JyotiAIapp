/**
 * SPATIAL AUDIO ENGINE (E13)
 * 
 * Phase 2 — Section 8: AUDIO ATMOSPHERE ENGINE v1.0
 * 
 * Complete spatial audio system exports
 */

// Core engine
export { AudioEngine } from './audio-engine';
export type { AudioLayer } from './audio-engine';

// Audio context
export {
  getAudioContext,
  resumeAudioContext,
  getAudioContextState,
  destroyAudioContext,
} from './audio-context';

// FFT processor
export { FFTProcessor } from './fft-processor';
export type { FFTData } from './fft-processor';

// Spatial audio
export { SpatialAudio } from './spatial-audio';
export type { SpatialAudioConfig } from './spatial-audio';

// Audio events
export { AudioEvent, AUDIO_EVENTS } from './audio-events';
export type { AudioEventType, AudioEventConfig } from './audio-events';

// Audio loader
export { audioLoader } from './audio-loader';
export type { AudioBufferCache } from './audio-loader';

// Filters
export { createLowpassFilter, updateLowpassFilter } from './filters/lowpass-filter';
export type { LowpassFilterConfig } from './filters/lowpass-filter';

export { createHighpassFilter, updateHighpassFilter } from './filters/highpass-filter';
export type { HighpassFilterConfig } from './filters/highpass-filter';

export { createReverb } from './filters/reverb';
export type { ReverbConfig } from './filters/reverb';

export { createDelay } from './filters/delay';
export type { DelayConfig } from './filters/delay';

// Utils
export { MovingAverage, ExponentialSmoothing, smoothValue } from './utils/smoothing';
export {
  FREQUENCY_BANDS,
  getFrequencyBand,
  frequencyToBinIndex,
  binIndexToFrequency,
} from './utils/frequency-bands';
export type { FrequencyBand } from './utils/frequency-bands';
