/**
 * Cosmic LensFlare v1 Shader
 * 
 * Phase 3 — Section 7: COSMIC LENSFLARE ENGINE v1
 * Cosmic LensFlare Engine v1 (F7)
 * 
 * Cinematic Lens Flares + Ghosting + Light Streaks + Chroma Halos with:
 * - Primary anamorphic flare (horizontal)
 * - Secondary vertical flare component
 * - Lens ghosting: multi-order reflections (5-7 ghosts)
 * - Chroma halos (gold → cyan → violet)
 * - Bloom mask interaction (reads bright buffer)
 * - BlessingWave flare burst (white-gold)
 * - Audio-reactive flare length + ghost intensity
 * - CameraFOV compensation
 * - Mobile fallback: reduce ghost count to 3
 */

export const cosmicLensFlareShader = {
  uniforms: {
    uTime: { value: 0 },
    uIntensity: { value: 1.0 },
    uFlareIntensity: { value: 0.3 },
    uGhostIntensity: { value: 0.2 },
    uChromaStrength: { value: 0.15 },
    uStreakLength: { value: 0.5 },
    uBass: { value: 0 },
    uMid: { value: 0 },
    uHigh: { value: 0 },
    uBlessingWaveProgress: { value: 0 },
    uCameraFOV: { value: 75.0 },
    uResolution: { value: [1, 1] },
    uGhostCount: { value: 5.0 },
    uFlareCenter: { value: [0.5, 0.5] },
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
    uniform float uFlareIntensity;
    uniform float uGhostIntensity;
    uniform float uChromaStrength;
    uniform float uStreakLength;
    uniform float uBass;
    uniform float uMid;
    uniform float uHigh;
    uniform float uBlessingWaveProgress;
    uniform float uCameraFOV;
    uniform vec2 uResolution;
    uniform float uGhostCount;
    uniform vec2 uFlareCenter;
    uniform sampler2D inputTexture;
    
    varying vec2 vUv;
    
    // ============================================
    // HASH FUNCTION (for noise)
    // ============================================
    float hash(vec2 p) {
      return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
    }
    
    // ============================================
    // NOISE FUNCTION
    // ============================================
    float noise(vec2 p) {
      vec2 i = floor(p);
      vec2 f = fract(p);
      f = f * f * (3.0 - 2.0 * f);
      
      float a = hash(i);
      float b = hash(i + vec2(1.0, 0.0));
      float c = hash(i + vec2(0.0, 1.0));
      float d = hash(i + vec2(1.0, 1.0));
      
      return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
    }
    
    // ============================================
    // BRIGHT PIXEL EXTRACTION (Bloom Mask)
    // ============================================
    float extractBrightness(vec4 color) {
      float luminance = dot(color.rgb, vec3(0.299, 0.587, 0.114));
      return max(0.0, luminance - 0.7);
    }
    
    // ============================================
    // PRIMARY ANAMORPHIC FLARE (Horizontal)
    // ============================================
    vec3 primaryAnamorphicFlare(vec2 uv, vec2 center, float brightness) {
      vec2 offset = uv - center;
      float distance = length(offset);
      
      // Audio-reactive flare length: bass → longer flares
      float flareLength = uStreakLength * (1.0 + uBass * 0.5);
      
      // FOV compensation
      float fovFactor = uCameraFOV / 75.0;
      flareLength *= fovFactor;
      
      // Horizontal anamorphic streak
      float horizontalDist = abs(offset.x);
      float flare = 1.0 / (1.0 + horizontalDist * flareLength * 10.0);
      
      // Vertical falloff
      float verticalDist = abs(offset.y);
      flare *= 1.0 / (1.0 + verticalDist * 5.0);
      
      // Apply brightness mask
      flare *= brightness;
      
      return vec3(flare) * uFlareIntensity;
    }
    
    // ============================================
    // SECONDARY VERTICAL FLARE COMPONENT
    // ============================================
    vec3 secondaryVerticalFlare(vec2 uv, vec2 center, float brightness) {
      vec2 offset = uv - center;
      
      // Vertical streak
      float verticalDist = abs(offset.y);
      float flare = 1.0 / (1.0 + verticalDist * uStreakLength * 8.0);
      
      // Horizontal falloff
      float horizontalDist = abs(offset.x);
      flare *= 1.0 / (1.0 + horizontalDist * 3.0);
      
      // Apply brightness mask
      flare *= brightness * 0.5;
      
      return vec3(flare) * uFlareIntensity * 0.6;
    }
    
    // ============================================
    // LENS GHOSTING (Multi-Order Reflections)
    // ============================================
    vec3 lensGhosting(vec2 uv, vec2 center, float brightness) {
      vec3 ghosts = vec3(0.0);
      
      int ghostCount = int(uGhostCount);
      
      // Generate multiple ghost reflections
      for (int i = 1; i <= 7; i++) {
        if (i > ghostCount) break;
        
        float ghostIndex = float(i);
        
        // Ghost position (reflected from center)
        vec2 ghostOffset = (uv - center) * (1.0 + ghostIndex * 0.3);
        vec2 ghostUV = center + ghostOffset;
        
        // Clamp to screen bounds
        if (ghostUV.x < 0.0 || ghostUV.x > 1.0 || ghostUV.y < 0.0 || ghostUV.y > 1.0) continue;
        
        // Sample bright areas
        vec4 ghostColor = texture2D(inputTexture, ghostUV);
        float ghostBrightness = extractBrightness(ghostColor);
        
        // Ghost intensity (decays with order)
        float ghostIntensity = uGhostIntensity / (ghostIndex * ghostIndex);
        
        // Audio-reactive ghost intensity: mid → intensity
        ghostIntensity *= (1.0 + uMid * 0.2);
        
        // Ghost shape (circular falloff)
        float ghostDist = length(ghostOffset);
        float ghostShape = 1.0 / (1.0 + ghostDist * 5.0);
        
        ghosts += ghostColor.rgb * ghostBrightness * ghostIntensity * ghostShape;
      }
      
      return ghosts;
    }
    
    // ============================================
    // CHROMA HALOS (Gold → Cyan → Violet)
    // ============================================
    vec3 chromaHalos(vec2 uv, vec2 center) {
      vec2 offset = uv - center;
      float distance = length(offset);
      
      // Chroma halo colors
      vec3 gold = vec3(1.0, 0.9, 0.6);
      vec3 cyan = vec3(0.4, 1.0, 1.0);
      vec3 violet = vec3(0.8, 0.5, 1.0);
      
      // Distance-based color shift
      float t = clamp(distance * 2.0, 0.0, 1.0);
      vec3 haloColor;
      if (t < 0.33) {
        haloColor = mix(gold, cyan, t * 3.0);
      } else if (t < 0.66) {
        haloColor = mix(cyan, violet, (t - 0.33) * 3.0);
      } else {
        haloColor = violet;
      }
      
      // Halo shape (radial falloff)
      float halo = 1.0 / (1.0 + distance * 8.0);
      halo = smoothstep(0.3, 0.0, distance);
      
      return haloColor * halo * uChromaStrength;
    }
    
    // ============================================
    // BLESSING WAVE FLARE BURST (White-Gold)
    // ============================================
    vec3 blessingFlareBurst(vec2 uv, vec2 center) {
      if (uBlessingWaveProgress <= 0.0) return vec3(0.0);
      
      vec2 offset = uv - center;
      float distance = length(offset);
      
      // Radial flare burst
      float flare = 1.0 / (1.0 + distance * 5.0);
      
      // Pulsing with blessing wave
      float pulse = sin(uTime * 4.0 + uBlessingWaveProgress * 6.28318) * 0.5 + 0.5;
      flare *= pulse * uBlessingWaveProgress;
      
      // White-gold color
      vec3 whiteGold = mix(vec3(1.0, 1.0, 1.0), vec3(1.0, 0.9, 0.6), uBlessingWaveProgress);
      
      return whiteGold * flare * 2.0;
    }
    
    void main() {
      vec2 uv = vUv;
      vec2 center = uFlareCenter;
      
      // Sample input texture
      vec4 inputColor = texture2D(inputTexture, uv);
      
      // Extract brightness for bloom mask interaction
      float brightness = extractBrightness(inputColor);
      
      // Primary anamorphic flare (horizontal)
      vec3 primaryFlare = primaryAnamorphicFlare(uv, center, brightness);
      
      // Secondary vertical flare
      vec3 secondaryFlare = secondaryVerticalFlare(uv, center, brightness);
      
      // Lens ghosting (multi-order reflections)
      vec3 ghosts = lensGhosting(uv, center, brightness);
      
      // Chroma halos
      vec3 halos = chromaHalos(uv, center);
      
      // Blessing wave flare burst
      vec3 blessingFlare = blessingFlareBurst(uv, center);
      
      // Combine all flare effects
      vec3 flare = primaryFlare + secondaryFlare + ghosts + halos + blessingFlare;
      
      // Apply intensity
      flare *= uIntensity;
      
      // Composite with input (additive blending)
      vec3 finalColor = inputColor.rgb + flare;
      
      // Clamp
      finalColor = clamp(finalColor, 0.0, 1.0);
      
      gl_FragColor = vec4(finalColor, inputColor.a);
    }
  `,
};

