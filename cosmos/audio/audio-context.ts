/**
 * Audio Context Singleton
 * 
 * Phase 2 — Section 8: AUDIO ATMOSPHERE ENGINE v1.0
 * Spatial Audio Engine (E13)
 * 
 * Web Audio API context singleton
 */

let audioContextInstance: AudioContext | null = null;

/**
 * Get or create the Web Audio API context singleton
 */
export function getAudioContext(): AudioContext {
  if (!audioContextInstance) {
    // Create new AudioContext
    audioContextInstance = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    // Resume context if suspended (browser autoplay policy)
    if (audioContextInstance.state === 'suspended') {
      audioContextInstance.resume();
    }
  }
  
  return audioContextInstance;
}

/**
 * Resume audio context (required after user interaction)
 */
export async function resumeAudioContext(): Promise<void> {
  const ctx = getAudioContext();
  if (ctx.state === 'suspended') {
    await ctx.resume();
  }
}

/**
 * Get audio context state
 */
export function getAudioContextState(): AudioContextState {
  return getAudioContext().state;
}

/**
 * Destroy audio context (cleanup)
 */
export function destroyAudioContext(): void {
  if (audioContextInstance) {
    audioContextInstance.close();
    audioContextInstance = null;
  }
}

