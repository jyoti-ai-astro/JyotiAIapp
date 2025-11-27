/**
 * Cosmic Pulse Field Fragment Shader
 * 
 * Phase 2 — Section 5: KUNDALINI ENERGY WAVE SYSTEM
 * Cosmic Pulse Field Engine (E8)
 * 
 * Creates pulse field colors with:
 * - Golden pulse rings
 * - Center core glow
 * - Shockwave ripple effects
 * - Bloom mask integration
 * - Smooth blending
 */

export const pulseFragmentShader = `
precision mediump float;

uniform float uTime;
uniform float uIntensity;
uniform float uScroll;
uniform float uBass;
uniform float uMid;
uniform float uHigh;
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
  vec2 uv = vUv;
  float dist = vRadialDistance;
  
  // ============================================
  // LAYER 1: RADIAL PULSE RINGS (Slow, Wide Pulses)
  // ============================================
  if (uLayerType < 0.5) {
    // Golden pulse rings
    vec3 gold1 = vec3(1.0, 0.85, 0.50);
    vec3 gold2 = vec3(1.0, 0.70, 0.30);
    
    // Pulse ring pattern
    float ringPattern = sin(vPulsePhase) * 0.5 + 0.5;
    ringPattern = smoothstep(0.3, 0.7, ringPattern);
    
    // Multiple rings
    float ring1 = smoothstep(0.0, 0.1, abs(dist - 0.3));
    float ring2 = smoothstep(0.0, 0.1, abs(dist - 0.5));
    float ring3 = smoothstep(0.0, 0.1, abs(dist - 0.7));
    
    float totalRings = (ring1 + ring2 + ring3) * ringPattern;
    
    // Mid-reactive radial diffusion (color variation)
    float diffusion = fbm(dist * 3.0 + uTime * 0.2) * uMid * 0.3;
    totalRings += diffusion;
    
    // Color
    vec3 ringColor = mix(gold1, gold2, ringPattern);
    
    // Scroll-driven amplitude boost
    float amplitudeBoost = 1.0 + uScroll * 0.3;
    ringColor *= amplitudeBoost;
    
    // High-reactive shimmer noise
    float shimmer = fbm(uv * 5.0 + uTime * 0.3) * uHigh * 0.2;
    ringColor += vec3(1.0) * shimmer * 0.3;
    
    // Glow falloff
    float glow = 1.0 - smoothstep(0.6, 1.0, dist);
    glow *= totalRings;
    
    vec3 finalColor = ringColor * glow * uIntensity;
    float alpha = glow * 0.5 * uIntensity;
    
    // Bloom mask
    float bloom = smoothstep(0.7, 1.0, glow);
    bloom *= (1.0 + uBass * 0.2);
    alpha += bloom * 0.2;
    
    gl_FragColor = vec4(finalColor, alpha);
    return;
  }
  
  // ============================================
  // LAYER 2: CENTER CORE PULSE (Fast, Golden Pulse)
  // ============================================
  else if (uLayerType < 1.5) {
    // Fast, golden pulse mechanics
    vec3 coreGold1 = vec3(1.0, 0.90, 0.60);
    vec3 coreGold2 = vec3(1.0, 0.75, 0.35);
    
    // Center-focused pulse
    float centerDist = dist;
    float coreGlow = exp(-centerDist * 6.0);
    
    // Pulse animation
    float pulse = vPulsePhase;
    coreGlow *= (0.5 + pulse * 0.5);
    
    // Bass-reactive expansion
    coreGlow *= (1.0 + uBass * 0.5);
    
    // Scroll-driven amplitude boost
    float amplitudeBoost = 1.0 + uScroll * 0.4;
    coreGlow *= amplitudeBoost;
    
    // Color
    vec3 coreColor = mix(coreGold1, coreGold2, pulse);
    
    // High-reactive shimmer
    float shimmer = sin(uTime * 8.0 + dist * 20.0) * uHigh * 0.3;
    coreColor += vec3(1.0) * shimmer * 0.4;
    
    vec3 finalColor = coreColor * coreGlow * uIntensity;
    float alpha = coreGlow * 0.9 * uIntensity;
    
    // Bloom mask
    float bloom = smoothstep(0.8, 1.0, coreGlow);
    bloom *= (1.0 + uBass * 0.4);
    alpha += bloom * 0.4;
    
    gl_FragColor = vec4(finalColor, alpha);
    return;
  }
  
  // ============================================
  // LAYER 3: SHOCKWAVE RIPPLE LAYER (Large Ripples on Bass Peaks)
  // ============================================
  else {
    // Shockwave ripple colors
    vec3 shockwave1 = vec3(1.0, 0.80, 0.40);  // Golden
    vec3 shockwave2 = vec3(0.60, 0.80, 1.0);  // Blue
    
    // Bass-reactive shockwave
    float bassTrigger = step(0.3, uBass);
    
    // Ripple pattern
    float ripple = sin(vShockwavePhase) * 0.5 + 0.5;
    ripple = smoothstep(0.4, 0.6, ripple);
    
    // Multiple ripple rings
    float ripple1 = smoothstep(0.0, 0.15, abs(dist - 0.2));
    float ripple2 = smoothstep(0.0, 0.15, abs(dist - 0.4));
    float ripple3 = smoothstep(0.0, 0.15, abs(dist - 0.6));
    
    float totalRipples = (ripple1 + ripple2 + ripple3) * ripple;
    totalRipples *= bassTrigger;
    totalRipples *= uBass;
    
    // Color gradient (golden → blue)
    float colorMix = smoothstep(0.0, 0.8, dist);
    vec3 shockwaveColor = mix(shockwave1, shockwave2, colorMix);
    
    // Scroll-driven amplitude boost
    float amplitudeBoost = 1.0 + uScroll * 0.5;
    shockwaveColor *= amplitudeBoost;
    
    // High-reactive shimmer noise
    float shimmer = fbm(uv * 4.0 + uTime * 0.4) * uHigh * 0.3;
    shockwaveColor += vec3(1.0) * shimmer * 0.4;
    
    // Glow falloff
    float glow = 1.0 - smoothstep(0.5, 1.0, dist);
    glow *= totalRipples;
    
    vec3 finalColor = shockwaveColor * glow * uIntensity;
    float alpha = glow * 0.6 * uIntensity;
    
    // Bloom mask
    float bloom = smoothstep(0.6, 1.0, glow);
    bloom *= (1.0 + uBass * 0.5);
    alpha += bloom * 0.3;
    
    // Clamp
    finalColor = clamp(finalColor, 0.0, 1.0);
    alpha = clamp(alpha, 0.0, 1.0);
    
    gl_FragColor = vec4(finalColor, alpha);
  }
}
`;

