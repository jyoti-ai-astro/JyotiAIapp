/**
 * Cosmic GodRays v1 Shader
 * 
 * Phase 3 — Section 14: COSMIC GODRAYS ENGINE v1
 * Cosmic GodRays Engine v1 (F14)
 * 
 * Volumetric Divine Light Shafts with Ray-Marching with:
 * - Volumetric ray-marching (16-32 steps, 12 steps on mobile)
 * - Depth-based occlusion (sample depthBuffer)
 * - Light direction + sunPosition param
 * - Gold-violet volumetric scattering
 * - Shadow mask from bright buffer (bloom mask)
 * - Beam intensity falloff (distance falloff + radial falloff)
 * - Audio-reactive shaft pulsing (bass → width, high → shimmer)
 * - BlessingWave → divine beam burst (white-gold)
 * - CameraFOV compensation
 * - Mouse parallax (subtle)
 * - Mobile fallback: reduce steps to 12, reduce scattering strength
 */

export const cosmicGodRaysShader = {
  uniforms: {
    uTime: { value: 0 },
    uSunPos: { value: [0.5, 0.5] },
    uLightDir: { value: [0.0, -1.0, 0.0] },
    uIntensity: { value: 0.5 },
    uBass: { value: 0 },
    uMid: { value: 0 },
    uHigh: { value: 0 },
    uBlessingWaveProgress: { value: 0 },
    uCameraFOV: { value: 75.0 },
    uDepthTexture: { value: null },
    uResolution: { value: [1, 1] },
    uParallaxStrength: { value: 0.1 },
    uScatteringStrength: { value: 0.3 },
    uStepCount: { value: 24.0 },
    uMouse: { value: [0.5, 0.5] },
  },

  vertexShader: `
    
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,

  fragmentShader: `
    precision highp float;
    
    uniform float uTime;
    uniform vec2 uSunPos;
    uniform vec3 uLightDir;
    uniform float uIntensity;
    uniform float uBass;
    uniform float uMid;
    uniform float uHigh;
    uniform float uBlessingWaveProgress;
    uniform float uCameraFOV;
    uniform sampler2D uDepthTexture;
    uniform vec2 uResolution;
    uniform float uParallaxStrength;
    uniform float uScatteringStrength;
    uniform float uStepCount;
    uniform vec2 uMouse;
    
    
    // ============================================
    // DEPTH SAMPLE (Linearize depth)
    // ============================================
    float sampleDepth(vec2 uv) {
      // Sample depth texture
      float depth = texture2D(uDepthTexture, uv).r;
      // Linearize depth (assuming perspective projection)
      // Depth is already in 0-1 range, return as-is
      return depth;
    }
    
    // ============================================
    // EXTRACT BRIGHTNESS (Bloom Mask)
    // ============================================
    float extractBrightness(vec4 color) {
      float luminance = dot(color.rgb, vec3(0.299, 0.587, 0.114));
      return max(0.0, luminance - 0.7);
    }
    
    // ============================================
    // VOLUMETRIC RAY-MARCHING
    // ============================================
    float volumetricRayMarch(vec2 uv, vec2 sunPos, vec3 lightDir) {
      // Mouse parallax
      vec2 parallaxOffset = (uMouse - vec2(0.5, 0.5)) * uParallaxStrength;
      vec2 rayStart = uv + parallaxOffset;
      
      // Ray direction from pixel to sun
      vec2 rayDir = normalize(sunPos - rayStart);
      float rayLength = length(sunPos - rayStart);
      
      // Step size
      float stepSize = rayLength / uStepCount;
      
      // Accumulate light
      float light = 0.0;
      
      // Ray-march
      int steps = int(uStepCount);
      for (int i = 0; i < 32; i++) {
        if (i >= steps) break;
        
        float t = float(i) / float(steps);
        vec2 samplePos = rayStart + rayDir * t * rayLength;
        
        // Clamp to screen
        if (samplePos.x < 0.0 || samplePos.x > 1.0 || samplePos.y < 0.0 || samplePos.y > 1.0) {
          continue;
        }
        
        // Sample depth
        float depth = sampleDepth(samplePos);
        
        // Check occlusion (if depth is close, we hit something)
        float occlusion = smoothstep(0.95, 1.0, depth);
        
        // Distance falloff
        float distanceFalloff = 1.0 / (1.0 + t * 5.0);
        
        // Radial falloff (from center of ray)
        float radialDist = abs(t - 0.5) * 2.0;
        float radialFalloff = 1.0 - smoothstep(0.0, 1.0, radialDist);
        
        // Accumulate light
        light += occlusion * distanceFalloff * radialFalloff;
      }
      
      // Normalize by step count
      light /= float(steps);
      
      return light;
    }
    
    // ============================================
    // GOLD-VIOLET VOLUMETRIC SCATTERING
    // ============================================
    vec3 volumetricScattering(float light, vec2 uv) {
      // Gold-violet scattering
      vec3 gold = vec3(1.0, 0.95, 0.85);
      vec3 violet = vec3(0.9, 0.85, 1.0);
      
      // Blend based on position
      float blend = smoothstep(0.3, 0.7, uv.y);
      vec3 scatterColor = mix(gold, violet, blend);
      
      return scatterColor * light * uScatteringStrength;
    }
    
    // ============================================
    // AUDIO-REACTIVE SHAFT PULSING
    // ============================================
    float audioReactivePulsing(float light, vec2 uv) {
      // Bass → width
      float widthBoost = 1.0 + uBass * 0.3;
      
      // High → shimmer
      float shimmer = sin(uTime * 5.0 + uv.x * 10.0) * uHigh * 0.1;
      shimmer = shimmer * 0.5 + 0.5;
      
      return light * widthBoost * (1.0 + shimmer);
    }
    
    // ============================================
    // BLESSING WAVE DIVINE BEAM BURST
    // ============================================
    vec3 blessingDivineBeam(vec2 uv, vec2 sunPos) {
      if (uBlessingWaveProgress <= 0.0) return vec3(0.0);
      
      // Divine beam burst
      float burst = uBlessingWaveProgress;
      
      // Pulsing with blessing wave
      float pulse = sin(uTime * 4.0 + uBlessingWaveProgress * 6.28318) * 0.3 + 0.7;
      burst *= pulse;
      
      // Radial beam from sun position
      vec2 rayDir = normalize(uv - sunPos);
      float distance = length(uv - sunPos);
      
      // Beam intensity
      float beam = 1.0 / (1.0 + distance * 10.0);
      beam = smoothstep(0.3, 0.0, distance);
      beam *= burst;
      
      // White-gold divine beam
      vec3 whiteGold = vec3(1.0, 0.98, 0.92);
      
      return whiteGold * beam * 0.6;
    }
    
    void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
      vec3 color = inputColor.rgb;
      
      // Extract brightness for shadow mask
      float brightness = extractBrightness(inputColor);
      
      // Volumetric ray-marching
      float light = volumetricRayMarch(uv, uSunPos, uLightDir);
      
      // Apply shadow mask (only show rays from bright areas)
      light *= brightness;
      
      // Audio-reactive shaft pulsing
      light = audioReactivePulsing(light, uv);
      
      // Gold-violet volumetric scattering
      vec3 scattering = volumetricScattering(light, uv);
      
      // Blessing wave divine beam burst
      vec3 blessingBeam = blessingDivineBeam(uv, uSunPos);
      
      // Combine all effects
      vec3 godRays = scattering + blessingBeam;
      
      // FOV compensation
      float fovFactor = uCameraFOV / 75.0;
      godRays *= fovFactor;
      
      // Apply intensity
      godRays *= uIntensity;
      
      // Composite with input (additive)
      color += godRays;
      
      // Clamp
      color = clamp(color, 0.0, 1.0);
      
      outputColor = vec4(color, inputColor.a);
    }
  `,
};

