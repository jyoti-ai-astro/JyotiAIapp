/**
 * Audio Engine
 * 
 * Phase 2 — Section 8: AUDIO ATMOSPHERE ENGINE v1.0
 * Spatial Audio Engine (E13)
 * 
 * Main audio engine with 3 layers and audio graph
 */

import { getAudioContext, resumeAudioContext } from './audio-context';
import { FFTProcessor, FFTData } from './fft-processor';
import { SpatialAudio } from './spatial-audio';
import { AudioEvent, AudioEventType } from './audio-events';
import { createReverb } from './filters/reverb';
import { audioLoader } from './audio-loader';

export interface AudioLayer {
  name: string;
  gain: GainNode;
  filter: BiquadFilterNode;
  panner: PannerNode;
  reverb: ReturnType<typeof createReverb>;
  spatialAudio: SpatialAudio;
  source: AudioBufferSourceNode | null;
  buffer: AudioBuffer | null;
}

export class AudioEngine {
  private ctx: AudioContext;
  private masterGain: GainNode;
  private fftProcessor: FFTProcessor | null = null;
  
  // Audio layers
  private ambientLayer: AudioLayer;
  private guruLayer: AudioLayer;
  private eventLayer: AudioLayer;
  
  // Audio events
  private events: Map<AudioEventType, AudioEvent> = new Map();
  
  // FFT data
  private fftData: FFTData = { bass: 0, mid: 0, high: 0 };
  private fftUpdateInterval: number | null = null;

  constructor() {
    this.ctx = getAudioContext();
    
    // Create master gain
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.value = 1.0;
    this.masterGain.connect(this.ctx.destination);
    
    // Create FFT processor (connected to master gain)
    this.fftProcessor = new FFTProcessor(this.masterGain);
    
    // Create audio layers
    this.ambientLayer = this.createLayer('ambient');
    this.guruLayer = this.createLayer('guru');
    this.eventLayer = this.createLayer('event');
    
    // Create audio events
    this.events.set('chakra-pulse', new AudioEvent('chakra-pulse'));
    this.events.set('shockwave-trigger', new AudioEvent('shockwave-trigger'));
    this.events.set('orb-spark', new AudioEvent('orb-spark'));
    this.events.set('ribbon-surge', new AudioEvent('ribbon-surge'));
    
    // Start FFT updates
    this.startFFTUpdates();
  }

  /**
   * Create an audio layer
   */
  private createLayer(name: string): AudioLayer {
    const gain = this.ctx.createGain();
    gain.gain.value = 1.0;
    
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 20000;
    
    const panner = this.ctx.createPanner();
    panner.panningModel = 'HRTF';
    
    const reverb = createReverb({ roomSize: 0.5, wet: 0.2 });
    
    const spatialAudio = new SpatialAudio();
    
    // Connect: spatialAudio → filter → panner → reverb → gain → master
    spatialAudio.getOutput().connect(filter);
    filter.connect(panner);
    panner.connect(reverb.convolver);
    reverb.convolver.connect(reverb.wetGain);
    reverb.wetGain.connect(gain);
    spatialAudio.getOutput().connect(reverb.dryGain);
    reverb.dryGain.connect(gain);
    gain.connect(this.masterGain);
    
    return {
      name,
      gain,
      filter,
      panner,
      reverb,
      spatialAudio,
      source: null,
      buffer: null,
    };
  }

  /**
   * Load sound for a layer
   */
  async loadSound(layer: 'ambient' | 'guru' | 'event', url: string): Promise<void> {
    const buffer = await audioLoader.loadSound(url);
    const layerObj = this.getLayer(layer);
    layerObj.buffer = buffer;
  }

  /**
   * Play layer
   */
  playLayer(layer: 'ambient' | 'guru' | 'event', loop: boolean = false): void {
    const layerObj = this.getLayer(layer);
    if (!layerObj.buffer) return;
    
    // Stop existing source
    if (layerObj.source) {
      layerObj.source.stop();
    }
    
    // Create new source
    const source = this.ctx.createBufferSource();
    source.buffer = layerObj.buffer;
    source.loop = loop;
    
    // Connect to spatial audio input
    source.connect(layerObj.spatialAudio.getInput());
    
    source.start(0);
    layerObj.source = source;
  }

  /**
   * Stop layer
   */
  stopLayer(layer: 'ambient' | 'guru' | 'event'): void {
    const layerObj = this.getLayer(layer);
    if (layerObj.source) {
      layerObj.source.stop();
      layerObj.source = null;
    }
  }

  /**
   * Set layer position
   */
  setPosition(layer: 'ambient' | 'guru' | 'event', x: number, y: number, z: number): void {
    const layerObj = this.getLayer(layer);
    layerObj.spatialAudio.setPosition(x, y, z);
  }

  /**
   * Set mouse position (affects all layers)
   */
  setMouse(x: number, y: number): void {
    this.ambientLayer.spatialAudio.setMouse(x, y);
    this.guruLayer.spatialAudio.setMouse(x, y);
    this.eventLayer.spatialAudio.setMouse(x, y);
  }

  /**
   * Set scroll position (affects all layers)
   */
  setScroll(scroll: number): void {
    this.ambientLayer.spatialAudio.setScroll(scroll);
    this.guruLayer.spatialAudio.setScroll(scroll);
    this.eventLayer.spatialAudio.setScroll(scroll);
  }

  /**
   * Trigger audio event
   */
  triggerEvent(type: AudioEventType): void {
    const event = this.events.get(type);
    if (event) {
      event.trigger(this.fftData);
    }
  }

  /**
   * Get FFT data
   */
  getFFTData(): FFTData {
    return { ...this.fftData };
  }

  /**
   * Start FFT updates
   */
  private startFFTUpdates(): void {
    const update = () => {
      if (this.fftProcessor) {
        this.fftData = this.fftProcessor.getFFTData();
      }
      this.fftUpdateInterval = requestAnimationFrame(update);
    };
    update();
  }

  /**
   * Stop FFT updates
   */
  private stopFFTUpdates(): void {
    if (this.fftUpdateInterval !== null) {
      cancelAnimationFrame(this.fftUpdateInterval);
      this.fftUpdateInterval = null;
    }
  }

  /**
   * Get layer
   */
  private getLayer(layer: 'ambient' | 'guru' | 'event'): AudioLayer {
    switch (layer) {
      case 'ambient':
        return this.ambientLayer;
      case 'guru':
        return this.guruLayer;
      case 'event':
        return this.eventLayer;
    }
  }

  /**
   * Resume audio context
   */
  async resume(): Promise<void> {
    await resumeAudioContext();
  }

  /**
   * Set master volume
   */
  setMasterVolume(volume: number): void {
    this.masterGain.gain.value = volume;
  }

  /**
   * Destroy engine
   */
  destroy(): void {
    this.stopFFTUpdates();
    this.stopLayer('ambient');
    this.stopLayer('guru');
    this.stopLayer('event');
    this.events.forEach(event => event.stop());
  }
}

