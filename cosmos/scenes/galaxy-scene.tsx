/**
 * Galaxy Scene Component
 * 
 * Phase 2 — Section 2: Galaxy Scene Blueprint (FULL SPEC)
 * Phase 2 — Section 3: NEBULA SHADER SYSTEM (FULL SPEC)
 * 
 * Complete galaxy scene with:
 * - 4-armed spiral galaxy structure
 * - Star particle system (45k-60k stars)
 * - Galaxy core glow
 * - 5-layer nebula shader (upgraded)
 * - Parallax and auto-orbit
 * - Cursor interactions
 * - Audio-reactive behaviors
 * - Performance optimizations
 */

'use client';

import React, { useRef, useMemo, useEffect, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Stars } from '@react-three/drei';
import * as THREE from 'three';
import { StarParticles } from '../particles/star-particles';
import { ParticleUniverse } from '../particles/particle-universe';
import { KundaliniWave } from '../kundalini/kundalini-wave';
import { EnergyRibbons } from '../ribbons/energy-ribbons';
import { ChakraRings } from '../chakra-rings/chakra-rings';
import { AuraHalo } from '../aura-halo/aura-halo';
import { CosmicPulseField } from '../cosmic-pulse/cosmic-pulse-field';
import { DivineAlignmentGrid } from '../divine-grid/divine-grid';
import { AlignmentGrid } from '../alignment-grid/grid';
import { MemoryStream } from '../memory-stream/memory-stream';
import { TimelineStream } from '../timeline-stream/timeline-stream';
import { SoulMirror } from '../soul-mirror/soul-mirror';
import { DivineCompass } from '../divine-compass/divine-compass';
import { AstralTrail } from '../astral-trail/astral-trail';
import { AstralVeil } from '../astral-veil/astral-veil';
import { DivineOrb } from '../divine-orb/divine-orb';
import { LightShafts } from '../light-shafts/light-shafts';
import { GuruEnergy } from '../guru/guru-energy';
import { BlessingWave } from '../blessing-wave/blessing-wave';
import { Projection } from '../projection/projection';
import { PranaField } from '../prana-field/prana-field';
import { AuraShield } from '../aura-shield/aura-shield';
import { PathIndicator } from '../path-indicator/path-indicator';
import { FateRipple } from '../fate-ripple/fate-ripple';
import { SoulStar } from '../soul-star/soul-star';
import { CelestialGate } from '../celestial-gate/celestial-gate';
import { AstralLotus } from '../astral-lotus/astral-lotus';
import { AstralMandala } from '../astral-mandala/astral-mandala';
import { ChakraPulse } from '../chakra-pulse/chakra-pulse';
import { KarmaWheel } from '../karma-wheel/karma-wheel';
import { CosmicOrbit } from '../cosmic-orbit/cosmic-orbit';
import { CelestialRibbon } from '../celestial-ribbon/celestial-ribbon';
import { AstralBloom } from '../astral-bloom/astral-bloom';
import { StarFall } from '../star-fall/star-fall';
import { DimensionalRipple } from '../dimensional-ripple/dimensional-ripple';
import { AuroraVeil } from '../aurora-veil/aurora-veil';
import { CosmicDriftField } from '../cosmic-drift-field/drift-field';
import { StellarWind } from '../stellar-wind/stellar-wind';
import { SolarArc } from '../solar-arc/solar-arc';
import { QuantumHalo } from '../quantum-halo/quantum-halo';
import { CosmicLens } from '../cosmic-lens/cosmic-lens';
import { CosmicFracture } from '../cosmic-fracture/cosmic-fracture';
import { CelestialWaveV2 } from '../celestial-wave-v2/celestial-wave';
import { CelestialHorizonV2 } from '../celestial-horizon-v2/celestial-horizon';
import { PathIndicatorV2 } from '../path-indicator-v2/path-indicator';
import { AstralThreadV2 } from '../astral-thread-v2/astral-thread';
import { DharmaWheelV2 } from '../dharma-wheel-v2/dharma-wheel';
import { GatewayV3 } from '../gateway-v3/gateway';
import { GateOfTimeV2 } from '../gate-of-time-v2/gate-of-time';
import { SoulBridgeV3 } from '../soul-bridge-v3/soul-bridge';
import { AstralGateV3 } from '../astral-gate-v3/astral-gate';
import { DivineThroneV3 } from '../divine-throne-v3/divine-throne';
import { AscensionLatticeV2 } from '../ascension-lattice-v2/ascension-lattice';
import { CelestialGateV2 } from '../celestial-gate-v2/celestial-gate';
import { CelestialTempleV2 } from '../celestial-temple-v2/celestial-temple';
import { CelestialSanctumV3 } from '../celestial-sanctum-v3/celestial-sanctum';
import { CelestialCrownV2 } from '../celestial-crown-v2/celestial-crown';
import { CelestialCrestV2 } from '../celestial-crest-v2/celestial-crest';
import { CameraController, CameraControllerRef } from '../camera/camera-controller';
import { UIRaymarch } from '../ui-raymarch/ui-raymarch';
import { useInteraction } from '../interaction/hooks/use-interaction';
import { createNebulaMaterial } from '../shaders/nebula-shader';
import { motionOrchestrator, MotionState } from '../motion/orchestrator';
import { useScrollMotion, useMouseMotion } from '@/hooks/motion';
import { useMotionOrchestrator } from '@/components/providers/MotionProvider';
import { useBlessingWaveStore } from '@/lib/motion/blessing-wave-store';
import { shouldUpdateScene, handleSceneUpdateFailure, freezeScene, disableAnimations, resetSceneState } from '@/lib/security/galaxy-scene-failover';
import { detectGPU, getPerformanceSettings, PerformanceTier } from '@/lib/optimization/gpu-detection';
import { EffectComposer, ToneMapping } from '@react-three/postprocessing';
import { ToneMappingMode } from 'postprocessing';
import { CosmicBloomEffect } from '../../postfx/cosmic-bloom-v1/cosmic-bloom-effect';
import { CosmicMotionBlurEffect } from '../../postfx/cosmic-motionblur-v1/cosmic-motionblur-effect';
import { CosmicDepthEffect } from '../../postfx/cosmic-depth-v1/cosmic-depth-effect';
import { CosmicChromaticEffect } from '../../postfx/cosmic-chromatic-v1/cosmic-chromatic-effect';
import { CosmicGlareEffect } from '../../postfx/cosmic-glare-v1/cosmic-glare-effect';
import { CosmicVignetteEffect } from '../../postfx/cosmic-vignette-v1/cosmic-vignette-effect';
import { CosmicLensFlareEffect } from '../../postfx/cosmic-lensflare-v1/cosmic-lensflare-effect';
import { CosmicFilmGrainEffect } from '../../postfx/cosmic-filmgrain-v1/cosmic-filmgrain-effect';
import { CosmicGrainOverlayEffect } from '../../postfx/cosmic-grainoverlay-v1/cosmic-grainoverlay-effect';
import { CosmicStarlightEffect } from '../../postfx/cosmic-starlight-v1/cosmic-starlight-effect';
import { CosmicHalationEffect } from '../../postfx/cosmic-halation-v1/cosmic-halation-effect';
import { CosmicBloomBoostEffect } from '../../postfx/cosmic-bloomboost-v1/cosmic-bloomboost-effect';
import { CosmicColorGradeEffect } from '../../postfx/cosmic-colorgrade-v1/cosmic-colorgrade-effect';
import { CosmicGodRaysEffect } from '../../postfx/cosmic-godrays-v1/cosmic-godrays-effect';
import { FinalCompositeEffect } from '../../postfx/final-composite-v1/final-composite-effect';

export interface GalaxySceneProps {
  /** Intensity multiplier for nebula and stars (0-1) */
  intensity?: number;
  
  /** Mouse position for parallax (optional) */
  mouse?: { x: number; y: number };
  
  /** Scroll position for color shift (optional, 0-1) */
  scroll?: number;
  
  /** Audio reactive values (optional) */
  audioReactive?: {
    bass?: number;
    mid?: number;
    high?: number;
  };
}

// Galaxy Core Component
const GalaxyCore: React.FC<{ intensity: number }> = ({ intensity }) => {
  const coreRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (coreRef.current) {
      // Slow rotation
      coreRef.current.rotation.y += 0.001;
      
      // Breathing pulse
      const pulse = 1.0 + Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
      coreRef.current.scale.setScalar(pulse);
    }
  });
  
  return (
    <mesh ref={coreRef} position={[0, 0, 0]}>
      <sphereGeometry args={[1.2, 32, 32]} />
      <meshPhysicalMaterial
        color="#9D4EDD"
        emissive="#F4CE65"
        emissiveIntensity={0.5 * intensity}
        transparent
        opacity={0.6 * intensity}
        transmission={0.9}
        thickness={0.5}
        roughness={0.1}
        metalness={0.0}
      />
    </mesh>
  );
};

// Nebula Layer Component with upgraded uniforms
const NebulaLayer: React.FC<{
  intensity: number;
  mouse: THREE.Vector2;
  scroll: number;
  audioReactive?: { bass?: number; mid?: number; high?: number };
  scrollVelocity?: number;
  mouseVelocity?: number;
  transitionParallax?: number;
  nebulaDrift?: number;
  hueShift?: number;
  blessingWaveProgress?: number;
}> = ({ intensity, mouse, scroll, audioReactive, scrollVelocity = 0, mouseVelocity = 0, transitionParallax = 0, nebulaDrift = 0, hueShift = 0, blessingWaveProgress = 0 }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  
  // Create full-screen quad geometry
  const geometry = useMemo(() => {
    return new THREE.PlaneGeometry(20, 20, 1, 1);
  }, []);
  
  // Create nebula material
  const material = useMemo(() => {
    return createNebulaMaterial();
  }, []);
  
  // Animation loop
  useFrame((state) => {
    if (material && material.uniforms) {
      const time = state.clock.elapsedTime;
      
      // Base uniforms
      material.uniforms.uTime.value = time;
      material.uniforms.uMouse.value.set(mouse.x, mouse.y);
      // Blessing wave brightness boost (Phase 13 - F28)
      material.uniforms.uIntensity.value = intensity * (1.0 + blessingWaveProgress * 0.3);
      
      // New uniforms
      material.uniforms.uParallaxStrength.value = 1.0;
      material.uniforms.uDistortionStrength.value = 1.0;
      material.uniforms.uOpacityMult.value = 1.0;
      
      // Color shift from scroll (0-1 scroll → 0-1 color shift) + interaction hue shift + blessing wave hue pulse (Phase 13 - F28)
      material.uniforms.uColorShift.value = scroll + hueShift + blessingWaveProgress * 0.2;
      
      // Audio reactive uniforms with mapping
      if (audioReactive) {
        const bass = audioReactive.bass || 0;
        const mid = audioReactive.mid || 0;
        const high = audioReactive.high || 0;
        
        // Map audio frequencies to shader uniforms
        material.uniforms.uBass.value = bass;
        material.uniforms.uMid.value = mid;
        material.uniforms.uHigh.value = high;
        
        // Audio-reactive modulation:
        // - bass → ribbon thickness (handled in shader)
        // - mid → fog thickness (handled in shader)
        // - high → cloud rotation speed (handled in shader)
      } else {
        material.uniforms.uBass.value = 0;
        material.uniforms.uMid.value = 0;
        material.uniforms.uHigh.value = 0;
      }
      
      // Slow breathing pulse for opacity
      const breathe = 0.95 + 0.05 * Math.sin(time * 0.15);
      material.uniforms.uOpacityMult.value = breathe;
      
      // Bloom intensity variation based on scroll velocity
      if (material.uniforms.uBloomIntensity) {
        material.uniforms.uBloomIntensity.value = 1.0 + scrollVelocity * 0.01;
      }
      
      // FilmGrain jitter strength based on mouse velocity
      if (material.uniforms.uJitterStrength) {
        material.uniforms.uJitterStrength.value = 0.1 + mouseVelocity * 0.001;
      }
    }
    
    // Parallax movement of nebula layer with scroll velocity + transition parallax + nebula drift
    if (meshRef.current) {
      const parallaxX = mouse.x * 0.1 + scrollVelocity * 0.01 + transitionParallax + nebulaDrift * 0.1;
      const parallaxY = mouse.y * 0.1 + scrollVelocity * 0.005 + nebulaDrift * 0.05;
      meshRef.current.position.x = parallaxX;
      meshRef.current.position.y = parallaxY;
    }
  });
  
  return (
    <mesh ref={meshRef} geometry={geometry} material={material} position={[0, 0, -5]} />
  );
};

// Main Galaxy Scene Component
export const GalaxyScene: React.FC<GalaxySceneProps> = ({
  intensity = 1.0,
  mouse = { x: 0, y: 0 },
  scroll = 0,
  audioReactive,
}) => {
  const sceneRef = useRef<THREE.Group>(null);
  const motionStateRef = useRef<MotionState | null>(null);
  const blessingWaveTriggerRef = useRef<(() => void) | null>(null);
  const cameraControllerRef = useRef<CameraControllerRef>(null);
  const [isGuruHovered, setIsGuruHovered] = useState(false);
  const [breathPhase, setBreathPhase] = useState(0);
  const [breathStrength, setBreathStrength] = useState(0);
  const [pathRotation, setPathRotation] = useState(0);
  const [cameraFOV, setCameraFOV] = useState(75.0);
  const { camera, size, scene } = useThree();
  const isMobile = size.width < 800;
  
  // Phase 30 - F45: GPU detection and performance tier
  const [gpuInfo, setGpuInfo] = useState(() => {
    if (typeof window !== 'undefined') {
      return detectGPU();
    }
    return { tier: 'mid' as PerformanceTier, isMobile: false, hardwareConcurrency: 4 };
  });
  const perfSettings = getPerformanceSettings(gpuInfo.tier);
  
  // Phase 30 - F45: Freeze scene on tab hidden
  const [isTabVisible, setIsTabVisible] = useState(true);
  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsTabVisible(!document.hidden);
      if (document.hidden) {
        // Freeze scene when tab is hidden
        freezeScene();
      } else {
        // Resume when tab becomes visible
        resetSceneState();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);
  
  // Connect to global motion orchestrator
  const { orchestrator } = useMotionOrchestrator();
  const scrollMotion = useScrollMotion();
  const mouseMotion = useMouseMotion();
  
  // Connect to blessing wave store (Phase 13 - F28)
  const blessingWaveProgress = useBlessingWaveStore((state) => state.blessingProgress);
  const blessingWaveActive = useBlessingWaveStore((state) => state.blessingActive);
  
  // Calculate scroll velocity for effects
  const scrollVelocity = scrollMotion.scrollVelocity;
  const mouseVelocity = mouseMotion.velocity;
  const scrollDirection = scrollMotion.direction;
  const heroProgress = scrollMotion.sectionProgress['hero'] || 0;
  
  // Transition state for shader effects
  const [transitionState, setTransitionState] = useState<{
    bloomIntensity: number;
    filmGrainIntensity: number;
    nebulaParallax: number;
    starfieldDensity: number;
    motionBlurSmear: number;
  }>({
    bloomIntensity: 1.0,
    filmGrainIntensity: 0.15,
    nebulaParallax: 0.0,
    starfieldDensity: 1.0,
    motionBlurSmear: 0.5,
  });
  
  // Interaction state for UI → Scene events (Phase 12 - F27)
  const [interactionState, setInteractionState] = useState<{
    cardHovered: { id: string; intensity: number } | null;
    ctaHovered: boolean;
    ctaClicked: boolean;
    contentActive: string | null;
    footerActive: boolean;
    heroHovered: boolean;
    premiumBoost: boolean;
    mandalaScale: number;
    mandalaRotation: number;
    nebulaBrightness: number;
    nebulaHueShift: number;
    starfieldFocus: number;
  }>({
    cardHovered: null,
    ctaHovered: false,
    ctaClicked: false,
    contentActive: null,
    footerActive: false,
    heroHovered: false,
    premiumBoost: false,
    mandalaScale: 1.0,
    mandalaRotation: 0,
    nebulaBrightness: 1.0,
    nebulaHueShift: 0,
    starfieldFocus: 0,
  });
  
  // Initialize Interaction Engine (E20)
  const { triggerBlessingWave, setCursorState } = useInteraction({
    scroll: motionStateRef.current?.scrollProgress ?? scroll,
    onGuruHover: (event) => {
      setIsGuruHovered(event.type === 'guru-hover');
    },
    onGuruClick: (event) => {
      // Guru click handled by interaction engine
    },
    onBlessingWaveTrigger: (event) => {
      // Trigger blessing wave
      if (blessingWaveTriggerRef.current) {
        blessingWaveTriggerRef.current();
      }
    },
    onChakraHover: (event) => {
      // Chakra hover handled
    },
    onChakraClick: (event) => {
      // Chakra click handled
    },
    onPulseIndicatorClick: (event) => {
      // Pulse indicator click handled
    },
    onProjectionHover: (event) => {
      // Projection hover handled
    },
    onProjectionClick: (event) => {
      // Projection click handled
    },
  });
  
  // Note: interactionState is now local to GalaxyScene (Phase 12 - F27)
  // Camera and scene are set internally in the useInteraction hook
  
  // Use provided audioReactive or default to zero
  const audioData = audioReactive || { bass: 0, mid: 0, high: 0 };
  
  // Convert mouse to Vector2 for shaders
  const mouseVec = useMemo(() => new THREE.Vector2(mouse.x, mouse.y), [mouse.x, mouse.y]);
  
  // Phase 27 - F42: Reduced star count by 15-20% and added adaptive performance mode
  // Phase 30 - F45: Enhanced with GPU detection and performance tier
  const [fps, setFps] = useState(60);
  const adaptiveMode = fps < 45; // Phase 27 - F42: Adaptive mode when FPS drops below 45
  
  // Phase 30 - F45: Pause star particle simulation on low FPS or tab hidden
  const shouldPauseParticles = fps < 30 || !isTabVisible || sceneState.isFrozen;
  
  // FPS tracking (Phase 27 - F42)
  useEffect(() => {
    let frameCount = 0;
    let lastTime = performance.now();
    
    const measureFPS = () => {
      frameCount++;
      const currentTime = performance.now();
      
      if (currentTime >= lastTime + 1000) {
        setFps(frameCount);
        frameCount = 0;
        lastTime = currentTime;
      }
      
      requestAnimationFrame(measureFPS);
    };
    
    requestAnimationFrame(measureFPS);
  }, []);
  
  const starCount = useMemo(() => {
    if (typeof window === 'undefined') return 42500; // Phase 27 - F42: Reduced by 15%
    const isMobile = size.width < 800;
    
    // Phase 27 - F42: Further reduce on low FPS
    if (adaptiveMode) {
      return isMobile ? 8000 : 35000; // Additional 20% reduction in adaptive mode
    }
    
    return isMobile ? 8500 : 42500; // Phase 27 - F42: Reduced by 15% (from 10000/50000)
  }, [size.width, adaptiveMode]);
  
  // Register with motion orchestrator (legacy + new)
  useEffect(() => {
    // Update legacy orchestrator with scroll and audio
    motionOrchestrator.setScroll(scroll);
    if (audioData) {
      motionOrchestrator.setAudio({
        bass: audioData.bass || 0,
        mid: audioData.mid || 0,
        high: audioData.high || 0,
      });
    }
    
    // Register GalaxyScene as an engine (legacy)
    motionOrchestrator.registerEngine('galaxy-scene', (motionState: MotionState) => {
      motionStateRef.current = motionState;
    });
    
    // Start orchestrator (legacy)
    motionOrchestrator.start();
    
    // Register with new orchestrator for scene progress
    const handleSceneProgress = (data: any) => {
      if (data.trigger === 'onSceneProgress') {
        orchestrator.onSceneProgress(data.data?.progress || 0);
      }
    };
    
    orchestrator.register('galaxy-scene', handleSceneProgress);
    
    return () => {
      motionOrchestrator.unregisterEngine('galaxy-scene');
      orchestrator.unregister('galaxy-scene');
    };
  }, [scroll, audioData, orchestrator]);
  
  // Update orchestrator when props change
  useEffect(() => {
    motionOrchestrator.setScroll(scroll);
    if (audioData) {
      motionOrchestrator.setAudio({
        bass: audioData.bass || 0,
        mid: audioData.mid || 0,
        high: audioData.high || 0,
      });
    }
    
    // Update new orchestrator with scene progress
    const sceneProgress = scroll; // 0-1 scroll progress
    orchestrator.onSceneProgress(sceneProgress);
  }, [scroll, audioData, orchestrator]);
  
  // Listen for route transition events and update shaders
  useEffect(() => {
    const handleRouteChange = (data: any) => {
      if (data.trigger === 'onRouteChange') {
        const transitionType = data.data?.type;
        const transitionProgress = data.data?.progress || 0;
        
        // React to route transitions in shaders
        if (transitionType === 'cosmic-mist-enter' || transitionType === 'mandala-zoom-enter') {
          // Increase bloom intensity during enter
          setCameraFOV(75.0 + transitionProgress * 5.0);
        } else if (transitionType === 'cosmic-mist-exit' || transitionType === 'nebula-shift-exit') {
          // Decrease intensity during exit
          setCameraFOV(75.0 - transitionProgress * 3.0);
        } else if (transitionType === 'starfield-pulse') {
          // Starfield pulse effect
          const intensity = data.data?.intensity || 1.0;
          // This will be handled by star particles
        }
      }
    };
    
    orchestrator.register('galaxy-route-transitions', handleRouteChange);
    
    return () => {
      orchestrator.unregister('galaxy-route-transitions');
    };
  }, [orchestrator]);
  
  // Update transition state based on route changes
  useEffect(() => {
    const handleTransition = (data: any) => {
      if (data.trigger === 'onRouteChange') {
        const type = data.data?.type;
        const progress = data.data?.progress || 0;
        
        if (type?.includes('enter')) {
          // Ramp up effects
          setTransitionState({
            bloomIntensity: 1.0 + progress * 0.5,
            filmGrainIntensity: 0.15 + progress * 0.1,
            nebulaParallax: progress * 0.1,
            starfieldDensity: 1.0 - progress * 0.2,
            motionBlurSmear: 0.5 + progress * 0.3,
          });
        } else if (type?.includes('exit')) {
          // Ramp down effects
          setTransitionState({
            bloomIntensity: 1.0 - progress * 0.3,
            filmGrainIntensity: 0.15 - progress * 0.05,
            nebulaParallax: -progress * 0.1,
            starfieldDensity: 1.0 + progress * 0.1,
            motionBlurSmear: 0.5 - progress * 0.2,
          });
        }
      }
    };
    
    orchestrator.register('galaxy-transition-state', handleTransition);
    
    return () => {
      orchestrator.unregister('galaxy-transition-state');
    };
  }, [orchestrator]);
  
  // Camera position based on scene context
  useEffect(() => {
    // Initial camera position
    camera.position.set(0, 0, 8);
    camera.lookAt(0, 0, 0);
  }, [camera]);
  
  // Listen for scroll callbacks
  useEffect(() => {
    const handleScrollNebula = (data: any) => {
      if (data.trigger === 'scrollNebulaReact') {
        const progress = data.data?.progress || 0;
        setTransitionState((prev) => ({
          ...prev,
          nebulaParallax: progress * 0.2,
        }));
      }
    };
    
    const handleScrollStarfield = (data: any) => {
      if (data.trigger === 'scrollStarfieldReact') {
        const progress = data.data?.progress || 0;
        setTransitionState((prev) => ({
          ...prev,
          starfieldDensity: 1.0 - progress * 0.3,
        }));
      }
    };
    
    orchestrator.register('galaxy-scroll-nebula', handleScrollNebula);
    orchestrator.register('galaxy-scroll-starfield', handleScrollStarfield);
    
    return () => {
      orchestrator.unregister('galaxy-scroll-nebula');
      orchestrator.unregister('galaxy-scroll-starfield');
    };
  }, [orchestrator]);
  
  // Listen for UI → Scene interaction events (Phase 12 - F27)
  useEffect(() => {
    const handleSceneEvent = (data: any) => {
      if (data.trigger === 'onSceneEvent') {
        const { eventName, payload } = data.data || {};
        
        switch (eventName) {
          case 'card-hover-start':
            handleCardHover(payload);
            break;
          case 'card-hover-end':
            handleCardHoverEnd(payload);
            break;
          case 'cta-hover':
            handleCTAHover();
            break;
          case 'cta-click':
            handleCTAClick();
            break;
          case 'content-enter':
            handleContentEnter(payload);
            break;
          case 'content-exit':
            handleContentExit(payload);
            break;
          case 'footer-enter':
            handleFooterEnter();
            break;
          case 'footer-exit':
            handleFooterExit();
            break;
          case 'hero-hover':
            handleHeroHover();
            break;
          case 'guru-insight':
            handleGuruInsight(payload || {});
            break;
          case 'guru-remedy':
            handleGuruRemedy(payload || {});
            break;
          case 'guru-emotion':
            // User expresses emotion → mandala scale pulse (Phase 16 - F31)
            const emotionType = payload?.type || 'neutral';
            if (emotionType === 'concerned' || emotionType === 'grateful') {
              setInteractionState((prev) => ({
                ...prev,
                mandalaScale: 1.1, // Pulse scale
              }));
              // Reset after pulse
              setTimeout(() => {
                setInteractionState((prev) => ({
                  ...prev,
                  mandalaScale: 1.0,
                }));
              }, 1000);
            }
            break;
          case 'guru-listening':
            // User is speaking → scene reactions (Phase 17 - F32)
            setInteractionState((prev) => ({
              ...prev,
              nebulaBrightness: prev.nebulaBrightness + 0.1,
              mandalaRotation: prev.mandalaRotation + 0.002,
            }));
            setTransitionState((prev) => ({
              ...prev,
              starfieldDensity: prev.starfieldDensity + 0.05,
            }));
            break;
          case 'guru-listening-end':
            // Reset scene after listening
            setInteractionState((prev) => ({
              ...prev,
              nebulaBrightness: Math.max(1.0, prev.nebulaBrightness - 0.1),
              mandalaRotation: Math.max(0, prev.mandalaRotation - 0.002),
            }));
            setTransitionState((prev) => ({
              ...prev,
              starfieldDensity: Math.max(1.0, prev.starfieldDensity - 0.05),
            }));
            break;
          case 'guru-speaking':
            // Guru is speaking (TTS) → scene reactions (Phase 17 - F32)
            setInteractionState((prev) => ({
              ...prev,
              nebulaHueShift: prev.nebulaHueShift + 0.1,
            }));
            setTransitionState((prev) => ({
              ...prev,
              starfieldFocus: prev.starfieldFocus + 0.15,
              bloomIntensity: 1.2, // Pulse bloom
            }));
            break;
          case 'guru-speaking-end':
            // Reset scene after speaking
            setInteractionState((prev) => ({
              ...prev,
              nebulaHueShift: Math.max(0, prev.nebulaHueShift - 0.1),
            }));
            setTransitionState((prev) => ({
              ...prev,
              starfieldFocus: Math.max(0, prev.starfieldFocus - 0.15),
              bloomIntensity: 1.0,
            }));
            break;
          case 'vision-palmistry':
            // Palmistry insight → mandala rotation pulse (Phase 18 - F33)
            setInteractionState((prev) => ({
              ...prev,
              mandalaRotation: prev.mandalaRotation + 0.1,
            }));
            setTimeout(() => {
              setInteractionState((prev) => ({
                ...prev,
                mandalaRotation: prev.mandalaRotation - 0.1,
              }));
            }, 2000);
            break;
          case 'vision-aura':
            // Aura from face → nebula hue shift = aura color (Phase 18 - F33)
            const auraColor = payload?.color || 'Violet';
            const hueShiftMap: { [key: string]: number } = {
              'Red': 0.0,
              'Orange': 0.1,
              'Yellow': 0.2,
              'Green': 0.3,
              'Blue': 0.4,
              'Indigo': 0.5,
              'Violet': 0.6,
            };
            const hueShift = hueShiftMap[auraColor] || 0.3;
            setInteractionState((prev) => ({
              ...prev,
              nebulaHueShift: prev.nebulaHueShift + hueShift,
            }));
            break;
          case 'vision-emotion':
            // Emotion detection → starfield density shift (Phase 18 - F33)
            const emotion = payload?.emotion || 'neutral';
            const densityShift = emotion === 'calm' ? 0.1 : emotion === 'happy' ? 0.15 : -0.05;
            setTransitionState((prev) => ({
              ...prev,
              starfieldDensity: prev.starfieldDensity + densityShift,
            }));
            break;
          case 'vision-kundali':
            // Kundali screenshot → mandala glow +0.2 (Phase 18 - F33)
            setInteractionState((prev) => ({
              ...prev,
              mandalaScale: prev.mandalaScale + 0.2,
            }));
            setTransitionState((prev) => ({
              ...prev,
              bloomIntensity: prev.bloomIntensity + 0.2,
            }));
            break;
          case 'vision-document':
            // Document extraction → nebula brightness +0.1 (Phase 18 - F33)
            setInteractionState((prev) => ({
              ...prev,
              nebulaBrightness: prev.nebulaBrightness + 0.1,
            }));
            break;
          case 'video-aura':
            // Aura color → nebulaHueShift dynamic (Phase 19 - F34)
            const auraColorVideo = payload?.color || 'Violet';
            const auraHueMap: { [key: string]: number } = {
              'Red': 0.0,
              'Orange': 0.1,
              'Yellow': 0.2,
              'Green': 0.3,
              'Blue': 0.4,
              'Indigo': 0.5,
              'Violet': 0.6,
            };
            const auraHue = auraHueMap[auraColorVideo] || 0.3;
            setInteractionState((prev) => ({
              ...prev,
              nebulaHueShift: auraHue,
            }));
            break;
          case 'video-emotion':
            // Emotional intensity → starfieldDensity oscillation (Phase 19 - F34)
            const videoEmotion = payload?.emotion || 'neutral';
            const intensity = payload?.intensity || 0.5;
            const densityOscillation = (intensity - 0.5) * 0.2; // -0.1 to +0.1
            setTransitionState((prev) => ({
              ...prev,
              starfieldDensity: 1.0 + densityOscillation,
            }));
            break;
          case 'video-chakra':
            // Chakra waveform → mandalaRotation acceleration (Phase 19 - F34)
            const chakras = payload?.chakras || {};
            const avgChakraStrength = Object.values(chakras).reduce((a: number, b: number) => a + b, 0) / Object.keys(chakras).length || 5;
            const rotationAccel = (avgChakraStrength - 5) * 0.01; // -0.05 to +0.05
            setInteractionState((prev) => ({
              ...prev,
              mandalaRotation: prev.mandalaRotation + rotationAccel,
            }));
            break;
          case 'video-gesture':
            // Gesture detection → scene reactions (Phase 19 - F34)
            const gesture = payload?.gesture || 'none';
            switch (gesture) {
              case 'namaste':
                // Namaste → blessingWave(1.0)
                orchestrator.triggerBlessingWave(1.0);
                break;
              case 'raised-palm':
                // Raised palm → mandalaScale pulse
                setInteractionState((prev) => ({
                  ...prev,
                  mandalaScale: prev.mandalaScale + 0.15,
                }));
                setTimeout(() => {
                  setInteractionState((prev) => ({
                    ...prev,
                    mandalaScale: prev.mandalaScale - 0.15,
                  }));
                }, 1000);
                break;
              case 'smile':
                // Smile → nebulaBrightness +0.1
                setInteractionState((prev) => ({
                  ...prev,
                  nebulaBrightness: prev.nebulaBrightness + 0.1,
                }));
                break;
              case 'sad':
                // Sad → bloomIntensity +0.15 (comfort mode)
                setTransitionState((prev) => ({
                  ...prev,
                  bloomIntensity: prev.bloomIntensity + 0.15,
                }));
                break;
            }
            break;
          case 'guru-pastlife':
            // Past life event → mandalaRotation +0.003, color shift to deep gold (Phase 20 - F35)
            setInteractionState((prev) => ({
              ...prev,
              mandalaRotation: prev.mandalaRotation + 0.003,
            }));
            setTransitionState((prev) => ({
              ...prev,
              nebulaHueShift: 0.2, // Deep gold hue
            }));
            break;
          case 'guru-karmic':
            // Karmic event → nebulaHueShift oscillation (Phase 20 - F35)
            const karmicIntensity = (payload?.debts || 0) + (payload?.lessons || 0);
            const oscillation = Math.sin(Date.now() / 1000) * 0.1 * Math.min(1, karmicIntensity / 5);
            setTransitionState((prev) => ({
              ...prev,
              nebulaHueShift: prev.nebulaHueShift + oscillation,
            }));
            break;
          case 'guru-synergy':
            // Synergy event → starfieldFocus pulse (Phase 20 - F35)
            const synergyScore = payload?.score || 0.5;
            const focusPulse = (synergyScore - 0.5) * 0.3; // -0.15 to +0.15
            setTransitionState((prev) => ({
              ...prev,
              starfieldFocus: 1.0 + focusPulse,
            }));
            break;
          case 'guru-prediction':
            // Prediction → mandala glow pulse (Phase 21 - F36)
            const predictionEnergy = payload?.energy || 5;
            const glowIntensity = (predictionEnergy / 10) * 0.3; // 0 to 0.3
            setInteractionState((prev) => ({
              ...prev,
              mandalaScale: prev.mandalaScale + glowIntensity,
            }));
            setTransitionState((prev) => ({
              ...prev,
              bloomIntensity: prev.bloomIntensity + glowIntensity,
            }));
            // Reset after pulse
            setTimeout(() => {
              setInteractionState((prev) => ({
                ...prev,
                mandalaScale: prev.mandalaScale - glowIntensity,
              }));
              setTransitionState((prev) => ({
                ...prev,
                bloomIntensity: prev.bloomIntensity - glowIntensity,
              }));
            }, 2000);
            break;
          case 'guru-caution':
            // Caution → nebula red tint (0.1s) (Phase 21 - F36)
            setTransitionState((prev) => ({
              ...prev,
              nebulaHueShift: 0.0, // Red tint
            }));
            setTimeout(() => {
              setTransitionState((prev) => ({
                ...prev,
                nebulaHueShift: prev.nebulaHueShift,
              }));
            }, 100);
            break;
          case 'guru-blessing':
            // Blessing → starfield expansion (Phase 21 - F36)
            setTransitionState((prev) => ({
              ...prev,
              starfieldDensity: prev.starfieldDensity + 0.2,
            }));
            setTimeout(() => {
              setTransitionState((prev) => ({
                ...prev,
                starfieldDensity: prev.starfieldDensity - 0.2,
              }));
            }, 1500);
            break;
          case 'guru-compatibility':
            // Compatibility → mandala pulse (Phase 22 - F37)
            setInteractionState((prev) => ({
              ...prev,
              mandalaScale: prev.mandalaScale + 0.15,
            }));
            setTimeout(() => {
              setInteractionState((prev) => ({
                ...prev,
                mandalaScale: prev.mandalaScale - 0.15,
              }));
            }, 2000);
            break;
          case 'guru-conflict':
            // Conflict → nebula red flash (Phase 22 - F37)
            setTransitionState((prev) => ({
              ...prev,
              nebulaHueShift: 0.0, // Red tint
            }));
            setTimeout(() => {
              setTransitionState((prev) => ({
                ...prev,
                nebulaHueShift: prev.nebulaHueShift,
              }));
            }, 200);
            break;
          case 'guru-harmony':
            // Harmony → starfield expansion (Phase 22 - F37)
            const harmonyLevel = payload?.harmony || 0.7;
            setTransitionState((prev) => ({
              ...prev,
              starfieldDensity: prev.starfieldDensity + (harmonyLevel * 0.2),
            }));
            setTimeout(() => {
              setTransitionState((prev) => ({
                ...prev,
                starfieldDensity: prev.starfieldDensity - (harmonyLevel * 0.2),
              }));
            }, 1500);
            break;
          case 'guru-report-loaded':
            // Report loaded → mandala glow boost (Phase 23 - F38)
            setInteractionState((prev) => ({
              ...prev,
              mandalaScale: prev.mandalaScale + 0.2,
            }));
            setTransitionState((prev) => ({
              ...prev,
              bloomIntensity: prev.bloomIntensity + 0.3,
            }));
            setTimeout(() => {
              setInteractionState((prev) => ({
                ...prev,
                mandalaScale: prev.mandalaScale - 0.2,
              }));
              setTransitionState((prev) => ({
                ...prev,
                bloomIntensity: prev.bloomIntensity - 0.3,
              }));
            }, 3000);
            break;
          case 'guru-report-section':
            // Report section → starfield parallax (Phase 23 - F38)
            setTransitionState((prev) => ({
              ...prev,
              starfieldFocus: prev.starfieldFocus + 0.1,
            }));
            setTimeout(() => {
              setTransitionState((prev) => ({
                ...prev,
                starfieldFocus: prev.starfieldFocus - 0.1,
              }));
            }, 1000);
            break;
          case 'guru-report-scroll':
            // Report scroll → nebula hue shift (Phase 23 - F38)
            const scrollProgress = payload?.progress || 0;
            setTransitionState((prev) => ({
              ...prev,
              nebulaHueShift: scrollProgress * 0.2, // Shift based on scroll progress
            }));
            break;
          case 'guru-pdf-start':
            // PDF start → bloom +0.2 (Phase 24 - F39)
            setTransitionState((prev) => ({
              ...prev,
              bloomIntensity: prev.bloomIntensity + 0.2,
            }));
            break;
          case 'guru-pdf-complete':
            // PDF complete → mandala glow pulse (Phase 24 - F39)
            setInteractionState((prev) => ({
              ...prev,
              mandalaScale: prev.mandalaScale + 0.3,
            }));
            setTimeout(() => {
              setInteractionState((prev) => ({
                ...prev,
                mandalaScale: prev.mandalaScale - 0.3,
              }));
              setTransitionState((prev) => ({
                ...prev,
                bloomIntensity: prev.bloomIntensity - 0.2,
              }));
            }, 2000);
            break;
          case 'orchestrator-insight':
            // Orchestrator insight → nebula brightness pulse (Phase 25 - F40)
            setTransitionState((prev) => ({
              ...prev,
              nebulaBrightness: prev.nebulaBrightness + 0.15,
            }));
            setTimeout(() => {
              setTransitionState((prev) => ({
                ...prev,
                nebulaBrightness: prev.nebulaBrightness - 0.15,
              }));
            }, 1500);
            break;
          case 'orchestrator-remedy':
            // Orchestrator remedy → starfield focus pulse (Phase 25 - F40)
            setTransitionState((prev) => ({
              ...prev,
              starfieldFocus: prev.starfieldFocus + 0.1,
            }));
            setTimeout(() => {
              setTransitionState((prev) => ({
                ...prev,
                starfieldFocus: prev.starfieldFocus - 0.1,
              }));
            }, 1500);
            break;
          case 'orchestrator-karmic':
            // Orchestrator karmic → mandala rotation + color shift (Phase 25 - F40)
            setInteractionState((prev) => ({
              ...prev,
              mandalaRotation: prev.mandalaRotation + 0.005,
              mandalaColor: new THREE.Color(0xFFD700), // Gold
            }));
            setTimeout(() => {
              setInteractionState((prev) => ({
                ...prev,
                mandalaColor: new THREE.Color(0x8B00FF), // Reset to violet
              }));
            }, 2000);
            break;
          case 'orchestrator-prediction':
            // Orchestrator prediction → bloom intensity pulse (Phase 25 - F40)
            const predictionCount = payload?.count || 0;
            setTransitionState((prev) => ({
              ...prev,
              bloomIntensity: prev.bloomIntensity + (predictionCount * 0.05),
            }));
            setTimeout(() => {
              setTransitionState((prev) => ({
                ...prev,
                bloomIntensity: prev.bloomIntensity - (predictionCount * 0.05),
              }));
            }, 2000);
            break;
          case 'orchestrator-compatibility':
            // Orchestrator compatibility → starfield expansion (Phase 25 - F40)
            const compatRating = payload?.rating || 0;
            const compatIntensity = (compatRating / 100) * 0.2;
            setTransitionState((prev) => ({
              ...prev,
              starfieldDensity: prev.starfieldDensity + compatIntensity,
            }));
            setTimeout(() => {
              setTransitionState((prev) => ({
                ...prev,
                starfieldDensity: prev.starfieldDensity - compatIntensity,
              }));
            }, 1500);
            break;
          case 'orchestrator-vision':
            // Orchestrator vision → nebula hue shift (Phase 25 - F40)
            setTransitionState((prev) => ({
              ...prev,
              nebulaHueShift: prev.nebulaHueShift + 0.15,
            }));
            setTimeout(() => {
              setTransitionState((prev) => ({
                ...prev,
                nebulaHueShift: prev.nebulaHueShift - 0.15,
              }));
            }, 1000);
            break;
          case 'orchestrator-video':
            // Orchestrator video → mandala scale pulse (Phase 25 - F40)
            setInteractionState((prev) => ({
              ...prev,
              mandalaScale: prev.mandalaScale + 0.1,
            }));
            setTimeout(() => {
              setInteractionState((prev) => ({
                ...prev,
                mandalaScale: prev.mandalaScale - 0.1,
              }));
            }, 1000);
            break;
          case 'orchestrator-voice':
            // Orchestrator voice → starfield focus pulse (Phase 25 - F40)
            setTransitionState((prev) => ({
              ...prev,
              starfieldFocus: prev.starfieldFocus + 0.15,
            }));
            setTimeout(() => {
              setTransitionState((prev) => ({
                ...prev,
                starfieldFocus: prev.starfieldFocus - 0.15,
              }));
            }, 1000);
            break;
          case 'orchestrator-pastlife':
            // Orchestrator past-life → mandala rotation + gold color shift (Phase 25 - F40)
            setInteractionState((prev) => ({
              ...prev,
              mandalaRotation: prev.mandalaRotation + 0.003,
              mandalaColor: new THREE.Color(0xFFD700), // Gold
            }));
            setTimeout(() => {
              setInteractionState((prev) => ({
                ...prev,
                mandalaColor: new THREE.Color(0x8B00FF), // Reset to violet
              }));
            }, 2000);
            break;
          case 'orchestrator-memory':
            // Orchestrator memory → subtle nebula brightness increase (Phase 25 - F40)
            setTransitionState((prev) => ({
              ...prev,
              nebulaBrightness: prev.nebulaBrightness + 0.05,
            }));
            setTimeout(() => {
              setTransitionState((prev) => ({
                ...prev,
                nebulaBrightness: prev.nebulaBrightness - 0.05,
              }));
            }, 1000);
            break;
          case 'premium-boost':
            handlePremiumBoost();
            break;
          case 'route-type-changed':
            // Handle route type changes if needed
            break;
        }
      }
    };
    
    orchestrator.register('galaxy-scene-events', handleSceneEvent);
    
    return () => {
      orchestrator.unregister('galaxy-scene-events');
    };
  }, [orchestrator]);
  
  // Scene event handlers (Phase 12 - F27)
  const handleCardHover = (payload: { id: string; intensity: number }) => {
    setInteractionState((prev) => ({
      ...prev,
      cardHovered: payload,
      nebulaBrightness: 1.3, // Increase nebula brightness
      mandalaRotation: payload.intensity * 0.1, // Tilt mandala
    }));
    
    setTransitionState((prev) => ({
      ...prev,
      starfieldDensity: 1.2, // Increase starfield density
    }));
  };
  
  const handleCardHoverEnd = (payload: { id: string }) => {
    setInteractionState((prev) => ({
      ...prev,
      cardHovered: null,
      nebulaBrightness: 1.0,
      mandalaRotation: 0,
    }));
    
    setTransitionState((prev) => ({
      ...prev,
      starfieldDensity: 1.0,
    }));
  };
  
  const handleCTAHover = () => {
    setInteractionState((prev) => ({
      ...prev,
      ctaHovered: true,
    }));
    
    setTransitionState((prev) => ({
      ...prev,
      bloomIntensity: 1.2, // Bloom pulse
    }));
  };
  
  const handleCTAClick = () => {
    setInteractionState((prev) => ({
      ...prev,
      ctaClicked: true,
    }));
    
    // Gold flare burst - temporary bloom spike
    setTransitionState((prev) => ({
      ...prev,
      bloomIntensity: 1.5,
    }));
    
    // Reset after animation
    setTimeout(() => {
      setTransitionState((prev) => ({
        ...prev,
        bloomIntensity: 1.0,
      }));
      setInteractionState((prev) => ({
        ...prev,
        ctaClicked: false,
      }));
    }, 500);
  };
  
  const handleContentEnter = (payload: { sectionId: string }) => {
    setInteractionState((prev) => ({
      ...prev,
      contentActive: payload.sectionId,
      nebulaHueShift: 0.3, // Purple → cyan shift
      starfieldFocus: 0.5,
      mandalaRotation: 0.05, // Subtle rotation
    }));
  };
  
  const handleContentExit = (payload: { sectionId: string }) => {
    setInteractionState((prev) => ({
      ...prev,
      contentActive: prev.contentActive === payload.sectionId ? null : prev.contentActive,
      nebulaHueShift: 0,
      starfieldFocus: 0,
      mandalaRotation: 0,
    }));
  };
  
  const handleFooterEnter = () => {
    setInteractionState((prev) => ({
      ...prev,
      footerActive: true,
      nebulaBrightness: 0.6, // Dimming
      mandalaScale: 0.8, // Shrink
    }));
    
    setTransitionState((prev) => ({
      ...prev,
      starfieldDensity: 0.7, // Slow fade
    }));
  };
  
  const handleFooterExit = () => {
    setInteractionState((prev) => ({
      ...prev,
      footerActive: false,
      nebulaBrightness: 1.0,
      mandalaScale: 1.0,
    }));
    
    setTransitionState((prev) => ({
      ...prev,
      starfieldDensity: 1.0,
    }));
  };
  
  // Handle Guru Insight event (Phase 16 - F31)
  const handleGuruInsight = (payload: { count?: number }) => {
    // Deep insight → starfield focus = +0.2
    const focusIncrease = 0.2 * (payload.count || 1);
    // This will be applied to starfield density or focus
    setTransitionState((prev) => ({
      ...prev,
      starfieldDensity: Math.min(prev.starfieldDensity + focusIncrease, 1.5),
    }));
  };

  // Handle Guru Remedy event (Phase 16 - F31)
  const handleGuruRemedy = (payload: { count?: number }) => {
    // Remedy → nebula hue shift = +0.15
    const hueShift = 0.15 * (payload.count || 1);
    // This will be applied to nebula color shift
    setTransitionState((prev) => ({
      ...prev,
      nebulaParallax: prev.nebulaParallax + hueShift * 0.1, // Apply as parallax shift
    }));
  };

  const handleHeroHover = () => {
    setInteractionState((prev) => ({
      ...prev,
      heroHovered: true,
      mandalaScale: 1.2, // Center mandala expands
      nebulaBrightness: 1.2, // Contrast increase
    }));
  };
  
  const handlePremiumBoost = () => {
    setInteractionState((prev) => ({
      ...prev,
      premiumBoost: true,
    }));
    
    setTransitionState((prev) => ({
      ...prev,
      bloomIntensity: 1.4, // 1.4x bloom
    }));
    
    setInteractionState((prev) => ({
      ...prev,
      nebulaBrightness: 1.2, // +20% brightness
    }));
  };
  
  // Auto-orbit and parallax animation with scroll/mouse velocity
  useFrame((state) => {
    if (!sceneRef.current) return;
    
    const motionState = motionStateRef.current;
    const time = motionState?.time || state.clock.elapsedTime;
    
    // Starfield speed = scrollVelocity * multipliers
    const starfieldSpeed = scrollVelocity * 0.01;
    
    // Nebula drift = smoothed progress (from scroll store)
    const nebulaDrift = scrollMotion.scrollY / (typeof window !== 'undefined' ? window.innerHeight * 2 : 1);
    
    // Mandala rotation = sectionProgress(hero)
    const mandalaRotation = heroProgress * 0.0002;
    
    // Bloom intensity pulse on scroll down
    if (scrollDirection === 'down') {
      const bloomPulse = 1.0 + Math.sin(time * 2) * 0.1 * Math.min(scrollVelocity * 0.01, 0.5);
      setTransitionState((prev) => ({
        ...prev,
        bloomIntensity: bloomPulse,
      }));
    }
    
    // Depth parallax based on scroll direction
    const depthParallax = scrollDirection === 'down' ? 0.1 : scrollDirection === 'up' ? -0.1 : 0;
    
    // Particle displacement based on mouse velocity
    const particleDisplacement = mouseVelocity * 0.0001;
    
    // Auto-orbit when mouse is idle (very slow) + scroll velocity
    if (Math.abs(mouse.x) < 0.1 && Math.abs(mouse.y) < 0.1) {
      sceneRef.current.rotation.y += 0.0004 + mandalaRotation;
    }
    
    // Parallax rotation from mouse + mouse velocity
    sceneRef.current.rotation.y += mouse.x * 0.0008 + mouseMotion.deltaX * 0.0001;
    sceneRef.current.rotation.x += mouse.y * 0.0005 + mouseMotion.deltaY * 0.0001;
    
    // Clamp rotation
    sceneRef.current.rotation.x = Math.max(-0.5, Math.min(0.5, sceneRef.current.rotation.x));
    
    // Camera FOV compensation based on scroll velocity
    const fovCompensation = Math.min(scrollVelocity * 0.1, 5.0);
    setCameraFOV(75.0 + fovCompensation);
  });
  
  return (
    <>
      {/* Cosmic Camera Controller (E18 - at top of Canvas) */}
      <CameraController
        ref={cameraControllerRef}
        mode="orbit"
        intensity={intensity}
        scroll={motionStateRef.current?.scrollProgress ?? scroll}
        mouse={mouse}
        audioReactive={{
          bass: motionStateRef.current?.bassMotion ?? audioData?.bass ?? 0,
          mid: motionStateRef.current?.midMotion ?? audioData?.mid ?? 0,
          high: motionStateRef.current?.highMotion ?? audioData?.high ?? 0,
        }}
        blessingWaveProgress={blessingWaveProgress}
        isGuruHovered={isGuruHovered}
        isBlessingWaveActive={isBlessingWaveActive}
      />
      
      {/* Cosmic UI Raymarch Overlay (E19 - after CameraController, above all engines) */}
      <UIRaymarch
        scroll={motionStateRef.current?.scrollProgress ?? scroll}
        mouse={mouse}
        audioReactive={{
          bass: motionStateRef.current?.bassMotion ?? audioData?.bass ?? 0,
          mid: motionStateRef.current?.midMotion ?? audioData?.mid ?? 0,
          high: motionStateRef.current?.highMotion ?? audioData?.high ?? 0,
        }}
        blessingWaveProgress={blessingWaveProgress}
        isGuruHovered={isGuruHovered}
        cameraState={cameraControllerRef.current?.getState()}
        intensity={intensity}
      />
      
      <group ref={sceneRef}>
        {/* Dark cosmic background */}
        <color attach="background" args={['#030014']} />
      
      {/* Galaxy Core */}
      <GalaxyCore intensity={intensity} />
      
      {/* Star Particles (Legacy - can be removed if using ParticleUniverse) */}
      <StarParticles
        count={starCount}
        intensity={intensity * transitionState.starfieldDensity * (interactionState.footerActive ? 0.7 : 1.0)}
        mouse={mouseVec}
        speed={scrollVelocity * 0.01}
        cursorVelocity={mouseVelocity > 0 ? { x: mouseMotion.deltaX, y: mouseMotion.deltaY } : { x: 0, y: 0 }}
        cursorProximity={interactionState.cardHovered ? 0.3 : 0}
      />
      
      {/* Nebula Layer with upgraded 5-layer shader */}
      <NebulaLayer
        intensity={intensity * interactionState.nebulaBrightness}
        mouse={mouseVec}
        scroll={motionStateRef.current?.scrollProgress ?? scroll}
        audioReactive={{
          bass: motionStateRef.current?.bassMotion ?? audioData?.bass ?? 0,
          mid: motionStateRef.current?.midMotion ?? audioData?.mid ?? 0,
          high: motionStateRef.current?.highMotion ?? audioData?.high ?? 0,
        }}
        scrollVelocity={scrollVelocity}
        mouseVelocity={mouseVelocity}
        transitionParallax={transitionState.nebulaParallax}
        hueShift={interactionState.nebulaHueShift}
        blessingWaveProgress={blessingWaveProgress}
      />
      
      {/* Energy Ribbons (E5 - between nebula and kundalini wave) */}
      <EnergyRibbons
        intensity={intensity}
        scroll={scroll}
        mouse={mouse}
        audioReactive={audioReactive}
        parallaxStrength={1.0}
      />
      
      {/* Kundalini Energy Wave (between nebula and particles) */}
      <KundaliniWave
        mouse={mouse}
        scroll={scroll}
        intensity={intensity}
        audioReactive={audioReactive}
      />
      
      {/* Chakra Glow Rings (E6 - between KundaliniWave and ParticleUniverse) */}
      <ChakraRings
        intensity={intensity}
        scroll={scroll}
        mouse={mouse}
        audioReactive={audioReactive}
        parallaxStrength={1.0}
      />
      
      {/* Aura Halo (E7 - above ChakraRings but below ParticleUniverse) */}
      <AuraHalo
        intensity={intensity}
        scroll={scroll}
        mouse={mouse}
        audioReactive={audioReactive}
        parallaxStrength={1.0}
      />
      
      {/* Cosmic Pulse Field (E8 - above AuraHalo but below ParticleUniverse) */}
      <CosmicPulseField
        intensity={intensity}
        scroll={scroll}
        mouse={mouse}
        audioReactive={audioReactive}
        parallaxStrength={1.0}
      />
      
      {/* Divine Alignment Grid (E9 - above CosmicPulseField but below ParticleUniverse) */}
      <DivineAlignmentGrid
        intensity={intensity}
        scroll={motionStateRef.current?.scrollProgress ?? scroll}
        mouse={mouse}
        audioReactive={{
          bass: motionStateRef.current?.bassMotion ?? audioData?.bass ?? 0,
          mid: motionStateRef.current?.midMotion ?? audioData?.mid ?? 0,
          high: motionStateRef.current?.highMotion ?? audioData?.high ?? 0,
        }}
        parallaxStrength={1.0}
      />
      
      {/* Sacred Geometry Projection (E17 - AFTER DivineAlignmentGrid, BEFORE GuruEnergy) */}
      <Projection
        intensity={intensity}
        scroll={motionStateRef.current?.scrollProgress ?? scroll}
        mouse={mouse}
        audioReactive={{
          bass: motionStateRef.current?.bassMotion ?? audioData?.bass ?? 0,
          mid: motionStateRef.current?.midMotion ?? audioData?.mid ?? 0,
          high: motionStateRef.current?.highMotion ?? audioData?.high ?? 0,
        }}
        parallaxStrength={1.0}
        position={[0, -0.5, -1.9]}
        scale={1.0}
        onRotationUpdate={(rotation) => {
          setPathRotation(rotation);
        }}
      />
      
      {/* Cosmic Alignment Grid (E26 - AFTER Projection, BEFORE PranaField) */}
      <AlignmentGrid
        intensity={intensity}
        scroll={motionStateRef.current?.scrollProgress ?? scroll}
        mouse={mouse}
        audioReactive={{
          bass: motionStateRef.current?.bassMotion ?? audioData?.bass ?? 0,
          mid: motionStateRef.current?.midMotion ?? audioData?.mid ?? 0,
          high: motionStateRef.current?.highMotion ?? audioData?.high ?? 0,
        }}
        blessingWaveProgress={blessingWaveProgress}
        breathPhase={breathPhase}
        breathStrength={breathStrength}
        gridRotation={pathRotation}
        cameraFOV={cameraFOV}
        parallaxStrength={1.0}
        position={[0, 0, -5]}
        scale={3.0}
      />
      
      {/* Prana Field (E22 - AFTER Projection, BEFORE GuruEnergy) */}
      <PranaField
        intensity={intensity}
        scroll={motionStateRef.current?.scrollProgress ?? scroll}
        mouse={mouse}
        audioReactive={{
          bass: motionStateRef.current?.bassMotion ?? audioData?.bass ?? 0,
          mid: motionStateRef.current?.midMotion ?? audioData?.mid ?? 0,
          high: motionStateRef.current?.highMotion ?? audioData?.high ?? 0,
        }}
        blessingWaveProgress={blessingWaveProgress}
        breathPhase={breathPhase}
        breathStrength={breathStrength}
        parallaxStrength={1.0}
        position={[0, 0, -1.8]}
        scale={1.5}
      />
      
      {/* Aura Shield (E23 - AFTER PranaField, BEFORE GuruEnergy) */}
      <AuraShield
        intensity={intensity}
        scroll={motionStateRef.current?.scrollProgress ?? scroll}
        mouse={mouse}
        audioReactive={{
          bass: motionStateRef.current?.bassMotion ?? audioData?.bass ?? 0,
          mid: motionStateRef.current?.midMotion ?? audioData?.mid ?? 0,
          high: motionStateRef.current?.highMotion ?? audioData?.high ?? 0,
        }}
        blessingWaveProgress={blessingWaveProgress}
        breathPhase={breathPhase}
        breathStrength={breathStrength}
        parallaxStrength={1.0}
        position={[0, 0, -1.8]}
        scale={1.0}
      />
      
      {/* Guru Avatar Energy (E15 - BEFORE Divine Orb) */}
      <GuruEnergy
        intensity={intensity}
        scroll={motionStateRef.current?.scrollProgress ?? scroll}
        mouse={mouse}
        audioReactive={{
          bass: motionStateRef.current?.bassMotion ?? audioData?.bass ?? 0,
          mid: motionStateRef.current?.midMotion ?? audioData?.mid ?? 0,
          high: motionStateRef.current?.highMotion ?? audioData?.high ?? 0,
        }}
        parallaxStrength={1.0}
        position={[0, 0, -1.8]}
        scale={1.0}
        blessingWaveProgress={blessingWaveProgress}
        onBlessingWave={() => {
          // Trigger blessing wave via interaction engine
          triggerBlessingWave();
          setIsBlessingWaveActive(true);
        }}
        onHover={(hovered) => {
          setIsGuruHovered(hovered);
          setCursorState(hovered ? 'hover-guru' : 'normal');
        }}
        onBreathUpdate={(phase, strength) => {
          setBreathPhase(phase);
          setBreathStrength(strength);
        }}
      />
      
      {/* Memory Stream (E25 - AFTER GuruEnergy (Face is inside), BEFORE BlessingWave) */}
      <MemoryStream
        intensity={intensity}
        scroll={motionStateRef.current?.scrollProgress ?? scroll}
        mouse={mouse}
        audioReactive={{
          bass: motionStateRef.current?.bassMotion ?? audioData?.bass ?? 0,
          mid: motionStateRef.current?.midMotion ?? audioData?.mid ?? 0,
          high: motionStateRef.current?.highMotion ?? audioData?.high ?? 0,
        }}
        blessingWaveProgress={blessingWaveProgress}
        breathPhase={breathPhase}
        breathStrength={breathStrength}
        parallaxStrength={1.0}
        position={[0, 1.2, -1.8]}
        scale={1.0}
        numParticles={isMobile ? 150 : 250}
        numRibbons={4}
        numGlyphs={8}
      />
      
      {/* Timeline Stream (E27 - AFTER MemoryStream, BEFORE PathIndicator) */}
      <TimelineStream
        intensity={intensity}
        scroll={motionStateRef.current?.scrollProgress ?? scroll}
        mouse={mouse}
        audioReactive={{
          bass: motionStateRef.current?.bassMotion ?? audioData?.bass ?? 0,
          mid: motionStateRef.current?.midMotion ?? audioData?.mid ?? 0,
          high: motionStateRef.current?.highMotion ?? audioData?.high ?? 0,
        }}
        blessingWaveProgress={blessingWaveProgress}
        breathPhase={breathPhase}
        breathStrength={breathStrength}
        rotationSync={pathRotation}
        cameraFOV={cameraFOV}
        parallaxStrength={1.0}
        position={[0, 0.8, -2.0]}
        scale={1.0}
        numParticles={isMobile ? 100 : 150}
        numLines={8}
      />
      
      {/* Dharma Wheel v2 (E59 - AFTER AstralThreadV2, BEFORE Gateway) */}
      <DharmaWheelV2
        intensity={intensity}
        scroll={motionStateRef.current?.scrollProgress ?? scroll}
        mouse={mouse}
        audioReactive={{
          bass: motionStateRef.current?.bassMotion ?? audioData?.bass ?? 0,
          mid: motionStateRef.current?.midMotion ?? audioData?.mid ?? 0,
          high: motionStateRef.current?.highMotion ?? audioData?.high ?? 0,
        }}
        blessingWaveProgress={blessingWaveProgress}
        breathPhase={breathPhase}
        breathStrength={breathStrength}
        rotationSync={pathRotation}
        cameraFOV={cameraFOV}
        parallaxStrength={1.0}
        position={[0, -0.1, -12.0]}
        scale={4.4}
      />
      
      {/* Gateway v3 (E60 - AFTER DharmaWheelV2, BEFORE GateOfTime) */}
      <GatewayV3
        intensity={intensity}
        scroll={motionStateRef.current?.scrollProgress ?? scroll}
        mouse={mouse}
        audioReactive={{
          bass: motionStateRef.current?.bassMotion ?? audioData?.bass ?? 0,
          mid: motionStateRef.current?.midMotion ?? audioData?.mid ?? 0,
          high: motionStateRef.current?.highMotion ?? audioData?.high ?? 0,
        }}
        blessingWaveProgress={blessingWaveProgress}
        breathPhase={breathPhase}
        breathStrength={breathStrength}
        rotationSync={pathRotation}
        cameraFOV={cameraFOV}
        parallaxStrength={1.0}
        position={[0, -0.2, -13.4]}
        scale={5.2}
      />
      
      {/* Gate of Time v2 (E61 - AFTER GatewayV3, BEFORE SoulBridge) */}
      <GateOfTimeV2
        intensity={intensity}
        scroll={motionStateRef.current?.scrollProgress ?? scroll}
        mouse={mouse}
        audioReactive={{
          bass: motionStateRef.current?.bassMotion ?? audioData?.bass ?? 0,
          mid: motionStateRef.current?.midMotion ?? audioData?.mid ?? 0,
          high: motionStateRef.current?.highMotion ?? audioData?.high ?? 0,
        }}
        blessingWaveProgress={blessingWaveProgress}
        breathPhase={breathPhase}
        breathStrength={breathStrength}
        rotationSync={pathRotation}
        cameraFOV={cameraFOV}
        parallaxStrength={1.0}
        position={[0, -0.3, -15.2]}
        scale={6.0}
      />
      
      {/* Soul Bridge v3 (E62 - AFTER GateOfTimeV2, BEFORE AstralGate) */}
      <SoulBridgeV3
        intensity={intensity}
        scroll={motionStateRef.current?.scrollProgress ?? scroll}
        mouse={mouse}
        audioReactive={{
          bass: motionStateRef.current?.bassMotion ?? audioData?.bass ?? 0,
          mid: motionStateRef.current?.midMotion ?? audioData?.mid ?? 0,
          high: motionStateRef.current?.highMotion ?? audioData?.high ?? 0,
        }}
        blessingWaveProgress={blessingWaveProgress}
        breathPhase={breathPhase}
        breathStrength={breathStrength}
        rotationSync={pathRotation}
        cameraFOV={cameraFOV}
        parallaxStrength={1.0}
        position={[0, -0.4, -18.0]}
        scale={7.0}
      />
      
      {/* Astral Gate v3 (E63 - AFTER SoulBridgeV3, BEFORE DivineThrone) */}
      <AstralGateV3
        intensity={intensity}
        scroll={motionStateRef.current?.scrollProgress ?? scroll}
        mouse={mouse}
        audioReactive={{
          bass: motionStateRef.current?.bassMotion ?? audioData?.bass ?? 0,
          mid: motionStateRef.current?.midMotion ?? audioData?.mid ?? 0,
          high: motionStateRef.current?.highMotion ?? audioData?.high ?? 0,
        }}
        blessingWaveProgress={blessingWaveProgress}
        breathPhase={breathPhase}
        breathStrength={breathStrength}
        rotationSync={pathRotation}
        cameraFOV={cameraFOV}
        parallaxStrength={1.0}
        position={[0, -0.6, -21.2]}
        scale={7.8}
      />
      
      {/* Divine Throne v3 (E64 - AFTER AstralGateV3, BEFORE AscensionLatticeV2) */}
      <DivineThroneV3
        intensity={intensity}
        scroll={motionStateRef.current?.scrollProgress ?? scroll}
        mouse={mouse}
        audioReactive={{
          bass: motionStateRef.current?.bassMotion ?? audioData?.bass ?? 0,
          mid: motionStateRef.current?.midMotion ?? audioData?.mid ?? 0,
          high: motionStateRef.current?.highMotion ?? audioData?.high ?? 0,
        }}
        blessingWaveProgress={blessingWaveProgress}
        breathPhase={breathPhase}
        breathStrength={breathStrength}
        rotationSync={pathRotation}
        cameraFOV={cameraFOV}
        parallaxStrength={1.0}
        position={[0, -0.8, -24.4]}
        scale={8.4}
      />
      
      {/* Ascension Lattice v2 (E65 - AFTER DivineThroneV3, BEFORE CelestialGateV2) */}
      <AscensionLatticeV2
        intensity={intensity}
        scroll={motionStateRef.current?.scrollProgress ?? scroll}
        mouse={mouse}
        audioReactive={{
          bass: motionStateRef.current?.bassMotion ?? audioData?.bass ?? 0,
          mid: motionStateRef.current?.midMotion ?? audioData?.mid ?? 0,
          high: motionStateRef.current?.highMotion ?? audioData?.high ?? 0,
        }}
        blessingWaveProgress={blessingWaveProgress}
        breathPhase={breathPhase}
        breathStrength={breathStrength}
        rotationSync={pathRotation}
        cameraFOV={cameraFOV}
        parallaxStrength={1.0}
        position={[0, -1.0, -27.0]}
        scale={10.0}
      />
      
      {/* Celestial Gate v2 (E66 - AFTER AscensionLatticeV2, BEFORE CelestialTempleV2) */}
      <CelestialGateV2
        intensity={intensity}
        scroll={motionStateRef.current?.scrollProgress ?? scroll}
        mouse={mouse}
        audioReactive={{
          bass: motionStateRef.current?.bassMotion ?? audioData?.bass ?? 0,
          mid: motionStateRef.current?.midMotion ?? audioData?.mid ?? 0,
          high: motionStateRef.current?.highMotion ?? audioData?.high ?? 0,
        }}
        blessingWaveProgress={blessingWaveProgress}
        breathPhase={breathPhase}
        breathStrength={breathStrength}
        rotationSync={pathRotation}
        cameraFOV={cameraFOV}
        parallaxStrength={1.0}
        position={[0, -1.4, -30.0]}
        scale={9.0}
      />
      
      {/* Celestial Temple v2 (E67 - AFTER CelestialGateV2, BEFORE CelestialSanctumV3) */}
      <CelestialTempleV2
        intensity={intensity}
        scroll={motionStateRef.current?.scrollProgress ?? scroll}
        mouse={mouse}
        audioReactive={{
          bass: motionStateRef.current?.bassMotion ?? audioData?.bass ?? 0,
          mid: motionStateRef.current?.midMotion ?? audioData?.mid ?? 0,
          high: motionStateRef.current?.highMotion ?? audioData?.high ?? 0,
        }}
        blessingWaveProgress={blessingWaveProgress}
        breathPhase={breathPhase}
        breathStrength={breathStrength}
        rotationSync={pathRotation}
        cameraFOV={cameraFOV}
        parallaxStrength={1.0}
        position={[0, -1.6, -33.2]}
        scale={11.0}
      />
      
      {/* Celestial Sanctum v3 (E68 - AFTER CelestialTempleV2, BEFORE CelestialCrownV2) */}
      <CelestialSanctumV3
        intensity={intensity}
        scroll={motionStateRef.current?.scrollProgress ?? scroll}
        mouse={mouse}
        audioReactive={{
          bass: motionStateRef.current?.bassMotion ?? audioData?.bass ?? 0,
          mid: motionStateRef.current?.midMotion ?? audioData?.mid ?? 0,
          high: motionStateRef.current?.highMotion ?? audioData?.high ?? 0,
        }}
        blessingWaveProgress={blessingWaveProgress}
        breathPhase={breathPhase}
        breathStrength={breathStrength}
        rotationSync={pathRotation}
        cameraFOV={cameraFOV}
        parallaxStrength={1.0}
        position={[0, -1.9, -36.4]}
        scale={12.4}
      />
      
      {/* Celestial Crown v2 (E69 - AFTER CelestialSanctumV3, BEFORE CelestialCrestV2) */}
      <CelestialCrownV2
        intensity={intensity}
        scroll={motionStateRef.current?.scrollProgress ?? scroll}
        mouse={mouse}
        audioReactive={{
          bass: motionStateRef.current?.bassMotion ?? audioData?.bass ?? 0,
          mid: motionStateRef.current?.midMotion ?? audioData?.mid ?? 0,
          high: motionStateRef.current?.highMotion ?? audioData?.high ?? 0,
        }}
        blessingWaveProgress={blessingWaveProgress}
        breathPhase={breathPhase}
        breathStrength={breathStrength}
        rotationSync={pathRotation}
        cameraFOV={cameraFOV}
        parallaxStrength={1.0}
        position={[0, -2.2, -39.8]}
        scale={13.2}
      />
      
      {/* Celestial Crest v2 (E70 - AFTER CelestialCrownV2, BEFORE PathToSource) */}
      <CelestialCrestV2
        intensity={intensity}
        scroll={motionStateRef.current?.scrollProgress ?? scroll}
        mouse={mouse}
        audioReactive={{
          bass: motionStateRef.current?.bassMotion ?? audioData?.bass ?? 0,
          mid: motionStateRef.current?.midMotion ?? audioData?.mid ?? 0,
          high: motionStateRef.current?.highMotion ?? audioData?.high ?? 0,
        }}
        blessingWaveProgress={blessingWaveProgress}
        breathPhase={breathPhase}
        breathStrength={breathStrength}
        rotationSync={pathRotation}
        cameraFOV={cameraFOV}
        parallaxStrength={1.0}
        position={[0, -2.4, -42.6]}
        scale={14.8}
      />
      
      {/* Astral Thread v2 (E58 - AFTER PathIndicatorV2, BEFORE DharmaWheel) */}
      <AstralThreadV2
        intensity={intensity}
        scroll={motionStateRef.current?.scrollProgress ?? scroll}
        mouse={mouse}
        audioReactive={{
          bass: motionStateRef.current?.bassMotion ?? audioData?.bass ?? 0,
          mid: motionStateRef.current?.midMotion ?? audioData?.mid ?? 0,
          high: motionStateRef.current?.highMotion ?? audioData?.high ?? 0,
        }}
        blessingWaveProgress={blessingWaveProgress}
        breathPhase={breathPhase}
        breathStrength={breathStrength}
        rotationSync={pathRotation}
        cameraFOV={cameraFOV}
        parallaxStrength={1.0}
        position={[0, 0.1, -6.4]}
        scale={2.8}
      />
      
      {/* Soul Mirror (E30 - AFTER KarmicThread, BEFORE PathIndicator) */}
      <SoulMirror
        intensity={intensity}
        scroll={motionStateRef.current?.scrollProgress ?? scroll}
        mouse={mouse}
        audioReactive={{
          bass: motionStateRef.current?.bassMotion ?? audioData?.bass ?? 0,
          mid: motionStateRef.current?.midMotion ?? audioData?.mid ?? 0,
          high: motionStateRef.current?.highMotion ?? audioData?.high ?? 0,
        }}
        blessingWaveProgress={blessingWaveProgress}
        breathPhase={breathPhase}
        breathStrength={breathStrength}
        rotationSync={pathRotation}
        cameraFOV={cameraFOV}
        parallaxStrength={1.0}
        position={[0, 1.2, -2.2]}
        scale={1.2}
        numEchoRings={isMobile ? 2 : 4}
        numGlyphs={isMobile ? 6 : 9}
      />
      
      {/* Divine Compass (E31 - AFTER SoulMirror, BEFORE PathIndicator) */}
      <DivineCompass
        intensity={intensity}
        scroll={motionStateRef.current?.scrollProgress ?? scroll}
        mouse={mouse}
        audioReactive={{
          bass: motionStateRef.current?.bassMotion ?? audioData?.bass ?? 0,
          mid: motionStateRef.current?.midMotion ?? audioData?.mid ?? 0,
          high: motionStateRef.current?.highMotion ?? audioData?.high ?? 0,
        }}
        blessingWaveProgress={blessingWaveProgress}
        breathPhase={breathPhase}
        breathStrength={breathStrength}
        rotationSync={pathRotation}
        cameraFOV={cameraFOV}
        parallaxStrength={1.0}
        position={[0, 1.6, -2.4]}
        scale={1.0}
      />
      
      {/* Astral Trail (E32 - AFTER DivineCompass, BEFORE PathIndicator) */}
      <AstralTrail
        intensity={intensity}
        scroll={motionStateRef.current?.scrollProgress ?? scroll}
        mouse={mouse}
        audioReactive={{
          bass: motionStateRef.current?.bassMotion ?? audioData?.bass ?? 0,
          mid: motionStateRef.current?.midMotion ?? audioData?.mid ?? 0,
          high: motionStateRef.current?.highMotion ?? audioData?.high ?? 0,
        }}
        blessingWaveProgress={blessingWaveProgress}
        breathPhase={breathPhase}
        breathStrength={breathStrength}
        rotationSync={pathRotation}
        cameraFOV={cameraFOV}
        parallaxStrength={1.0}
        position={[0, 0.5, -2.0]}
        scale={1.0}
      />
      
      {/* Astral Veil (E33 - AFTER AstralTrail, BEFORE PathIndicator) */}
      <AstralVeil
        intensity={intensity}
        scroll={motionStateRef.current?.scrollProgress ?? scroll}
        mouse={mouse}
        audioReactive={{
          bass: motionStateRef.current?.bassMotion ?? audioData?.bass ?? 0,
          mid: motionStateRef.current?.midMotion ?? audioData?.mid ?? 0,
          high: motionStateRef.current?.highMotion ?? audioData?.high ?? 0,
        }}
        blessingWaveProgress={blessingWaveProgress}
        breathPhase={breathPhase}
        breathStrength={breathStrength}
        rotationSync={pathRotation}
        cameraFOV={cameraFOV}
        parallaxStrength={1.0}
        position={[0, 0.6, -2.2]}
        scale={1.2}
      />
      
      {/* Fate Ripple (E34 - AFTER AstralVeil, BEFORE PathIndicator) */}
      <FateRipple
        intensity={intensity}
        scroll={motionStateRef.current?.scrollProgress ?? scroll}
        mouse={mouse}
        audioReactive={{
          bass: motionStateRef.current?.bassMotion ?? audioData?.bass ?? 0,
          mid: motionStateRef.current?.midMotion ?? audioData?.mid ?? 0,
          high: motionStateRef.current?.highMotion ?? audioData?.high ?? 0,
        }}
        blessingWaveProgress={blessingWaveProgress}
        breathPhase={breathPhase}
        breathStrength={breathStrength}
        rotationSync={pathRotation}
        cameraFOV={cameraFOV}
        parallaxStrength={1.0}
        position={[0, 0.3, -2.5]}
        scale={1.0}
      />
      
      {/* Soul Star (E35 - AFTER FateRipple, BEFORE PathIndicator) */}
      <SoulStar
        intensity={intensity}
        scroll={motionStateRef.current?.scrollProgress ?? scroll}
        mouse={mouse}
        audioReactive={{
          bass: motionStateRef.current?.bassMotion ?? audioData?.bass ?? 0,
          mid: motionStateRef.current?.midMotion ?? audioData?.mid ?? 0,
          high: motionStateRef.current?.highMotion ?? audioData?.high ?? 0,
        }}
        blessingWaveProgress={blessingWaveProgress}
        breathPhase={breathPhase}
        breathStrength={breathStrength}
        rotationSync={pathRotation}
        cameraFOV={cameraFOV}
        parallaxStrength={1.0}
        position={[0, 1.0, -2.8]}
        scale={1.2}
      />
      
      {/* Celestial Gate v2 (E66 - Replaced old CelestialGate) */}
      {/* Note: Main CelestialGateV2 is now positioned after AscensionLatticeV2 */}
      
      {/* Astral Lotus (E37 - AFTER CelestialGate, BEFORE PathIndicator) */}
      <AstralLotus
        intensity={intensity}
        scroll={motionStateRef.current?.scrollProgress ?? scroll}
        mouse={mouse}
        audioReactive={{
          bass: motionStateRef.current?.bassMotion ?? audioData?.bass ?? 0,
          mid: motionStateRef.current?.midMotion ?? audioData?.mid ?? 0,
          high: motionStateRef.current?.highMotion ?? audioData?.high ?? 0,
        }}
        blessingWaveProgress={blessingWaveProgress}
        breathPhase={breathPhase}
        breathStrength={breathStrength}
        rotationSync={pathRotation}
        cameraFOV={cameraFOV}
        parallaxStrength={1.0}
        position={[0, 0.9, -3.3]}
        scale={1.4}
      />
      
      {/* Astral Mandala (E38 - AFTER AstralLotus, BEFORE PathIndicator) */}
      <AstralMandala
        intensity={intensity}
        scroll={motionStateRef.current?.scrollProgress ?? scroll}
        mouse={mouse}
        audioReactive={{
          bass: motionStateRef.current?.bassMotion ?? audioData?.bass ?? 0,
          mid: motionStateRef.current?.midMotion ?? audioData?.mid ?? 0,
          high: motionStateRef.current?.highMotion ?? audioData?.high ?? 0,
        }}
        blessingWaveProgress={blessingWaveProgress}
        breathPhase={breathPhase}
        breathStrength={breathStrength}
        rotationSync={pathRotation + interactionState.mandalaRotation}
        cameraFOV={cameraFOV}
        parallaxStrength={1.0}
        position={[0, 0.7, -3.6]}
        scale={1.5 * interactionState.mandalaScale * (1.0 + blessingWaveProgress * 0.2)}
      />
      
      {/* Chakra Pulse (E39 - AFTER AstralMandala, BEFORE PathIndicator) */}
      <ChakraPulse
        intensity={intensity}
        scroll={motionStateRef.current?.scrollProgress ?? scroll}
        mouse={mouse}
        audioReactive={{
          bass: motionStateRef.current?.bassMotion ?? audioData?.bass ?? 0,
          mid: motionStateRef.current?.midMotion ?? audioData?.mid ?? 0,
          high: motionStateRef.current?.highMotion ?? audioData?.high ?? 0,
        }}
        blessingWaveProgress={blessingWaveProgress}
        breathPhase={breathPhase}
        breathStrength={breathStrength}
        rotationSync={pathRotation}
        cameraFOV={cameraFOV}
        parallaxStrength={1.0}
        position={[0, 0.0, -3.9]}
        scale={1.4}
      />
      
      {/* Karma Wheel (E40 - AFTER ChakraPulse, BEFORE PathIndicator) */}
      <KarmaWheel
        intensity={intensity}
        scroll={motionStateRef.current?.scrollProgress ?? scroll}
        mouse={mouse}
        audioReactive={{
          bass: motionStateRef.current?.bassMotion ?? audioData?.bass ?? 0,
          mid: motionStateRef.current?.midMotion ?? audioData?.mid ?? 0,
          high: motionStateRef.current?.highMotion ?? audioData?.high ?? 0,
        }}
        blessingWaveProgress={blessingWaveProgress}
        breathPhase={breathPhase}
        breathStrength={breathStrength}
        rotationSync={pathRotation}
        cameraFOV={cameraFOV}
        parallaxStrength={1.0}
        position={[0, 0.0, -4.2]}
        scale={1.5}
      />
      
      {/* Cosmic Orbit (E41 - AFTER KarmaWheel, BEFORE PathIndicator) */}
      <CosmicOrbit
        intensity={intensity}
        scroll={motionStateRef.current?.scrollProgress ?? scroll}
        mouse={mouse}
        audioReactive={{
          bass: motionStateRef.current?.bassMotion ?? audioData?.bass ?? 0,
          mid: motionStateRef.current?.midMotion ?? audioData?.mid ?? 0,
          high: motionStateRef.current?.highMotion ?? audioData?.high ?? 0,
        }}
        blessingWaveProgress={blessingWaveProgress}
        breathPhase={breathPhase}
        breathStrength={breathStrength}
        rotationSync={pathRotation}
        cameraFOV={cameraFOV}
        parallaxStrength={1.0}
        position={[0, 0.0, -4.6]}
        scale={1.6}
      />
      
      {/* Celestial Ribbon (E42 - AFTER CosmicOrbit, BEFORE PathIndicator) */}
      <CelestialRibbon
        intensity={intensity}
        scroll={motionStateRef.current?.scrollProgress ?? scroll}
        mouse={mouse}
        audioReactive={{
          bass: motionStateRef.current?.bassMotion ?? audioData?.bass ?? 0,
          mid: motionStateRef.current?.midMotion ?? audioData?.mid ?? 0,
          high: motionStateRef.current?.highMotion ?? audioData?.high ?? 0,
        }}
        blessingWaveProgress={blessingWaveProgress}
        breathPhase={breathPhase}
        breathStrength={breathStrength}
        rotationSync={pathRotation}
        cameraFOV={cameraFOV}
        parallaxStrength={1.0}
        position={[0, 0.0, -5.0]}
        scale={1.7}
      />
      
      {/* Astral Bloom (E43 - AFTER CelestialRibbon, BEFORE PathIndicator) */}
      <AstralBloom
        intensity={intensity}
        scroll={motionStateRef.current?.scrollProgress ?? scroll}
        mouse={mouse}
        audioReactive={{
          bass: motionStateRef.current?.bassMotion ?? audioData?.bass ?? 0,
          mid: motionStateRef.current?.midMotion ?? audioData?.mid ?? 0,
          high: motionStateRef.current?.highMotion ?? audioData?.high ?? 0,
        }}
        blessingWaveProgress={blessingWaveProgress}
        breathPhase={breathPhase}
        breathStrength={breathStrength}
        rotationSync={pathRotation}
        cameraFOV={cameraFOV}
        parallaxStrength={1.0}
        position={[0, 0.0, -5.4]}
        scale={1.8}
      />
      
      {/* StarFall (E44 - AFTER AstralBloom, BEFORE PathIndicator) */}
      <StarFall
        intensity={intensity}
        scroll={motionStateRef.current?.scrollProgress ?? scroll}
        mouse={mouse}
        audioReactive={{
          bass: motionStateRef.current?.bassMotion ?? audioData?.bass ?? 0,
          mid: motionStateRef.current?.midMotion ?? audioData?.mid ?? 0,
          high: motionStateRef.current?.highMotion ?? audioData?.high ?? 0,
        }}
        blessingWaveProgress={blessingWaveProgress}
        breathPhase={breathPhase}
        breathStrength={breathStrength}
        rotationSync={pathRotation}
        cameraFOV={cameraFOV}
        parallaxStrength={1.0}
        position={[0, 0.0, -5.8]}
        scale={1.8}
      />
      
      {/* Dimensional Ripple (E47 - BEFORE CelestialWave, AFTER StarFall) */}
      <DimensionalRipple
        intensity={intensity}
        scroll={motionStateRef.current?.scrollProgress ?? scroll}
        mouse={mouse}
        audioReactive={{
          bass: motionStateRef.current?.bassMotion ?? audioData?.bass ?? 0,
          mid: motionStateRef.current?.midMotion ?? audioData?.mid ?? 0,
          high: motionStateRef.current?.highMotion ?? audioData?.high ?? 0,
        }}
        blessingWaveProgress={blessingWaveProgress}
        breathPhase={breathPhase}
        breathStrength={breathStrength}
        rotationSync={pathRotation}
        cameraFOV={cameraFOV}
        parallaxStrength={1.0}
        position={[0, -0.6, -6.8]}
        scale={2.4}
      />
      
      {/* Aurora Veil (E48 - AFTER DimensionalRipple, BEFORE CelestialWave) */}
      <AuroraVeil
        intensity={intensity}
        scroll={motionStateRef.current?.scrollProgress ?? scroll}
        mouse={mouse}
        audioReactive={{
          bass: motionStateRef.current?.bassMotion ?? audioData?.bass ?? 0,
          mid: motionStateRef.current?.midMotion ?? audioData?.mid ?? 0,
          high: motionStateRef.current?.highMotion ?? audioData?.high ?? 0,
        }}
        blessingWaveProgress={blessingWaveProgress}
        breathPhase={breathPhase}
        breathStrength={breathStrength}
        rotationSync={pathRotation}
        cameraFOV={cameraFOV}
        parallaxStrength={1.0}
        position={[0, 0.4, -6.2]}
        scale={2.3}
      />
      
      {/* Cosmic Drift Field (E49 - AFTER AuroraVeil, BEFORE CelestialWave) */}
      <CosmicDriftField
        intensity={intensity}
        scroll={motionStateRef.current?.scrollProgress ?? scroll}
        mouse={mouse}
        audioReactive={{
          bass: motionStateRef.current?.bassMotion ?? audioData?.bass ?? 0,
          mid: motionStateRef.current?.midMotion ?? audioData?.mid ?? 0,
          high: motionStateRef.current?.highMotion ?? audioData?.high ?? 0,
        }}
        blessingWaveProgress={blessingWaveProgress}
        breathPhase={breathPhase}
        breathStrength={breathStrength}
        rotationSync={pathRotation}
        cameraFOV={cameraFOV}
        parallaxStrength={1.0}
        position={[0, 0.0, -6.5]}
        scale={2.4}
      />
      
      {/* Stellar Wind (E50 - AFTER CosmicDriftField, BEFORE CelestialWave) */}
      <StellarWind
        intensity={intensity}
        scroll={motionStateRef.current?.scrollProgress ?? scroll}
        mouse={mouse}
        audioReactive={{
          bass: motionStateRef.current?.bassMotion ?? audioData?.bass ?? 0,
          mid: motionStateRef.current?.midMotion ?? audioData?.mid ?? 0,
          high: motionStateRef.current?.highMotion ?? audioData?.high ?? 0,
        }}
        blessingWaveProgress={blessingWaveProgress}
        breathPhase={breathPhase}
        breathStrength={breathStrength}
        rotationSync={pathRotation}
        cameraFOV={cameraFOV}
        parallaxStrength={1.0}
        position={[0, 0.2, -6.7]}
        scale={2.4}
      />
      
      {/* Solar Arc (E51 - AFTER StellarWind, BEFORE CelestialWave) */}
      <SolarArc
        intensity={intensity}
        scroll={motionStateRef.current?.scrollProgress ?? scroll}
        mouse={mouse}
        audioReactive={{
          bass: motionStateRef.current?.bassMotion ?? audioData?.bass ?? 0,
          mid: motionStateRef.current?.midMotion ?? audioData?.mid ?? 0,
          high: motionStateRef.current?.highMotion ?? audioData?.high ?? 0,
        }}
        blessingWaveProgress={blessingWaveProgress}
        breathPhase={breathPhase}
        breathStrength={breathStrength}
        rotationSync={pathRotation}
        cameraFOV={cameraFOV}
        parallaxStrength={1.0}
        position={[0, 0.0, -6.9]}
        scale={2.5}
      />
      
      {/* Quantum Halo (E52 - AFTER SolarArc, BEFORE CelestialWave) */}
      <QuantumHalo
        intensity={intensity}
        scroll={motionStateRef.current?.scrollProgress ?? scroll}
        mouse={mouse}
        audioReactive={{
          bass: motionStateRef.current?.bassMotion ?? audioData?.bass ?? 0,
          mid: motionStateRef.current?.midMotion ?? audioData?.mid ?? 0,
          high: motionStateRef.current?.highMotion ?? audioData?.high ?? 0,
        }}
        blessingWaveProgress={blessingWaveProgress}
        breathPhase={breathPhase}
        breathStrength={breathStrength}
        rotationSync={pathRotation}
        cameraFOV={cameraFOV}
        parallaxStrength={1.0}
        position={[0, 0.0, -7.2]}
        scale={2.8}
      />
      
      {/* Cosmic Lens (E53 - AFTER QuantumHalo, BEFORE CelestialWave) */}
      <CosmicLens
        intensity={intensity}
        scroll={motionStateRef.current?.scrollProgress ?? scroll}
        mouse={mouse}
        audioReactive={{
          bass: motionStateRef.current?.bassMotion ?? audioData?.bass ?? 0,
          mid: motionStateRef.current?.midMotion ?? audioData?.mid ?? 0,
          high: motionStateRef.current?.highMotion ?? audioData?.high ?? 0,
        }}
        blessingWaveProgress={blessingWaveProgress}
        breathPhase={breathPhase}
        breathStrength={breathStrength}
        rotationSync={pathRotation}
        cameraFOV={cameraFOV}
        parallaxStrength={1.0}
        position={[0, 0.2, -7.5]}
        scale={3.0}
      />
      
      {/* Cosmic Fracture (E54 - AFTER CosmicLens, BEFORE CelestialWave) */}
      <CosmicFracture
        intensity={intensity}
        scroll={motionStateRef.current?.scrollProgress ?? scroll}
        mouse={mouse}
        audioReactive={{
          bass: motionStateRef.current?.bassMotion ?? audioData?.bass ?? 0,
          mid: motionStateRef.current?.midMotion ?? audioData?.mid ?? 0,
          high: motionStateRef.current?.highMotion ?? audioData?.high ?? 0,
        }}
        blessingWaveProgress={blessingWaveProgress}
        breathPhase={breathPhase}
        breathStrength={breathStrength}
        rotationSync={pathRotation}
        cameraFOV={cameraFOV}
        parallaxStrength={1.0}
        position={[0, 0.1, -7.9]}
        scale={3.2}
      />
      
      {/* Celestial Wave v2 (E55 - AFTER CosmicFracture, BEFORE CelestialHorizon) */}
      <CelestialWaveV2
        intensity={intensity}
        scroll={motionStateRef.current?.scrollProgress ?? scroll}
        mouse={mouse}
        audioReactive={{
          bass: motionStateRef.current?.bassMotion ?? audioData?.bass ?? 0,
          mid: motionStateRef.current?.midMotion ?? audioData?.mid ?? 0,
          high: motionStateRef.current?.highMotion ?? audioData?.high ?? 0,
        }}
        blessingWaveProgress={blessingWaveProgress}
        breathPhase={breathPhase}
        breathStrength={breathStrength}
        rotationSync={pathRotation}
        cameraFOV={cameraFOV}
        parallaxStrength={1.0}
        position={[0, -0.1, -8.2]}
        scale={3.4}
      />
      
      {/* Celestial Horizon v2 (E56 - AFTER CelestialWaveV2, BEFORE PathIndicator) */}
      <CelestialHorizonV2
        intensity={intensity}
        scroll={motionStateRef.current?.scrollProgress ?? scroll}
        mouse={mouse}
        audioReactive={{
          bass: motionStateRef.current?.bassMotion ?? audioData?.bass ?? 0,
          mid: motionStateRef.current?.midMotion ?? audioData?.mid ?? 0,
          high: motionStateRef.current?.highMotion ?? audioData?.high ?? 0,
        }}
        blessingWaveProgress={blessingWaveProgress}
        breathPhase={breathPhase}
        breathStrength={breathStrength}
        rotationSync={pathRotation}
        cameraFOV={cameraFOV}
        parallaxStrength={1.0}
        position={[0, -1.2, -9.0]}
        scale={3.8}
      />
      
      {/* Path Indicator v2 (E57 - AFTER CelestialHorizonV2, BEFORE remaining engines) */}
      <PathIndicatorV2
        intensity={intensity}
        scroll={motionStateRef.current?.scrollProgress ?? scroll}
        mouse={mouse}
        audioReactive={{
          bass: motionStateRef.current?.bassMotion ?? audioData?.bass ?? 0,
          mid: motionStateRef.current?.midMotion ?? audioData?.mid ?? 0,
          high: motionStateRef.current?.highMotion ?? audioData?.high ?? 0,
        }}
        blessingWaveProgress={blessingWaveProgress}
        breathPhase={breathPhase}
        breathStrength={breathStrength}
        rotationSync={pathRotation}
        cameraFOV={cameraFOV}
        parallaxStrength={1.0}
        position={[0, -0.2, -10.0]}
        scale={4.0}
      />
      
      {/* Blessing Wave (E16 - AFTER GuruEnergy, BEFORE Divine Orb) */}
      <BlessingWave
        intensity={intensity}
        scroll={motionStateRef.current?.scrollProgress ?? scroll}
        mouse={mouse}
        audioReactive={{
          bass: motionStateRef.current?.bassMotion ?? audioData?.bass ?? 0,
          mid: motionStateRef.current?.midMotion ?? audioData?.mid ?? 0,
          high: motionStateRef.current?.highMotion ?? audioData?.high ?? 0,
        }}
        parallaxStrength={1.0}
        position={[0, 0, -1.7]}
        waveTrigger={(triggerFn) => {
          blessingWaveTriggerRef.current = triggerFn;
        }}
        onWaveProgressChange={(progress) => {
          // Update blessing wave progress for camera
          setBlessingWaveProgress(progress);
          setIsBlessingWaveActive(progress > 0);
          
          // Feed wave progress to bloom engine (E12)
          // Bloom intensity can be boosted by wave progress
          // This will be handled by the parent component or bloom engine
        }}
      />
      
      {/* Orb of Divine Consciousness (E10 - above DivineAlignmentGrid but below ParticleUniverse) */}
      <DivineOrb
        intensity={intensity}
        scroll={motionStateRef.current?.scrollProgress ?? scroll}
        mouse={mouse}
        audioReactive={{
          bass: motionStateRef.current?.bassMotion ?? audioData?.bass ?? 0,
          mid: motionStateRef.current?.midMotion ?? audioData?.mid ?? 0,
          high: motionStateRef.current?.highMotion ?? audioData?.high ?? 0,
        }}
        parallaxStrength={1.0}
        position={[0, 0, -1.5]}
      />
      
      {/* Celestial Light Shafts (E11 - above DivineOrb but below ParticleUniverse) */}
      <LightShafts
        intensity={intensity}
        scroll={scroll}
        mouse={mouse}
        audioReactive={audioReactive}
        parallaxStrength={1.0}
      />
      
      {/* Particle Universe Engine (4-layer system) */}
      <ParticleUniverse
        mouse={mouse}
        scroll={scroll}
        audioReactive={audioReactive}
        intensity={intensity}
        parallaxStrength={1.0}
        gravityStrength={0.6}
        orbitSpeed={1.0}
      />
      
      {/* Additional ambient stars (drei Stars component for depth) */}
      <Stars
        radius={15}
        depth={50}
        count={1000}
        factor={2}
        saturation={0.5}
        fade
        speed={0.2}
      />
    </group>
    
    {/* Post-Processing Chain (Phase 3 - F12: CosmicMotionBlur → F2: CosmicDepth → F3: CosmicChromatic → F4: CosmicGlare → F5: CosmicVignette → F7: CosmicLensFlare → F6: CosmicFilmGrain → F9: CosmicGrainOverlay → F10: CosmicStarlight → F8: CosmicHalation → F1: CosmicBloom → F11: CosmicBloomBoost → F13: CosmicColorGrade → F14: CosmicGodRays → F15: FinalComposite → ToneMapping) */}
    <EffectComposer>
      {/* Cosmic MotionBlur v1 (F12 - MOTION BLUR FIRST) */}
      <CosmicMotionBlurEffect
        blurStrength={transitionState.motionBlurSmear}
        radialStrength={0.3}
        velocityFactor={1.0}
        sampleCount={16.0}
        audioReactive={{
          bass: motionStateRef.current?.bassMotion ?? audioReactive?.bass ?? 0,
          mid: motionStateRef.current?.midMotion ?? audioReactive?.mid ?? 0,
          high: motionStateRef.current?.highMotion ?? audioReactive?.high ?? 0,
        }}
        scrollVelocity={{ x: 0, y: scrollVelocity * 0.01 }}
        mouseVelocity={{ x: mouseMotion.deltaX * 0.01, y: mouseMotion.deltaY * 0.01 }}
        blessingWaveProgress={blessingWaveProgress}
        cameraFOV={cameraFOV}
        isMobile={isMobile}
      />
      
      {/* Cosmic Depth v1 (F2 - AFTER CosmicMotionBlur) */}
      <CosmicDepthEffect
        focusDistance={5.0}
        aperture={0.1}
        blurIntensity={1.0}
        nearBlur={1.0}
        farBlur={1.0}
        audioReactive={{
          bass: motionStateRef.current?.bassMotion ?? audioReactive?.bass ?? 0,
          mid: motionStateRef.current?.midMotion ?? audioReactive?.mid ?? 0,
          high: motionStateRef.current?.highMotion ?? audioReactive?.high ?? 0,
        }}
        blessingWaveProgress={blessingWaveProgress}
        cameraFOV={cameraFOV}
        cameraNear={0.1}
        cameraFar={1000.0}
        isMobile={isMobile}
      />
      
      {/* Cosmic Chromatic v1 (F3 - AFTER CosmicDepth, BEFORE CosmicGlare) */}
      <CosmicChromaticEffect
        intensity={0.02}
        prismStrength={1.0}
        warpStrength={0.1}
        audioReactive={{
          bass: motionStateRef.current?.bassMotion ?? audioReactive?.bass ?? 0,
          mid: motionStateRef.current?.midMotion ?? audioReactive?.mid ?? 0,
          high: motionStateRef.current?.highMotion ?? audioReactive?.high ?? 0,
        }}
        blessingWaveProgress={blessingWaveProgress}
        cameraFOV={cameraFOV}
        globalMotion={[
          (mouse.x - 0.5) * 0.1,
          (mouse.y - 0.5) * 0.1,
        ]}
        isMobile={isMobile}
      />
      
      {/* Cosmic Glare v1 (F4 - AFTER CosmicChromatic, BEFORE CosmicVignette) */}
      <CosmicGlareEffect
        intensity={1.0}
        streakLength={0.5}
        starStrength={1.0}
        audioReactive={{
          bass: motionStateRef.current?.bassMotion ?? audioReactive?.bass ?? 0,
          mid: motionStateRef.current?.midMotion ?? audioReactive?.mid ?? 0,
          high: motionStateRef.current?.highMotion ?? audioReactive?.high ?? 0,
        }}
        blessingWaveProgress={blessingWaveProgress}
        cameraFOV={cameraFOV}
        isMobile={isMobile}
      />
      
      {/* Cosmic Vignette v1 (F5 - AFTER CosmicGlare, BEFORE CosmicLensFlare) */}
      <CosmicVignetteEffect
        intensity={1.0}
        radius={0.75}
        tintStrength={0.1}
        audioReactive={{
          bass: motionStateRef.current?.bassMotion ?? audioReactive?.bass ?? 0,
          mid: motionStateRef.current?.midMotion ?? audioReactive?.mid ?? 0,
          high: motionStateRef.current?.highMotion ?? audioReactive?.high ?? 0,
        }}
        blessingWaveProgress={blessingWaveProgress}
        cameraFOV={cameraFOV}
        isMobile={isMobile}
      />
      
      {/* Cosmic LensFlare v1 (F7 - AFTER CosmicVignette, BEFORE CosmicFilmGrain) */}
      <CosmicLensFlareEffect
        intensity={1.0}
        flareIntensity={0.3}
        ghostIntensity={0.2}
        chromaStrength={0.15}
        streakLength={0.5}
        audioReactive={{
          bass: motionStateRef.current?.bassMotion ?? audioReactive?.bass ?? 0,
          mid: motionStateRef.current?.midMotion ?? audioReactive?.mid ?? 0,
          high: motionStateRef.current?.highMotion ?? audioReactive?.high ?? 0,
        }}
        blessingWaveProgress={blessingWaveProgress}
        cameraFOV={cameraFOV}
        flareCenter={[0.5, 0.5]}
        isMobile={isMobile}
      />
      
      {/* Cosmic FilmGrain v1 (F6 - AFTER CosmicLensFlare, BEFORE CosmicGrainOverlay) */}
      <CosmicFilmGrainEffect
        intensity={1.0}
        grainIntensity={transitionState.filmGrainIntensity + mouseVelocity * 0.001}
        chromaIntensity={0.1}
        flickerStrength={0.05 + scrollVelocity * 0.0001}
        audioReactive={{
          bass: motionStateRef.current?.bassMotion ?? audioReactive?.bass ?? 0,
          mid: motionStateRef.current?.midMotion ?? audioReactive?.mid ?? 0,
          high: motionStateRef.current?.highMotion ?? audioReactive?.high ?? 0,
        }}
        blessingWaveProgress={blessingWaveProgress}
        cameraFOV={cameraFOV}
        isMobile={isMobile}
      />
      
      {/* Cosmic GrainOverlay v1 (F9 - AFTER CosmicFilmGrain, BEFORE CosmicStarlight) */}
      <CosmicGrainOverlayEffect
        intensity={1.0}
        overlayIntensity={0.08}
        dustDensity={0.5}
        shimmerStrength={0.1}
        audioReactive={{
          bass: motionStateRef.current?.bassMotion ?? audioReactive?.bass ?? 0,
          mid: motionStateRef.current?.midMotion ?? audioReactive?.mid ?? 0,
          high: motionStateRef.current?.highMotion ?? audioReactive?.high ?? 0,
        }}
        blessingWaveProgress={blessingWaveProgress}
        cameraFOV={cameraFOV}
        isMobile={isMobile}
      />
      
      {/* Cosmic Starlight v1 (F10 - AFTER CosmicGrainOverlay, BEFORE CosmicHalation) */}
      <CosmicStarlightEffect
        starIntensity={0.3}
        twinkleStrength={0.5}
        layerDensity={1.0}
        audioReactive={{
          bass: motionStateRef.current?.bassMotion ?? audioReactive?.bass ?? 0,
          mid: motionStateRef.current?.midMotion ?? audioReactive?.mid ?? 0,
          high: motionStateRef.current?.highMotion ?? audioReactive?.high ?? 0,
        }}
        blessingWaveProgress={blessingWaveProgress}
        mousePosition={mouse}
        cameraFOV={cameraFOV}
        isMobile={isMobile}
      />
      
      {/* Cosmic Halation v1 (F8 - AFTER CosmicStarlight, BEFORE CosmicBloom) */}
      <CosmicHalationEffect
        intensity={1.0}
        halationIntensity={0.2}
        radius={0.3}
        tintStrength={0.15}
        audioReactive={{
          bass: motionStateRef.current?.bassMotion ?? audioReactive?.bass ?? 0,
          mid: motionStateRef.current?.midMotion ?? audioReactive?.mid ?? 0,
          high: motionStateRef.current?.highMotion ?? audioReactive?.high ?? 0,
        }}
        blessingWaveProgress={blessingWaveProgress}
        cameraFOV={cameraFOV}
        isMobile={isMobile}
      />
      
      {/* Cosmic Bloom v1 (F1 - AFTER CosmicHalation, BEFORE CosmicBloomBoost) */}
      <CosmicBloomEffect
        threshold={0.85}
        intensity={1.0}
        audioReactive={{
          bass: motionStateRef.current?.bassMotion ?? audioReactive?.bass ?? 0,
          mid: motionStateRef.current?.midMotion ?? audioReactive?.mid ?? 0,
          high: motionStateRef.current?.highMotion ?? audioReactive?.high ?? 0,
        }}
        blessingWaveProgress={blessingWaveProgress}
        cameraFOV={cameraFOV}
      />
      
      {/* Cosmic BloomBoost v1 (F11 - AFTER CosmicBloom, BEFORE CosmicColorGrade) */}
      <CosmicBloomBoostEffect
        boostIntensity={0.4}
        boostRadius={0.2}
        threshold={0.95}
        audioReactive={{
          bass: motionStateRef.current?.bassMotion ?? audioReactive?.bass ?? 0,
          mid: motionStateRef.current?.midMotion ?? audioReactive?.mid ?? 0,
          high: motionStateRef.current?.highMotion ?? audioReactive?.high ?? 0,
        }}
        blessingWaveProgress={blessingWaveProgress}
        cameraFOV={cameraFOV}
        isMobile={isMobile}
      />
      
      {/* Cosmic ColorGrade v1 (F13 - AFTER CosmicBloomBoost, BEFORE CosmicGodRays) */}
      <CosmicColorGradeEffect
        lutStrength={0.3}
        temperature={0.0}
        tint={0.0}
        contrast={1.0}
        gamma={1.0}
        saturation={1.0}
        vibrance={1.0}
        fade={0.0}
        rolloff={0.5}
        audioReactive={{
          bass: motionStateRef.current?.bassMotion ?? audioReactive?.bass ?? 0,
          mid: motionStateRef.current?.midMotion ?? audioReactive?.mid ?? 0,
          high: motionStateRef.current?.highMotion ?? audioReactive?.high ?? 0,
        }}
        blessingWaveProgress={blessingWaveProgress}
        cameraFOV={cameraFOV}
        isMobile={isMobile}
      />
      
      {/* Cosmic GodRays v1 (F14 - AFTER CosmicColorGrade, BEFORE FinalComposite) */}
      <CosmicGodRaysEffect
        sunPos={{ x: 0.5, y: 0.3 }}
        lightDir={{ x: 0.0, y: -1.0, z: 0.0 }}
        intensity={0.5}
        scatteringStrength={0.3}
        stepCount={24.0}
        parallaxStrength={0.1}
        audioReactive={{
          bass: motionStateRef.current?.bassMotion ?? audioReactive?.bass ?? 0,
          mid: motionStateRef.current?.midMotion ?? audioReactive?.mid ?? 0,
          high: motionStateRef.current?.highMotion ?? audioReactive?.high ?? 0,
        }}
        blessingWaveProgress={blessingWaveProgress}
        cameraFOV={cameraFOV}
        depthBuffer={null} // Will be provided by EffectComposer when depth is enabled
        mouse={mouse}
        isMobile={isMobile}
      />
      
      {/* Final Composite v1 (F15 - AFTER CosmicGodRays, BEFORE ToneMapping) */}
      <FinalCompositeEffect
        intensity={1.0}
        exposure={1.0}
        globalFade={1.0} // Gate fade: fade-in/out driven by globalProgress (default: 1.0 = no fade)
        vibrance={1.0}
        highlightRepair={0.5}
        ditherStrength={0.5}
        lift={0.0}
        gamma={1.0}
        gain={1.0}
        audioReactive={{
          bass: motionStateRef.current?.bassMotion ?? audioReactive?.bass ?? 0,
          mid: motionStateRef.current?.midMotion ?? audioReactive?.mid ?? 0,
          high: motionStateRef.current?.highMotion ?? audioReactive?.high ?? 0,
        }}
        blessingWaveProgress={blessingWaveProgress}
        cameraFOV={cameraFOV}
        isMobile={isMobile}
      />
      
      {/* HDR Tone Mapping (ACES) - AFTER FinalComposite */}
      <ToneMapping
        mode={ToneMappingMode.ACES_FILMIC}
        resolution={256}
        whitePoint={4.0}
        middleGrey={0.6}
        minLuminance={0.01}
        averageLuminance={1.0}
        adaptationRate={2.0}
      />
    </EffectComposer>
    </>
  );
};
