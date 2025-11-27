/**
 * Cosmic Chromatic v1 Shader
 * 
 * Phase 3 — Section 3: COSMIC CHROMATIC ENGINE v1
 * Cosmic Chromatic Engine v1 (F3)
 * 
 * Chromatic Aberration + Prism Fringe + Velocity Warp with:
 * - RGB shift based on radial distance from screen center
 * - Prism dispersion gradient (gold → violet)
 * - BlessingWave flash → prism flare
 * - Audio-reactive chroma offset (bass/mid/high)
 * - CameraFOV compensation
 * - VelocityWarp: subtle smear using motion vector approximation
 */

export const cosmicChromaticShader = {
  uniforms: {
    uTime: { value: 0 },
    uIntensity: { value: 0.02 },
    uBass: { value: 0 },
    uMid: { value: 0 },
    uHigh: { value: 0 },
    uBlessingWaveProgress: { value: 0 },
    uCameraFOV: { value: 75.0 },
    uWarpStrength: { value: 0.1 },
    uPrismStrength: { value: 1.0 },
    uResolution: { value: [1, 1] },
    uGlobalMotion: { value: [0, 0] },
  },

  vertexShader: `
    varying vec2 vUv;
    
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,

  fragmentShader: `
    precision highp float;
    
    uniform float uTime;
    uniform float uIntensity;
    uniform float uBass;
    uniform float uMid;
    uniform float uHigh;
    uniform float uBlessingWaveProgress;
    uniform float uCameraFOV;
    uniform float uWarpStrength;
    uniform float uPrismStrength;
    uniform vec2 uResolution;
    uniform vec2 uGlobalMotion;
    
    // ============================================
    // PRISM DISPERSION GRADIENT (Gold → Violet)
    // ============================================
    vec3 prismDispersion(float t) {
      // Gold (1.0, 0.8, 0.3) → Violet (0.5, 0.0, 1.0)
      vec3 gold = vec3(1.0, 0.8, 0.3);
      vec3 violet = vec3(0.5, 0.0, 1.0);
      vec3 cyan = vec3(0.0, 1.0, 1.0);
      vec3 blue = vec3(0.0, 0.5, 1.0);
      
      if (t < 0.25) {
        return mix(gold, cyan, t * 4.0);
      } else if (t < 0.5) {
        return mix(cyan, blue, (t - 0.25) * 4.0);
      } else if (t < 0.75) {
        return mix(blue, violet, (t - 0.5) * 4.0);
      } else {
        return violet;
      }
    }
    
    // ============================================
    // RGB SHIFT (Radial Distance Based)
    // ============================================
    vec2 calculateChromaOffset(vec2 uv, float intensity, float bass, float mid, float high) {
      // Center of screen
      vec2 center = vec2(0.5, 0.5);
      
      // Radial distance from center
      vec2 offset = uv - center;
      float distance = length(offset);
      
      // Normalize direction
      vec2 direction = normalize(offset);
      
      // Base chroma intensity (increases with distance from center)
      float chromaIntensity = intensity * distance * 2.0;
      
      // Audio-reactive chroma offset
      float audioChroma = bass * 0.3 + mid * 0.2 + high * 0.1;
      chromaIntensity += audioChroma * 0.5;
      
      // BlessingWave → increased chroma
      if (uBlessingWaveProgress > 0.0) {
        float blessingChroma = uBlessingWaveProgress * 2.0;
        chromaIntensity += blessingChroma;
      }
      
      // FOV compensation
      float fovFactor = uCameraFOV / 75.0;
      chromaIntensity *= fovFactor;
      
      // Calculate RGB shift offsets
      // Red shifts outward, Blue shifts inward, Green stays centered
      vec2 redOffset = direction * chromaIntensity * 1.0;
      vec2 greenOffset = direction * chromaIntensity * 0.0;
      vec2 blueOffset = direction * chromaIntensity * -0.8;
      
      // Return offset (we'll use this for sampling)
      return redOffset;
    }
    
    // ============================================
    // VELOCITY WARP (Screen-Space Motion Vector)
    // ============================================
    vec2 calculateVelocityWarp(vec2 uv, vec2 motion) {
      // Approximate motion vector from global motion
      vec2 velocity = motion * uWarpStrength;
      
      // Apply subtle smear in motion direction
      vec2 warpedUV = uv + velocity;
      
      // Clamp to prevent sampling outside bounds
      warpedUV = clamp(warpedUV, 0.0, 1.0);
      
      return warpedUV;
    }
    
    // ============================================
    // PRISM FLARE (BlessingWave Flash)
    // ============================================
    float calculatePrismFlare(vec2 uv) {
      if (uBlessingWaveProgress <= 0.0) return 0.0;
      
      vec2 center = vec2(0.5, 0.5);
      vec2 offset = uv - center;
      float distance = length(offset);
      
      // Radial flare pattern
      float flare = 1.0 - smoothstep(0.0, 0.5, distance);
      
      // Pulsing with blessing wave
      float pulse = sin(uTime * 5.0 + uBlessingWaveProgress * 6.28318) * 0.5 + 0.5;
      flare *= pulse * uBlessingWaveProgress;
      
      return flare * uPrismStrength;
    }
    
    void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
      // Apply velocity warp
      vec2 warpedUV = calculateVelocityWarp(uv, uGlobalMotion);
      
      // Calculate chroma offset
      vec2 chromaOffset = calculateChromaOffset(warpedUV, uIntensity, uBass, uMid, uHigh);
      
      // Sample RGB channels with offsets
      vec2 redUV = warpedUV + chromaOffset * 1.0;
      vec2 greenUV = warpedUV + chromaOffset * 0.0;
      vec2 blueUV = warpedUV + chromaOffset * -0.8;
      
      // Clamp UVs
      redUV = clamp(redUV, 0.0, 1.0);
      greenUV = clamp(greenUV, 0.0, 1.0);
      blueUV = clamp(blueUV, 0.0, 1.0);
      
      // Sample RGB channels from inputBuffer (provided by postprocessing)
      float r = texture2D(inputBuffer, redUV).r;
      float g = texture2D(inputBuffer, greenUV).g;
      float b = texture2D(inputBuffer, blueUV).b;
      
      vec3 color = vec3(r, g, b);
      
      // Apply prism dispersion gradient
      vec2 center = vec2(0.5, 0.5);
      vec2 offset = warpedUV - center;
      float distance = length(offset);
      float prismT = clamp(distance * 2.0, 0.0, 1.0);
      
      vec3 prismColor = prismDispersion(prismT);
      float prismMix = distance * uPrismStrength * 0.3;
      color = mix(color, prismColor, prismMix);
      
      // Apply prism flare (BlessingWave flash)
      float flare = calculatePrismFlare(warpedUV);
      if (flare > 0.0) {
        vec3 flareColor = prismDispersion(uBlessingWaveProgress);
        color = mix(color, flareColor, flare * 0.5);
      }
      
      // Clamp
      color = clamp(color, 0.0, 1.0);
      
      outputColor = vec4(color, inputColor.a);
    }
  `,
};

