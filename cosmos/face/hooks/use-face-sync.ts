/**
 * Face Sync Hook
 * 
 * Phase 2 — Section 17: DYNAMIC AVATAR FACE ENGINE
 * Dynamic Avatar Face Engine (E21)
 * 
 * Syncs face with motion orchestrator and interaction state
 */

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { motionOrchestrator, MotionState } from '../../motion/orchestrator';
import { FaceExpressions, ExpressionParams } from '../face-expressions';

export interface FaceSyncState {
  expression: ExpressionParams;
  breathPhase: number; // 0-1
  blinkPhase: number; // 0-1 (0 = open, 1 = closed)
  audioBass: number;
  audioMid: number;
  audioHigh: number;
  scrollProgress: number;
  scrollVelocity: number;
  scrollDirection: number;
  blessingWaveProgress: number;
  isGuruHovered: boolean;
}

export function useFaceSync(
  expressions: FaceExpressions,
  blessingWaveProgress: number,
  isGuruHovered: boolean
): FaceSyncState {
  const stateRef = useRef<FaceSyncState>({
    expression: {
      brow: 0,
      eye: 0.7,
      cheek: 0,
      mouthCurve: 0,
      glow: 0.2,
    },
    breathPhase: 0,
    blinkPhase: 0,
    audioBass: 0,
    audioMid: 0,
    audioHigh: 0,
    scrollProgress: 0,
    scrollVelocity: 0,
    scrollDirection: 0,
    blessingWaveProgress: 0,
    isGuruHovered: false,
  });

  const breathTimeRef = useRef(0);
  const blinkTimeRef = useRef(0);
  const lastBlinkTimeRef = useRef(0);

  useFrame((state) => {
    const deltaTime = state.clock.getDelta();
    const time = state.clock.elapsedTime;

    // Get motion state from orchestrator
    const motionState = motionOrchestrator.getMotionState();

    // Base Neutral Layer: Soft breathing micro-movements
    breathTimeRef.current += deltaTime;
    const breathCycle = 3.5; // 3.5s inhale + 3.5s exhale
    stateRef.current.breathPhase = (breathTimeRef.current % breathCycle) / breathCycle;

    // Base Neutral Layer: Eye blink cycle (4-6 sec)
    blinkTimeRef.current += deltaTime;
    const timeSinceLastBlink = blinkTimeRef.current - lastBlinkTimeRef.current;
    const blinkInterval = 4.0 + Math.random() * 2.0; // 4-6 seconds

    if (timeSinceLastBlink >= blinkInterval) {
      // Trigger blink
      lastBlinkTimeRef.current = blinkTimeRef.current;
      stateRef.current.blinkPhase = 1.0; // Start closed
    } else {
      // Blink animation (0.2s duration)
      const blinkDuration = 0.2;
      if (stateRef.current.blinkPhase > 0) {
        stateRef.current.blinkPhase -= deltaTime / blinkDuration;
        if (stateRef.current.blinkPhase < 0) {
          stateRef.current.blinkPhase = 0;
        }
      }
    }

    // Get current expression
    const expression = expressions.getCurrentExpression(deltaTime);

    // Audio-Reactive Micro Expressions
    stateRef.current.audioBass = motionState.bassMotion;
    stateRef.current.audioMid = motionState.midMotion;
    stateRef.current.audioHigh = motionState.highMotion;

    // Scroll-Reactive Face Motion
    stateRef.current.scrollProgress = motionState.scrollProgress;
    stateRef.current.scrollVelocity = motionState.scrollVelocity;
    stateRef.current.scrollDirection = motionState.scrollDirection;

    // Blessing wave progress
    stateRef.current.blessingWaveProgress = blessingWaveProgress;

    // Guru hover state
    stateRef.current.isGuruHovered = isGuruHovered;

    // Update expression
    stateRef.current.expression = expression;
  });

  return stateRef.current;
}

