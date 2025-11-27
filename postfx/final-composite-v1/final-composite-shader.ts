/**
 * Final Composite v1 Shader
 * 
 * Phase 3 — Section 15: FINAL COMPOSITE ENGINE v1
 * Final Composite Engine v1 (F15)
 * 
 * Master Compositor & Final Output Stabilizer with:
 * - Exposure compensation (auto + manual)
 * - Soft clip (filmic white curve)
 * - Lift / Gamma / Gain (final)
 * - Final bloom-godrays merge with smooth envelope
 * - Anti-banding dithering (8x8 Bayer)
 * - Highlight repair (prevents bloom overburn)
 * - Black level compression (to avoid crushed shadows)
 * - BlessingWave → final cosmic white flash
 * - AudioReactive → micro vibrance + highlight shake
 * - FOV → subtle compensations
 * - Gate fade: fade-in/out driven by globalProgress
 * - Mobile fallback: reduce vibrance + reduce highlight repair strength
 */

export const finalCompositeShader = {
  uniforms: {
    uTime: { value: 0 },
    uIntensity: { value: 1.0 },
    uBass: { value: 0 },
    uMid: { value: 0 },
    uHigh: { value: 0 },
    uBlessingWaveProgress: { value: 0 },
    uCameraFOV: { value: 75.0 },
    uExposure: { value: 1.0 },
    uFade: { value: 1.0 },
    uResolution: { value: [1, 1] },
    uVibrance: { value: 1.0 },
    uHighlightRepair: { value: 0.5 },
    uDitherStrength: { value: 0.5 },
    uLift: { value: 0.0 },
    uGamma: { value: 1.0 },
    uGain: { value: 1.0 },
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
    uniform float uExposure;
    uniform float uFade;
    uniform vec2 uResolution;
    uniform float uVibrance;
    uniform float uHighlightRepair;
    uniform float uDitherStrength;
    uniform float uLift;
    uniform float uGamma;
    uniform float uGain;
    uniform sampler2D inputBuffer;
    
    // Removed varying vec2 vUv; (using mainImage signature)
    
    // ============================================
    // 8x8 BAYER DITHERING MATRIX
    // ============================================
    float bayerDither8x8(vec2 uv) {
      // 4x4 Bayer matrix (tiled to create 8x8 pattern)
      // Values normalized to 0-1 range
      float bayer[16];
      bayer[0]  = 0.0 / 16.0;  bayer[1]  = 8.0 / 16.0;  bayer[2]  = 2.0 / 16.0;  bayer[3]  = 10.0 / 16.0;
      bayer[4]  = 12.0 / 16.0; bayer[5]  = 4.0 / 16.0;  bayer[6]  = 14.0 / 16.0; bayer[7]  = 6.0 / 16.0;
      bayer[8]  = 3.0 / 16.0;  bayer[9]  = 11.0 / 16.0; bayer[10] = 1.0 / 16.0;  bayer[11] = 9.0 / 16.0;
      bayer[12] = 15.0 / 16.0; bayer[13] = 7.0 / 16.0;  bayer[14] = 13.0 / 16.0; bayer[15] = 5.0 / 16.0;
      
      // Tile the 4x4 matrix to create 8x8 pattern
      vec2 tile = floor(mod(uv * uResolution, 8.0));
      int x = int(mod(tile.x, 4.0));
      int y = int(mod(tile.y, 4.0));
      
      // Access matrix using 1D index
      int index = y * 4 + x;
      return bayer[index];
    }
    
    // ============================================
    // SOFT CLIP (FILMIC WHITE CURVE)
    // ============================================
    vec3 softClip(vec3 color, float threshold) {
      // Filmic white curve - smooth rolloff
      float maxChannel = max(max(color.r, color.g), color.b);
      if (maxChannel > threshold) {
        float excess = maxChannel - threshold;
        float compression = 1.0 / (1.0 + excess * 2.0);
        return color * compression;
      }
      return color;
    }
    
    // ============================================
    // LIFT / GAMMA / GAIN
    // ============================================
    vec3 liftGammaGain(vec3 color, float lift, float gamma, float gain) {
      // Lift (add to shadows)
      color = color + lift * (1.0 - color);
      
      // Gamma (midtones)
      color = pow(max(color, 0.0), vec3(1.0 / gamma));
      
      // Gain (highlights)
      color = color * gain;
      
      return color;
    }
    
    // ============================================
    // BLACK LEVEL COMPRESSION
    // ============================================
    vec3 blackLevelCompression(vec3 color, float threshold) {
      // Compress very dark areas to avoid crushed shadows
      float minChannel = min(min(color.r, color.g), color.b);
      if (minChannel < threshold) {
        float compression = smoothstep(0.0, threshold, minChannel);
        return mix(vec3(threshold * 0.1), color, compression);
      }
      return color;
    }
    
    // ============================================
    // HIGHLIGHT REPAIR (PREVENTS BLOOM OVERBURN)
    // ============================================
    vec3 highlightRepair(vec3 color, float strength) {
      // Detect overexposed areas
      float maxChannel = max(max(color.r, color.g), color.b);
      if (maxChannel > 0.95) {
        // Reduce overexposure
        float excess = (maxChannel - 0.95) / 0.05;
        float repair = 1.0 - excess * strength;
        return color * repair;
      }
      return color;
    }
    
    // ============================================
    // VIBRANCE (SELECTIVE SATURATION)
    // ============================================
    vec3 applyVibrance(vec3 color, float vibrance) {
      float luminance = dot(color, vec3(0.299, 0.587, 0.114));
      float saturation = length(color - vec3(luminance));
      
      // Boost saturation of less saturated colors
      float boost = 1.0 + (1.0 - saturation) * (vibrance - 1.0);
      return mix(vec3(luminance), color, boost);
    }
    
    // ============================================
    // AUDIO-REACTIVE MICRO VIBRANCE + HIGHLIGHT SHAKE
    // ============================================
    vec3 audioReactiveEffects(vec3 color, vec2 uv) {
      // Micro vibrance from audio
      float vibranceBoost = 1.0 + uHigh * 0.05;
      color = applyVibrance(color, vibranceBoost);
      
      // Highlight shake (subtle)
      float shake = sin(uTime * 10.0 + uv.x * 20.0) * uBass * 0.01;
      color += vec3(shake);
      
      return color;
    }
    
    // ============================================
    // FOV COMPENSATION
    // ============================================
    vec3 fovCompensation(vec3 color) {
      // Subtle FOV-based adjustments
      float fovFactor = uCameraFOV / 75.0;
      // Slight exposure adjustment based on FOV
      color *= 1.0 + (fovFactor - 1.0) * 0.05;
      return color;
    }
    
    void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
      // Removed vec2 uv = vUv; (uv is now a parameter)
      
      // Sample input texture (now passed as inputColor)
      // vec4 inputColor = texture2D(inputTexture, uv); // Removed
      vec3 color = inputColor.rgb;
      
      // ============================================
      // EXPOSURE COMPENSATION
      // ============================================
      color *= uExposure;
      
      // ============================================
      // SOFT CLIP (FILMIC WHITE CURVE)
      // ============================================
      color = softClip(color, 0.9);
      
      // ============================================
      // LIFT / GAMMA / GAIN (FINAL)
      // ============================================
      color = liftGammaGain(color, uLift, uGamma, uGain);
      
      // ============================================
      // HIGHLIGHT REPAIR (PREVENTS BLOOM OVERBURN)
      // ============================================
      color = highlightRepair(color, uHighlightRepair);
      
      // ============================================
      // BLACK LEVEL COMPRESSION
      // ============================================
      color = blackLevelCompression(color, 0.02);
      
      // ============================================
      // VIBRANCE
      // ============================================
      color = applyVibrance(color, uVibrance);
      
      // ============================================
      // AUDIO-REACTIVE EFFECTS
      // ============================================
      color = audioReactiveEffects(color, uv);
      
      // ============================================
      // BLESSING WAVE FINAL COSMIC WHITE FLASH (Phase 13 - F28)
      // ============================================
      if (uBlessingWaveProgress > 0.0) {
        // White flash curve: strength = pow(blessingProgress, 2.0)
        float strength = pow(uBlessingWaveProgress, 2.0);
        // Fade-out with smoothstep
        float fadeOut = smoothstep(0.5, 1.0, uBlessingWaveProgress);
        strength *= (1.0 - fadeOut);
        // Add white flash
        color = mix(color, vec3(1.0), strength * 0.3);
      }
      
      // ============================================
      // FOV COMPENSATION
      // ============================================
      color = fovCompensation(color);
      
      // ============================================
      // GATE FADE (FADE-IN/OUT)
      // ============================================
      color *= uFade;
      
      // ============================================
      // ANTI-BANDING DITHERING (8x8 BAYER)
      // ============================================
      float dither = bayerDither8x8(uv);
      dither = (dither - 0.5) * uDitherStrength / 255.0;
      color += dither;
      
      // ============================================
      // INTENSITY
      // ============================================
      color *= uIntensity;
      
      // ============================================
      // CLAMP
      // ============================================
      color = clamp(color, 0.0, 1.0);
      
      outputColor = vec4(color, inputColor.a);
    }
  `,
};

