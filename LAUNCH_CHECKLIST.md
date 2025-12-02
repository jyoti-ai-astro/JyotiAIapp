# JyotiAI Launch Checklist

**Last Updated:** Phases LZ1–LZ4 Complete  
**Status:** Production-Ready with Launch Guardrails

---

## 1. Environment & Config

### Required Environment Variables

- [ ] **APP_ENV** set to `"production"` on Vercel
- [ ] **DISABLE_PAYMENTS** not set or `"false"` (set to `"true"` only for emergency maintenance)

### Firebase Configuration

- [ ] **NEXT_PUBLIC_FIREBASE_API_KEY** set
- [ ] **NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN** set
- [ ] **NEXT_PUBLIC_FIREBASE_PROJECT_ID** set
- [ ] **NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET** set
- [ ] **NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID** set
- [ ] **NEXT_PUBLIC_FIREBASE_APP_ID** set
- [ ] **FIREBASE_ADMIN_PROJECT_ID** set
- [ ] **FIREBASE_ADMIN_PRIVATE_KEY** set (with proper newline escaping)
- [ ] **FIREBASE_ADMIN_CLIENT_EMAIL** set

### AI Provider Configuration

- [ ] **AI_PROVIDER** set to `"openai"` or `"gemini"`
- [ ] **OPENAI_API_KEY** set (if using OpenAI)
- [ ] **GEMINI_API_KEY** set (if using Gemini)

### RAG / Pinecone Configuration

- [ ] **PINECONE_API_KEY** set
- [ ] **PINECONE_ENVIRONMENT** set (default: `"us-east-1"`)
- [ ] **PINECONE_INDEX_NAME** set (default: `"jyotiai-index"`)
- [ ] **PINECONE_INDEX_GURU** set (default: `"jyotiai-guru-knowledge"`)
- [ ] **GURU_RAG_ENABLED** set to `"true"` (if using RAG)

### Razorpay Configuration

- [ ] **RAZORPAY_KEY_ID** set (server-side)
- [ ] **RAZORPAY_KEY_SECRET** set (server-side)
- [ ] **NEXT_PUBLIC_RAZORPAY_KEY_ID** set (client-side)
- [ ] **RAZORPAY_PLAN_STARTER_ID** set (Razorpay plan ID for Starter subscription)
- [ ] **RAZORPAY_PLAN_ADVANCED_ID** set (Razorpay plan ID for Advanced subscription)
- [ ] **RAZORPAY_PLAN_SUPREME_ID** set (Razorpay plan ID for Supreme subscription)
- [ ] **RAZORPAY_WEBHOOK_SECRET** set (for webhook verification)

### Optional Configuration

- [ ] **ZEPTO_API_KEY** set (for email notifications)
- [ ] **GOOGLE_GEOCODING_API_KEY** set (for location services)
- [ ] **TIMEZONEDB_API_KEY** set (for timezone services)
- [ ] **SENTRY_DSN** set (for error tracking)
- [ ] **NEXT_PUBLIC_MIXPANEL_TOKEN** set (for analytics)

---

## 2. Manual Smoke Test (User Flows)

### Authentication

- [ ] Visit home page → check layout, pricing, and Super Cosmic UI render correctly
- [ ] Sign up with a new account (email/password) → redirected to dashboard/onboarding
- [ ] Log in with existing account → redirected to dashboard
- [ ] Log out → redirected to home page

### Guru Chat

- [ ] Open `/guru` → chat interface loads
- [ ] If user has `aiGuruTickets > 0` → ask 1 question → verify response received
- [ ] If user has `aiGuruTickets = 0` → verify OneTimeOfferBanner appears with purchase CTAs
- [ ] Verify ticket count decrements after successful question

### One-Time Purchases

- [ ] If no credits → navigate to `/pricing` → click "Quick Reading — ₹99"
- [ ] Complete Razorpay test payment flow
- [ ] Verify redirect to `/thanks?payment=success`
- [ ] Check dashboard → verify `aiGuruTickets` incremented
- [ ] Test with ₹199 and ₹299 products

### Feature Modules (Ticket Gating)

- [ ] Navigate to `/kundali` → if no tickets → verify OneTimeOfferBanner appears
- [ ] Navigate to `/career` → if no tickets → verify OneTimeOfferBanner appears
- [ ] Navigate to `/business` → if no tickets → verify OneTimeOfferBanner appears
- [ ] Navigate to `/compatibility` → if no tickets → verify OneTimeOfferBanner appears
- [ ] Navigate to `/face` → if no tickets → verify OneTimeOfferBanner appears
- [ ] Navigate to `/pregnancy` → if no tickets → verify OneTimeOfferBanner appears
- [ ] If user has tickets → verify feature loads and ticket is consumed after use

### Subscriptions

- [ ] Log in as test user
- [ ] Go to `/pricing` → click "Starter ₹499/month" as logged-in user
- [ ] Complete Razorpay test subscription flow
- [ ] Refresh `/payments` → subscription appears as Active
- [ ] Verify subscription status shows correct plan name
- [ ] Cancel subscription via `/payments` → status becomes Cancelled
- [ ] Verify ticket enforcement allows access while subscription is active

---

## 3. Admin Dashboard

- [ ] Log in to `/admin/login` with admin credentials
- [ ] Verify admin dashboard loads
- [ ] Check **One-Time Purchases** tab:
  - [ ] Purchases list displays correctly
  - [ ] Email search filter works
  - [ ] Date range filter works
- [ ] Check **Tickets** tab:
  - [ ] User tickets display correctly
  - [ ] "+1 AI Guru Ticket" action works
  - [ ] "+5 AI Guru Tickets" action works
  - [ ] "Reset Tickets" action works
  - [ ] Verify Guru / Kundali respect updated ticket counts

---

## 4. Dev Tools (Non-Production Only)

- [ ] In non-production, open `/dev/api-health` → ensure no red issues for critical endpoints
- [ ] Open `/dev/smoke-test` → run all tests:
  - [ ] Auth Check → should return 200 when logged in, 401/403 when not
  - [ ] Tickets Check → should show tickets + subscription info
  - [ ] Subscription Status → should return current subscription or "None"
  - [ ] Guru API (Dry Run) → should return `{ok: true}`
  - [ ] Payments Config → should show all Razorpay keys and plan IDs configured
- [ ] Verify environment badge shows in header (DEV / STAGING) when not in production

---

## 5. Payments Kill Switch Test

- [ ] Set `DISABLE_PAYMENTS="true"` in Vercel environment variables
- [ ] Deploy to preview/staging
- [ ] Verify:
  - [ ] Pricing page shows "Payments Temporarily Disabled" banner
  - [ ] All payment buttons are disabled
  - [ ] `/pay/[productId]` page shows disabled message
  - [ ] `/api/pay/create-one-time-order` returns 503
  - [ ] `/api/subscriptions/create` returns 503
- [ ] Set `DISABLE_PAYMENTS="false"` → verify payments work again

---

## 6. Final Go-Live

### Pre-Launch

- [ ] Confirm `DISABLE_PAYMENTS` is `"false"` or not set
- [ ] Confirm `APP_ENV="production"` on Vercel production environment
- [ ] Verify all Razorpay plan IDs are set correctly
- [ ] Test one complete payment flow end-to-end in Razorpay test mode
- [ ] Test one complete subscription flow end-to-end in Razorpay test mode
- [ ] Verify Guru API responds correctly
- [ ] Verify all feature modules respect ticket gating

### Launch

- [ ] Trigger Vercel production deploy
- [ ] Monitor first 10–20 payments & Guru calls
- [ ] Check error logs for any unexpected issues
- [ ] Verify environment badge does NOT show in production (header should be clean)

### Post-Launch Monitoring

- [ ] Monitor `/dev/api-health` (if accessible) for endpoint health
- [ ] Check Sentry (if configured) for error reports
- [ ] Monitor Razorpay dashboard for payment success rates
- [ ] Verify subscription webhooks are working (if configured)

---

## 7. Emergency Procedures

### Disable Payments Instantly

If payments need to be disabled immediately:

1. Go to Vercel → Project Settings → Environment Variables
2. Set `DISABLE_PAYMENTS="true"`
3. Redeploy (or wait for auto-deploy)
4. All payment buttons will be disabled within minutes

### Check System Health

- Visit `/dev/api-health` (non-production) or `/dev/smoke-test` to verify all endpoints
- Check Firebase console for user data integrity
- Check Razorpay dashboard for payment issues

---

## Notes

- **Environment Badge**: Shows "DEV MODE" or "STAGING MODE" in header when `APP_ENV` is not `"production"`
- **Kill Switch**: `DISABLE_PAYMENTS="true"` instantly disables all payment flows without code changes
- **Smoke Test**: `/dev/smoke-test` page allows manual verification of all critical API endpoints
- **API Health**: `/dev/api-health` shows status of all API endpoints with ticket-guarded badges

---

**End of Checklist**

