/**
 * Interaction Hook
 * 
 * Phase 2 — Section 16: COSMIC INTERACTION SYSTEM
 * Cosmic Interaction System (E20)
 * 
 * React hook for interaction system
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { InteractionEngine } from '../interaction-engine';
import { InteractionState, InteractionEvent } from '../events/interaction-events';
import { RawInput } from '../interaction-mapper';
import { motionOrchestrator } from '../../motion/orchestrator';

export interface UseInteractionOptions {
  scroll?: number;
  onGuruHover?: (event: InteractionEvent) => void;
  onGuruClick?: (event: InteractionEvent) => void;
  onBlessingWaveTrigger?: (event: InteractionEvent) => void;
  onChakraHover?: (event: InteractionEvent) => void;
  onChakraClick?: (event: InteractionEvent) => void;
  onPulseIndicatorClick?: (event: InteractionEvent) => void;
  onProjectionHover?: (event: InteractionEvent) => void;
  onProjectionClick?: (event: InteractionEvent) => void;
}

export function useInteraction(options: UseInteractionOptions = {}) {
  const { camera, size, scene } = useThree();
  const engineRef = useRef<InteractionEngine | null>(null);
  const [interactionState, setInteractionState] = useState<InteractionState>({
    isGuruHovered: false,
    isChakraHovered: false,
    isProjectionHovered: false,
    hasBlessingIntent: false,
    currentScrollZone: 0,
    cursorState: 'normal',
    lastInteractionTime: 0,
    interactionVelocity: { x: 0, y: 0 },
  });
  
  // Initialize engine
  useEffect(() => {
    if (!engineRef.current) {
      engineRef.current = new InteractionEngine();
      
      // Set screen size
      const mapper = engineRef.current.getMapper();
      mapper.setScreenSize(size.width, size.height);
    }
    
    return () => {
      // Cleanup if needed
    };
  }, [size]);
  
  // Set camera and scene for raycasting
  useEffect(() => {
    if (engineRef.current && camera && scene) {
      const mapper = engineRef.current.getMapper();
      // Convert R3F scene to THREE.Scene if needed
      const threeScene = scene as unknown as THREE.Scene;
      mapper.setCameraAndScene(camera, threeScene);
    }
  }, [camera, scene, engineRef.current]);
  
  // Register callbacks
  useEffect(() => {
    if (!engineRef.current) return;
    
    const engine = engineRef.current;
    const unsubscribers: Array<() => void> = [];
    
    if (options.onGuruHover) {
      unsubscribers.push(engine.on('guru-hover', options.onGuruHover));
    }
    if (options.onGuruClick) {
      unsubscribers.push(engine.on('guru-click', options.onGuruClick));
    }
    if (options.onBlessingWaveTrigger) {
      unsubscribers.push(engine.on('blessing-wave-trigger', options.onBlessingWaveTrigger));
    }
    if (options.onChakraHover) {
      unsubscribers.push(engine.on('chakra-hover', options.onChakraHover));
    }
    if (options.onChakraClick) {
      unsubscribers.push(engine.on('chakra-click', options.onChakraClick));
    }
    if (options.onPulseIndicatorClick) {
      unsubscribers.push(engine.on('pulse-indicator-click', options.onPulseIndicatorClick));
    }
    if (options.onProjectionHover) {
      unsubscribers.push(engine.on('projection-hover', options.onProjectionHover));
    }
    if (options.onProjectionClick) {
      unsubscribers.push(engine.on('projection-click', options.onProjectionClick));
    }
    
    return () => {
      unsubscribers.forEach(unsub => unsub());
    };
  }, [options, engineRef.current]);
  
  // Register event listeners
  useEffect(() => {
    if (!engineRef.current || typeof window === 'undefined') return;
    
    const engine = engineRef.current;
    const mapper = engine.getMapper();
    
    // Update screen size
    mapper.setScreenSize(size.width, size.height);
    
    // Mouse move
    const handleMouseMove = (e: MouseEvent) => {
      const input: RawInput = {
        type: 'mouse',
        x: e.clientX,
        y: e.clientY,
        timestamp: Date.now(),
      };
      const intent = mapper.mapInput(input);
      if (intent) {
        engine.processIntent(intent);
        setInteractionState(engine.getState());
      }
    };
    
    // Mouse down (click)
    const handleMouseDown = (e: MouseEvent) => {
      const input: RawInput = {
        type: 'mouse',
        x: e.clientX,
        y: e.clientY,
        button: e.button,
        timestamp: Date.now(),
      };
      const intent = mapper.mapInput(input);
      if (intent) {
        engine.processIntent(intent);
        setInteractionState(engine.getState());
      }
    };
    
    // Wheel (scroll)
    const handleWheel = (e: WheelEvent) => {
      if (options.scroll !== undefined) {
        const input: RawInput = {
          type: 'wheel',
          x: e.clientX,
          y: e.clientY,
          deltaX: e.deltaX,
          deltaY: e.deltaY,
          deltaZ: e.deltaZ,
          scrollProgress: options.scroll,
          timestamp: Date.now(),
        };
        const intent = mapper.mapInput(input);
        if (intent) {
          engine.processIntent(intent);
          setInteractionState(engine.getState());
        }
      }
    };
    
    // Touch start
    const handleTouchStart = (e: TouchEvent) => {
      const input: RawInput = {
        type: 'touch',
        touches: e.touches,
        timestamp: Date.now(),
      };
      const intent = mapper.mapInput(input);
      if (intent) {
        engine.processIntent(intent);
        setInteractionState(engine.getState());
      }
    };
    
    // Touch move
    const handleTouchMove = (e: TouchEvent) => {
      const input: RawInput = {
        type: 'touch',
        touches: e.touches,
        timestamp: Date.now(),
      };
      const intent = mapper.mapInput(input);
      if (intent) {
        engine.processIntent(intent);
        setInteractionState(engine.getState());
      }
    };
    
    // Touch end
    const handleTouchEnd = (e: TouchEvent) => {
      const input: RawInput = {
        type: 'touch',
        touches: e.changedTouches,
        timestamp: Date.now(),
      };
      const intent = mapper.mapInput(input);
      if (intent) {
        engine.processIntent(intent);
        setInteractionState(engine.getState());
      }
    };
    
    // Register listeners
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('wheel', handleWheel, { passive: true });
    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('touchend', handleTouchEnd, { passive: true });
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [engineRef.current, size, options.scroll]);
  
  // Register with motion orchestrator
  useEffect(() => {
    if (!engineRef.current) return;
    
    motionOrchestrator.registerEngine('interaction-engine', () => {
      // Update engine each frame
      if (engineRef.current) {
        engineRef.current.update(0.016); // ~60fps
        setInteractionState(engineRef.current.getState());
      }
    });
    
    return () => {
      motionOrchestrator.unregisterEngine('interaction-engine');
    };
  }, [engineRef.current]);
  
  // Trigger blessing wave manually
  const triggerBlessingWave = useCallback(() => {
    if (engineRef.current) {
      engineRef.current.triggerBlessingWave();
      setInteractionState(engineRef.current.getState());
    }
  }, []);
  
  // Set cursor state
  const setCursorState = useCallback((state: InteractionState['cursorState']) => {
    if (engineRef.current) {
      const currentState = engineRef.current.getState();
      currentState.cursorState = state;
      setInteractionState(currentState);
    }
  }, []);
  
    return {
      interactionState,
      triggerBlessingWave,
      setCursorState,
      engine: engineRef.current,
    };
}

