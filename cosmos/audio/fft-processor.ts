/**
 * FFT Processor
 * 
 * Phase 2 — Section 8: AUDIO ATMOSPHERE ENGINE v1.0
 * Spatial Audio Engine (E13)
 * 
 * FFT analysis for frequency bands extraction
 */

import { getAudioContext } from './audio-context';
import { FREQUENCY_BANDS, frequencyToBinIndex } from './utils/frequency-bands';
import { MovingAverage } from './utils/smoothing';

export interface FFTData {
  bass: number;
  mid: number;
  high: number;
}

export class FFTProcessor {
  private analyser: AnalyserNode;
  private bufferLength: number;
  private dataArray: Uint8Array;
  private fftSize: number = 2048;
  
  // Smoothing for each band
  private bassSmoother: MovingAverage;
  private midSmoother: MovingAverage;
  private highSmoother: MovingAverage;
  
  // Bin indices for each band
  private bassStartBin: number;
  private bassEndBin: number;
  private midStartBin: number;
  private midEndBin: number;
  private highStartBin: number;
  private highEndBin: number;

  constructor(source: AudioNode) {
    const ctx = getAudioContext();
    
    // Create analyser node
    this.analyser = ctx.createAnalyser();
    this.analyser.fftSize = this.fftSize;
    this.analyser.smoothingTimeConstant = 0.8;
    
    // Connect source to analyser
    source.connect(this.analyser);
    
    // Initialize buffer
    this.bufferLength = this.analyser.frequencyBinCount;
    this.dataArray = new Uint8Array(this.bufferLength);
    
    // Initialize smoothers
    this.bassSmoother = new MovingAverage(10);
    this.midSmoother = new MovingAverage(10);
    this.highSmoother = new MovingAverage(10);
    
    // Calculate bin indices for frequency bands
    const sampleRate = ctx.sampleRate;
    this.bassStartBin = frequencyToBinIndex(FREQUENCY_BANDS.BASS.min, sampleRate, this.fftSize);
    this.bassEndBin = frequencyToBinIndex(FREQUENCY_BANDS.BASS.max, sampleRate, this.fftSize);
    this.midStartBin = frequencyToBinIndex(FREQUENCY_BANDS.MID.min, sampleRate, this.fftSize);
    this.midEndBin = frequencyToBinIndex(FREQUENCY_BANDS.MID.max, sampleRate, this.fftSize);
    this.highStartBin = frequencyToBinIndex(FREQUENCY_BANDS.HIGH.min, sampleRate, this.fftSize);
    this.highEndBin = frequencyToBinIndex(FREQUENCY_BANDS.HIGH.max, sampleRate, this.fftSize);
  }

  /**
   * Get current FFT data for all frequency bands
   */
  getFFTData(): FFTData {
    // Get frequency data
    this.analyser.getByteFrequencyData(this.dataArray);
    
    // Calculate average for each band
    let bassSum = 0;
    let bassCount = 0;
    for (let i = this.bassStartBin; i < this.bassEndBin; i++) {
      bassSum += this.dataArray[i];
      bassCount++;
    }
    const bassRaw = bassCount > 0 ? bassSum / bassCount / 255 : 0;
    
    let midSum = 0;
    let midCount = 0;
    for (let i = this.midStartBin; i < this.midEndBin; i++) {
      midSum += this.dataArray[i];
      midCount++;
    }
    const midRaw = midCount > 0 ? midSum / midCount / 255 : 0;
    
    let highSum = 0;
    let highCount = 0;
    for (let i = this.highStartBin; i < this.highEndBin; i++) {
      highSum += this.dataArray[i];
      highCount++;
    }
    const highRaw = highCount > 0 ? highSum / highCount / 255 : 0;
    
    // Apply smoothing
    const bass = this.bassSmoother.add(bassRaw);
    const mid = this.midSmoother.add(midRaw);
    const high = this.highSmoother.add(highRaw);
    
    return {
      bass: Math.max(0, Math.min(1, bass)),
      mid: Math.max(0, Math.min(1, mid)),
      high: Math.max(0, Math.min(1, high)),
    };
  }

  /**
   * Get analyser node (for connection)
   */
  getAnalyser(): AnalyserNode {
    return this.analyser;
  }
}

