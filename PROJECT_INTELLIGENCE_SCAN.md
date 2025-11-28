# COMPLETE PROJECT INTELLIGENCE SCAN
**Generated:** 2024-11-28
**Project:** Jyoti AI App
**Root:** /Users/diptanshuojha/Desktop/JyotiAIapp

---

## 1. FULL PROJECT TREE STRUCTURE

```
JyotiAIapp/
├── app/                          # Next.js App Router - All routes & pages
│   ├── page.tsx                  # HOME PAGE (Landing) - Uses R3F Canvas directly
│   ├── layout.tsx                # ROOT LAYOUT - Wraps entire app
│   ├── globals.css               # Global CSS with cosmic theme variables
│   ├── loading.tsx               # Loading state
│   ├── not-found.tsx             # 404 page
│   ├── global-error.tsx           # Global error boundary
│   ├── robots.ts                 # SEO robots.txt generator
│   ├── sitemap.ts                # SEO sitemap generator
│   │
│   ├── (root)/                   # Public website routes
│   │   ├── home/                  # Home page client component
│   │   │   ├── page.tsx
│   │   │   └── home-page-client.tsx
│   │   ├── about/                 # About page
│   │   ├── features/              # Features page
│   │   ├── pricing/               # Pricing page
│   │   ├── modules/               # Modules showcase
│   │   ├── updates/               # Updates/changelog
│   │   ├── status/                # Status page
│   │   ├── contact/               # Contact page
│   │   ├── support/               # Support page
│   │   ├── terms/                 # Terms of service
│   │   ├── privacy/               # Privacy policy
│   │   ├── blog/                  # Blog listing
│   │   └── company/               # Company pages
│   │       ├── about/
│   │       ├── blog/
│   │       ├── careers/
│   │       ├── press-kit/
│   │       └── contact/
│   │
│   ├── auth/                     # Authentication routes
│   │   ├── callback/             # OAuth callback
│   │   ├── login/                # Login page
│   │   ├── signup/               # Signup page
│   │   ├── magic-link/           # Magic link auth
│   │   ├── profile-setup/        # Profile setup
│   │   └── rasi-confirmation/    # Rashi selection
│   │
│   ├── dashboard/                # Main dashboard (protected)
│   ├── onboarding/                # Onboarding flow
│   ├── splash/                   # Splash screen
│   │
│   ├── astro/                    # Astrology engine pages
│   │   ├── page.tsx
│   │   ├── astro-page-client.tsx
│   │   └── error.tsx
│   ├── cosmos/                   # Cosmos page
│   ├── guru/                     # AI Guru chat
│   ├── premium/                  # Premium features
│   ├── kundali/                  # Kundali generator
│   ├── planets/                  # Planets view
│   ├── houses/                   # Houses view
│   ├── charts/                   # Divisional charts
│   ├── dasha/                    # Dasha timeline
│   ├── numerology/               # Numerology calculator
│   │
│   ├── engines/                  # Intelligence engine pages
│   │   ├── face/                 # Face reading
│   │   ├── palmistry/            # Palmistry scanner
│   │   ├── aura/                 # Aura scanner
│   │   ├── business/             # Business compatibility
│   │   ├── pregnancy/            # Pregnancy insights
│   │   ├── predictions/           # Predictions hub
│   │   ├── timeline/             # 12-month timeline
│   │   ├── compatibility/        # Partner compatibility
│   │   └── career/               # Career analysis
│   │
│   ├── reports/                  # Reports center
│   │   ├── page.tsx
│   │   └── [id]/page.tsx         # Individual report
│   ├── report/                   # Report viewer
│   ├── settings/                 # User settings
│   ├── payments/                 # Payment management
│   ├── profile/                  # User profile
│   ├── notifications/            # Notifications
│   │
│   ├── admin/                    # Admin dashboard (protected)
│   │   ├── layout.tsx
│   │   ├── login/
│   │   ├── dashboard/
│   │   ├── users/
│   │   ├── guru/
│   │   ├── reports/
│   │   ├── payments/
│   │   ├── settings/
│   │   ├── content/
│   │   ├── knowledge/
│   │   ├── jobs/
│   │   ├── logs/
│   │   └── backup/
│   │
│   └── api/                      # Next.js API Routes (Backend)
│       ├── auth/                 # Authentication endpoints
│       ├── user/                 # User management
│       ├── kundali/              # Kundali generation
│       ├── numerology/          # Numerology calculations
│       ├── guru/                 # Guru chat API
│       ├── guru-chat/            # Legacy guru chat
│       ├── guru-voice/           # Voice input
│       ├── guru-vision/          # Vision/image analysis
│       ├── guru-video/           # Video analysis
│       ├── guru-tts/             # Text-to-speech
│       ├── face/                 # Face reading API
│       ├── palmistry/            # Palmistry API
│       ├── aura/                 # Aura analysis
│       ├── business/             # Business compatibility
│       ├── compatibility/        # Partner compatibility
│       ├── predictions/          # Predictions engine
│       ├── timeline/             # Timeline generation
│       ├── reports/              # Report generation
│       ├── report-pdf/           # PDF generation
│       ├── horoscope/            # Daily horoscope
│       ├── festival/             # Festival calendar
│       ├── transits/             # Planetary transits
│       ├── chakra/               # Chakra analysis
│       ├── career/               # Career analysis
│       ├── location/             # Location analysis
│       ├── side-hustle/          # Side hustle recommendations
│       ├── ritual/               # Ritual generation
│       ├── onboarding/           # Onboarding API
│       ├── dashboard/            # Dashboard data
│       ├── notifications/        # Notifications API
│       ├── payments/             # Payment processing
│       ├── upload/               # File upload
│       ├── rag/                  # RAG (vector search)
│       ├── workers/              # Background workers
│       └── admin/                # Admin API endpoints
│
├── components/                   # React UI Components
│   ├── global/                   # Global app components
│   │   ├── Background.tsx        # PLACEHOLDER (returns null)
│   │   ├── CosmicCursor.tsx      # Custom cursor effects
│   │   ├── SoundscapeController.tsx  # Audio controller
│   │   ├── PageTransitionWrapper.tsx # Page transitions
│   │   ├── GalaxySceneWrapper.tsx    # R3F Galaxy scene wrapper
│   │   ├── TransitionOverlay.tsx    # Transition overlay
│   │   ├── RouteTransitionHandler.tsx # Route change handler
│   │   ├── BlessingWaveOverlay.tsx   # Blessing wave effect
│   │   ├── LoadingOverlay.tsx        # Global loading
│   │   ├── ErrorBoundary.tsx         # Error boundary
│   │   ├── ResponsiveWrapper.tsx     # Responsive context
│   │   └── MicroInteractions.tsx     # Micro-interactions
│   │
│   ├── cosmic/                   # Cosmic/R3F background components
│   │   ├── CosmicBackground.tsx      # ⭐ CLEAN GRADIENT (non-R3F)
│   │   ├── CosmicBackground.dynamic.tsx # Dynamic import wrapper
│   │   ├── NebulaShader.tsx          # R3F Nebula shader (still exists)
│   │   ├── ParticleField.tsx         # R3F Particle system (still exists)
│   │   ├── RotatingMandala.tsx       # R3F Mandala (still exists)
│   │   ├── R3FFallback.tsx           # R3F fallback UI
│   │   ├── cosmic-background.tsx     # Alternative background
│   │   ├── astro-glyph.tsx
│   │   ├── chakra-wheel.tsx
│   │   ├── energy-wave.tsx
│   │   ├── mandala.tsx
│   │   └── index.ts
│   │
│   ├── sections/                 # Page sections
│   │   ├── Hero/
│   │   │   └── CosmicHero.tsx       # Hero section (uses R3F in variant='home')
│   │   ├── Features/
│   │   │   ├── CosmicFeatures.tsx
│   │   │   └── FeatureCard.tsx
│   │   ├── CTA/
│   │   │   └── CosmicCTA.tsx
│   │   ├── Content/
│   │   │   ├── CosmicContentBlock.tsx
│   │   │   ├── CosmicContentSection.tsx
│   │   │   └── CosmicSectionDivider.tsx
│   │   ├── Footer/
│   │   │   └── CosmicFooter.tsx
│   │   ├── Testimonials/
│   │   │   └── TestimonialsSection.tsx
│   │   ├── Modules/
│   │   │   └── ModulesSection.tsx
│   │   ├── Pricing/
│   │   │   └── PricingCards.tsx
│   │   ├── AstrologicalWheel/
│   │   │   └── AstrologicalWheel3D.tsx  # R3F 3D wheel
│   │   └── Roadmap/
│   │       └── RoadmapTimeline.tsx
│   │
│   ├── providers/                # Context providers
│   │   ├── GlobalProviders.tsx       # Main global wrapper
│   │   └── MotionProvider.tsx         # Motion orchestrator provider
│   │
│   ├── auth/                     # Authentication components
│   ├── astro/                    # Astrology components
│   ├── engines/                  # Intelligence engine UIs
│   ├── guru/                     # Guru chat components
│   ├── reports/                  # Report components
│   ├── dashboard/                # Dashboard components
│   │   ├── CosmicDashboard.tsx
│   │   └── CosmicBackground.tsx   # Dashboard-specific background
│   ├── ui/                       # shadcn/ui components
│   └── [other component folders]
│
├── cosmos/                       # R3F SCENE ENGINE (Massive library)
│   ├── scenes/                   # Pre-built R3F scenes
│   │   ├── galaxy-scene.tsx          # Main galaxy scene
│   │   ├── nebula-scene.tsx
│   │   ├── particle-universe-scene.tsx
│   │   ├── kundalini-wave-scene.tsx
│   │   └── index.ts
│   │
│   ├── [50+ scene modules]/      # Each with engine, hooks, shaders
│   │   ├── alignment-grid/
│   │   ├── ascension-lattice-v2/
│   │   ├── astral-bloom/
│   │   ├── astral-gate-v3/
│   │   ├── astral-lotus/
│   │   ├── astral-mandala/
│   │   ├── astral-thread-v2/
│   │   ├── astral-trail/
│   │   ├── astral-veil/
│   │   ├── aura-halo/
│   │   ├── aura-shield/
│   │   ├── aurora-veil/
│   │   ├── blessing-wave/
│   │   ├── camera/
│   │   ├── celestial-crest-v2/
│   │   ├── celestial-crown-v2/
│   │   ├── celestial-gate-v2/
│   │   ├── celestial-horizon-v2/
│   │   ├── celestial-ribbon/
│   │   ├── celestial-sanctum-v3/
│   │   ├── celestial-temple-v2/
│   │   ├── celestial-wave-v2/
│   │   ├── chakra-pulse/
│   │   ├── chakra-rings/
│   │   ├── cosmic-drift-field/
│   │   ├── cosmic-fracture/
│   │   ├── cosmic-lens/
│   │   ├── cosmic-orbit/
│   │   ├── cosmic-pulse/
│   │   ├── cursor/
│   │   ├── dharma-wheel-v2/
│   │   ├── dimensional-ripple/
│   │   ├── divine-compass/
│   │   ├── divine-grid/
│   │   ├── divine-orb/
│   │   ├── divine-throne-v3/
│   │   ├── face/
│   │   ├── fate-ripple/
│   │   ├── gate-of-time-v2/
│   │   ├── gateway-v3/
│   │   ├── guru/
│   │   ├── karma-wheel/
│   │   ├── karmic-thread/
│   │   ├── kundalini/
│   │   ├── light-shafts/
│   │   ├── memory-stream/
│   │   ├── path-indicator-v2/
│   │   ├── prana-field/
│   │   ├── projection/
│   │   ├── quantum-halo/
│   │   ├── ribbons/
│   │   ├── solar-arc/
│   │   ├── soul-bridge-v3/
│   │   ├── soul-mirror/
│   │   ├── soul-star/
│   │   ├── star-fall/
│   │   ├── stellar-wind/
│   │   ├── timeline-stream/
│   │   └── ui-raymarch/
│   │
│   ├── motion/                   # Motion engine
│   │   ├── motion-engine.ts
│   │   ├── orchestrator.ts
│   │   ├── scroll-motion.ts
│   │   ├── audio-motion.ts
│   │   ├── frame-loop.ts
│   │   ├── timeline.ts
│   │   └── easing.ts
│   │
│   ├── audio/                    # Audio processing
│   ├── particles/                # Particle systems
│   ├── postprocessing/           # Post-processing effects
│   ├── shaders/                  # Shared shaders
│   ├── interaction/              # Interaction handlers
│   └── index.ts
│
├── postfx/                       # POST-PROCESSING EFFECTS (R3F)
│   ├── cosmic-bloom-v1/
│   ├── cosmic-bloomboost-v1/
│   ├── cosmic-chromatic-v1/
│   ├── cosmic-colorgrade-v1/
│   ├── cosmic-depth-v1/
│   ├── cosmic-filmgrain-v1/
│   ├── cosmic-glare-v1/
│   ├── cosmic-godrays-v1/
│   ├── cosmic-grainoverlay-v1/
│   ├── cosmic-halation-v1/
│   ├── cosmic-lensflare-v1/
│   ├── cosmic-motionblur-v1/
│   ├── cosmic-starlight-v1/
│   ├── cosmic-vignette-v1/
│   ├── final-composite-v1/
│   └── index.ts
│
├── hooks/                        # React Hooks
│   ├── motion/                   # Motion/GSAP hooks
│   │   ├── useSectionMotion.ts       # ⚠️ SCROLLTRIGGER (FIXED)
│   │   ├── useScrollMotion.ts
│   │   ├── useMouseMotion.ts
│   │   └── useRouteMotion.ts
│   ├── use-global-progress.ts        # Global progress (Zustand)
│   ├── use-scroll-trigger.ts
│   ├── use-audio.ts
│   ├── use-cosmic-motion.ts
│   ├── use-cursor-trail.ts
│   ├── use-glow-pulse.ts
│   ├── use-kundalini-wave.ts
│   ├── use-particle-distortion.ts
│   ├── use-reduced-motion.ts
│   └── [engine hooks]
│
├── lib/                          # Business Logic & Utilities
│   ├── motion/                   # Motion orchestration
│   │   ├── MotionOrchestrator.ts     # Main orchestrator
│   │   ├── gsap-motion-bridge.ts     # GSAP bridge (ScrollTrigger)
│   │   ├── scroll-store.ts           # Scroll state (Zustand)
│   │   ├── mouse-store.ts            # Mouse state (Zustand)
│   │   ├── blessing-wave-store.ts    # Blessing wave state
│   │   └── guru-context-store.ts     # Guru context state
│   │
│   ├── engines/                  # Spiritual intelligence engines
│   │   ├── kundali-engine.ts
│   │   ├── numerology-engine.ts
│   │   ├── prediction-engine.ts
│   │   ├── compatibility-engine.ts
│   │   ├── business-engine.ts
│   │   ├── pregnancy-engine.ts
│   │   ├── face-reading-engine.ts
│   │   ├── palmistry-engine.ts
│   │   ├── aura-engine.ts
│   │   ├── remedy-engine.ts
│   │   ├── report-engine.ts
│   │   ├── timeline-engine.ts
│   │   └── guru-engine.ts
│   │
│   ├── guru/                     # Guru chat engine
│   ├── rag/                      # RAG (vector search)
│   ├── firebase/                  # Firebase config
│   ├── seo/                      # SEO utilities
│   ├── design-system.ts          # Design tokens
│   └── [other lib modules]
│
├── store/                        # Zustand State Stores
│   ├── user-store.ts                 # User state
│   ├── engine-results-store.ts      # Engine results cache
│   └── global-progress-store.ts     # Global progress (Zustand)
│
├── providers/                    # Additional providers
│   ├── audio-provider.tsx
│   ├── cosmic-provider.tsx
│   ├── motion-provider.tsx
│   ├── theme-provider.tsx
│   └── accessibility-provider.tsx
│
├── styles/                       # Style system
│   ├── themes/                   # Theme definitions
│   └── tokens/                   # Design tokens
│
├── layout/                       # Layout components
│   ├── app-layout.tsx
│   ├── admin-layout.tsx
│   ├── public-website-layout.tsx
│   └── [other layouts]
│
├── utils/                        # Utility functions
├── config/                       # Configuration
├── types/                        # TypeScript types
├── scripts/                      # Build scripts
├── tests/                        # Test files
│
├── middleware.ts                 # Next.js middleware (route protection)
├── next.config.mjs               # Next.js config (shader support)
├── tailwind.config.ts            # Tailwind config (cosmic colors)
├── tsconfig.json                 # TypeScript config
├── package.json                  # Dependencies
└── app/globals.css               # Global CSS
```

---

## 2. BACKGROUND-RELATED FILES

### PRIMARY BACKGROUND COMPONENTS:
1. **`components/cosmic/CosmicBackground.tsx`** ⭐ **ACTIVE**
   - **Type:** CSS Gradient (non-R3F)
   - **Z-index:** `-z-10` (behind everything)
   - **Status:** CLEAN - Simple gradient, no WebGL
   - **Usage:** Can be imported anywhere

2. **`components/cosmic/CosmicBackground.dynamic.tsx`**
   - **Type:** Dynamic import wrapper
   - **Fallback:** Gradient background
   - **Status:** Wrapper only

3. **`components/global/Background.tsx`**
   - **Type:** Placeholder (returns `null`)
   - **Status:** Currently unused

4. **`components/global/GalaxySceneWrapper.tsx`**
   - **Type:** R3F Canvas wrapper
   - **Uses:** `cosmos/scenes/galaxy-scene.tsx`
   - **Z-index:** `z-0`
   - **Status:** Still active, uses R3F

5. **`components/dashboard/CosmicBackground.tsx`**
   - **Type:** Dashboard-specific background
   - **Status:** Separate from main background

### BACKGROUND RENDERING IN HOME PAGE:
**`app/page.tsx`** (HOME PAGE):
- **Line 35-43:** Direct R3F Canvas with NebulaShader, ParticleField, RotatingMandala
- **Z-index:** `z-0` (background layer)
- **Status:** ⚠️ **STILL USING R3F** - Not using CosmicBackground component

### R3F BACKGROUND COMPONENTS (Still exist but may not be used):
- `components/cosmic/NebulaShader.tsx` - R3F shader component
- `components/cosmic/ParticleField.tsx` - R3F particle system
- `components/cosmic/RotatingMandala.tsx` - R3F mandala

### COSMOS SCENE ENGINE (Massive R3F library):
- `cosmos/scenes/galaxy-scene.tsx` - Main galaxy scene
- `cosmos/scenes/nebula-scene.tsx`
- `cosmos/scenes/particle-universe-scene.tsx`
- `cosmos/scenes/kundalini-wave-scene.tsx`
- **50+ other R3F scene modules** in `cosmos/` directory

---

## 3. CANVAS / R3F FILES

### FILES USING `<Canvas>` FROM @react-three/fiber:

**Direct Canvas Usage:**
1. `app/page.tsx` - **HOME PAGE** (lines 36-42)
2. `components/global/GalaxySceneWrapper.tsx` (line 119)
3. `components/sections/Hero/CosmicHero.tsx` (line 622) - Only when `variant='home'`
4. `components/sections/AstrologicalWheel/AstrologicalWheel3D.tsx`
5. `components/kundali/KundaliWheel3DCanvas.tsx`

**R3F Components (use useFrame, ShaderMaterial, etc.):**
- `components/cosmic/NebulaShader.tsx` - ShaderMaterial
- `components/cosmic/ParticleField.tsx` - Points, BufferGeometry
- `components/cosmic/RotatingMandala.tsx` - Mesh, Line
- `cosmos/scenes/galaxy-scene.tsx` - Full R3F scene
- `cosmos/scenes/nebula-scene.tsx`
- `cosmos/scenes/particle-universe-scene.tsx`
- `cosmos/scenes/kundalini-wave-scene.tsx`
- **All 50+ cosmos scene modules** (each has .tsx file with R3F components)

**Post-processing Effects (R3F):**
- All files in `postfx/` directory (15 effect modules)
- Each uses R3F post-processing passes

### WEBGL SHADER FILES:
- All `.ts` files in `cosmos/*/shaders/` directories
- All `.ts` files in `postfx/*/` directories (shader files)
- `components/cosmic/NebulaShader.tsx` (inline shaders)

---

## 4. LAYOUT + HOME PAGE WRAPPERS

### ROOT LAYOUT (`app/layout.tsx`):
**Wrapper Hierarchy:**
```
<html>
  <body>
    <GlobalErrorBoundary>
      <MotionProvider>              # Motion orchestrator
        <AudioProvider>              # Audio context
          <GlobalProviders>          # CosmicCursor + SoundscapeController
            <Background />           # Returns null (placeholder)
            <RouteTransitionHandler />
            <TransitionOverlay />
            <BlessingWaveOverlay />
            {children}               # All pages
          </GlobalProviders>
        </AudioProvider>
      </MotionProvider>
    </GlobalErrorBoundary>
  </body>
</html>
```

### HOME PAGE (`app/page.tsx`):
**Component Hierarchy:**
```
<PageTransitionWrapper>            # Framer Motion transitions
  <div className="fixed inset-0 z-0">  # R3F Background
    <Canvas>
      <NebulaShader />
      <ParticleField />
      <RotatingMandala />
    </Canvas>
  </div>
  <CosmicCursor />                 # Custom cursor
  <SoundscapeController />         # Audio
  <div className="relative z-10">  # Content layer
    <CosmicHero />
    <CosmicFeatures />
    <TestimonialsSection />
    <ModulesSection />
    <PricingCards />
    <AstrologicalWheel3D />
    <RoadmapTimeline />
    <CosmicFooter />
  </div>
</PageTransitionWrapper>
```

### GLOBAL PROVIDERS (`components/providers/GlobalProviders.tsx`):
- Wraps: `CosmicCursor`, `SoundscapeController`, `ResponsiveWrapper`
- Ensures single mount (prevents duplication)

### PAGE TRANSITION WRAPPER (`components/global/PageTransitionWrapper.tsx`):
- Uses Framer Motion `AnimatePresence`
- Cosmic mist overlay
- Particle drift effect
- Mandala rotation fade

---

## 5. API ROUTES

### AUTHENTICATION:
- `app/api/auth/login/route.ts`
- `app/api/auth/logout/route.ts`
- `app/api/auth/magic-link/route.ts`

### USER MANAGEMENT:
- `app/api/user/get/route.ts`
- `app/api/user/update/route.ts`

### SPIRITUAL ENGINES:
- `app/api/kundali/*` - Kundali generation
- `app/api/numerology/*` - Numerology calculations
- `app/api/guru/*` - Guru chat API
- `app/api/face/*` - Face reading
- `app/api/palmistry/*` - Palmistry
- `app/api/aura/*` - Aura analysis
- `app/api/business/*` - Business compatibility
- `app/api/compatibility/*` - Partner compatibility
- `app/api/predictions/*` - Predictions
- `app/api/timeline/*` - Timeline generation
- `app/api/reports/*` - Report generation
- `app/api/horoscope/*` - Daily horoscope
- `app/api/festival/*` - Festival calendar
- `app/api/transits/*` - Planetary transits
- `app/api/chakra/*` - Chakra analysis
- `app/api/career/*` - Career analysis
- `app/api/location/*` - Location analysis
- `app/api/ritual/*` - Ritual generation

### ADMIN:
- `app/api/admin/*` - Admin endpoints (users, reports, payments, etc.)

### UTILITIES:
- `app/api/upload/image/route.ts`
- `app/api/rag/ingest/route.ts`
- `app/api/notifications/*`
- `app/api/payments/*`
- `app/api/workers/*`

---

## 6. CRITICAL PROVIDERS

### `components/providers/GlobalProviders.tsx`:
- **Purpose:** Ensures global components mount once
- **Wraps:** `CosmicCursor`, `SoundscapeController`, `ResponsiveWrapper`
- **Mount Guard:** Uses `globalProvidersMounted` flag

### `components/providers/MotionProvider.tsx`:
- **Purpose:** Provides MotionOrchestrator context
- **Exports:** `useMotionOrchestrator()` hook
- **Used by:** All motion-aware components

### `providers/audio-provider.tsx`:
- **Purpose:** Audio context provider
- **Wraps:** Entire app in `app/layout.tsx`

### `providers/cosmic-provider.tsx`:
- **Purpose:** Cosmic theme provider (if exists)

### `providers/theme-provider.tsx`:
- **Purpose:** Theme switching

### `providers/accessibility-provider.tsx`:
- **Purpose:** Accessibility features

---

## 7. MOTION / GSAP HOOKS

### GSAP SCROLLTRIGGER HOOKS:
1. **`hooks/motion/useSectionMotion.ts`** ⚠️ **FIXED**
   - **Status:** Fixed infinite loop
   - **Uses:** ScrollTrigger.create (runs once on mount)
   - **Batches:** State updates with requestAnimationFrame
   - **Dependencies:** Empty array (runs once)

2. **`hooks/motion/useScrollMotion.ts`**
   - **Uses:** Scroll store (Zustand)
   - **No ScrollTrigger** (uses scroll events)

3. **`hooks/motion/useMouseMotion.ts`**
   - **Uses:** Mouse store (Zustand)
   - **No ScrollTrigger**

4. **`hooks/motion/useRouteMotion.ts`**
   - **Uses:** ScrollTrigger for route transitions

### GSAP MOTION BRIDGE:
- **`lib/motion/gsap-motion-bridge.ts`**
  - **Functions:** `scrollParallaxY`, `scrollFadeIn`, `scrollGlowPulse`, `scrollTilt`, etc.
  - **All use:** ScrollTrigger.create
  - **Status:** Enhanced with batching

### FRAMER MOTION USAGE:
**160 files** use Framer Motion:
- All page components
- All section components
- All card components
- `PageTransitionWrapper`
- `CosmicHero`
- `CosmicFeatures`
- `CosmicCTA`
- `CosmicFooter`
- `GuruChatShell`
- And many more...

---

## 8. GLOBAL STYLES

### `app/globals.css`:
- **Tailwind base styles**
- **Cosmic dark theme variables:**
  - `--background: 220 40% 3%` (Deep Navy #020916)
  - `--primary: 262 83% 58%` (Cosmic Purple #6E2DEB)
  - `--secondary: 220 30% 15%` (Mystic Indigo #0A0F2B)
- **Custom classes:** `.spiritual-gradient`, `.aura-glow`, `.chakra-pulse`
- **Animation keyframes:** `aura-pulse`, `chakra-spin`, `fade-in`, `slide-in`

### `tailwind.config.ts`:
- **Cosmic color palette:**
  - `cosmic.navy: "#020916"`
  - `cosmic.indigo: "#0A0F2B"`
  - `cosmic.purple: "#6E2DEB"`
  - `cosmic.cyan: "#17E8F6"`
  - `cosmic.gold: "#F2C94C"`
- **Font families:** `heading`, `body`, `display`
- **Custom animations:** `aura-pulse`, `chakra-spin`

### Z-INDEX LAYERS:
- **Background:** `z-0` or `-z-10`
- **Content:** `z-10`
- **Modals:** `z-50`
- **Overlays:** `z-[10000]`, `z-[9999]`, `z-[9998]`

---

## 9. POTENTIAL BACKGROUND OVERRIDES

### CONFLICTING BACKGROUND LAYERS:

1. **HOME PAGE (`app/page.tsx`):**
   - **Line 35:** `<div className="fixed inset-0 z-0">` with R3F Canvas
   - **NOT using:** `CosmicBackground` component
   - **Status:** ⚠️ **CONFLICT** - Uses R3F directly instead of clean gradient

2. **ROOT LAYOUT (`app/layout.tsx`):**
   - **Line 57:** `<Background />` component (returns null, no conflict)
   - **No background rendering here**

3. **GLOBAL PROVIDERS:**
   - No background rendering

4. **COSMIC HERO (`components/sections/Hero/CosmicHero.tsx`):**
   - **Line 622:** R3F Canvas when `variant='home'`
   - **Only renders** if variant is 'home'
   - **Status:** May conflict with home page background

5. **GALAXY SCENE WRAPPER:**
   - **Used by:** Some pages (home-page-client.tsx, cosmos-page-client.tsx, etc.)
   - **Z-index:** `z-0`
   - **Status:** May conflict if used on same page

### BACKGROUND COLOR OVERRIDES:

**CSS Classes that set background:**
- `bg-[#020617]` - Used in CosmicBackground.tsx
- `bg-cosmic-navy` - Tailwind class
- `bg-gradient-to-br from-cosmic via-purple-900 to-cosmic` - Gradient fallback
- `bg-background` - CSS variable (from globals.css)

**Z-index Conflicts:**
- Multiple `fixed inset-0 z-0` elements can stack
- `CosmicBackground` uses `-z-10` (behind)
- R3F Canvas uses `z-0` (background layer)
- Content uses `z-10` (foreground)

---

## 10. IDENTIFIED ISSUES

### ⚠️ CRITICAL: HOME PAGE BACKGROUND CONFLICT

**Problem:**
- `app/page.tsx` uses R3F Canvas directly (lines 35-43)
- `CosmicBackground.tsx` is clean gradient but NOT used on home page
- Two different background systems

**Files Involved:**
1. `app/page.tsx` - Uses R3F Canvas
2. `components/cosmic/CosmicBackground.tsx` - Clean gradient (unused on home)

**Solution Needed:**
- Replace R3F Canvas in `app/page.tsx` with `<CosmicBackground />`
- Remove direct Canvas usage from home page

### ⚠️ POTENTIAL: COSMIC HERO R3F CONFLICT

**Problem:**
- `CosmicHero` renders R3F Canvas when `variant='home'`
- Home page also has its own R3F Canvas
- May cause duplicate rendering

**Files Involved:**
1. `components/sections/Hero/CosmicHero.tsx` (line 622)
2. `app/page.tsx` (line 35)

### ✅ FIXED: SCROLLTRIGGER INFINITE LOOP

**Status:** Fixed in `hooks/motion/useSectionMotion.ts`
- Runs once on mount
- Uses refs for callbacks
- Batches state updates

---

## 11. SUMMARY

### BACKGROUND RENDERING STATUS:
- **CosmicBackground.tsx:** ✅ Clean gradient (non-R3F)
- **Home Page:** ⚠️ Still uses R3F Canvas directly
- **GalaxySceneWrapper:** ✅ Active (uses R3F)
- **CosmicHero:** ⚠️ Uses R3F when variant='home'

### R3F USAGE:
- **344 files** import from `@react-three/fiber` or `three`
- **50+ cosmos scene modules** (full R3F scenes)
- **15 post-processing effects** (R3F)
- **Home page** still uses R3F directly

### MOTION SYSTEM:
- **29 files** use GSAP ScrollTrigger
- **160 files** use Framer Motion
- **ScrollTrigger fixed** in useSectionMotion.ts

### PROVIDERS:
- **GlobalProviders:** Mounts once, prevents duplication
- **MotionProvider:** Provides orchestrator
- **AudioProvider:** Audio context

---

**END OF SCAN**

