/**
 * StarFall Vertex Shader
 * 
 * Phase 2 — Section 40: STARFALL ENGINE
 * StarFall Engine (E44)
 * 
 * Meteoric light streaks, falling spark particles, impact glow bursts, breath pulse, scroll acceleration, bass jitter, high shimmer, cameraFOV
 */

export const starfallVertexShader = `
precision mediump float;

attribute vec3 position;
attribute vec2 uv;
attribute float streakIndex;
attribute float sparkIndex;
attribute float glowIndex;

uniform float uTime;
uniform float uBreathPhase;
uniform float uBreathStrength;
uniform float uScroll;
uniform float uBass;
uniform float uMid;
uniform float uHigh;
uniform vec2 uMouse;
uniform float uIntensity;
uniform float uParallaxStrength;
uniform float uRotationSync; // From Projection (E17)
uniform float uCameraFOV;
uniform float uBlessingWaveProgress;

varying vec2 vUv;
varying vec3 vPosition;
varying float vStreakIndex;
varying float vSparkIndex;
varying float vGlowIndex;
varying float vDistance;
varying float vRadialDistance;
varying float vStreakProgress;

// Noise functions
float hash(float n) {
  return fract(sin(n) * 43758.5453123);
}

float hash2(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

float noise2(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  float a = hash2(i);
  float b = hash2(i + vec2(1.0, 0.0));
  float c = hash2(i + vec2(0.0, 1.0));
  float d = hash2(i + vec2(1.0, 1.0));
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
}

float fbm(vec2 p) {
  float value = 0.0;
  float amplitude = 0.5;
  for (int i = 0; i < 3; i++) {
    value += amplitude * noise2(p);
    p *= 2.0;
    amplitude *= 0.5;
  }
  return value;
}

void main() {
  vUv = uv;
  vStreakIndex = streakIndex;
  vSparkIndex = sparkIndex;
  vGlowIndex = glowIndex;
  
  vec3 pos = position;
  
  // ============================================
  // LAYER A: METEORIC LIGHT STREAKS
  // ============================================
  if (streakIndex >= 0.0) {
    // 40-80 long streaks (mobile: 30)
    // Fall direction: negative Y with slight Z drift
    
    // Streak length: 0.25 → 0.55
    float baseLength = 0.25;
    float maxLength = 0.55;
    
    // Breath → streak-length pulse
    float breathPulse = 1.0 + uBreathStrength * 0.15;
    float streakLength = baseLength + (maxLength - baseLength) * breathPulse;
    
    // Scroll → fall acceleration
    float scrollAccel = 1.0 + uScroll * 0.3;
    
    // Loop streak position via mod()
    float fallSpeed = 0.5 * scrollAccel;
    float streakY = mod(uTime * fallSpeed + streakIndex * 0.1, 2.0) - 1.0; // -1 to 1 range
    
    // Bass → streak jitter wobble
    float bassJitter = sin(uTime * 3.0 + streakIndex * 2.0) * uBass * 0.02;
    float streakX = (streakIndex / 80.0) * 2.0 - 1.0 + bassJitter; // Spread across X
    
    // Slight Z drift
    float zDrift = sin(uTime * 0.5 + streakIndex * 0.3) * 0.1;
    
    // Streak thickness: 0.015
    float streakThickness = 0.015;
    float thicknessOffset = (uv.y - 0.5) * streakLength; // Extrude along Y
    
    // Direction vector: negative Y with slight Z
    vec3 direction = normalize(vec3(0.0, -1.0, zDrift));
    vec3 perpendicular = vec3(1.0, 0.0, 0.0) * streakThickness;
    
    pos = vec3(streakX, streakY, -5.8 + zDrift) + direction * thicknessOffset + perpendicular * (uv.x - 0.5) * streakThickness;
    vStreakProgress = (streakY + 1.0) / 2.0; // 0-1 progress
  }
  
  // ============================================
  // LAYER B: FALLING SPARK PARTICLES
  // ============================================
  if (sparkIndex >= 0.0) {
    // 80-150 small sparks (mobile: 60)
    // Independent downward velocity
    
    // Breath → velocity modulation
    float breathVel = 1.0 + uBreathStrength * 0.2;
    
    // Scroll → drag multiplier
    float scrollDrag = 1.0 + uScroll * 0.4;
    
    // Downward velocity: baseSpeed + scrollSpeed
    float baseSpeed = 0.4;
    float fallSpeed = baseSpeed * breathVel * scrollDrag;
    
    // Loop on Y
    float sparkY = mod(uTime * fallSpeed + sparkIndex * 0.05, 2.0) - 1.0;
    
    // Bass → flicker on X
    float bassFlicker = sin(uTime * 5.0 + sparkIndex * 3.0) * uBass * 0.02;
    float sparkX = (sparkIndex / 150.0) * 2.0 - 1.0 + bassFlicker;
    
    // Slight Z drift
    float zDrift = sin(uTime * 0.3 + sparkIndex * 0.2) * 0.05;
    
    // Radius: 0.01-0.02
    float sparkRadius = 0.015;
    
    pos = vec3(sparkX, sparkY, -5.8 + zDrift);
    pos *= sparkRadius;
  }
  
  // ============================================
  // LAYER C: IMPACT GLOW BURSTS
  // ============================================
  if (glowIndex >= 0.0) {
    // When streaks loop (reach bottom), emit radial glow at bottom Y-plane
    // Glow radius: 0.08-0.16
    
    // Breath → Glow radius pulse
    float breathPulse = 1.0 + uBreathStrength * 0.1;
    float baseGlowRadius = 0.08;
    float maxGlowRadius = 0.16;
    float glowRadius = baseGlowRadius + (maxGlowRadius - baseGlowRadius) * breathPulse;
    
    // Emit burst when streak loops
    float glowTrigger = mod(uTime * 0.3 + glowIndex * 0.5, 2.0);
    float glowIntensity = 1.0 - smoothstep(0.0, 0.3, glowTrigger); // Fade out after 0.3s
    
    // Position at bottom Y-plane
    float glowX = (glowIndex / 20.0) * 2.0 - 1.0; // Spread across X
    float glowY = -1.0; // Bottom plane
    
    // Use polar billboard quads
    vec2 center = vec2(0.5, 0.5);
    vec2 toCenter = uv - center;
    float dist = length(toCenter);
    float angle = atan(toCenter.y, toCenter.x);
    
    float x = cos(angle) * dist * glowRadius;
    float y = sin(angle) * dist * glowRadius;
    
    pos = vec3(glowX + x, glowY + y, -5.8);
    pos *= glowIntensity; // Scale by intensity
  }
  
  // ============================================
  // CAMERA FOV → PARALLAX WARP INTENSITY
  // ============================================
  float fovFactor = uCameraFOV / 75.0;
  pos.xy *= 1.0 + (fovFactor - 1.0) * 0.05;
  
  // ============================================
  // PARALLAX WOBBLE
  // ============================================
  float wobbleX = sin(uTime * 0.2) * uMouse.x * 0.01;
  float wobbleY = cos(uTime * 0.2) * uMouse.y * 0.01;
  pos.xy += vec2(wobbleX, wobbleY) * uParallaxStrength;
  
  vPosition = pos;
  vDistance = length(pos);
  vRadialDistance = length(pos.xz);
  
  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}
`;

