/**
 * Divine Alignment Grid Fragment Shader
 * 
 * Phase 2 — Section 5: KUNDALINI ENERGY WAVE SYSTEM
 * Divine Alignment Grid Engine (E9)
 * 
 * Creates grid colors with:
 * - Sacred Geometry Grid (Flower of Life + triangles)
 * - Rotational Mandala Grid (16-seg mandala)
 * - Radiant Guideline Grid (radial beams + circles)
 * - Bass-driven pulse of grid luminance
 * - High-frequency shimmer on intersections
 * - Bloom mask for high-energy intersection points
 */

export const gridFragmentShader = `
precision mediump float;

uniform float uTime;
uniform float uIntensity;
uniform float uScroll;
uniform float uBass;
uniform float uMid;
uniform float uHigh;
uniform float uLayerType;  // 0: Sacred Geometry, 1: Mandala, 2: Radiant

varying vec2 vUv;
varying vec3 vPosition;
varying float vDistance;
varying float vRadialDistance;
varying float vGridCoord;

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

void main() {
  vec2 uv = vUv;
  vec2 center = vec2(0.5, 0.5);
  vec2 toCenter = uv - center;
  float dist = vRadialDistance;
  
  // ============================================
  // LAYER 1: SACRED GEOMETRY GRID (Flower of Life + Triangles)
  // ============================================
  if (uLayerType < 0.5) {
    // Flower of Life lattice
    float gridScale = 8.0;
    vec2 gridUV = uv * gridScale;
    
    // Hexagonal grid
    vec2 hexCoord = vec2(
      gridUV.x + gridUV.y * 0.5,
      gridUV.y * 0.866
    );
    vec2 hexCell = floor(hexCoord);
    vec2 hexLocal = fract(hexCoord);
    
    // Grid lines
    float gridLine = 0.0;
    gridLine += smoothstep(0.02, 0.0, abs(hexLocal.x - 0.5));
    gridLine += smoothstep(0.02, 0.0, abs(hexLocal.y - 0.5));
    gridLine += smoothstep(0.02, 0.0, length(hexLocal - vec2(0.5, 0.5)) - 0.3);
    
    // Triangle tessellation
    vec2 triCoord = hexLocal;
    float triDist = length(triCoord - vec2(0.5));
    float triLine = smoothstep(0.015, 0.0, abs(triDist - 0.25));
    
    float totalGrid = max(gridLine, triLine);
    
    // Intersection points (high-energy)
    float intersection = smoothstep(0.05, 0.0, length(hexLocal - vec2(0.5, 0.5)));
    
    // Grid color (golden-white)
    vec3 gridColor = vec3(1.0, 0.90, 0.70);
    
    // Bass-driven pulse of grid luminance
    float luminancePulse = 1.0 + sin(uTime * 2.0) * 0.2 * uBass;
    gridColor *= luminancePulse;
    
    // High-frequency shimmer on intersections
    float shimmer = sin(uTime * 10.0 + dist * 30.0) * uHigh * 0.5;
    shimmer *= intersection;
    gridColor += vec3(1.0) * shimmer * 0.8;
    
    // Grid glow
    float glow = totalGrid * 0.6;
    glow += intersection * 0.4;
    
    vec3 finalColor = gridColor * glow * uIntensity;
    float alpha = glow * 0.4 * uIntensity;
    
    // Bloom mask for high-energy intersection points
    float bloom = smoothstep(0.7, 1.0, intersection);
    bloom *= (1.0 + uBass * 0.3);
    alpha += bloom * 0.3;
    
    gl_FragColor = vec4(finalColor, alpha);
    return;
  }
  
  // ============================================
  // LAYER 2: ROTATIONAL MANDALA GRID (16-seg Mandala)
  // ============================================
  else if (uLayerType < 1.5) {
    // 16-segment mandala
    float segments = 16.0;
    float angle = atan(toCenter.y, toCenter.x);
    float segmentAngle = angle / (3.14159 * 2.0) * segments;
    float segmentIndex = floor(segmentAngle);
    float segmentLocal = fract(segmentAngle);
    
    // Radial grid lines
    float radialLine = smoothstep(0.03, 0.0, segmentLocal);
    radialLine += smoothstep(0.03, 0.0, 1.0 - segmentLocal);
    
    // Concentric circles
    float circleCount = 6.0;
    float circleIndex = floor(dist * circleCount);
    float circleLocal = fract(dist * circleCount);
    float circleLine = smoothstep(0.02, 0.0, circleLocal);
    circleLine += smoothstep(0.02, 0.0, 1.0 - circleLocal);
    
    float totalGrid = max(radialLine, circleLine);
    
    // Intersection points (where radial meets circle)
    float intersection = radialLine * circleLine;
    
    // Grid color (violet-gold)
    vec3 gridColor = mix(
      vec3(0.70, 0.50, 1.0),  // Violet
      vec3(1.0, 0.85, 0.50),  // Gold
      dist * 0.5
    );
    
    // Bass-driven pulse of grid luminance
    float luminancePulse = 1.0 + sin(uTime * 2.5) * 0.25 * uBass;
    gridColor *= luminancePulse;
    
    // High-frequency shimmer on intersections
    float shimmer = sin(uTime * 12.0 + dist * 35.0) * uHigh * 0.6;
    shimmer *= intersection;
    gridColor += vec3(1.0) * shimmer * 0.9;
    
    // Scroll affects color shift
    gridColor *= (0.8 + uScroll * 0.2);
    
    // Grid glow
    float glow = totalGrid * 0.7;
    glow += intersection * 0.5;
    
    vec3 finalColor = gridColor * glow * uIntensity;
    float alpha = glow * 0.5 * uIntensity;
    
    // Bloom mask for high-energy intersection points
    float bloom = smoothstep(0.6, 1.0, intersection);
    bloom *= (1.0 + uBass * 0.4);
    alpha += bloom * 0.4;
    
    gl_FragColor = vec4(finalColor, alpha);
    return;
  }
  
  // ============================================
  // LAYER 3: RADIANT GUIDELINE GRID (Radial Beams + Concentric Circles)
  // ============================================
  else {
    // Radial beams
    float beamCount = 12.0;
    float angle = atan(toCenter.y, toCenter.x);
    float beamAngle = angle / (3.14159 * 2.0) * beamCount;
    float beamIndex = floor(beamAngle);
    float beamLocal = fract(beamAngle);
    
    // Beam lines
    float beamLine = smoothstep(0.025, 0.0, beamLocal);
    beamLine += smoothstep(0.025, 0.0, 1.0 - beamLocal);
    
    // Concentric circles
    float circleCount = 8.0;
    float circleIndex = floor(dist * circleCount);
    float circleLocal = fract(dist * circleCount);
    float circleLine = smoothstep(0.02, 0.0, circleLocal);
    circleLine += smoothstep(0.02, 0.0, 1.0 - circleLocal);
    
    float totalGrid = max(beamLine, circleLine);
    
    // Intersection points (where beam meets circle)
    float intersection = beamLine * circleLine;
    
    // Grid color (golden-white)
    vec3 gridColor = mix(
      vec3(1.0, 0.95, 0.80),  // Light gold
      vec3(1.0, 1.0, 1.0),    // White
      dist * 0.3
    );
    
    // Bass-driven pulse of grid luminance
    float luminancePulse = 1.0 + sin(uTime * 3.0) * 0.3 * uBass;
    gridColor *= luminancePulse;
    
    // High-frequency shimmer on intersections
    float shimmer = sin(uTime * 15.0 + dist * 40.0) * uHigh * 0.7;
    shimmer *= intersection;
    gridColor += vec3(1.0) * shimmer * 1.0;
    
    // Grid glow
    float glow = totalGrid * 0.8;
    glow += intersection * 0.6;
    
    vec3 finalColor = gridColor * glow * uIntensity;
    float alpha = glow * 0.6 * uIntensity;
    
    // Bloom mask for high-energy intersection points
    float bloom = smoothstep(0.5, 1.0, intersection);
    bloom *= (1.0 + uBass * 0.5);
    alpha += bloom * 0.5;
    
    // Clamp
    finalColor = clamp(finalColor, 0.0, 1.0);
    alpha = clamp(alpha, 0.0, 1.0);
    
    gl_FragColor = vec4(finalColor, alpha);
  }
}
`;

