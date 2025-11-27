/**
 * UI Raymarch Fragment Shader
 * 
 * Phase 2 — Section 15: QUALITY ASSURANCE + BROWSER COMPATIBILITY + STRESS TESTING
 * Cosmic UI Raymarch Overlay Engine (E19)
 * 
 * Raymarched UI overlay: Chakra Rings, Sacred Geometry Lines, Energy Pulses, Aura Fog
 */

export const uiRaymarchFragmentShader = `
precision mediump float;

uniform float uTime;
uniform float uIntensity;
uniform float uScroll;
uniform float uBass;
uniform float uMid;
uniform float uHigh;
uniform float uBlessingWaveProgress;
uniform float uGuruHover;
uniform vec2 uMouse;
uniform float uCameraFOV;

varying vec2 vUv;
varying vec2 vScreenPos;

// Raymarching utilities
float sdCircle(vec2 p, float r) {
  return length(p) - r;
}

float sdRing(vec2 p, float r, float thickness) {
  return abs(length(p) - r) - thickness;
}

float sdLine(vec2 p, vec2 a, vec2 b) {
  vec2 pa = p - a;
  vec2 ba = b - a;
  float h = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0);
  return length(pa - ba * h);
}

// Noise functions
float hash(float n) {
  return fract(sin(n) * 43758.5453123);
}

float hash2(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

float noise(float x) {
  float i = floor(x);
  float f = fract(x);
  return mix(hash(i), hash(i + 1.0), smoothstep(0.0, 1.0, f));
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

// ============================================
// A. CHAKRA HUD RINGS (Screen-Space)
// ============================================
vec3 chakraRings(vec2 screenPos) {
  vec3 color = vec3(0.0);
  
  // 7 chakra positions (fixed screen positions)
  vec2 chakraPositions[7];
  chakraPositions[0] = vec2(-0.7, 0.6);  // Crown
  chakraPositions[1] = vec2(-0.5, 0.4);  // Third Eye
  chakraPositions[2] = vec2(-0.3, 0.2);  // Throat
  chakraPositions[3] = vec2(-0.1, 0.0);  // Heart
  chakraPositions[4] = vec2(0.1, -0.2);  // Solar Plexus
  chakraPositions[5] = vec2(0.3, -0.4);  // Sacral
  chakraPositions[6] = vec2(0.5, -0.6);  // Root
  
  vec3 chakraColors[7];
  chakraColors[0] = vec3(0.5, 0.0, 1.0);   // Crown - Violet
  chakraColors[1] = vec3(0.0, 0.5, 1.0);   // Third Eye - Indigo
  chakraColors[2] = vec3(0.0, 0.8, 1.0);   // Throat - Blue
  chakraColors[3] = vec3(0.0, 1.0, 0.5);   // Heart - Green
  chakraColors[4] = vec3(1.0, 1.0, 0.0);   // Solar Plexus - Yellow
  chakraColors[5] = vec3(1.0, 0.5, 0.0);   // Sacral - Orange
  chakraColors[6] = vec3(1.0, 0.0, 0.0);   // Root - Red
  
  for (int i = 0; i < 7; i++) {
    vec2 p = screenPos - chakraPositions[i];
    float ringRadius = 0.08;
    float ringThickness = 0.01;
    
    // Audio reactive: bass → scale
    ringRadius *= (1.0 + uBass * 0.2);
    
    // Raymarched ring with soft edges
    float dist = sdRing(p, ringRadius, ringThickness);
    float ring = 1.0 - smoothstep(0.0, 0.005, dist);
    
    // Mid → turbulence
    float turbulence = fbm(p * 5.0 + uTime * 0.5) * uMid * 0.1;
    ring += turbulence * 0.3;
    
    // High → shimmer
    float shimmer = sin(uTime * 10.0 + length(p) * 20.0) * 0.5 + 0.5;
    shimmer = smoothstep(0.7, 1.0, shimmer);
    ring += shimmer * uHigh * 0.2;
    
    // BlessingWave: brightness boost
    ring *= (1.0 + uBlessingWaveProgress * 0.5);
    
    // GuruHover: golden highlight
    if (uGuruHover > 0.5) {
      ring += 0.3;
      color += mix(chakraColors[i], vec3(1.0, 0.85, 0.5), 0.5) * ring;
    } else {
      color += chakraColors[i] * ring;
    }
  }
  
  return color;
}

// ============================================
// B. SACRED GEOMETRY UI LINES
// ============================================
vec3 sacredGeometryLines(vec2 screenPos) {
  vec3 color = vec3(0.0);
  
  // Phi ratio = 1.618
  float phi = 1.618;
  
  // Thin phi-ratio lines drawn in screen-space
  // Follow camera tilt (from E18) - use scroll as proxy
  float tilt = uScroll * 0.3;
  
  // Horizontal lines (phi spacing)
  for (int i = 0; i < 5; i++) {
    float y = float(i) * 0.3 * phi - 0.5;
    y += tilt;
    
    float dist = abs(screenPos.y - y);
    float line = 1.0 - smoothstep(0.0, 0.002, dist);
    
    // Scroll → line density modulation
    line *= (0.5 + uScroll * 0.5);
    
    // Audio → micro-wiggles
    float wiggle = sin(uTime * 5.0 + screenPos.x * 10.0) * uBass * 0.001;
    line *= (1.0 + wiggle);
    
    color += vec3(1.0, 0.9, 0.7) * line * 0.3;
  }
  
  // Vertical lines (phi spacing)
  for (int i = 0; i < 5; i++) {
    float x = float(i) * 0.3 * phi - 0.5;
    x += tilt * 0.5;
    
    float dist = abs(screenPos.x - x);
    float line = 1.0 - smoothstep(0.0, 0.002, dist);
    
    // Scroll → line density modulation
    line *= (0.5 + uScroll * 0.5);
    
    // Audio → micro-wiggles
    float wiggle = sin(uTime * 5.0 + screenPos.y * 10.0) * uBass * 0.001;
    line *= (1.0 + wiggle);
    
    color += vec3(1.0, 0.9, 0.7) * line * 0.3;
  }
  
  return color;
}

// ============================================
// C. ENERGY PULSE INDICATORS
// ============================================
vec3 energyPulseIndicators(vec2 screenPos) {
  vec3 color = vec3(0.0);
  
  // Circular pulse that expands with blessingWaveProgress
  vec2 center = vec2(0.0, 0.0);
  vec2 p = screenPos - center;
  
  float pulseRadius = uBlessingWaveProgress * 1.5;
  float pulseThickness = 0.02;
  
  // Raymarched ring
  float dist = sdRing(p, pulseRadius, pulseThickness);
  float pulse = 1.0 - smoothstep(0.0, 0.01, dist);
  
  // Color ramp: Gold → White → Violet
  float colorPhase = uBlessingWaveProgress;
  vec3 pulseColor;
  if (colorPhase < 0.33) {
    // Gold
    pulseColor = mix(
      vec3(1.0, 0.85, 0.5),
      vec3(1.0, 1.0, 1.0),
      colorPhase * 3.0
    );
  } else if (colorPhase < 0.66) {
    // White
    pulseColor = mix(
      vec3(1.0, 1.0, 1.0),
      vec3(0.8, 0.6, 1.0),
      (colorPhase - 0.33) * 3.0
    );
  } else {
    // Violet
    pulseColor = vec3(0.8, 0.6, 1.0);
  }
  
  color = pulseColor * pulse;
  
  return color;
}

// ============================================
// D. SCREEN-SPACE AURA FOG OVERLAY
// ============================================
vec3 auraFog(vec2 screenPos) {
  // Fog intensity: scrollProgress * 0.4
  float fogIntensity = uScroll * 0.4;
  
  // Audio shimmer integrated into fog
  float shimmer = fbm(screenPos * 2.0 + uTime * 0.3) * uHigh * 0.3;
  fogIntensity += shimmer;
  
  // Parallax from mouse
  vec2 parallaxOffset = uMouse * 0.1;
  float fog = fbm(screenPos * 1.5 + parallaxOffset + uTime * 0.1);
  fog = smoothstep(0.3, 0.7, fog);
  
  // Color: warm gold-white cosmic fog
  vec3 fogColor = mix(
    vec3(1.0, 0.9, 0.7),  // Gold
    vec3(1.0, 1.0, 1.0),  // White
    fog
  );
  
  return fogColor * fog * fogIntensity;
}

void main() {
  vec2 screenPos = vScreenPos;
  
  // ============================================
  // COMBINE ALL LAYERS
  // ============================================
  vec3 finalColor = vec3(0.0);
  float bloomMask = 0.0;
  
  // A. Chakra HUD Rings
  vec3 chakra = chakraRings(screenPos);
  finalColor += chakra;
  bloomMask = max(bloomMask, length(chakra));
  
  // B. Sacred Geometry Lines
  vec3 lines = sacredGeometryLines(screenPos);
  finalColor += lines;
  bloomMask = max(bloomMask, length(lines));
  
  // C. Energy Pulse Indicators
  vec3 pulse = energyPulseIndicators(screenPos);
  finalColor += pulse;
  bloomMask = max(bloomMask, length(pulse));
  
  // D. Aura Fog Overlay
  vec3 fog = auraFog(screenPos);
  finalColor += fog;
  
  // ============================================
  // FINAL COMPOSITION
  // ============================================
  finalColor *= uIntensity;
  
  // Soft additive blending for UI (transparent overlay)
  float alpha = min(length(finalColor), 0.8);
  alpha *= (0.5 + uScroll * 0.5); // Fade with scroll
  
  // Clamp
  finalColor = clamp(finalColor, 0.0, 1.0);
  alpha = clamp(alpha, 0.0, 1.0);
  
  // Output color and bloom mask
  gl_FragColor = vec4(finalColor, alpha);
  
  // Bloom mask stored in alpha channel (for E12 post-processing)
  // This will be extracted by the bloom engine
}
`;

