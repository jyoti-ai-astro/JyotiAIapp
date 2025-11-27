/**
 * Audio Loader
 * 
 * Phase 2 — Section 8: AUDIO ATMOSPHERE ENGINE v1.0
 * Spatial Audio Engine (E13)
 * 
 * Audio file loading and buffer management
 */

import { getAudioContext } from './audio-context';

export interface AudioBufferCache {
  [url: string]: AudioBuffer;
}

class AudioLoader {
  private cache: AudioBufferCache = {};

  /**
   * Load audio file and return AudioBuffer
   */
  async loadSound(url: string): Promise<AudioBuffer> {
    // Check cache
    if (this.cache[url]) {
      return this.cache[url];
    }

    // Fetch audio file
    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();
    
    // Decode audio data
    const ctx = getAudioContext();
    const audioBuffer = await ctx.decodeAudioData(arrayBuffer);
    
    // Cache buffer
    this.cache[url] = audioBuffer;
    
    return audioBuffer;
  }

  /**
   * Preload multiple audio files
   */
  async loadSounds(urls: string[]): Promise<AudioBuffer[]> {
    return Promise.all(urls.map(url => this.loadSound(url)));
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.cache = {};
  }

  /**
   * Get cached buffer
   */
  getCachedBuffer(url: string): AudioBuffer | null {
    return this.cache[url] || null;
  }
}

export const audioLoader = new AudioLoader();

