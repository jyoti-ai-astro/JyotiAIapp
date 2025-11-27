/**
 * Celestial Sanctum v3 Fragment Shader
 * 
 * Phase 2 — Section 64: CELESTIAL SANCTUM ENGINE v3
 * Celestial Sanctum Engine v3 (E68)
 * 
 * 24-layer ascended sanctum: Sanctum Base Disc, Twin Infinity Staircases, Celestial Sanctum Pillars, Triple Halo Arch Crown, Quantum Spiral Halo, Celestial Rune Band, Ascension Obelisks, Cross-Realm Beams, Orbital Sanctum Rings, Sanctum Flame Shell, Ether Fog Plane, Sanctum Light Shafts, Inner Spiral Matrix, Divine Particle Stream, Dimensional Wave Rings, Outer Sanctum Halo, Sanctum Heart Core, Celestial Lattice Veil, Ether Thread Matrix, Spiral Light Towers, Sanctum Rays, Ascension Aura Field, Reality Warp Layer, Bloom Mask Layer
 */

export const celestialSanctumFragmentShader = `
precision mediump float;

uniform float uTime;
uniform float uIntensity;
uniform float uBreathPhase;
uniform float uBreathStrength;
uniform float uBass;
uniform float uMid;
uniform float uHigh;
uniform float uScroll;
uniform float uBlessingWaveProgress;
uniform float uRotationSync;

varying vec2 vUv;
varying vec3 vPosition;
varying float vBaseDiscIndex;
varying float vTwinStaircaseIndex;
varying float vSanctumPillarIndex;
varying float vTripleHaloIndex;
varying float vQuantumSpiralIndex;
varying float vRuneBandIndex;
varying float vObeliskIndex;
varying float vCrossBeamIndex;
varying float vOrbitalRingIndex;
varying float vFlameShellIndex;
varying float vEtherFogIndex;
varying float vLightShaftIndex;
varying float vSpiralMatrixIndex;
varying float vParticleStreamIndex;
varying float vWaveRingIndex;
varying float vOuterHaloIndex;
varying float vHeartCoreIndex;
varying float vLatticeVeilIndex;
varying float vEtherThreadIndex;
varying float vLightTowerIndex;
varying float vSanctumRayIndex;
varying float vAuraFieldIndex;
varying float vRealityWarpIndex;
varying float vBloomIndex;
varying float vRadialSegment;
varying float vConcentricRing;
varying float vDistance;
varying float vRadialDistance;
varying float vGradientProgress;
varying float vAngle;
varying float vRadius;

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

// SDF functions
float sdCircle(vec2 p, float r) {
  return length(p) - r;
}

// ============================================
// LAYER A: SANCTUM BASE DISC
// ============================================
vec3 sanctumBaseDisc(vec2 uv) {
  if (vBaseDiscIndex < 0.0) {
    return vec3(0.0);
  }
  
  // Color: White → Gold → Violet
  vec3 whiteColor = vec3(1.0, 1.0, 1.0);
  vec3 goldColor = vec3(1.0, 0.8, 0.3);
  vec3 violetColor = vec3(0.8, 0.6, 1.0);
  
  float gradientT = vGradientProgress;
  
  // Grid pattern
  float gridX = sin(vAngle * 64.0) * 0.5 + 0.5;
  float gridY = sin(vRadius * 64.0) * 0.5 + 0.5;
  float gridPattern = (gridX + gridY) * 0.5;
  
  vec3 discColor;
  if (gradientT < 0.5) {
    discColor = mix(whiteColor, goldColor, gradientT * 2.0);
  } else {
    discColor = mix(goldColor, violetColor, (gradientT - 0.5) * 2.0);
  }
  
  return discColor * gridPattern * 0.7;
}

// ============================================
// LAYER B: TWIN INFINITY STAIRCASES
// ============================================
vec3 twinInfinityStaircases(vec2 uv) {
  if (vTwinStaircaseIndex < 0.0) {
    return vec3(0.0);
  }
  
  // Color: White → Gold → Violet
  vec3 whiteColor = vec3(1.0, 1.0, 1.0);
  vec3 goldColor = vec3(1.0, 0.8, 0.3);
  vec3 violetColor = vec3(0.8, 0.6, 1.0);
  
  float gradientT = vGradientProgress;
  
  float widthFade = 1.0 - abs(uv.x - 0.5) * 2.0;
  widthFade = smoothstep(0.0, 0.3, widthFade);
  
  vec3 stairColor;
  if (gradientT < 0.5) {
    stairColor = mix(whiteColor, goldColor, gradientT * 2.0);
  } else {
    stairColor = mix(goldColor, violetColor, (gradientT - 0.5) * 2.0);
  }
  
  return stairColor * widthFade * 0.6;
}

// ============================================
// LAYER C: CELESTIAL SANCTUM PILLARS
// ============================================
vec3 celestialSanctumPillars(vec2 uv) {
  if (vSanctumPillarIndex < 0.0) {
    return vec3(0.0);
  }
  
  // Color: White → Gold → Violet
  vec3 whiteColor = vec3(1.0, 1.0, 1.0);
  vec3 goldColor = vec3(1.0, 0.8, 0.3);
  vec3 violetColor = vec3(0.8, 0.6, 1.0);
  
  float gradientT = vGradientProgress;
  
  // Bass → vibration wobble (already in vertex)
  
  float widthFade = 1.0 - abs(uv.x - 0.5) * 2.0;
  widthFade = smoothstep(0.0, 0.3, widthFade);
  
  vec3 pillarColor;
  if (gradientT < 0.5) {
    pillarColor = mix(whiteColor, goldColor, gradientT * 2.0);
  } else {
    pillarColor = mix(goldColor, violetColor, (gradientT - 0.5) * 2.0);
  }
  
  return pillarColor * widthFade * 0.6;
}

// ============================================
// LAYER D: TRIPLE HALO ARCH CROWN
// ============================================
vec3 tripleHaloArchCrown(vec2 uv) {
  if (vTripleHaloIndex < 0.0) {
    return vec3(0.0);
  }
  
  // Color: White → Gold → Violet
  vec3 whiteColor = vec3(1.0, 1.0, 1.0);
  vec3 goldColor = vec3(1.0, 0.8, 0.3);
  vec3 violetColor = vec3(0.8, 0.6, 1.0);
  
  float gradientT = vGradientProgress;
  
  // RotationSync → tilt (already in vertex)
  
  float thicknessFade = 1.0 - abs(uv.y - 0.5) * 2.0;
  thicknessFade = smoothstep(0.0, 0.4, thicknessFade);
  
  vec3 haloColor;
  if (gradientT < 0.5) {
    haloColor = mix(whiteColor, goldColor, gradientT * 2.0);
  } else {
    haloColor = mix(goldColor, violetColor, (gradientT - 0.5) * 2.0);
  }
  
  return haloColor * thicknessFade * 0.5;
}

// ============================================
// LAYER E: QUANTUM SPIRAL HALO
// ============================================
vec3 quantumSpiralHalo(vec2 uv) {
  if (vQuantumSpiralIndex < 0.0) {
    return vec3(0.0);
  }
  
  // Color: White → Cyan → Violet
  vec3 whiteColor = vec3(1.0, 1.0, 1.0);
  vec3 cyanColor = vec3(0.2, 0.7, 0.9);
  vec3 violetColor = vec3(0.8, 0.6, 1.0);
  
  float gradientT = vGradientProgress;
  
  float widthFade = 1.0 - abs(uv.x - 0.5) * 2.0;
  widthFade = smoothstep(0.0, 0.3, widthFade);
  
  vec3 spiralColor;
  if (gradientT < 0.5) {
    spiralColor = mix(whiteColor, cyanColor, gradientT * 2.0);
  } else {
    spiralColor = mix(cyanColor, violetColor, (gradientT - 0.5) * 2.0);
  }
  
  return spiralColor * widthFade * 0.5;
}

// ============================================
// LAYER F: CELESTIAL RUNE BAND
// ============================================
vec3 celestialRuneBand(vec2 uv) {
  if (vRuneBandIndex < 0.0) {
    return vec3(0.0);
  }
  
  vec2 center = vec2(0.5, 0.5);
  vec2 p = uv - center;
  float dist = length(p);
  
  float runeRadius = 0.24;
  float runeDist = sdCircle(p, runeRadius);
  float runeMask = 1.0 - smoothstep(0.0, runeRadius * 2.0, runeDist);
  
  // BlessingWave → rune flash
  float blessingFlash = 0.0;
  if (uBlessingWaveProgress > 0.0) {
    blessingFlash = uBlessingWaveProgress * 0.9;
  }
  
  // Color: White → Gold → Violet
  vec3 whiteColor = vec3(1.0, 1.0, 1.0);
  vec3 goldColor = vec3(1.0, 0.8, 0.3);
  vec3 violetColor = vec3(0.8, 0.6, 1.0);
  
  float gradientT = dist / runeRadius;
  vec3 runeColor;
  if (gradientT < 0.5) {
    runeColor = mix(whiteColor, goldColor, gradientT * 2.0);
  } else {
    runeColor = mix(goldColor, violetColor, (gradientT - 0.5) * 2.0);
  }
  
  return runeColor * runeMask * (1.0 + blessingFlash) * 0.8;
}

// ============================================
// LAYER G: ASCENSION OBELISKS
// ============================================
vec3 ascensionObelisks(vec2 uv) {
  if (vObeliskIndex < 0.0) {
    return vec3(0.0);
  }
  
  // Color: White → Cyan → Violet
  vec3 whiteColor = vec3(1.0, 1.0, 1.0);
  vec3 cyanColor = vec3(0.2, 0.7, 0.9);
  vec3 violetColor = vec3(0.8, 0.6, 1.0);
  
  float gradientT = vGradientProgress;
  
  float widthFade = 1.0 - abs(uv.x - 0.5) * 2.0;
  widthFade = smoothstep(0.0, 0.3, widthFade);
  
  vec3 obeliskColor;
  if (gradientT < 0.5) {
    obeliskColor = mix(whiteColor, cyanColor, gradientT * 2.0);
  } else {
    obeliskColor = mix(cyanColor, violetColor, (gradientT - 0.5) * 2.0);
  }
  
  return obeliskColor * widthFade * 0.6;
}

// ============================================
// LAYER H: CROSS-REALM BEAMS
// ============================================
vec3 crossRealmBeams(vec2 uv) {
  if (vCrossBeamIndex < 0.0) {
    return vec3(0.0);
  }
  
  // Color: White → Cyan → Violet
  vec3 whiteColor = vec3(1.0, 1.0, 1.0);
  vec3 cyanColor = vec3(0.2, 0.7, 0.9);
  vec3 violetColor = vec3(0.8, 0.6, 1.0);
  
  float gradientT = vGradientProgress;
  
  float widthFade = 1.0 - abs(uv.x - 0.5) * 2.0;
  widthFade = smoothstep(0.0, 0.3, widthFade);
  
  vec3 beamColor;
  if (gradientT < 0.5) {
    beamColor = mix(whiteColor, cyanColor, gradientT * 2.0);
  } else {
    beamColor = mix(cyanColor, violetColor, (gradientT - 0.5) * 2.0);
  }
  
  return beamColor * widthFade * 0.4;
}

// ============================================
// LAYER I: ORBITAL SANCTUM RINGS
// ============================================
vec3 orbitalSanctumRings(vec2 uv) {
  if (vOrbitalRingIndex < 0.0) {
    return vec3(0.0);
  }
  
  // Color: White → Gold → Violet
  vec3 whiteColor = vec3(1.0, 1.0, 1.0);
  vec3 goldColor = vec3(1.0, 0.8, 0.3);
  vec3 violetColor = vec3(0.8, 0.6, 1.0);
  
  float gradientT = vGradientProgress;
  
  // High → sparkle
  float sparkle = fbm(uv * 12.0 + uTime) * uHigh * 0.3;
  sparkle = smoothstep(0.6, 1.0, sparkle);
  
  float thicknessFade = 1.0 - abs(uv.y - 0.5) * 2.0;
  thicknessFade = smoothstep(0.0, 0.4, thicknessFade);
  
  vec3 ringColor;
  if (gradientT < 0.5) {
    ringColor = mix(whiteColor, goldColor, gradientT * 2.0);
  } else {
    ringColor = mix(goldColor, violetColor, (gradientT - 0.5) * 2.0);
  }
  
  return ringColor * thicknessFade * (1.0 + sparkle) * 0.5;
}

// ============================================
// LAYER J: SANCTUM FLAME SHELL
// ============================================
vec3 sanctumFlameShell(vec2 uv) {
  if (vFlameShellIndex < 0.0) {
    return vec3(0.0);
  }
  
  // Color: White → Orange → Violet
  vec3 whiteColor = vec3(1.0, 1.0, 1.0);
  vec3 orangeColor = vec3(1.0, 0.6, 0.2);
  vec3 violetColor = vec3(0.8, 0.6, 1.0);
  
  float gradientT = vGradientProgress;
  
  float flamePattern = fbm(uv * 3.0 + uTime * 0.2) * 0.5 + 0.5;
  
  vec3 flameColor;
  if (gradientT < 0.5) {
    flameColor = mix(whiteColor, orangeColor, gradientT * 2.0);
  } else {
    flameColor = mix(orangeColor, violetColor, (gradientT - 0.5) * 2.0);
  }
  
  return flameColor * flamePattern * 0.3;
}

// ============================================
// LAYER K: ETHER FOG PLANE
// ============================================
vec3 etherFogPlane(vec2 uv) {
  if (vEtherFogIndex < 0.0) {
    return vec3(0.0);
  }
  
  // Color: White → Violet
  vec3 whiteColor = vec3(1.0, 1.0, 1.0);
  vec3 violetColor = vec3(0.8, 0.6, 1.0);
  
  float gradientT = vGradientProgress;
  
  // Breath → pulse
  float breathPulse = 1.0 + sin(uBreathPhase * 6.28318) * uBreathStrength * 0.2;
  
  float fogPattern = fbm(uv * 3.0 + uTime * 0.15) * 0.5 + 0.5;
  
  vec3 fogColor = mix(whiteColor, violetColor, gradientT);
  
  return fogColor * fogPattern * breathPulse * 0.2;
}

// ============================================
// LAYER L: SANCTUM LIGHT SHAFTS
// ============================================
vec3 sanctumLightShafts(vec2 uv) {
  if (vLightShaftIndex < 0.0) {
    return vec3(0.0);
  }
  
  // Color: White → Violet
  vec3 whiteColor = vec3(1.0, 1.0, 1.0);
  vec3 violetColor = vec3(0.8, 0.6, 1.0);
  
  float gradientT = vGradientProgress;
  
  float widthFade = 1.0 - abs(uv.x - 0.5) * 2.0;
  widthFade = smoothstep(0.0, 0.3, widthFade);
  
  vec3 shaftColor = mix(whiteColor, violetColor, gradientT);
  
  return shaftColor * widthFade * 0.6;
}

// ============================================
// LAYER M: INNER SPIRAL MATRIX
// ============================================
vec3 innerSpiralMatrix(vec2 uv) {
  if (vSpiralMatrixIndex < 0.0) {
    return vec3(0.0);
  }
  
  // Color: White → Cyan → Violet
  vec3 whiteColor = vec3(1.0, 1.0, 1.0);
  vec3 cyanColor = vec3(0.2, 0.7, 0.9);
  vec3 violetColor = vec3(0.8, 0.6, 1.0);
  
  float gradientT = vGradientProgress;
  
  float widthFade = 1.0 - abs(uv.x - 0.5) * 2.0;
  widthFade = smoothstep(0.0, 0.3, widthFade);
  
  vec3 spiralColor;
  if (gradientT < 0.5) {
    spiralColor = mix(whiteColor, cyanColor, gradientT * 2.0);
  } else {
    spiralColor = mix(cyanColor, violetColor, (gradientT - 0.5) * 2.0);
  }
  
  return spiralColor * widthFade * 0.5;
}

// ============================================
// LAYER N: DIVINE PARTICLE STREAM
// ============================================
vec3 divineParticleStream(vec2 uv) {
  if (vParticleStreamIndex < 0.0) {
    return vec3(0.0);
  }
  
  vec2 center = vec2(0.5, 0.5);
  vec2 p = uv - center;
  float dist = length(p);
  
  float particleRadius = 0.01;
  float particleDist = sdCircle(p, particleRadius);
  float particleMask = 1.0 - smoothstep(0.0, particleRadius * 2.0, particleDist);
  
  // Color: White–Cyan–Violet
  vec3 whiteColor = vec3(1.0, 1.0, 1.0);
  vec3 cyanColor = vec3(0.2, 0.7, 0.9);
  vec3 violetColor = vec3(0.8, 0.6, 1.0);
  
  float gradientT = dist / particleRadius;
  vec3 particleColor;
  if (gradientT < 0.33) {
    particleColor = mix(whiteColor, cyanColor, gradientT * 3.0);
  } else {
    particleColor = mix(cyanColor, violetColor, (gradientT - 0.33) * 1.5);
  }
  
  return particleColor * particleMask * 0.7;
}

// ============================================
// LAYER O: DIMENSIONAL WAVE RINGS
// ============================================
vec3 dimensionalWaveRings(vec2 uv) {
  if (vWaveRingIndex < 0.0) {
    return vec3(0.0);
  }
  
  // Color: White → Gold → Violet
  vec3 whiteColor = vec3(1.0, 1.0, 1.0);
  vec3 goldColor = vec3(1.0, 0.8, 0.3);
  vec3 violetColor = vec3(0.8, 0.6, 1.0);
  
  float gradientT = vGradientProgress;
  
  // Mid → turbulence jitter (already in vertex)
  
  float thicknessFade = 1.0 - abs(uv.y - 0.5) * 2.0;
  thicknessFade = smoothstep(0.0, 0.4, thicknessFade);
  
  // Wave pattern
  float wavePattern = sin(vRadius * 8.0 - uTime * 2.0) * 0.5 + 0.5;
  
  vec3 waveColor;
  if (gradientT < 0.5) {
    waveColor = mix(whiteColor, goldColor, gradientT * 2.0);
  } else {
    waveColor = mix(goldColor, violetColor, (gradientT - 0.5) * 2.0);
  }
  
  return waveColor * thicknessFade * wavePattern * 0.5;
}

// ============================================
// LAYER P: OUTER SANCTUM HALO
// ============================================
vec3 outerSanctumHalo(vec2 uv) {
  if (vOuterHaloIndex < 0.0) {
    return vec3(0.0);
  }
  
  // Color: White → Gold → Violet
  vec3 whiteColor = vec3(1.0, 1.0, 1.0);
  vec3 goldColor = vec3(1.0, 0.8, 0.3);
  vec3 violetColor = vec3(0.8, 0.6, 1.0);
  
  float gradientT = vGradientProgress;
  
  // RotationSync → rotation (already in vertex)
  
  float thicknessFade = 1.0 - abs(uv.y - 0.5) * 2.0;
  thicknessFade = smoothstep(0.0, 0.4, thicknessFade);
  
  vec3 haloColor;
  if (gradientT < 0.5) {
    haloColor = mix(whiteColor, goldColor, gradientT * 2.0);
  } else {
    haloColor = mix(goldColor, violetColor, (gradientT - 0.5) * 2.0);
  }
  
  return haloColor * thicknessFade * 0.4;
}

// ============================================
// LAYER Q: SANCTUM HEART CORE
// ============================================
vec3 sanctumHeartCore(vec2 uv) {
  if (vHeartCoreIndex < 0.0) {
    return vec3(0.0);
  }
  
  // White-gold pulsing core
  // Color: White → Gold
  vec3 whiteColor = vec3(1.0, 1.0, 1.0);
  vec3 goldColor = vec3(1.0, 0.8, 0.3);
  
  float gradientT = vGradientProgress;
  
  // Breath → pulse (already in vertex)
  
  float coreIntensity = 1.0 - smoothstep(0.0, 2.2, vRadius);
  
  vec3 coreColor = mix(whiteColor, goldColor, gradientT);
  
  return coreColor * coreIntensity * 0.8;
}

// ============================================
// LAYER R: CELESTIAL LATTICE VEIL
// ============================================
vec3 celestialLatticeVeil(vec2 uv) {
  if (vLatticeVeilIndex < 0.0) {
    return vec3(0.0);
  }
  
  // Color: White → Violet → Cyan
  vec3 whiteColor = vec3(1.0, 1.0, 1.0);
  vec3 violetColor = vec3(0.8, 0.6, 1.0);
  vec3 cyanColor = vec3(0.2, 0.7, 0.9);
  
  float gradientT = vGradientProgress;
  
  // Scroll → drift (already in vertex)
  
  float latticePattern = fbm(uv * 3.0 + uTime * 0.2) * 0.5 + 0.5;
  
  vec3 latticeColor;
  if (gradientT < 0.5) {
    latticeColor = mix(whiteColor, violetColor, gradientT * 2.0);
  } else {
    latticeColor = mix(violetColor, cyanColor, (gradientT - 0.5) * 2.0);
  }
  
  return latticeColor * latticePattern * 0.3;
}

// ============================================
// LAYER S: ETHER THREAD MATRIX
// ============================================
vec3 etherThreadMatrix(vec2 uv) {
  if (vEtherThreadIndex < 0.0) {
    return vec3(0.0);
  }
  
  // Color: White → Cyan → Violet
  vec3 whiteColor = vec3(1.0, 1.0, 1.0);
  vec3 cyanColor = vec3(0.2, 0.7, 0.9);
  vec3 violetColor = vec3(0.8, 0.6, 1.0);
  
  float gradientT = vGradientProgress;
  
  // Breath → thickness pulse
  float breathThickness = 1.0 + sin(uBreathPhase * 6.28318) * uBreathStrength * 0.15;
  
  float widthFade = 1.0 - abs(uv.x - 0.5) * 2.0;
  widthFade = smoothstep(0.0, 0.3, widthFade);
  
  vec3 threadColor;
  if (gradientT < 0.5) {
    threadColor = mix(whiteColor, cyanColor, gradientT * 2.0);
  } else {
    threadColor = mix(cyanColor, violetColor, (gradientT - 0.5) * 2.0);
  }
  
  return threadColor * widthFade * breathThickness * 0.5;
}

// ============================================
// LAYER T: SPIRAL LIGHT TOWERS
// ============================================
vec3 spiralLightTowers(vec2 uv) {
  if (vLightTowerIndex < 0.0) {
    return vec3(0.0);
  }
  
  // Color: White → Gold → Violet
  vec3 whiteColor = vec3(1.0, 1.0, 1.0);
  vec3 goldColor = vec3(1.0, 0.8, 0.3);
  vec3 violetColor = vec3(0.8, 0.6, 1.0);
  
  float gradientT = vGradientProgress;
  
  float widthFade = 1.0 - abs(uv.x - 0.5) * 2.0;
  widthFade = smoothstep(0.0, 0.3, widthFade);
  
  vec3 towerColor;
  if (gradientT < 0.5) {
    towerColor = mix(whiteColor, goldColor, gradientT * 2.0);
  } else {
    towerColor = mix(goldColor, violetColor, (gradientT - 0.5) * 2.0);
  }
  
  return towerColor * widthFade * 0.6;
}

// ============================================
// LAYER U: SANCTUM RAYS
// ============================================
vec3 sanctumRays(vec2 uv) {
  if (vSanctumRayIndex < 0.0) {
    return vec3(0.0);
  }
  
  // Color: White → Gold → Violet
  vec3 whiteColor = vec3(1.0, 1.0, 1.0);
  vec3 goldColor = vec3(1.0, 0.8, 0.3);
  vec3 violetColor = vec3(0.8, 0.6, 1.0);
  
  float gradientT = vGradientProgress;
  
  float widthFade = 1.0 - abs(uv.x - 0.5) * 2.0;
  widthFade = smoothstep(0.0, 0.3, widthFade);
  
  vec3 rayColor;
  if (gradientT < 0.5) {
    rayColor = mix(whiteColor, goldColor, gradientT * 2.0);
  } else {
    rayColor = mix(goldColor, violetColor, (gradientT - 0.5) * 2.0);
  }
  
  return rayColor * widthFade * 0.4;
}

// ============================================
// LAYER V: ASCENSION AURA FIELD
// ============================================
vec3 ascensionAuraField(vec2 uv) {
  if (vAuraFieldIndex < 0.0) {
    return vec3(0.0);
  }
  
  // Breath → pulse
  // Color: White → Violet
  vec3 whiteColor = vec3(1.0, 1.0, 1.0);
  vec3 violetColor = vec3(0.8, 0.6, 1.0);
  
  float gradientT = vGradientProgress;
  
  // Breath → pulse
  float breathPulse = 1.0 + sin(uBreathPhase * 6.28318) * uBreathStrength * 0.2;
  
  // Aura fade
  float auraFade = 1.0 - smoothstep(0.0, 7.0, vRadius);
  
  vec3 auraColor = mix(whiteColor, violetColor, gradientT);
  
  return auraColor * auraFade * breathPulse * 0.2;
}

// ============================================
// LAYER W: REALITY WARP LAYER
// ============================================
vec3 realityWarpLayer(vec2 uv) {
  if (vRealityWarpIndex < 0.0) {
    return vec3(0.0);
  }
  
  // Color: White → Violet → Cyan
  vec3 whiteColor = vec3(1.0, 1.0, 1.0);
  vec3 violetColor = vec3(0.8, 0.6, 1.0);
  vec3 cyanColor = vec3(0.2, 0.7, 0.9);
  
  float gradientT = vGradientProgress;
  
  // Scroll → warp drift (already in vertex)
  
  float warpPattern = fbm(uv * 2.5 + uTime * 0.18) * 0.5 + 0.5;
  
  vec3 warpColor;
  if (gradientT < 0.5) {
    warpColor = mix(whiteColor, violetColor, gradientT * 2.0);
  } else {
    warpColor = mix(violetColor, cyanColor, (gradientT - 0.5) * 2.0);
  }
  
  return warpColor * warpPattern * 0.3;
}

// ============================================
// LAYER X: BLOOM MASK LAYER
// ============================================
vec3 bloomMaskLayer(vec2 uv) {
  if (vBloomIndex < 0.0) {
    return vec3(0.0);
  }
  
  // Required for E12 bloom
  float distFromCenter = vRadialDistance;
  float bloomIntensity = 1.0 - smoothstep(0.0, 6.5, distFromCenter);
  
  // Intensifies with blessingWaveProgress
  float blessingIntensity = 0.0;
  if (uBlessingWaveProgress > 0.0) {
    blessingIntensity = uBlessingWaveProgress * 0.7;
  }
  
  bloomIntensity = min(bloomIntensity + blessingIntensity, 1.0);
  
  // Soft white-violet bloom color
  vec3 bloomColor = mix(vec3(1.0, 1.0, 1.0), vec3(0.8, 0.6, 1.0), 0.4);
  
  return bloomColor * bloomIntensity * 0.3;
}

void main() {
  vec2 uv = vUv;
  
  // ============================================
  // COMBINE ALL LAYERS
  // ============================================
  vec3 finalColor = vec3(0.0);
  float bloomMask = 0.0;
  
  // Layer A: Sanctum Base Disc (base layer)
  vec3 layerA = sanctumBaseDisc(uv);
  finalColor = layerA; // Base layer, not additive
  
  // Layer B: Twin Infinity Staircases (additive blending)
  vec3 layerB = twinInfinityStaircases(uv);
  finalColor += layerB * 0.5;
  bloomMask = max(bloomMask, length(layerB));
  
  // Layer C: Celestial Sanctum Pillars (additive blending)
  vec3 layerC = celestialSanctumPillars(uv);
  finalColor += layerC * 0.5;
  bloomMask = max(bloomMask, length(layerC));
  
  // Layer D: Triple Halo Arch Crown (additive blending)
  vec3 layerD = tripleHaloArchCrown(uv);
  finalColor += layerD * 0.5;
  bloomMask = max(bloomMask, length(layerD));
  
  // Layer E: Quantum Spiral Halo (additive blending)
  vec3 layerE = quantumSpiralHalo(uv);
  finalColor += layerE * 0.5;
  bloomMask = max(bloomMask, length(layerE));
  
  // Layer F: Celestial Rune Band (additive blending)
  vec3 layerF = celestialRuneBand(uv);
  finalColor += layerF * 0.7;
  bloomMask = max(bloomMask, length(layerF));
  
  // Layer G: Ascension Obelisks (additive blending)
  vec3 layerG = ascensionObelisks(uv);
  finalColor += layerG * 0.5;
  bloomMask = max(bloomMask, length(layerG));
  
  // Layer H: Cross-Realm Beams (additive blending)
  vec3 layerH = crossRealmBeams(uv);
  finalColor += layerH * 0.4;
  bloomMask = max(bloomMask, length(layerH));
  
  // Layer I: Orbital Sanctum Rings (additive blending)
  vec3 layerI = orbitalSanctumRings(uv);
  finalColor += layerI * 0.5;
  bloomMask = max(bloomMask, length(layerI));
  
  // Layer J: Sanctum Flame Shell (additive blending)
  vec3 layerJ = sanctumFlameShell(uv);
  finalColor += layerJ * 0.3;
  bloomMask = max(bloomMask, length(layerJ));
  
  // Layer K: Ether Fog Plane (additive blending)
  vec3 layerK = etherFogPlane(uv);
  finalColor += layerK * 0.2;
  bloomMask = max(bloomMask, length(layerK));
  
  // Layer L: Sanctum Light Shafts (additive blending)
  vec3 layerL = sanctumLightShafts(uv);
  finalColor += layerL * 0.6;
  bloomMask = max(bloomMask, length(layerL));
  
  // Layer M: Inner Spiral Matrix (additive blending)
  vec3 layerM = innerSpiralMatrix(uv);
  finalColor += layerM * 0.5;
  bloomMask = max(bloomMask, length(layerM));
  
  // Layer N: Divine Particle Stream (additive blending)
  vec3 layerN = divineParticleStream(uv);
  finalColor += layerN * 0.6;
  bloomMask = max(bloomMask, length(layerN));
  
  // Layer O: Dimensional Wave Rings (additive blending)
  vec3 layerO = dimensionalWaveRings(uv);
  finalColor += layerO * 0.5;
  bloomMask = max(bloomMask, length(layerO));
  
  // Layer P: Outer Sanctum Halo (additive blending)
  vec3 layerP = outerSanctumHalo(uv);
  finalColor += layerP * 0.4;
  bloomMask = max(bloomMask, length(layerP));
  
  // Layer Q: Sanctum Heart Core (additive blending)
  vec3 layerQ = sanctumHeartCore(uv);
  finalColor += layerQ * 0.7;
  bloomMask = max(bloomMask, length(layerQ));
  
  // Layer R: Celestial Lattice Veil (additive blending)
  vec3 layerR = celestialLatticeVeil(uv);
  finalColor += layerR * 0.3;
  bloomMask = max(bloomMask, length(layerR));
  
  // Layer S: Ether Thread Matrix (additive blending)
  vec3 layerS = etherThreadMatrix(uv);
  finalColor += layerS * 0.5;
  bloomMask = max(bloomMask, length(layerS));
  
  // Layer T: Spiral Light Towers (additive blending)
  vec3 layerT = spiralLightTowers(uv);
  finalColor += layerT * 0.6;
  bloomMask = max(bloomMask, length(layerT));
  
  // Layer U: Sanctum Rays (additive blending)
  vec3 layerU = sanctumRays(uv);
  finalColor += layerU * 0.4;
  bloomMask = max(bloomMask, length(layerU));
  
  // Layer V: Ascension Aura Field (additive blending)
  vec3 layerV = ascensionAuraField(uv);
  finalColor += layerV * 0.2;
  bloomMask = max(bloomMask, length(layerV));
  
  // Layer W: Reality Warp Layer (additive blending)
  vec3 layerW = realityWarpLayer(uv);
  finalColor += layerW * 0.3;
  bloomMask = max(bloomMask, length(layerW));
  
  // Layer X: Bloom Mask Layer (additive blending)
  vec3 layerX = bloomMaskLayer(uv);
  finalColor += layerX * 0.5;
  bloomMask = max(bloomMask, length(layerX));
  
  // ============================================
  // FINAL COMPOSITION
  // ============================================
  finalColor *= uIntensity;
  
  float alpha = min(length(finalColor), 0.95);
  
  // Clamp
  finalColor = clamp(finalColor, 0.0, 1.0);
  alpha = clamp(alpha, 0.0, 1.0);
  
  // Output color and bloom mask (for E12 post-processing)
  // Bloom mask stored in alpha channel intensity
  gl_FragColor = vec4(finalColor, alpha * bloomMask);
}
`;

