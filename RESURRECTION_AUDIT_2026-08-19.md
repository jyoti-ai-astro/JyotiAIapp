# Jyoti AI Resurrection Audit — 2026-08-19

## Objective
Restore the existing Jyoti AI web application to a launchable revenue-first MVP without rewriting working systems unnecessarily.

## Current technical baseline
- Next.js 14.2.x / React 18 / TypeScript 5.x
- Firebase client + Admin authentication / Firestore
- OpenAI + optional Gemini integration
- Razorpay subscriptions and one-time purchases
- Pinecone RAG support
- Kundali, horoscope, predictions, AI Guru, reports, onboarding, dashboard and admin surfaces already exist
- No node_modules included in source archive (correct)
- No .env.local included (secrets/config must be restored separately)

## Initial audit findings
1. Historical build logs showed missing `components/ui/skeleton`, `select`, and `label` modules. Those files are present in the current archive, so that old blocker has already been resolved in source.
2. Static local-import integrity scan found no genuine missing internal application modules.
3. A launch-critical auth/monetization state bug existed: login/signup client flows reset local subscription state to `free` and did not restore current ticket balances from Firestore.
4. User state types were out of sync with the newer payment system: UI reads `aiGuruTickets`, `kundaliTickets`, and `lifetimePredictions`, but the persisted store did not define them.
5. Backend subscription data has both legacy string and newer object forms. A normalization boundary is required before values enter the client store.
6. Runtime verification cannot yet be completed from this archive because `.env.local` is absent.
7. Dependency installation could not be completed in the current sandbox because npm registry access stalled; this is not yet evidence of an application dependency failure.

## Repairs applied in this working copy
- `app/api/auth/login/route.ts`
  - Added subscription-tier normalization.
  - Re-reads Firestore after first-user creation.
  - Returns subscription, expiry, legacy tickets, modern ticket balances, and daily usage.
  - Initializes new-user credit fields explicitly.
- `app/api/auth/verify/route.ts`
  - Added subscription-tier normalization.
  - Returns complete payment/credit state.
- `store/user-store.ts`
  - Added modern ticket fields.
  - Added legacy-to-current ticket normalization/defaults.
- Login/signup/magic-link client flows
  - Restore subscription and credit data returned by backend instead of forcing `free`.
- `lib/hooks/useAuth.ts`
  - Hydrates the complete normalized user/payment state.

## Runtime configuration required for launch verification
At minimum, verify values for:
- NEXT_PUBLIC_FIREBASE_API_KEY
- NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
- NEXT_PUBLIC_FIREBASE_PROJECT_ID
- NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
- NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
- NEXT_PUBLIC_FIREBASE_APP_ID
- FIREBASE_ADMIN_PROJECT_ID
- FIREBASE_ADMIN_PRIVATE_KEY
- FIREBASE_ADMIN_CLIENT_EMAIL
- ADMIN_SESSION_SECRET
- OPENAI_API_KEY (or GEMINI_API_KEY if provider changed)
- RAZORPAY_KEY_ID
- RAZORPAY_KEY_SECRET
- NEXT_PUBLIC_RAZORPAY_KEY_ID
- RAZORPAY_WEBHOOK_SECRET
- Razorpay plan IDs for active subscription tiers
- ZEPTO_API_KEY if magic-link email remains in launch scope

Optional/feature-dependent:
- PINECONE_API_KEY / index configuration
- GOOGLE_GEOCODING_API_KEY
- TIMEZONEDB_API_KEY
- analytics/error-monitoring variables

## Launch-critical verification order
1. Clean dependency install using the lockfile.
2. `npm run type-check`.
3. `npm run build`.
4. Local start with restored environment variables.
5. Signup/login/session persistence.
6. Birth-details onboarding and Firestore profile persistence.
7. Kundali generation and dashboard load.
8. Daily horoscope response.
9. AI Guru authenticated chat and credit consumption.
10. Razorpay one-time purchase, signature verification, webhook idempotency and credit grant.
11. Razorpay subscription activation/cancellation and paid-state persistence after logout/login.
12. Mobile smoke test of landing → auth → onboarding → dashboard → Guru → payment.

## Launch scope recommendation
Keep launch path focused on landing, auth, onboarding, Kundali/profile, dashboard, horoscope/predictions, AI Guru, pricing/payments, account, essential legal pages and minimum admin visibility. Non-core experiential modules should not block launch.
