/**
 * Cosmic Camera Controller Component
 * 
 * Phase 2 — Section 10: SCROLL INTERACTION ENGINE v1.0
 * Phase 2 — Section 12: PERFORMANCE, FALLBACKS & MOBILE STRATEGY v1.0
 * Cosmic Camera System (E18)
 * 
 * Wraps R3F PerspectiveCamera with cosmic camera engine
 */

'use client';

import React, { useRef, useMemo, useEffect, forwardRef, useImperativeHandle } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';
import { motionOrchestrator } from '../motion/orchestrator';
import { CameraEngine, CameraMode, CameraConfig, CameraState } from './camera-engine';
import { useCameraMotion } from './hooks/use-camera-motion';

export interface CameraControllerRef {
  setCameraMode: (mode: CameraMode) => void;
  setCameraTarget: (target: THREE.Vector3 | [number, number, number]) => void;
  setCameraOffset: (offset: THREE.Vector3 | [number, number, number]) => void;
  shake: (intensity?: number) => void;
  reset: () => void;
  getState: () => CameraState;
}

export interface CameraControllerProps {
  /** Camera mode */
  mode?: CameraMode;
  
  /** Intensity multiplier */
  intensity?: number;
  
  /** Scroll position (0-1) */
  scroll?: number;
  
  /** Mouse position for parallax */
  mouse?: { x: number; y: number };
  
  /** Audio reactive values */
  audioReactive?: {
    bass?: number;
    mid?: number;
    high?: number;
  };
  
  /** Blessing wave progress (0-1) */
  blessingWaveProgress?: number;
  
  /** Is guru hovered */
  isGuruHovered?: boolean;
  
  /** Is blessing wave active */
  isBlessingWaveActive?: boolean;
  
  /** FOV */
  fov?: number;
  
  /** Near plane */
  near?: number;
  
  /** Far plane */
  far?: number;
}

export const CameraController = forwardRef<CameraControllerRef, CameraControllerProps>(
  (
    {
      mode = 'orbit',
      intensity = 1.0,
      scroll = 0,
      mouse = { x: 0, y: 0 },
      audioReactive,
      blessingWaveProgress = 0,
      isGuruHovered = false,
      isBlessingWaveActive = false,
      fov = 50,
      near = 0.1,
      far = 1000,
    },
    ref
  ) => {
    const cameraRef = useRef<THREE.PerspectiveCamera>(null);
    const { set } = useThree();
    
    // Create camera engine
    const cameraEngine = useMemo(() => {
      return new CameraEngine({
        mode,
        intensity,
        scroll,
        mouse,
        audioReactive,
        blessingWaveProgress,
        isGuruHovered,
        isBlessingWaveActive,
      });
    }, [mode, intensity]);
    
    // Update engine config when props change
    useEffect(() => {
      cameraEngine.updateConfig({
        mode,
        intensity,
        scroll,
        mouse,
        audioReactive,
        blessingWaveProgress,
        isGuruHovered,
        isBlessingWaveActive,
      });
    }, [cameraEngine, mode, intensity, scroll, mouse, audioReactive, blessingWaveProgress, isGuruHovered, isBlessingWaveActive]);
    
    // Get camera state from motion hook
    const cameraState = useCameraMotion(cameraEngine, {
      mode,
      intensity,
      scroll,
      mouse,
      audioReactive,
      blessingWaveProgress,
      isGuruHovered,
      isBlessingWaveActive,
    });
    
    // Apply camera state to R3F camera
    useFrame(() => {
      if (!cameraRef.current) return;
      
      // Update position
      cameraRef.current.position.copy(cameraState.position);
      
      // Update rotation
      cameraRef.current.rotation.copy(cameraState.rotation);
      
      // Update FOV
      const previousFOV = cameraRef.current.fov;
      cameraRef.current.fov = cameraState.fov;
      cameraRef.current.updateProjectionMatrix();
      
      // Notify parent of FOV changes (for Alignment Grid E26)
      if (onFOVChange && previousFOV !== cameraState.fov) {
        onFOVChange(cameraState.fov);
      }
      
      // Look at target
      cameraRef.current.lookAt(cameraState.target);
      
      // Set camera in R3F
      set({ camera: cameraRef.current });
    });
    
    // Register with motion orchestrator
    useEffect(() => {
      motionOrchestrator.registerEngine('camera-controller', (motionState) => {
        // Camera state is already synced via useCameraMotion
      });
      
      return () => {
        motionOrchestrator.unregisterEngine('camera-controller');
      };
    }, []);
    
    // Expose public API via ref
    useImperativeHandle(ref, () => ({
      setCameraMode: (newMode: CameraMode) => {
        cameraEngine.setMode(newMode);
      },
      setCameraTarget: (target: THREE.Vector3 | [number, number, number]) => {
        const targetVec = target instanceof THREE.Vector3 
          ? target 
          : new THREE.Vector3(...target);
        cameraEngine.setTarget(targetVec);
      },
      setCameraOffset: (offset: THREE.Vector3 | [number, number, number]) => {
        const offsetVec = offset instanceof THREE.Vector3 
          ? offset 
          : new THREE.Vector3(...offset);
        cameraEngine.setOffset(offsetVec);
      },
      shake: (shakeIntensity?: number) => {
        cameraEngine.shake(shakeIntensity);
      },
      reset: () => {
        cameraEngine.reset();
      },
      getState: (): CameraState => {
        return cameraEngine.getState();
      },
    }), [cameraEngine]);
    
    return (
      <PerspectiveCamera
        ref={cameraRef}
        makeDefault
        fov={fov}
        near={near}
        far={far}
        position={[0, 0, -4]}
      />
    );
  }
);

CameraController.displayName = 'CameraController';

