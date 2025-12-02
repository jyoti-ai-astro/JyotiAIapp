# Comprehensive Project Audit & Fix Plan
**Date:** 2024-12-03  
**Status:** 🔴 IN PROGRESS

---

## 1. PROJECT STRUCTURE OVERVIEW

### Total Pages Found: 81 pages
### Total API Routes: 97+ endpoints
### Components: 200+ components

---

## 2. NAVIGATION ANALYSIS

### Header Navigation Links (Current):
- `/` - Home
- `/guru` - Guru
- `/pricing` - Pricing
- `/dashboard` - Dashboard
- `/company/about` - About
- `/company/contact` - Contact

### Footer Navigation Links (Current):
**Product:**
- `/guru` - AI Guru
- `/pricing` - Pricing
- `/dashboard` - Dashboard
- `/features` - Features

**Company:**
- `/company/about` - About
- `/company/contact` - Contact
- `/company/blog` - Blog
- `/company/careers` - Careers

**Legal:**
- `/legal/terms` - Terms
- `/legal/privacy` - Privacy
- `/legal/security` - Security
- `/legal/cookies` - Cookies

---

## 3. PAGES NOT IN NAVIGATION (MISSING LINKS)

### Public Marketing Pages (Not Linked):
- `/about` - About (duplicate of `/company/about`?)
- `/features` - Features ✅ (in footer)
- `/modules` - Modules
- `/updates` - Updates
- `/status` - Status
- `/splash` - Splash
- `/blog` - Blog (duplicate of `/company/blog`?)
- `/contact` - Contact (duplicate of `/company/contact`?)
- `/support` - Support
- `/terms` - Terms (duplicate of `/legal/terms`?)
- `/privacy` - Privacy (duplicate of `/legal/privacy`?)

### Dashboard/Feature Pages (Not Linked):
- `/kundali` - Kundali
- `/predictions` - Predictions
- `/timeline` - Timeline
- `/career` - Career
- `/business` - Business
- `/compatibility` - Compatibility
- `/face` - Face Reading
- `/palmistry` - Palmistry
- `/aura` - Aura
- `/numerology` - Numerology
- `/calendar` - Calendar
- `/rituals` - Rituals
- `/planets` - Planets
- `/houses` - Houses
- `/charts` - Charts
- `/dasha` - Dasha
- `/pregnancy` - Pregnancy
- `/reports` - Reports
- `/report` - Report Viewer
- `/premium` - Premium
- `/cosmos` - Cosmos
- `/astro` - Astro

### Auth/Onboarding Pages (Not Linked):
- `/login` - Login ✅ (should be accessible)
- `/signup` - Signup ✅ (should be accessible)
- `/magic-link` - Magic Link ✅ (redirected to)
- `/onboarding` - Onboarding ✅ (redirected to)
- `/profile-setup` - Profile Setup ✅ (redirected to)
- `/rasi-confirmation` - Rasi Confirmation ✅ (redirected to)
- `/auth/callback` - Auth Callback ✅ (redirected to)

### Payment Pages (Not Linked):
- `/payments` - Payments ✅ (should be in dashboard)
- `/pay/[productId]` - Payment Page ✅ (redirected to)
- `/thanks` - Thanks ✅ (redirected to)

### Settings/Profile Pages (Not Linked):
- `/settings` - Settings ✅ (should be in dashboard)
- `/profile` - Profile ✅ (should be in dashboard)
- `/notifications` - Notifications ✅ (should be in dashboard)

### Admin Pages (Not Linked - Protected):
- `/admin/*` - All admin pages ✅ (protected, accessed via `/admin/login`)

### Dev Pages (Not Linked - Dev Only):
- `/dev/api-health` - API Health ✅ (dev only)
- `/dev/smoke-test` - Smoke Test ✅ (dev only)

---

## 4. CRITICAL ISSUES TO FIX

### A. Authentication Issues
1. **Login/Signup Pages** - Need to verify they render properly
2. **API Routes** - Check if all auth APIs have `dynamic = 'force-dynamic'`
3. **Firebase Config** - Verify env vars are correct

### B. Blank Pages
1. Check all pages for proper shell components
2. Verify all pages have content
3. Check for missing imports

### C. Navigation Gaps
1. Add missing pages to navigation menus
2. Create sitemap
3. Add breadcrumbs where needed

### D. API Issues
1. Verify all API routes have proper error handling
2. Check for missing `dynamic` exports
3. Verify authentication on protected routes

---

## 5. ENVIRONMENT VARIABLES CHECK

Need to verify:
- Firebase config (client + admin)
- Razorpay keys
- OpenAI/Gemini keys
- Pinecone config
- Email service (ZeptoMail)
- All other required env vars

---

## NEXT STEPS:
1. ✅ Create audit document
2. ⏳ Check each page for blank/error issues
3. ⏳ Fix navigation gaps
4. ⏳ Verify all APIs work
5. ⏳ Test authentication flow
6. ⏳ Fix any blank pages
7. ⏳ Add missing links to menus

