/**
 * Motion Orchestrator
 * 
 * Phase 2 — Section 7: Page Transition & Scene Orchestration Engine
 * Phase 2 — Section 10: SCROLL INTERACTION ENGINE v1.0
 * Motion Orchestration Engine (E14)
 * 
 * Central brain coordinating all motion across cosmic engines
 */

import { frameLoop, FrameData } from './frame-loop';
import { MotionSync, MotionState } from './motion-sync';
import { FFTData } from '../audio/fft-processor';

export type EngineUpdateFunction = (motionState: MotionState) => void;

export interface RegisteredEngine {
  name: string;
  updateFn: EngineUpdateFunction;
}

export class MotionOrchestrator {
  private motionSync: MotionSync;
  private engines: Map<string, EngineUpdateFunction> = new Map();
  private isRunning: boolean = false;
  private unsubscribeFrame?: () => void;
  
  private currentScroll: number = 0;
  private currentAudio: FFTData = { bass: 0, mid: 0, high: 0 };
  private interactionState: {
    isGuruHovered?: boolean;
    isChakraHovered?: boolean;
    isProjectionHovered?: boolean;
    hasBlessingIntent?: boolean;
  } = {};

  constructor() {
    this.motionSync = new MotionSync();
  }

  /**
   * Start orchestrator
   */
  start(): void {
    if (this.isRunning) return;
    
    this.isRunning = true;
    
    // Start frame loop
    frameLoop.start();
    
    // Subscribe to frame updates
    this.unsubscribeFrame = frameLoop.onFrame((frameData: FrameData) => {
      this.update(frameData);
    });
  }

  /**
   * Stop orchestrator
   */
  stop(): void {
    if (!this.isRunning) return;
    
    this.isRunning = false;
    
    // Unsubscribe from frame loop
    if (this.unsubscribeFrame) {
      this.unsubscribeFrame();
      this.unsubscribeFrame = undefined;
    }
    
    // Stop frame loop
    frameLoop.stop();
  }

  /**
   * Update orchestrator (called each frame)
   */
  private update(frameData: FrameData): void {
    // Update motion sync
    const motionState = this.motionSync.update(
      frameData.time,
      frameData.delta,
      frameData.scroll,
      frameData.audio
    );
    
    // Update all registered engines
    this.engines.forEach((updateFn, name) => {
      try {
        updateFn(motionState);
      } catch (error) {
        console.error(`Motion orchestrator error in engine "${name}":`, error);
      }
    });
  }

  /**
   * Register engine
   */
  registerEngine(name: string, updateFn: EngineUpdateFunction): void {
    this.engines.set(name, updateFn);
  }

  /**
   * Unregister engine
   */
  unregisterEngine(name: string): void {
    this.engines.delete(name);
  }

  /**
   * Set scroll value
   */
  setScroll(scroll: number): void {
    this.currentScroll = scroll;
    frameLoop.setScroll(scroll);
  }

  /**
   * Set audio data
   */
  setAudio(audio: FFTData): void {
    this.currentAudio = audio;
    frameLoop.setAudio(audio);
  }

  /**
   * Get current motion state
   */
  getMotionState(): MotionState {
    return this.motionSync.getState();
  }

  /**
   * Set interaction state
   */
  setInteractionState(state: {
    isGuruHovered?: boolean;
    isChakraHovered?: boolean;
    isProjectionHovered?: boolean;
    hasBlessingIntent?: boolean;
  }): void {
    this.interactionState = { ...this.interactionState, ...state };
  }

  /**
   * Get interaction state
   */
  getInteractionState() {
    return { ...this.interactionState };
  }

  /**
   * Get registered engines
   */
  getRegisteredEngines(): string[] {
    return Array.from(this.engines.keys());
  }
}

// Singleton instance
export const motionOrchestrator = new MotionOrchestrator();

