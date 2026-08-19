# Jyoti AI — Project Hub (Local Only)

## A. One-Page Summary
- Jyoti AI is an AI-driven astrology assistant delivering personalized reports, predictions, and guided flows (palm, face, aura, kundali, numerology).
- Tech stack: Next.js 14 (App Router), React 18, TypeScript, Tailwind, Firebase Auth/Firestore/Storage (client + Admin SDK), Razorpay payments, OpenAI/Gemini + Pinecone RAG, ZeptoMail/email utilities.

## B. Core Flows
1) Signup / Login (magic link + session cookie)
- Client signs in with Firebase; server API (`/api/auth/login`, `/api/auth/verify`, `/api/auth/magic-link`) validates ID tokens via Firebase Admin and mints secure session cookies.
- Middleware and API routes rely on the session cookie; user profile is created/updated in Firestore.
2) Dashboard & prediction creation flow
- User pages (`/dashboard`, `/predictions`, `/timeline`, `/reports`) fetch profile/subscription and trigger prediction/report generation via `/api/predictions`, `/api/reports/*`, `/api/timeline`, etc.
- Results are stored in Firestore/Storage and rendered in the UI.
3) Payment / upgrade flows
- Pricing/pay pages create Razorpay orders via `/api/payments/order`; client completes checkout, then verification via `/api/payments/verify`.
- Subscriptions and one-time purchases are updated in Firestore; webhook `/api/webhooks/razorpay` keeps state in sync.
4) Admin panel (/admin)
- Admin login issues signed admin_session cookie; admin routes `/api/admin/*` manage users, payments, logs, knowledge, jobs, backups, settings.
- Pages: `/admin/dashboard`, `/admin/users`, `/admin/payments`, `/admin/logs`, `/admin/knowledge`, `/admin/settings`, etc.
5) Background/scheduled tasks
- No explicit schedulers found; some “workers” endpoints (`/api/workers/*`) act as job triggers; backups via `/api/admin/backup`.

## C. Routes & Screens Index
- Front-end key routes (public/protected/admin):
  - `/` (`app/page.tsx`) — public landing.
  - `/login`, `/signup`, `/magic-link` — public auth.
  - `/dashboard`, `/onboarding`, `/profile-setup`, `/rasi-confirmation` — protected user flows.
  - `/predictions`, `/timeline`, `/reports`, `/report`, `/guru`, `/pay`, `/premium`, `/pricing`, `/planets`, `/houses`, `/palmistry`, `/face`, `/aura`, `/numerology`, `/compatibility`, `/business`, `/side-hustle`, `/career`, `/festival`, `/rituals`, `/updates`, `/status`, `/support`, `/legal/*`, `/privacy`, `/terms`, `/about`, `/contact`, `/blog` — feature screens (mostly protected for user data; some public info pages).
  - `/admin/*` — admin-only (dashboard, users, payments, logs, knowledge, settings, etc.).
- API routes (URLs/file paths/methods/desc):
  - Auth: `/api/auth/login|logout|verify|magic-link` (`app/api/auth/*`, POST/GET) — session management.
  - User: `/api/user/get|update|tickets` — profile and ticket counters.
  - Payments: `/api/payments/order|verify` — create/verify Razorpay orders (POST).
  - Webhook: `/api/webhooks/razorpay` — Razorpay events (POST).
  - Admin: `/api/admin/*` — admin CRUD/stats/logs/knowledge/payments/backups (GET/POST).
  - Guru/AI: `/api/guru*`, `/api/guru-chat`, `/api/guru-vision|voice|video|tts` — AI interactions (POST).
  - Reports: `/api/reports/*`, `/api/report-pdf` — report generation/export (GET/POST).
  - Uploads/Scans: `/api/upload/image`, `/api/palmistry`, `/api/face`, `/api/aura` — media uploads/processing (POST).
  - Domain flows: `/api/astro`, `/api/compatibility`, `/api/predictions`, `/api/timeline`, `/api/transits`, `/api/ritual`, `/api/notifications`, `/api/onboarding`, `/api/business`, `/api/career`, `/api/side-hustle`, `/api/numerology`, `/api/kundali`, `/api/planets`, `/api/houses`, `/api/chakra`, `/api/festival`, `/api/rag`, `/api/guru-rag` — feature-specific processing (mostly POST/GET).
  - Workers: `/api/workers/*`, `/api/location`, `/api/report-pdf` — auxiliary/job endpoints.

## D. Important Modules & Hooks
- Hooks: `hooks/use-auth`, `hooks/use-user`, `hooks/use-payment`, `hooks/use-modal`, etc. manage auth state, user profile, payments, and UI state.
- UI components: `components/ui/*` (buttons, inputs, select, label, skeleton), `components/auth/*` (forms, signup/login cards), `components/engines/*` (feature-specific UIs), `components/layout/*` (headers, navigation).
- Lib/utils: `lib/firebase/config.ts` (client Firebase), `lib/firebase/admin.ts` (Admin SDK), `lib/env/env.mjs` (env validation), `lib/admin/admin-auth.ts` (admin auth + signed sessions), `lib/middleware/admin-middleware.ts`, `lib/services/pdf-service.ts`, `lib/services/upload-service.ts`, `lib/logging/*`, `lib/email/*`, `lib/engines/reports/*`.

## E. Environment & Secrets Map
- Auth/Firebase client: `NEXT_PUBLIC_FIREBASE_*` (used in `lib/firebase/config.ts`, `lib/env/env.mjs`).
- Firebase Admin: `FIREBASE_ADMIN_PROJECT_ID`, `FIREBASE_ADMIN_PRIVATE_KEY`, `FIREBASE_ADMIN_CLIENT_EMAIL` (used in `lib/firebase/admin.ts`, API routes).
- Admin session: `ADMIN_SESSION_SECRET` (used in `lib/admin/admin-auth.ts`, `middleware.ts`, `lib/env/env.mjs`).
- AI: `AI_PROVIDER`, `EMBEDDING_PROVIDER`, `OPENAI_API_KEY`, `GEMINI_API_KEY` (AI routes/services).
- Razorpay: `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET`, `NEXT_PUBLIC_RAZORPAY_KEY_ID`, `RAZORPAY_PLAN_*` (payments routes/webhook/env).
- Pinecone/RAG: `PINECONE_API_KEY`, `PINECONE_ENVIRONMENT`, `PINECONE_INDEX_NAME`, `PINECONE_INDEX_GURU`, `GURU_RAG_ENABLED`.
- Email: `ZEPTO_API_KEY`, `ZEPTO_DOMAIN`, `ZEPTO_FROM`.
- Monitoring/analytics: `SENTRY_DSN`, `NEXT_PUBLIC_SENTRY_DSN`, `NEXT_PUBLIC_MIXPANEL_TOKEN`.
- App config: `APP_ENV`, `NEXT_PUBLIC_APP_ENV`, `NEXT_PUBLIC_BASE_URL`, `BETA_MODE`, `NEXT_PUBLIC_BETA_MODE`, `DISABLE_PAYMENTS`.
- Others: `WORKER_API_KEY`, `CLOUDFLARE_ACCOUNT_ID`, `CLOUDFLARE_API_TOKEN`.

## F. Known Pain Points / Fragile Areas (Best Guess)
- Admin auth was previously plaintext/unsigned; now uses signed tokens but requires `ADMIN_SESSION_SECRET` and password rehashing for legacy accounts.
- Upload service was client-only; server upload route now uses admin storage but needs careful file handling and sharp-native considerations.
- Env validation is strict in production; missing keys will fail—must populate all required secrets on Vercel.
- Many API routes lack explicit Zod validation and uniform error handling—risk of malformed input causing errors.
- Payments/webhook flows depend on correct Razorpay secrets and signature verification; misconfig leads to failed subscription sync.
- Image domain allowlist in `next.config.mjs` must be kept in sync with actual asset hosts.
- Potential duplication across prediction/report flows and multiple feature-specific APIs; consolidation could reduce surface area.

## G. Unused / Experimental Areas
- Placeholder for future audit: see `docs/local/jyotai-unused-files-report.md` (to be generated later).
- Observed exploratory/marketing sections under feature pages (`/updates`, `/blog`, some 3D/cosmos/postfx assets) that may be experimental.

## H. Next Steps for Cleanup
- Populate all required env vars on Vercel (Firebase client/admin, ADMIN_SESSION_SECRET, AI, Razorpay, Pinecone, email).
- Rehash admin passwords and clear legacy plaintext fields; rotate admin sessions.
- Add request validation (Zod) and consistent error responses across `/api/**`.
- Add integration tests for payments (order/verify/webhook) and auth flows (login/session cookies).
- Consolidate prediction/report/guru API logic to reduce duplication and centralize validation.
- Review image domains and CDN usage; add missing hosts to `next.config.mjs`.
- Audit upload/processing code paths for sharp/native handling and Storage permissions.
- Streamline feature pages/routes; archive unused/experimental sections once identified.
- Improve logging/monitoring hooks around webhooks, payments, and admin actions.
- Document job/worker endpoints and, if needed, add scheduling triggers or cron wrappers.
