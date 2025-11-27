# Phase 31 - F46: Final Deployment Checklist

## Pre-Deployment Checklist

### 1. Environment Variables ✅

- [ ] All required environment variables set in Vercel
- [ ] `.env.example` updated and committed
- [ ] `.env.local` exists locally (not committed)
- [ ] Firebase credentials verified
- [ ] AI provider API keys configured
- [ ] Razorpay keys configured (if using payments)
- [ ] Base URL set to production domain

### 2. Code Validation ✅

- [ ] All `process.env.*` replaced with `envVars` from `@/lib/env/env.mjs`
- [ ] TypeScript compilation passes: `npm run type-check`
- [ ] Linting passes: `npm run lint`
- [ ] Build succeeds: `npm run build`
- [ ] No console errors in development

### 3. Firebase Setup ✅

- [ ] Firebase project created
- [ ] Authentication providers enabled (Google, Email Link)
- [ ] Firestore database created
- [ ] Storage bucket created
- [ ] Firestore security rules deployed
- [ ] Firebase Admin SDK service account created
- [ ] Admin credentials added to Vercel

### 4. Third-Party Services ✅

- [ ] OpenAI/Gemini API keys configured
- [ ] Pinecone index created (if using RAG)
- [ ] ZeptoMail domain verified
- [ ] Razorpay account activated
- [ ] Sentry project created (if using)
- [ ] Mixpanel project created (if using)

### 5. Vercel Configuration ✅

- [ ] Vercel project connected to GitHub
- [ ] Build command: `npm run build`
- [ ] Output directory: `.next`
- [ ] Node.js version: 18.x or higher
- [ ] Environment variables added
- [ ] Custom domain configured (if applicable)

### 6. Testing ✅

- [ ] Local development works: `npm run dev`
- [ ] Production build works: `npm run build`
- [ ] Authentication flow tested
- [ ] API routes tested
- [ ] Payment flow tested (if applicable)
- [ ] Error boundaries tested
- [ ] Mobile responsiveness tested

## Deployment Steps

### Step 1: GitHub Repository

```bash
# Ensure all changes are committed
git add .
git commit -m "Phase 31 - F46: Environment variable validation"
git push origin main
```

### Step 2: Vercel Deployment

1. Go to Vercel Dashboard
2. Select your project
3. Go to Settings → Environment Variables
4. Verify all variables are set
5. Go to Deployments
6. Click "Redeploy" or push to trigger new deployment

### Step 3: Verify Deployment

```bash
# Test production build locally
npm run build

# If using Vercel CLI
vercel --prod
```

### Step 4: Post-Deployment Checks

- [ ] Production URL loads correctly
- [ ] Authentication works
- [ ] API routes respond correctly
- [ ] No console errors in browser
- [ ] Environment variables validated (check logs)
- [ ] Firebase connection works
- [ ] AI services respond (if configured)

## Vercel Environment Variable Setup

### Quick Setup Script

1. **Export from .env.local** (for reference only, don't commit):
```bash
# View your local variables (for reference)
cat .env.local
```

2. **Add to Vercel**:
   - Go to Vercel Dashboard → Your Project → Settings → Environment Variables
   - Add each variable manually or use Vercel CLI:

```bash
# Install Vercel CLI if not installed
npm i -g vercel

# Login
vercel login

# Link project
vercel link

# Add environment variables (example)
vercel env add NEXT_PUBLIC_FIREBASE_API_KEY production
# Paste value when prompted
```

### Bulk Import (Manual)

For bulk import, use Vercel Dashboard:
1. Settings → Environment Variables
2. Click "Add New"
3. Add each variable from `.env.example`
4. Set environment: Production, Preview, Development

## Firebase Deployment

### Firestore Rules

```bash
# Install Firebase CLI
npm i -g firebase-tools

# Login
firebase login

# Initialize (if not done)
firebase init firestore

# Deploy rules
firebase deploy --only firestore:rules
```

### Storage Rules

```bash
# Deploy storage rules
firebase deploy --only storage:rules
```

## Monitoring & Alerts

### Set Up Monitoring

- [ ] Sentry error tracking configured
- [ ] Vercel analytics enabled
- [ ] Firebase performance monitoring enabled
- [ ] Log aggregation set up (if applicable)

### Alerts

- [ ] Error rate alerts configured
- [ ] API failure alerts configured
- [ ] Payment failure alerts configured (if applicable)

## Rollback Plan

### If Deployment Fails

1. **Check Vercel Logs**:
   - Go to Deployments → Select failed deployment → View logs
   - Look for environment variable errors
   - Check build errors

2. **Rollback**:
   - Go to Deployments
   - Find last successful deployment
   - Click "..." → "Promote to Production"

3. **Fix Issues**:
   - Fix environment variables
   - Fix code issues
   - Redeploy

## Post-Deployment

### Week 1 Monitoring

- [ ] Monitor error rates daily
- [ ] Check API response times
- [ ] Verify payment processing (if applicable)
- [ ] Monitor Firebase usage
- [ ] Check AI API usage/costs

### Ongoing Maintenance

- [ ] Review error logs weekly
- [ ] Update dependencies monthly
- [ ] Rotate API keys quarterly
- [ ] Review security settings quarterly
- [ ] Monitor costs monthly

## Support Resources

- **Vercel Docs**: https://vercel.com/docs
- **Firebase Docs**: https://firebase.google.com/docs
- **Next.js Docs**: https://nextjs.org/docs
- **Environment Variables**: See `docs/DEPLOYMENT_ENV_GUIDE.md`

## Emergency Contacts

- **Vercel Support**: support@vercel.com
- **Firebase Support**: https://firebase.google.com/support
- **Project Team**: [Your contact info]

---

**Last Updated**: Phase 31 - F46
**Status**: ✅ Ready for Production

