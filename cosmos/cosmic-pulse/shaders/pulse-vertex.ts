/**
 * Cosmic Pulse Field Vertex Shader
 * 
 * Phase 2 — Section 5: KUNDALINI ENERGY WAVE SYSTEM
 * Cosmic Pulse Field Engine (E8)
 * 
 * Creates pulse field with:
 * - Radial pulse rings
 * - Center core pulse
 * - Shockwave ripple layer
 * - Scroll-driven amplitude boost
 * - Mouse-driven parallax warp
 */

export const pulseVertexShader = `
precision mediump float;

attribute vec3 position;
attribute vec2 uv;

uniform float uTime;
uniform float uBass;
uniform float uMid;
uniform float uHigh;
uniform float uScroll;
uniform vec2 uMouse;
uniform float uIntensity;
uniform float uParallaxStrength;
uniform float uLayerType;  // 0: Radial Pulse, 1: Center Core, 2: Shockwave

varying vec2 vUv;
varying vec3 vPosition;
varying float vDistance;
varying float vRadialDistance;
varying float vPulsePhase;
varying float vShockwavePhase;

// Noise functions
float hash(float n) {
  return fract(sin(n) * 43758.5453123);
}

float noise(float x) {
  float i = floor(x);
  float f = fract(x);
  return mix(hash(i), hash(i + 1.0), smoothstep(0.0, 1.0, f));
}

float fbm(float p) {
  float value = 0.0;
  float amplitude = 0.5;
  for (int i = 0; i < 3; i++) {
    value += amplitude * noise(p);
    p *= 2.0;
    amplitude *= 0.5;
  }
  return value;
}

void main() {
  vUv = uv;
  vec3 pos = position;
  
  // ============================================
  // RADIAL DISTANCE (from center)
  // ============================================
  vec2 center = vec2(0.5, 0.5);
  vec2 toCenter = uv - center;
  vRadialDistance = length(toCenter);
  
  // ============================================
  // LAYER 1: RADIAL PULSE RINGS (Slow, Wide Pulses)
  // ============================================
  if (uLayerType < 0.5) {
    // Slow, wide pulses
    float pulseSpeed = 0.8;
    float pulseFrequency = 3.0;
    vPulsePhase = vRadialDistance * pulseFrequency - uTime * pulseSpeed;
    
    // Radial pulse displacement
    float radialPulse = sin(vPulsePhase) * 0.2;
    
    // Mid-reactive radial diffusion
    float diffusion = fbm(vRadialDistance * 2.0 + uTime * 0.3) * uMid * 0.3;
    radialPulse += diffusion;
    
    // Scroll-driven amplitude boost
    float amplitudeBoost = 1.0 + uScroll * 0.5;
    radialPulse *= amplitudeBoost;
    
    // Expand/contract
    pos.xy += normalize(toCenter) * radialPulse;
    pos.z = -3.2;
  }
  
  // ============================================
  // LAYER 2: CENTER CORE PULSE (Fast, Golden Pulse)
  // ============================================
  else if (uLayerType < 1.5) {
    // Fast, golden pulse mechanics
    float corePulseSpeed = 2.5;
    float corePulse = sin(uTime * corePulseSpeed) * 0.5 + 0.5;
    
    // Center-focused pulse
    float centerDist = vRadialDistance;
    float corePulseEffect = exp(-centerDist * 4.0) * corePulse;
    
    // Bass-reactive expansion
    corePulseEffect *= (1.0 + uBass * 0.4);
    
    // Scroll-driven amplitude boost
    float amplitudeBoost = 1.0 + uScroll * 0.3;
    corePulseEffect *= amplitudeBoost;
    
    // Radial expansion
    pos.xy += normalize(toCenter) * corePulseEffect * 0.3;
    pos.z = -3.0;
    
    vPulsePhase = corePulse;
  }
  
  // ============================================
  // LAYER 3: SHOCKWAVE RIPPLE LAYER (Large Ripples on Bass Peaks)
  // ============================================
  else {
    // Shockwave ripples triggered by bass peaks
    float shockwaveSpeed = 3.0;
    float shockwaveFrequency = 5.0;
    
    // Bass-reactive shockwave
    float bassTrigger = step(0.3, uBass);  // Trigger when bass > 0.3
    vShockwavePhase = vRadialDistance * shockwaveFrequency - uTime * shockwaveSpeed;
    
    // Shockwave ripple
    float shockwave = sin(vShockwavePhase) * 0.3;
    shockwave *= bassTrigger;
    shockwave *= uBass;  // Intensity based on bass
    
    // Multiple ripple rings
    float ripple2 = sin(vShockwavePhase * 1.5) * 0.15;
    ripple2 *= bassTrigger * uBass;
    
    float ripple3 = sin(vShockwavePhase * 2.0) * 0.1;
    ripple3 *= bassTrigger * uBass;
    
    float totalShockwave = shockwave + ripple2 + ripple3;
    
    // Scroll-driven amplitude boost
    float amplitudeBoost = 1.0 + uScroll * 0.4;
    totalShockwave *= amplitudeBoost;
    
    // Radial expansion
    pos.xy += normalize(toCenter) * totalShockwave;
    pos.z = -2.8;
  }
  
  // ============================================
  // HIGH-REACTIVE SHIMMER NOISE
  // ============================================
  float shimmer = fbm(pos.xy * 3.0 + uTime * 0.5) * uHigh * 0.1;
  pos.xy += vec2(shimmer);
  
  // ============================================
  // MOUSE-DRIVEN PARALLAX WARP
  // ============================================
  float parallaxX = sin(uTime * 0.3 + pos.x * 0.2) * uMouse.x * 0.05;
  float parallaxY = cos(uTime * 0.3 + pos.y * 0.2) * uMouse.y * 0.05;
  pos.xy += vec2(parallaxX, parallaxY) * uParallaxStrength;
  
  vPosition = pos;
  vDistance = length(pos);
  
  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}
`;

