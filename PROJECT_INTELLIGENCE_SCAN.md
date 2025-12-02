# COMPLETE PROJECT INTELLIGENCE SCAN
**Generated:** 2024-12-02
**Project:** Jyoti AI App
**Root:** /Users/diptanshuojha/Desktop/JyotiAIapp
**Last Major Update:** Super Cosmic UI Transformation (December 2024)

---

## 1. FULL PROJECT TREE STRUCTURE

```
JyotiAIapp/
├── app/                          # Next.js 14 App Router - All routes & pages
│   ├── page.tsx                  # HOME PAGE - Super Cosmic UI with new sections
│   ├── layout.tsx                # ROOT LAYOUT - GlobalShaderBackground + Header + Footer
│   ├── globals.css               # Global CSS with .page-container utility
│   ├── loading.tsx               # Loading state
│   ├── not-found.tsx             # 404 page
│   ├── global-error.tsx          # Global error boundary
│   ├── robots.ts                 # SEO robots.txt generator
│   ├── sitemap.ts                # SEO sitemap generator
│   │
│   ├── (root)/                   # Public website routes
│   │   ├── home/                  # Home page client component
│   │   ├── about/                 # About page
│   │   ├── features/              # Features page (MarketingPageShell)
│   │   ├── pricing/               # Pricing page (Super Cosmic UI)
│   │   ├── modules/               # Modules showcase (MarketingPageShell)
│   │   ├── updates/               # Updates/changelog (MarketingPageShell)
│   │   ├── status/                # Status page (MarketingPageShell)
│   │   ├── contact/               # Contact page
│   │   ├── support/               # Support page
│   │   ├── terms/                 # Terms of service
│   │   ├── privacy/               # Privacy policy
│   │   ├── blog/                  # Blog listing
│   │   └── company/               # Company pages (CompanyPageShell)
│   │       ├── about/             # About (CompanyPageShell)
│   │       ├── blog/              # Blog (CompanyPageShell)
│   │       ├── careers/           # Careers (CompanyPageShell)
│   │       ├── press-kit/         # Press Kit (CompanyPageShell)
│   │       └── contact/           # Contact (CompanyPageShell)
│   │
│   ├── auth/                     # Authentication routes
│   │   ├── callback/             # OAuth callback
│   │   ├── login/                # Login page (AuthLayout)
│   │   ├── signup/               # Signup page (AuthLayout)
│   │   ├── magic-link/           # Magic link auth (MarketingPageShell)
│   │   ├── profile-setup/        # Profile setup (MarketingPageShell)
│   │   └── rasi-confirmation/     # Rashi selection (MarketingPageShell)
│   │
│   ├── dashboard/                # Main dashboard (DashboardPageShell)
│   ├── onboarding/               # Onboarding flow
│   ├── splash/                   # Splash screen (MarketingPageShell)
│   │
│   ├── astro/                    # Astrology engine pages
│   ├── cosmos/                   # Cosmos page
│   ├── guru/                     # AI Guru chat (GuruHero + GuruLayoutShell)
│   ├── premium/                  # Premium features
│   ├── kundali/                  # Kundali generator (DashboardPageShell)
│   ├── planets/                  # Planets view (DashboardPageShell)
│   ├── houses/                   # Houses view (DashboardPageShell)
│   ├── charts/                   # Divisional charts (DashboardPageShell)
│   ├── dasha/                    # Dasha timeline (DashboardPageShell)
│   ├── numerology/               # Numerology calculator
│   │
│   ├── engines/                  # Intelligence engine pages
│   │   ├── face/                 # Face reading (DashboardPageShell)
│   │   ├── palmistry/            # Palmistry scanner
│   │   ├── aura/                 # Aura scanner
│   │   ├── business/             # Business compatibility (DashboardPageShell)
│   │   ├── pregnancy/            # Pregnancy insights (DashboardPageShell)
│   │   ├── predictions/          # Predictions hub (DashboardPageShell)
│   │   ├── timeline/             # 12-month timeline (DashboardPageShell)
│   │   ├── compatibility/        # Partner compatibility (DashboardPageShell)
│   │   ├── career/               # Career analysis (DashboardPageShell)
│   │   ├── calendar/             # Cosmic calendar (DashboardPageShell)
│   │   └── rituals/              # Vedic rituals (DashboardPageShell)
│   │
│   ├── reports/                  # Reports center (DashboardPageShell)
│   ├── report/                   # Report viewer
│   ├── settings/                 # User settings (DashboardPageShell)
│   ├── payments/                 # Payment management (DashboardPageShell)
│   ├── profile/                  # User profile
│   ├── notifications/            # Notifications
│   ├── pay/[productId]/          # Payment page (DashboardPageShell)
│   ├── thanks/                   # Payment success (MarketingPageShell)
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
│   │   ├── backup/
│   │   ├── tickets/
│   │   └── one-time-purchases/
│   │
│   └── api/                      # Next.js API Routes (Backend)
│       ├── auth/                 # Authentication endpoints
│       ├── user/                 # User management
│       ├── kundali/              # Kundali generation
│       ├── numerology/           # Numerology calculations
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
│       ├── predictions/           # Predictions engine
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
│       ├── tickets/              # Ticket system
│       └── admin/                # Admin API endpoints
│
├── src/                          # ⭐ NEW: Super Cosmic UI System
│   └── ui/                       # UI component library
│       ├── theme/                # Design system
│       │   ├── tokens.ts         # Color tokens, gradients, shadows, spacing
│       │   └── global-motion.ts  # Framer Motion presets
│       ├── layout/               # Layout shells
│       │   ├── Header.tsx         # Global header (glassmorphic, gold border)
│       │   ├── Footer.tsx        # Global footer (minimal 3-row layout)
│       │   ├── DashboardShell.tsx        # Dashboard content shell
│       │   ├── DashboardPageShell.tsx    # Full dashboard layout
│       │   ├── MarketingPageShell.tsx   # Marketing page wrapper
│       │   └── CompanyPageShell.tsx     # Company page wrapper
│       ├── background/           # Background system
│       │   └── GlobalShaderBackground.tsx  # ⭐ Universal WebGL2 shader background
│       └── sections/              # Page sections
│           ├── home/              # Homepage sections
│           │   ├── HomeHero.tsx           # Hero with floating cards
│           │   ├── HomeValueProps.tsx     # Value proposition tiles
│           │   ├── HomeHowItWorks.tsx     # 3-step flow
│           │   ├── HomeSocialProof.tsx    # Testimonials + India map
│           │   ├── HomePricingTeaser.tsx  # Pricing teaser
│           │   └── HomeFinalCTA.tsx       # Final CTA section
│           ├── guru/              # Guru page sections
│           │   ├── GuruHero.tsx           # Guru hero with stats
│           │   └── GuruLayoutShell.tsx    # Chat UI wrapper
│           ├── pricing/           # Pricing page sections
│           │   ├── PricingHero.tsx        # Pricing hero
│           │   └── PricingFAQ.tsx        # FAQ section
│           └── auth/              # Auth layouts
│               └── AuthLayout.tsx         # Reusable auth wrapper
│
├── components/                   # React UI Components
│   ├── global/                   # Global app components
│   │   ├── GlobalShaderBackground.tsx  # (legacy, moved to src/ui)
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
│   │   └── [other cosmic components]
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
│   │   ├── Footer/
│   │   │   └── CosmicFooter.tsx
│   │   ├── testimonials/         # ⭐ RENAMED: lowercase for case-sensitive systems
│   │   │   └── TestimonialsSection.tsx
│   │   ├── Modules/
│   │   │   └── ModulesSection.tsx
│   │   ├── Pricing/
│   │   │   ├── PricingSection6.tsx
│   │   │   ├── PricingCards.tsx
│   │   │   └── PricingComparisonTable.tsx
│   │   ├── AstrologicalWheel/
│   │   │   └── AstrologicalWheel3D.tsx  # R3F 3D wheel
│   │   ├── Roadmap/
│   │   ├── about/
│   │   │   └── CompanyTimeline.tsx
│   │   └── marketing/
│   │       └── IndiaCustomersWidget.tsx
│   │
│   ├── providers/                # Context providers
│   │   ├── GlobalProviders.tsx       # Main global wrapper
│   │   └── MotionProvider.tsx         # Motion orchestrator provider
│   │
│   ├── auth/                     # Authentication components
│   │   └── SignInPage.tsx         # Glassmorphic sign-in (used by AuthLayout)
│   ├── astro/                    # Astrology components
│   ├── engines/                  # Intelligence engine UIs
│   ├── guru/                     # Guru chat components
│   ├── reports/                  # Report components
│   ├── dashboard/                # Dashboard components
│   │   ├── CosmicDashboard.tsx
│   │   └── CosmicBackground.tsx   # Dashboard-specific background
│   ├── ui/                       # shadcn/ui components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── gradient-button.tsx   # ⭐ GradientButton component
│   │   ├── upgrade-banner.tsx    # ⭐ UpgradeBanner component
│   │   ├── testimonial-card.tsx   # TestimonialCard component
│   │   └── [other shadcn components]
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
│   │   ├── [50+ more scene modules]
│   │
│   ├── motion/                   # Motion engine
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
│   ├── [15 effect modules]
│   └── index.ts
│
├── hooks/                        # React Hooks
│   ├── motion/                   # Motion/GSAP hooks
│   │   ├── useSectionMotion.ts       # ⚠️ SCROLLTRIGGER (FIXED)
│   │   ├── useScrollMotion.ts
│   │   ├── useMouseMotion.ts
│   │   └── useRouteMotion.ts
│   ├── use-global-progress.ts        # Global progress (Zustand)
│   └── [other hooks]
│
├── lib/                          # Business Logic & Utilities
│   ├── motion/                   # Motion orchestration
│   ├── engines/                  # Spiritual intelligence engines
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
├── public/                       # Static assets
│   ├── images/
│   │   └── maps/
│   │       └── india-outline-light.png  # ⭐ India map for widget
│   └── [other assets]
│
├── middleware.ts                 # Next.js middleware (route protection)
├── next.config.mjs               # Next.js config (shader support)
├── tailwind.config.ts            # Tailwind config (cosmic colors)
├── tsconfig.json                 # TypeScript config
├── package.json                  # Dependencies
└── app/globals.css               # Global CSS with .page-container
```

**File Counts:**
- **Total TypeScript/React files:** ~1,266
- **App routes:** 80+ pages
- **API routes:** 83 endpoints
- **Components:** 200+ components
- **Super Cosmic UI files:** 20 files in `src/ui/`
- **R3F scenes:** 50+ scene modules
- **Post-processing effects:** 15 modules

---

## 2. BACKGROUND SYSTEM (UPDATED - December 2024)

### ⭐ PRIMARY BACKGROUND: GlobalShaderBackground

**Location:** `src/ui/background/GlobalShaderBackground.tsx`

**Type:** WebGL2 Shader (full-screen, fixed position)

**Implementation:**
- Based on 21st.dev shader #3435
- Full-screen fixed background (`position: fixed`)
- Optimized WebGL2 shader
- Soft cosmic gradients
- Opacity: 0.25-0.35 (doesn't overpower text)
- Z-index: `z-0` (behind all content)

**Usage:**
- Mounted in `app/layout.tsx` at root level
- Appears on ALL pages automatically
- No per-page background components needed

**Status:** ✅ **ACTIVE** - Universal background for entire app

### ROOT LAYOUT (`app/layout.tsx`):

**Current Structure:**
```tsx
<html>
  <body className="bg-[#05050A] text-white antialiased overflow-x-hidden">
    <GlobalShaderBackground />  {/* ⭐ Universal shader background */}
    <div className="relative z-20">
      <Header />                {/* ⭐ Super Cosmic header */}
    </div>
    <main className="relative z-10">
      {children}                {/* All page content */}
    </main>
    <Footer />                  {/* ⭐ Super Cosmic footer */}
  </body>
</html>
```

**Z-Index Layering:**
- `GlobalShaderBackground`: `z-0` (background)
- `Header`/`Footer`: `z-20` (top layer)
- `main` content: `z-10` (middle layer)

### REMOVED BACKGROUND SYSTEMS:

**No longer used globally:**
- ❌ `components/global/Background.tsx` (returns null)
- ❌ `components/cosmic/CosmicBackground.tsx` (replaced by GlobalShaderBackground)
- ❌ `components/global/GalaxySceneWrapper.tsx` (removed from layout)
- ❌ `components/cosmic/NebulaShader.tsx` (removed from layout)
- ❌ `components/cosmic/ParticleField.tsx` (removed from layout)
- ❌ `components/cosmic/RotatingMandala.tsx` (removed from layout)

**Still exists but not used as global background:**
- `components/cosmic/NebulaShader.tsx` - Can be used as foreground element
- `components/cosmic/ParticleField.tsx` - Can be used as foreground element
- `components/cosmic/RotatingMandala.tsx` - Can be used as foreground element
- `components/global/GalaxySceneWrapper.tsx` - Can be used on specific pages

### HOMEPAGE BACKGROUND:

**`app/page.tsx` (HOME PAGE):**
- **Status:** ✅ **UPDATED** - Uses Super Cosmic UI sections
- **Background:** Inherits `GlobalShaderBackground` from layout
- **No direct R3F Canvas** - Clean section-based layout
- **Sections:**
  - `HomeHero` - Hero with floating cards
  - `HomeValueProps` - Value proposition tiles
  - `HomeHowItWorks` - 3-step flow
  - `HomeSocialProof` - Testimonials + India map
  - `HomePricingTeaser` - Pricing teaser
  - `HomeFinalCTA` - Final CTA

---

## 3. SUPER COSMIC UI SYSTEM (NEW - December 2024)

### Theme System (`src/ui/theme/`):

**`tokens.ts`:**
- Color tokens: `cosmicGold`, `cosmicIndigo`, `nebulaPurple`, etc.
- Gradients: `gradientGold`, `gradientIndigo`, etc.
- Shadows: `shadowSoftGoldGlow`, `shadowCosmicGlow`, etc.
- Spacing: Consistent spacing scale
- Typography: Font sizes and weights
- Container widths: Max-width utilities

**`global-motion.ts`:**
- Motion presets: `fadeUp`, `staggerChildren`, `softFloat`, etc.
- Consistent animation timing and easing
- Reusable across all components

### Layout Shells (`src/ui/layout/`):

**`Header.tsx`:**
- Transparent, glassmorphic design
- Gold border with glow
- Glowing nav links
- Mobile menu
- "Ask The Guru" CTA
- Cosmic gold logo

**`Footer.tsx`:**
- Minimal 3-row layout
- Logo + message
- Navigation links
- Copyright + social icons

**`DashboardShell.tsx`:**
- Reusable shell for dashboard content
- Optional title, subtitle, right actions
- Glassmorphic styling
- `fadeUp` motion

**`DashboardPageShell.tsx`:**
- Combines sidebar (if needed) + DashboardShell
- Two-column desktop, stacked mobile

**`MarketingPageShell.tsx`:**
- Standard marketing layout wrapper
- Eyebrow, title, description
- Uses `.page-container` utility

**`CompanyPageShell.tsx`:**
- Company page wrapper
- Similar to MarketingPageShell
- More formal spacing

### Homepage Sections (`src/ui/sections/home/`):

1. **`HomeHero.tsx`**
   - Full-width hero, 21st.dev style
   - Left: text (Supertitle, H1, Subtext, 2 CTAs)
   - Right: floating card stack with parallax
   - Uses `AnimatedShaderHero` as background canvas

2. **`HomeValueProps.tsx`**
   - 3-4 columns of value tiles
   - Icon, title, description
   - Responsive grid

3. **`HomeHowItWorks.tsx`**
   - 3-step vertical/horizontal flow
   - Neon rings/pills
   - Connecting lines

4. **`HomeSocialProof.tsx`**
   - Integrates `TestimonialsSection` and `IndiaCustomersWidget`
   - Two-column desktop, stacked mobile

5. **`HomePricingTeaser.tsx`**
   - Teaser section with 2 glass cards
   - "View full pricing" CTA

6. **`HomeFinalCTA.tsx`**
   - Narrow bottom section
   - Big cosmic statement
   - "Open JyotiAI Dashboard" CTA

### Guru Page Sections (`src/ui/sections/guru/`):

1. **`GuruHero.tsx`**
   - Top hero for `/guru`
   - Wraps `AnimatedShaderHero` as background
   - Overlays text + CTAs
   - Mini stats card

2. **`GuruLayoutShell.tsx`**
   - Wraps existing guru chat UI
   - Glass-card shell
   - "Session details" column

### Pricing Page Sections (`src/ui/sections/pricing/`):

1. **`PricingHero.tsx`**
   - Narrow hero with eyebrow, H1, subtext
   - Optional mini badges

2. **`PricingFAQ.tsx`**
   - 4-6 FAQ items in responsive grid
   - Expandable answers

### Auth Layout (`src/ui/sections/auth/`):

1. **`AuthLayout.tsx`**
   - Reusable layout for login/signup
   - Full-height, centered section
   - Wraps `SignInPage` component
   - Dynamically sets title/description based on mode

---

## 4. CANVAS / R3F FILES

### FILES USING `<Canvas>` FROM @react-three/fiber:

**Direct Canvas Usage (Foreground Elements):**
1. `components/sections/Hero/CosmicHero.tsx` - Only when `variant='home'`
2. `components/sections/AstrologicalWheel/AstrologicalWheel3D.tsx` - 3D wheel
3. `components/kundali/KundaliWheel3DCanvas.tsx` - Kundali wheel
4. `components/ui/animated-shader-hero.tsx` - Used in HomeHero and GuruHero

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

**Global Background:**
- `src/ui/background/GlobalShaderBackground.tsx` - WebGL2 shader (inline)

**R3F Shaders:**
- All `.ts` files in `cosmos/*/shaders/` directories
- All `.ts` files in `postfx/*/` directories (shader files)
- `components/cosmic/NebulaShader.tsx` (inline shaders)

**R3F Usage Count:**
- **344 files** import from `@react-three/fiber` or `three`
- **50+ cosmos scene modules** (full R3F scenes)
- **15 post-processing effects** (R3F)
- **Global background:** WebGL2 shader (not R3F)

---

## 5. LAYOUT + PAGE STRUCTURE

### ROOT LAYOUT (`app/layout.tsx`):

**Current Wrapper Hierarchy:**
```tsx
<html>
  <body className="bg-[#05050A] text-white overflow-x-hidden">
    <GlobalShaderBackground />  {/* ⭐ Universal shader */}
    <div className="relative z-20">
      <Header />                {/* ⭐ Super Cosmic header */}
    </div>
    <main className="relative z-10">
      {children}                {/* All pages */}
    </main>
    <Footer />                  {/* ⭐ Super Cosmic footer */}
  </body>
</html>
```

**Removed from Layout:**
- ❌ `<Background />` (was placeholder)
- ❌ `<RouteTransitionHandler />`
- ❌ `<TransitionOverlay />`
- ❌ `<BlessingWaveOverlay />`
- ❌ Old `<Header />` and `<FooterWrapper />`

### HOME PAGE (`app/page.tsx`):

**Current Structure:**
```tsx
<div className="relative">
  <section className="page-container pt-8 md:pt-16">
    <HomeHero />
  </section>
  <section className="page-container pt-8 md:pt-16">
    <HomeValueProps />
  </section>
  <section className="page-container pt-8 md:pt-20">
    <HomeHowItWorks />
  </section>
  <section className="page-container pt-12 md:pt-20">
    <HomeSocialProof />
  </section>
  <section className="page-container pt-12 md:pt-20">
    <HomePricingTeaser />
  </section>
  <section className="page-container pt-16 md:pt-24 pb-16 md:pb-24">
    <HomeFinalCTA />
  </section>
</div>
```

**Removed:**
- ❌ Direct R3F Canvas
- ❌ `<CosmicCursor />`
- ❌ `<SoundscapeController />`
- ❌ `<PageTransitionWrapper />`
- ❌ Old hero sections

### PAGE SHELLS USAGE:

**Dashboard Pages (DashboardPageShell):**
- `/dashboard`, `/kundali`, `/timeline`, `/reports`, `/predictions`
- `/face`, `/business`, `/compatibility`, `/career`, `/calendar`
- `/rituals`, `/planets`, `/pregnancy`, `/houses`, `/dasha`
- `/charts`, `/payments`, `/settings`, `/pay/[productId]`

**Marketing Pages (MarketingPageShell):**
- `/features`, `/modules`, `/status`, `/updates`
- `/splash`, `/profile-setup`, `/rasi-confirmation`, `/magic-link`
- `/thanks`

**Company Pages (CompanyPageShell):**
- `/company/about`, `/company/careers`, `/company/blog`
- `/company/contact`, `/company/press-kit`

**Auth Pages (AuthLayout):**
- `/login`, `/signup`

**Guru Page:**
- Uses `GuruHero` + `GuruLayoutShell`

**Pricing Page:**
- Uses `PricingHero` + `PricingSection6` + `PricingFAQ`

---

## 6. API ROUTES

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
- `app/api/guru-chat/*` - Legacy guru chat
- `app/api/guru-voice/*` - Voice input
- `app/api/guru-vision/*` - Vision/image analysis
- `app/api/guru-video/*` - Video analysis
- `app/api/guru-tts/*` - Text-to-speech
- `app/api/face/*` - Face reading
- `app/api/palmistry/*` - Palmistry
- `app/api/aura/*` - Aura analysis
- `app/api/business/*` - Business compatibility
- `app/api/compatibility/*` - Partner compatibility
- `app/api/predictions/*` - Predictions
- `app/api/timeline/*` - Timeline generation
- `app/api/reports/*` - Report generation
- `app/api/report-pdf/*` - PDF generation
- `app/api/horoscope/*` - Daily horoscope
- `app/api/festival/*` - Festival calendar
- `app/api/transits/*` - Planetary transits
- `app/api/chakra/*` - Chakra analysis
- `app/api/career/*` - Career analysis
- `app/api/location/*` - Location analysis
- `app/api/ritual/*` - Ritual generation
- `app/api/side-hustle/*` - Side hustle recommendations

### ADMIN:
- `app/api/admin/*` - Admin endpoints (users, reports, payments, etc.)

### UTILITIES:
- `app/api/upload/image/route.ts`
- `app/api/rag/ingest/route.ts`
- `app/api/notifications/*`
- `app/api/payments/*`
- `app/api/workers/*`
- `app/api/tickets/*`
- `app/api/onboarding/*`
- `app/api/dashboard/*`

**Total API Routes:** 83 endpoints

---

## 7. GLOBAL STYLES

### `app/globals.css`:

**Key Features:**
- Tailwind base styles
- Cosmic dark theme variables
- **`.page-container` utility class:**
  ```css
  .page-container {
    max-width: 1350px;
    margin: 0 auto;
    padding: 2rem 1.25rem;
  }
  ```
- Custom classes: `.spiritual-gradient`, `.aura-glow`, `.chakra-pulse`
- Animation keyframes: `marquee`, `aura-pulse`, `chakra-spin`, `fade-in`, `slide-in`

### `tailwind.config.ts`:

**Cosmic Color Palette:**
- `cosmic.navy: "#020916"`
- `cosmic.indigo: "#0A0F2B"`
- `cosmic.purple: "#6E2DEB"`
- `cosmic.cyan: "#17E8F6"`
- `cosmic.gold: "#F2C94C"`

**Font Families:**
- `heading`, `body`, `display`

**Custom Animations:**
- `aura-pulse`, `chakra-spin`, `marquee`

### Z-INDEX LAYERS:
- **Background:** `z-0` (GlobalShaderBackground)
- **Content:** `z-10` (main)
- **Header/Footer:** `z-20` (top layer)
- **Modals:** `z-50`
- **Overlays:** `z-[10000]`, `z-[9999]`, `z-[9998]`

---

## 8. MOTION / GSAP HOOKS

### GSAP SCROLLTRIGGER HOOKS:
1. **`hooks/motion/useSectionMotion.ts`** ✅ **FIXED**
   - Status: Fixed infinite loop
   - Uses: ScrollTrigger.create (runs once on mount)
   - Batches: State updates with requestAnimationFrame
   - Dependencies: Empty array (runs once)

2. **`hooks/motion/useScrollMotion.ts`**
   - Uses: Scroll store (Zustand)
   - No ScrollTrigger (uses scroll events)

3. **`hooks/motion/useMouseMotion.ts`**
   - Uses: Mouse store (Zustand)
   - No ScrollTrigger

4. **`hooks/motion/useRouteMotion.ts`**
   - Uses: ScrollTrigger for route transitions

### FRAMER MOTION USAGE:
**160+ files** use Framer Motion:
- All Super Cosmic UI sections
- All layout shells
- All page components
- All card components
- Motion presets from `global-motion.ts`

---

## 9. EMPTY STATES & DEMO MODE

### Pages with Empty States:

**Dashboard Pages:**
- `/reports` - "No Reports Yet" with "Generate First Report" CTA
- `/predictions` - Empty states for daily, weekly, monthly tabs
- `/timeline` - "No Timeline Data" message
- `/charts` - "No Charts Available" with link to Kundali
- `/payments` - Empty payment history state
- `/rituals` - Empty rituals state
- `/calendar` - Empty calendar state

**Design:**
- Centered glass cards
- Sparkles icon
- Friendly, cosmic-themed messages
- Clear CTAs where appropriate

---

## 10. RECENT CHANGES (December 2024)

### Super Cosmic UI Transformation:

**Phase 1: Global UI Foundation**
- ✅ Created `src/ui/theme/` (tokens, motion)
- ✅ Created `src/ui/layout/Header.tsx` and `Footer.tsx`
- ✅ Created `src/ui/background/GlobalShaderBackground.tsx`
- ✅ Updated `app/layout.tsx` with new global components
- ✅ Added `.page-container` utility class

**Phase 2: Homepage Rebuild**
- ✅ Created `src/ui/sections/home/*` (6 new sections)
- ✅ Rebuilt `app/page.tsx` with new sections
- ✅ Removed old R3F background from homepage

**Phase 3: Guru, Pricing, Auth Pages**
- ✅ Created `src/ui/sections/guru/*`
- ✅ Created `src/ui/sections/pricing/*`
- ✅ Created `src/ui/sections/auth/AuthLayout.tsx`
- ✅ Updated `/guru`, `/pricing`, `/login`, `/signup`

**Phase 4: Dashboard & Marketing Pages**
- ✅ Created layout shells (DashboardPageShell, MarketingPageShell, CompanyPageShell)
- ✅ Applied shells to 30+ pages
- ✅ Removed old background wrappers
- ✅ Added empty states

**Phase 5: Final Polish**
- ✅ Fixed spacing and typography consistency
- ✅ Added empty states to dashboard pages
- ✅ Fixed unescaped apostrophes
- ✅ Verified mobile responsiveness
- ✅ Build passes successfully

### Build Status:

**Current Status:** ✅ **PASSING**
- TypeScript: No errors
- Build: Successful
- Lint: Minor warnings (non-blocking)
- Vercel: Deployed successfully

**Recent Fixes:**
- Fixed `TestimonialsSection` import path (case sensitivity)
- Added `TestimonialItem` type export
- Renamed `Testimonials` folder to `testimonials` for Linux compatibility

---

## 11. IDENTIFIED ISSUES

### ✅ RESOLVED:

1. **Home Page Background Conflict** - ✅ FIXED
   - Replaced R3F Canvas with Super Cosmic UI sections
   - Now uses GlobalShaderBackground from layout

2. **TestimonialsSection Import Path** - ✅ FIXED
   - Renamed folder from `Testimonials` to `testimonials`
   - Fixed case sensitivity for Linux/Vercel

3. **ScrollTrigger Infinite Loop** - ✅ FIXED
   - Fixed in `hooks/motion/useSectionMotion.ts`

### ⚠️ MINOR ISSUES:

1. **Unescaped Apostrophes**
   - 20 remaining in non-critical files (API routes, some components)
   - Non-blocking warnings
   - Can be fixed incrementally

2. **Unused R3F Components**
   - Many R3F scene modules exist but may not be actively used
   - Can be cleaned up in future optimization pass

---

## 12. SUMMARY

### BACKGROUND RENDERING STATUS:
- **GlobalShaderBackground:** ✅ Active (WebGL2 shader, universal)
- **Home Page:** ✅ Uses Super Cosmic UI sections (no direct R3F)
- **Dashboard Pages:** ✅ Use DashboardPageShell (no per-page backgrounds)
- **Marketing Pages:** ✅ Use MarketingPageShell (no per-page backgrounds)

### R3F USAGE:
- **344 files** import from `@react-three/fiber` or `three`
- **50+ cosmos scene modules** (full R3F scenes)
- **15 post-processing effects** (R3F)
- **Global background:** WebGL2 shader (not R3F)
- **Foreground elements:** R3F used for specific widgets (3D wheels, hero backgrounds)

### MOTION SYSTEM:
- **29 files** use GSAP ScrollTrigger
- **160+ files** use Framer Motion
- **Motion presets:** Centralized in `global-motion.ts`
- **ScrollTrigger:** Fixed in useSectionMotion.ts

### SUPER COSMIC UI:
- **20 files** in `src/ui/` directory
- **6 homepage sections** (HomeHero, HomeValueProps, etc.)
- **2 guru sections** (GuruHero, GuruLayoutShell)
- **2 pricing sections** (PricingHero, PricingFAQ)
- **1 auth layout** (AuthLayout)
- **6 layout shells** (Header, Footer, DashboardShell, etc.)

### PROVIDERS:
- **GlobalProviders:** Mounts once, prevents duplication
- **MotionProvider:** Provides orchestrator
- **AudioProvider:** Audio context

### BUILD & DEPLOYMENT:
- **Build:** ✅ Passing
- **TypeScript:** ✅ No errors
- **Vercel:** ✅ Deployed
- **Last Commit:** "Super Cosmic UI + global background + final polish"

---

**END OF SCAN**

**Last Updated:** 2024-12-02
**Next Review:** After next major feature addition

---

## Full System Reactivation — Status (Phases 0-7 Complete)

**Date:** Latest Update  
**Status:** ✅ All Critical Systems Reactivated

### Auth (User + Admin)
- ✅ User login/signup working with visible error states
- ✅ Admin login working with session management
- ✅ Route guards functional
- ✅ Middleware allows public auth routes

### Guru + Pinecone
- ✅ Guru API functional (requires OPENAI_API_KEY or GEMINI_API_KEY)
- ✅ RAG integration ready (requires PINECONE_API_KEY)
- ✅ Clear error messages when env vars missing
- ✅ Graceful degradation when RAG unavailable

### Pricing + Payments
- ✅ Unified pricing config: Basic ₹99, Advanced ₹199, Premium ₹299
- ✅ Single source of truth in `lib/pricing/plans.ts`
- ✅ Payment flows wired correctly
- ✅ Limits applied on payment success

### API Health
- ✅ Dev tool at `/dev/api-health` to test all endpoints
- ✅ 30+ endpoints checked across 8 categories
- ✅ Clear error messages for missing env vars

### Frontend Routes
- ✅ All major routes render without crashing
- ✅ Correct shells applied (DashboardPageShell, MarketingPageShell, etc.)
- ✅ Empty states in place

### How to Run Locally
1. `npm install`
2. `cp .env.example .env.local` and fill values
3. `npm run dev`
4. Access API Health: `http://localhost:3000/dev/api-health` (dev only)

See `FULL_SYSTEM_REACTIVATION_SUMMARY.md` for complete details.
