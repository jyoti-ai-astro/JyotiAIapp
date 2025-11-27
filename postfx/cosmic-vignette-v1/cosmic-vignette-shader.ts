/**
 * Cosmic Vignette v1 Shader
 * 
 * Phase 3 — Section 5: COSMIC VIGNETTE ENGINE v1
 * Cosmic Vignette Engine v1 (F5)
 * 
 * Cinematic Vignette + Mood Shading with:
 * - Radial vignette (inner softness + outer fade)
 * - Color grading tint (subtle gold → blue shift)
 * - Audio-reactive vignette pulse (bass expands radius)
 * - BlessingWave → cinematic white-gold wash
 * - CameraFOV compensation
 * - Filmic edge-darkening
 * - Optional elliptic vignette (mobile fallback → circular)
 */

export const cosmicVignetteShader = {
  uniforms: {
    uTime: { value: 0 },
    uIntensity: { value: 1.0 },
    uVignetteStrength: { value: 0.5 },
    uVignetteRadius: { value: 0.75 },
    uTintStrength: { value: 0.1 },
    uBass: { value: 0 },
    uMid: { value: 0 },
    uHigh: { value: 0 },
    uBlessingWaveProgress: { value: 0 },
    uCameraFOV: { value: 75.0 },
    uResolution: { value: [1, 1] },
    uIsCircular: { value: 1.0 }, // 1.0 = circular, 0.0 = elliptic
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
    uniform float uVignetteStrength;
    uniform float uVignetteRadius;
    uniform float uTintStrength;
    uniform float uBass;
    uniform float uMid;
    uniform float uHigh;
    uniform float uBlessingWaveProgress;
    uniform float uCameraFOV;
    uniform vec2 uResolution;
    uniform float uIsCircular;
    
    // ============================================
    // RADIAL VIGNETTE (Inner Softness + Outer Fade)
    // ============================================
    float calculateVignette(vec2 uv) {
      vec2 center = vec2(0.5, 0.5);
      vec2 offset = uv - center;
      
      // Aspect ratio correction
      float aspect = uResolution.x / uResolution.y;
      offset.x *= aspect;
      
      // Elliptic or circular vignette
      float distance;
      if (uIsCircular > 0.5) {
        // Circular vignette (mobile fallback)
        distance = length(offset);
      } else {
        // Elliptic vignette (cinematic)
        distance = length(offset * vec2(1.0, 1.0 / aspect));
      }
      
      // Base radius
      float radius = uVignetteRadius;
      
      // Audio-reactive vignette pulse: bass expands radius
      float bassPulse = 1.0 + uBass * 0.15;
      radius *= bassPulse;
      
      // FOV compensation
      float fovFactor = uCameraFOV / 75.0;
      radius *= fovFactor;
      
      // Inner softness (smooth transition from center)
      float innerSoftness = 0.3;
      float innerFade = smoothstep(0.0, innerSoftness, distance);
      
      // Outer fade (vignette darkening)
      float outerFade = smoothstep(radius, 1.0, distance);
      
      // Combine inner and outer
      float vignette = mix(1.0, 0.0, innerFade * outerFade);
      
      return vignette;
    }
    
    // ============================================
    // COLOR GRADING TINT (Gold → Blue Shift)
    // ============================================
    vec3 applyColorTint(vec3 color, vec2 uv) {
      // Distance from center
      vec2 center = vec2(0.5, 0.5);
      vec2 offset = uv - center;
      float distance = length(offset);
      
      // Gold tint in center, blue shift at edges
      vec3 goldTint = vec3(1.0, 0.95, 0.85);
      vec3 blueTint = vec3(0.9, 0.95, 1.0);
      
      // Blend based on distance
      float tintMix = smoothstep(0.0, 0.8, distance);
      vec3 tint = mix(goldTint, blueTint, tintMix);
      
      // Apply tint
      color = mix(color, color * tint, uTintStrength);
      
      return color;
    }
    
    // ============================================
    // FILMIC EDGE-DARKENING
    // ============================================
    float calculateEdgeDarkening(vec2 uv) {
      // Distance from edges
      float edgeX = min(uv.x, 1.0 - uv.x);
      float edgeY = min(uv.y, 1.0 - uv.y);
      float edgeDistance = min(edgeX, edgeY);
      
      // Filmic darkening (stronger at very edges)
      float darkening = smoothstep(0.0, 0.1, edgeDistance);
      darkening = 1.0 - (1.0 - darkening) * 0.2; // 20% darkening at edges
      
      return darkening;
    }
    
    // ============================================
    // BLESSING WAVE CINEMATIC WASH (White-Gold)
    // ============================================
    vec3 applyBlessingWash(vec3 color, vec2 uv) {
      if (uBlessingWaveProgress <= 0.0) return color;
      
      vec2 center = vec2(0.5, 0.5);
      vec2 offset = uv - center;
      float distance = length(offset);
      
      // Radial wash from center
      float wash = 1.0 - smoothstep(0.0, 0.7, distance);
      
      // Pulsing with blessing wave
      float pulse = sin(uTime * 2.0 + uBlessingWaveProgress * 6.28318) * 0.3 + 0.7;
      wash *= pulse * uBlessingWaveProgress;
      
      // White-gold wash color
      vec3 whiteGold = mix(vec3(1.0, 1.0, 1.0), vec3(1.0, 0.9, 0.6), uBlessingWaveProgress);
      
      // Apply wash
      color = mix(color, whiteGold, wash * 0.4);
      
      return color;
    }
    
    void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
      vec3 color = inputColor.rgb;
      
      // Calculate vignette
      float vignette = calculateVignette(uv);
      
      // Apply vignette darkening
      color *= mix(1.0, vignette, uVignetteStrength);
      
      // Apply color grading tint
      color = applyColorTint(color, uv);
      
      // Apply filmic edge-darkening
      float edgeDarkening = calculateEdgeDarkening(uv);
      color *= edgeDarkening;
      
      // Apply blessing wave cinematic wash
      color = applyBlessingWash(color, uv);
      
      // Apply intensity
      color = mix(inputColor.rgb, color, uIntensity);
      
      // Clamp
      color = clamp(color, 0.0, 1.0);
      
      outputColor = vec4(color, inputColor.a);
    }
  `,
};

