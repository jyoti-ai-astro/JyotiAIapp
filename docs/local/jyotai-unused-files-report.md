# Jyoti AI — Probably Unused or Placeholder Files

## 1. Probably Unused Components
- components/loaders/* (particle-swirl-loader.tsx, nebula-pulse.tsx, mandala-spinner.tsx, planet-orbit-loader.tsx, index.ts): Loader variants with only TODO stubs and no apparent imports — likely scaffolding for future loading states.
- components/interactive/* (parallax-element.tsx, scroll-reveal.tsx, magnetic-button.tsx, hover-glow.tsx, index.ts): Micro-interaction engines marked TODO, no obvious in-use references.
- components/cosmic/* (astro-glyph.tsx, chakra-wheel.tsx, mandala.tsx, cosmic-background.tsx, energy-wave.tsx, index.ts): Cosmic animation/iconography placeholders noted with TODOs, likely unused in current UI.
- components/cosmic/mandala.tsx and components/cosmic/chakra-wheel.tsx: Complex placeholders with TODO-only specs, no clear consumers.
- components/chat/* (chat-input.tsx, guru-avatar.tsx, message-bubble.tsx, chat-container.tsx, index.ts): Guru chat component scaffolding with TODOs; main chat likely implemented elsewhere.
- components/forms/* (date-picker.tsx, time-picker.tsx, form-field.tsx, select.tsx, autocomplete.tsx, index.ts): Form molecule placeholders with TODOs; other UI inputs appear to be the active set.
- components/charts/* (chakra-bars.tsx, dasha-timeline.tsx, numerology-radar.tsx, kundali-chart.tsx, index.ts): Chart scaffolding with TODO-only specs; unclear if rendered anywhere.
- components/cosmic/energy-wave.tsx and components/cosmic/cosmic-background.tsx: Animation placeholders with TODOs, no obvious imports.
- cosmos/cursor/* (cursor-controller.tsx, click-burst.tsx, cursor-aura.tsx, jyoti-trail.tsx, index.ts): Cursor trail system marked TODO and likely not wired into layouts.
- cosmos/audio/* (audio-engine.tsx, audio-controller.tsx, sound-layers.tsx): Audio atmosphere engine placeholders with TODOs, no visible integration.
- cosmos/shaders/* (aurora-shader.ts, kundalini-shader.ts, particle-shader.ts, index.ts): Shader stubs with TODO specs; probably unused in production builds.
- cosmos/scenes/* (particle-universe-scene.tsx, kundalini-wave-scene.tsx, nebula-scene.tsx, index.ts): Scene blueprints with TODOs; appear experimental.
- cosmos/index.ts: Core animation engine placeholder with multiple TODOs; likely unused.
- components/engines/* (various) may be partially used, but many have TODO-heavy placeholder sections; flag for review.

## 2. Probably Unused Pages/Routes
- app/updates/page.tsx, app/status/page.tsx, app/splash/*, app/thanks/page.tsx: Marketing/status/placeholder pages with minimal content; may not be linked.
- app/cosmos/* (if present under app/) or 3D/animation demo pages: likely exploratory.
- app/api/guru-chat/route.ts: Marked deprecated in favor of /api/guru; likely unused legacy route.
- Feature demo-like pages: app/side-hustle, app/festival, app/rituals, app/business, app/career — appear marketing/experimental; unclear linkage from nav.
- app/api/report/generate/route.ts: Contains TODO about refactor; verify if superseded by other report endpoints.
- app/api/workers/*: Job trigger endpoints may be unused if no scheduler; verify call sites.

## 3. Placeholder or Empty Files
- public/hero/README.md and public/hero/.gitkeep: TODO to upload hero images — asset placeholders.
- public/transitions/README.md, public/features/README.md, public/cta/README.md, public/footer/README.md, public/content/README.md: Asset upload placeholders.
- hooks/use-*.ts with TODO-only bodies (use-cursor-trail, use-glow-pulse, use-scroll-trigger, use-particle-distortion, use-kundalini-wave, use-cosmic-motion, use-audio, use-reduced-motion): Motion/FX hooks not implemented.
- providers/* with TODO-only implementations (cosmic-provider, motion-provider, accessibility-provider, theme-provider): Context scaffolding not yet wired.
- layout/* files full of TODOs (app-layout, reports-center-layout, public-website-layout, ai-guru-layout, master-app-layout, admin-layout, onboarding-layout): Layout scaffolding/placeholder content.
- utils/animations/*, utils/effects/*, utils/accessibility/*: Entire folders of TODO-stubbed helpers for motion/effects/accessibility.
- lib/rag/knowledge-graph.ts: Graph helper with only TODO stubs.
- lib/engines/kundali/divisional-charts.ts: Contains TODOs for chart calculations; may be partial/unused.
- cosmos/shaders/index.ts and related shader files: Placeholder exports with TODOs.
- styles/themes/* (cosmic-theme.ts, dark-theme.ts, light-theme.ts, mystic-theme.ts, index.ts): Theme token placeholders with TODOs.
- public/hero/.gitkeep: Empty placeholder file to keep directory — no functional content.

Notes:
- This report is best-effort static reading; some items may be used indirectly or via dynamic imports. Review before deleting or archiving.***
