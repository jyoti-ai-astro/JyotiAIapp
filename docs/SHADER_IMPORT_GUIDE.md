# Shader Import Guide

## Current Implementation

All shaders are currently embedded as template strings in TypeScript files (`.ts`), not as separate `.glsl` files. This is the recommended approach for Next.js and works well with the `postprocessing` library.

## Shader File Structure

Shaders are located in:
- `postfx/cosmic-*/cosmic-*-shader.ts` - Post-processing shaders
- `cosmos/**/shaders/*.ts` - 3D scene shaders

All shaders are exported as constants and imported in their respective pass/effect files.

## If You Need to Use Separate .glsl Files

If you need to extract shaders to separate `.glsl` files in the future, use the `?raw` syntax:

```typescript
// ✅ Correct - using ?raw syntax
import fragmentShader from './shader.glsl?raw';
import vertexShader from './shader.vert?raw';

// ❌ Incorrect - will be tree-shaken
import fragmentShader from './shader.glsl';
```

## Webpack Configuration

The `next.config.mjs` file is configured to:
1. Handle `.glsl`, `.vert`, and `.frag` files as raw source
2. Mark `postfx` and `cosmos` directories as having side effects
3. Prevent tree-shaking of shader modules

## Package.json Side Effects

The `package.json` includes a `sideEffects` field to ensure shader files are not tree-shaken:

```json
{
  "sideEffects": [
    "**/*.css",
    "**/postfx/**/*.ts",
    "**/cosmos/**/*.ts",
    "**/lib/**/*.ts"
  ]
}
```

## Verification

All shader exports are verified in:
- `postfx/cosmic-*/index.ts` - All shader constants are exported
- Shaders are used in `cosmic-*-pass.ts` files via the `Effect` class

## Current Status

✅ All shaders are properly exported
✅ Webpack config prevents tree-shaking
✅ Package.json sideEffects field configured
✅ No separate .glsl files (all embedded in TypeScript)

