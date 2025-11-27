# Missing Images FAQ

## Are Missing Images Causing Errors?

**No, missing images are NOT causing the shader errors you're seeing.**

The errors you're seeing (`Could not find mainImage or mainUv function`) are **shader format issues**, not image loading issues.

## What's Actually Happening

### Shader Errors (Current Issue)
- **Cause**: Post-processing shaders using old GLSL format (`void main()`) instead of the format expected by the `postprocessing` library (`mainImage`)
- **Fix**: Converting shaders to use `mainImage` format (already fixed for CosmicChromaticPass and CosmicGlarePass)
- **Status**: Being fixed now

### Missing Images (Not an Issue)
- **Impact**: **None** - Missing images won't cause errors
- **Current State**: All image references have fallbacks or are optional
- **When to Add**: After backend is complete and website is live (as per your plan)

## Image Usage in Code

### 1. Content Images (`public/content/`)
- **Status**: Placeholders expected
- **Usage**: Used in content blocks with fallback handling
- **Impact**: If missing, shows placeholder or skips image section
- **No errors**: Code handles missing images gracefully

### 2. Hero Images (`public/hero/`)
- **Status**: Placeholders expected  
- **Usage**: Open Graph meta tags for social sharing
- **Impact**: If missing, social shares won't have preview images (not an error)
- **No errors**: Next.js handles missing images in meta tags

### 3. Component Images
- **Status**: All have fallbacks
- **Usage**: Profile photos, avatars, etc.
- **Impact**: Shows default placeholder if missing
- **No errors**: All image components have error handling

## Your Original Plan (Still Valid)

✅ **Phase 1**: Backend + Core Functionality (Current)
- Build all APIs
- Create database structure
- Implement core features
- **Images**: Not needed yet

✅ **Phase 2**: UI/UX Frontend (Current)
- Build all pages
- Create components
- Implement interactions
- **Images**: Placeholders are fine

✅ **Phase 3**: Website Goes Live
- Deploy to production
- Test all features
- **Images**: Still placeholders OK

✅ **Phase 4**: Final Polish (Future)
- Add all final images
- Optimize assets
- Final design touches
- **This is when you'll add images**

## Current Image Status

### What's Missing (Expected)
- Hero images for social sharing
- Content section images
- Profile/avatar placeholders

### What's Working
- All image loading has error handling
- Fallbacks are in place
- No image-related errors in code

## Recommendation

**Don't add images yet.** Focus on:
1. ✅ Fixing shader errors (in progress)
2. ✅ Getting the site functional
3. ✅ Testing all features
4. ⏳ Add images in final polish phase

The shader errors are unrelated to images and are being fixed now.

