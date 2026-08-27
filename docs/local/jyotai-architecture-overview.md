# Jyoti AI — High-Level Architecture

## 1. Project Purpose
- AI-driven astrology assistant offering reports, predictions, and guided flows (palm, face, aura, kundali, numerology).
- Provides user onboarding, profile setup, and personalized dashboards with insights and timelines.
- Supports payments/subscriptions (Razorpay) for premium content and reports.
- Admin panel for managing users, content, payments, logs, and backups.
- Integrates AI backends (OpenAI/Gemini) and vector search (Pinecone) for Guru chat/RAG features.

## 2. Folder Structure and Roles
- `app/`: Next.js App Router pages (public, protected, admin) and API routes under `app/api/**`.
- `components/`: Shared UI, auth components, engines, layouts, forms, etc. (`components/ui`, `components/auth`, `components/engines`).
- `src/`: Additional UI sections and assets used by the landing/home experience.
- `lib/`: Core services (firebase admin/client, env validation, email, PDF, logging), engines (reports), admin auth, middleware helpers.
- `hooks/`: React hooks (auth state, modal state, payment/session helpers).
- `providers/`: Context providers (theming, auth wrappers).
- `store/`: Zustand stores for UI/app state.
- `styles/`: Global Tailwind/CSS assets.
- `public/`: Static assets (images, icons, manifests).
- `config/`, `layout/`, `utils/`, `types/`: Configuration, layout wrappers, helpers, and type definitions.
- `scripts/`: Utility scripts for admin/grants, checks, backup helpers.
- `docs/`: Project docs; `docs/local/` is for local-only notes (ignored by git).

## 3. Routes (Pages) Map
- `/` → `app/page.tsx` — Landing/home sections with hero, value props, pricing teaser.
- `/login`, `/signup`, `/magic-link` → `app/login`, `app/signup`, `app/magic-link` — Auth entry points.
- `/dashboard` → `app/dashboard` — User dashboard for reports/insights.
- `/onboarding`, `/profile-setup`, `/rasi-confirmation` → `app/onboarding`, `app/profile-setup`, `app/rasi-confirmation` — User onboarding flows.
- `/predictions`, `/timeline`, `/reports`, `/report`, `/astrology` variants → `app/predictions`, `app/timeline`, `app/report*` — Report/prediction generation and viewing.
- `/guru`, `/guru/*` (chat/vision/voice) → `app/guru` — AI Guru experiences.
- `/pay`, `/payments`, `/pricing`, `/premium` → `app/pay*`, `app/pricing`, `app/premium` — Payment/upgrade UI.
- `/admin/*` → `app/admin/**` — Admin app pages (dashboard, users, payments, logs, knowledge, settings).
- Misc feature pages: `/palmistry`, `/face`, `/aura`, `/numerology`, `/compatibility`, `/pregnancy`, `/houses`, `/planets`, `/dasha`, `/business`, `/side-hustle`, `/career`, `/festival`, `/rituals`, `/updates`, `/status`, `/support`, `/legal/*`, `/privacy`, `/terms`, `/about`, `/contact`, `/blog`.
- Fallback/error: `app/not-found.tsx`, `app/global-error.tsx`, `app/loading.tsx`, `app/splash`, `app/thanks`, `app/status`, `app/robots.ts`, `app/sitemap.ts`.

## 4. API Routes Map
- Auth: `/api/auth/login`, `/api/auth/logout`, `/api/auth/verify`, `/api/auth/magic-link` — Session cookies via Firebase Admin.
- User: `/api/user/get`, `/api/user/update`, `/api/user/tickets` — Profile CRUD, ticket counters.
- Payments: `/api/payments/order`, `/api/payments/verify`, `/api/pay/` helpers — Razorpay order creation & verification.
- Webhooks: `/api/webhooks/razorpay` — Razorpay webhook signature verify + subscription sync.
- Admin: `/api/admin/*` (login, overview, dashboard, users, payments, logs, knowledge, content, jobs, backup, tickets, reports, settings, guru, etc.) — Admin-only management APIs.
- Features: `/api/guru/*`, `/api/guru-chat`, `/api/guru-tts`, `/api/guru-voice`, `/api/guru-video`, `/api/guru-vision` — AI Guru endpoints.
- Reports: `/api/report*`, `/api/reports/*`, `/api/report-pdf` — Report generation/export.
- Scans/Uploads: `/api/upload/image`, `/api/palmistry`, `/api/face`, `/api/aura` — Media uploads/processing.
- Domain flows: `/api/astro`, `/api/compatibility`, `/api/predictions`, `/api/timeline`, `/api/transits`, `/api/ritual`, `/api/notifications`, `/api/onboarding`, `/api/business`, `/api/career`, `/api/side-hustle`, `/api/numerology`, `/api/kundali`, `/api/planets`, `/api/houses`, `/api/chakra`, `/api/festival`.
- Workers/hooks: `/api/workers/*`, `/api/location`, `/api/upload`, `/api/report-pdf`, `/api/rag`, `/api/guru-rag`.
(Most routes expose POST/GET depending on the file; admin routes typically support GET/POST for list/actions.)

## 5. External Services & Config
- Firebase client: configured in `lib/firebase/config.ts` (Auth, Firestore, Storage) for frontend usage.
- Firebase Admin: `lib/firebase/admin.ts` for server-side Auth, Firestore, Storage, used across API routes.
- Razorpay: used in `/api/payments/order`, `/api/payments/verify`, `/api/webhooks/razorpay`; keys validated in `lib/env/env.mjs`.
- AI providers: OpenAI/Gemini via `openai` / `@google/generative-ai` with configuration in `lib/env/env.mjs`; Pinecone for embeddings/RAG in `lib/env/env.mjs` and RAG helpers.
- Email/notifications: ZeptoMail and custom email service in `lib/email/*`; logging via `lib/logging/*`.

## 6. Environment Variables (Names Only)
- Firebase client: `NEXT_PUBLIC_FIREBASE_API_KEY`, `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`, `NEXT_PUBLIC_FIREBASE_PROJECT_ID`, `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`, `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`, `NEXT_PUBLIC_FIREBASE_APP_ID` (used in `lib/firebase/config.ts`, `lib/env/env.mjs`).
- Firebase Admin: `FIREBASE_ADMIN_PROJECT_ID`, `FIREBASE_ADMIN_PRIVATE_KEY`, `FIREBASE_ADMIN_CLIENT_EMAIL` (used in `lib/firebase/admin.ts`, `lib/env/env.mjs`, APIs).
- Auth/session: `ADMIN_SESSION_SECRET` (used in `lib/admin/admin-auth.ts`, `middleware.ts`, `lib/env/env.mjs`).
- AI: `AI_PROVIDER`, `EMBEDDING_PROVIDER`, `OPENAI_API_KEY`, `GEMINI_API_KEY`, `GURU_MODEL_NAME`, `PREDICTION_MODEL_NAME` (used in `lib/env/env.mjs`, AI engines/routes).
- Razorpay: `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET`, `NEXT_PUBLIC_RAZORPAY_KEY_ID`, `RAZORPAY_PLAN_*` (used in payments routes, webhook, `lib/env/env.mjs`).
- Pinecone: `PINECONE_API_KEY`, `PINECONE_ENVIRONMENT`, `PINECONE_INDEX_NAME`, `PINECONE_INDEX_GURU`, `GURU_RAG_ENABLED` (used in env and RAG services).
- Email: `ZEPTO_API_URL`, `ZEPTO_API_TOKEN`, `ZEPTO_DOMAIN`, `SENDER_EMAIL` (used in `lib/email`).
- Analytics/monitoring: `SENTRY_DSN`, `NEXT_PUBLIC_SENTRY_DSN`, `NEXT_PUBLIC_MIXPANEL_TOKEN` (used in env validation/logging).
- App config: `APP_ENV`, `NEXT_PUBLIC_APP_ENV`, `NEXT_PUBLIC_BASE_URL`, `BETA_MODE`, `NEXT_PUBLIC_BETA_MODE`, `DISABLE_PAYMENTS` (used in `lib/env/env.mjs` and feature toggles).
- Worker/Cloudflare: `WORKER_API_KEY`, `CLOUDFLARE_ACCOUNT_ID`, `CLOUDFLARE_API_TOKEN` (used in env).

## 7. Frontend–Backend Flow Summary
- Frontend pages/forms call Next.js API routes under `/api/*` for auth, payments, uploads, reports, and AI features.
!- Auth uses Firebase client for ID tokens and server-side Admin to mint/verify session cookies; middleware protects routes via cookies.
- Payments use Razorpay order creation (`/api/payments/order`) and verification (`/api/payments/verify`); webhook syncs subscriptions.
- File uploads from UI post to `/api/upload/image`; server validates and stores via Firebase Storage (admin SDK).
- AI flows (Guru/chat/vision/voice) call dedicated API routes that in turn call OpenAI/Gemini and Pinecone.
- Admin panel pages call `/api/admin/*` endpoints for users, payments, logs, knowledge, jobs, and backups.
- Reports and predictions pages fetch/generate report data through `/api/reports/*` and report PDF generation routes.
- Various feature pages (palm/face/aura/kundali/numerology) post user data to corresponding API routes to process and persist to Firestore.
