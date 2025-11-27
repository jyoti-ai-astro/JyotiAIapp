# Phase 31 - F46: Deployment Environment Guide

## Environment Variable Mapping Table

### Vercel Environment Variables

| Variable Name | Type | Required | Description | Example |
|--------------|------|----------|-------------|----------|
| **Firebase (Client)** |
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Public | ✅ Yes | Firebase API key | `AIzaSy...` |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Public | ✅ Yes | Firebase auth domain | `your-project.firebaseapp.com` |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Public | ✅ Yes | Firebase project ID | `your-project-id` |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | Public | ✅ Yes | Firebase storage bucket | `your-project.appspot.com` |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Public | ✅ Yes | Firebase messaging sender ID | `123456789012` |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | Public | ✅ Yes | Firebase app ID | `1:123456789012:web:abc...` |
| **Firebase Admin** |
| `FIREBASE_ADMIN_PROJECT_ID` | Private | ✅ Yes | Firebase admin project ID | `your-project-id` |
| `FIREBASE_ADMIN_PRIVATE_KEY` | Private | ✅ Yes | Firebase admin private key | `-----BEGIN PRIVATE KEY-----\n...` |
| `FIREBASE_ADMIN_CLIENT_EMAIL` | Private | ✅ Yes | Firebase admin client email | `firebase-adminsdk-xxx@...` |
| **AI Providers** |
| `AI_PROVIDER` | Private | ✅ Yes | AI provider: `openai` or `gemini` | `openai` |
| `EMBEDDING_PROVIDER` | Private | ✅ Yes | Embedding provider: `openai` or `gemini` | `openai` |
| `OPENAI_API_KEY` | Private | Conditional | OpenAI API key (if `AI_PROVIDER=openai`) | `sk-...` |
| `GEMINI_API_KEY` | Private | Conditional | Gemini API key (if `AI_PROVIDER=gemini`) | `...` |
| **Razorpay** |
| `RAZORPAY_KEY_ID` | Private | ⚠️ Optional | Razorpay key ID | `rzp_test_...` |
| `RAZORPAY_KEY_SECRET` | Private | ⚠️ Optional | Razorpay key secret | `...` |
| `RAZORPAY_WEBHOOK_SECRET` | Private | ⚠️ Optional | Razorpay webhook secret | `...` |
| **Pinecone** |
| `PINECONE_API_KEY` | Private | ⚠️ Optional | Pinecone API key | `...` |
| `PINECONE_ENVIRONMENT` | Private | ⚠️ Optional | Pinecone environment | `us-east-1` |
| `PINECONE_INDEX_NAME` | Private | ⚠️ Optional | Pinecone index name | `jyotiai-index` |
| **ZeptoMail** |
| `ZEPTO_API_KEY` | Private | ⚠️ Optional | ZeptoMail API key | `...` |
| `ZEPTO_DOMAIN` | Private | ⚠️ Optional | ZeptoMail domain | `jyoti.app` |
| `ZEPTO_FROM` | Private | ⚠️ Optional | ZeptoMail from address | `order@jyoti.app` |
| **Geocoding** |
| `GOOGLE_GEOCODING_API_KEY` | Private | ⚠️ Optional | Google Geocoding API key | `...` |
| `TIMEZONEDB_API_KEY` | Private | ⚠️ Optional | TimezoneDB API key | `...` |
| **Error Tracking** |
| `SENTRY_DSN` | Private | ⚠️ Optional | Sentry DSN (server) | `https://...` |
| `NEXT_PUBLIC_SENTRY_DSN` | Public | ⚠️ Optional | Sentry DSN (client) | `https://...` |
| **Analytics** |
| `NEXT_PUBLIC_MIXPANEL_TOKEN` | Public | ⚠️ Optional | Mixpanel token | `...` |
| **Application Config** |
| `NEXT_PUBLIC_BASE_URL` | Public | ✅ Yes | Base URL for callbacks | `https://your-domain.com` |
| `BETA_MODE` | Private | ⚠️ Optional | Enable beta features | `false` |
| `NEXT_PUBLIC_BETA_MODE` | Public | ⚠️ Optional | Enable beta features (client) | `false` |
| **Worker API** |
| `WORKER_API_KEY` | Private | ⚠️ Optional | Worker API key | `...` |
| **Cloudflare** |
| `CLOUDFLARE_ACCOUNT_ID` | Private | ⚠️ Optional | Cloudflare account ID | `...` |
| `CLOUDFLARE_API_TOKEN` | Private | ⚠️ Optional | Cloudflare API token | `...` |

**Legend:**
- ✅ Yes = Required for production
- ⚠️ Optional = Feature will work with fallbacks if not set
- Conditional = Required based on other variable values

## Local .env.local.merge Guide

### Step 1: Copy .env.example

```bash
cp .env.example .env.local
```

### Step 2: Fill in Required Variables

Edit `.env.local` and fill in all required variables (marked with ✅ Yes above).

### Step 3: Merge with Existing .env.local (if any)

If you already have a `.env.local` file, you can merge:

```bash
# Backup existing
cp .env.local .env.local.backup

# Merge with example (manual process)
# Copy missing variables from .env.example to .env.local
```

### Step 4: Validate

Run the development server to validate:

```bash
npm run dev
```

You should see warnings for missing optional variables, but no errors for required ones.

## Vercel Deployment Steps

### 1. Add Environment Variables in Vercel Dashboard

1. Go to your Vercel project → Settings → Environment Variables
2. Add each variable from the table above
3. Set environment: Production, Preview, Development (as needed)

### 2. Important Notes for Vercel

- **Private Keys**: Never commit private keys. Always use Vercel's environment variables.
- **NEXT_PUBLIC_***: These are exposed to the browser. Only use for safe, public values.
- **Multi-line Values**: For `FIREBASE_ADMIN_PRIVATE_KEY`, paste the entire key including `\n` characters.
- **Base URL**: Set `NEXT_PUBLIC_BASE_URL` to your production domain: `https://your-domain.com`

### 3. Firebase Admin Private Key Format

In Vercel, paste the private key exactly as it appears in the JSON file, including newlines:

```
-----BEGIN PRIVATE KEY-----
MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...
-----END PRIVATE KEY-----
```

Vercel will handle the newlines automatically.

## Validation

### Development Mode

- Missing optional variables: ⚠️ Warnings only
- Missing required variables: ⚠️ Warnings (app may not work correctly)
- Invalid format: ⚠️ Warnings

### Production Mode (Vercel)

- Missing required variables: ❌ Build fails
- Invalid format: ❌ Build fails
- Missing optional variables: ⚠️ Warnings (features disabled)

## Testing Environment Variables

### Check Validation

```bash
# Start dev server - will show warnings
npm run dev

# Build for production - will fail on missing required vars
npm run build
```

### Verify in Code

All environment variables are now accessed via `@/lib/env/env.mjs`:

```typescript
import { envVars } from '@/lib/env/env.mjs'

// Access validated variables
const apiKey = envVars.firebase.apiKey
const aiProvider = envVars.ai.provider
```

## Troubleshooting

### "Environment variable validation failed"

- Check that all required variables are set in Vercel
- Verify variable names match exactly (case-sensitive)
- Check for typos in variable values

### "Firebase Admin credentials not configured"

- Verify `FIREBASE_ADMIN_PRIVATE_KEY` includes the full key with newlines
- Check that `FIREBASE_ADMIN_PROJECT_ID` matches your Firebase project
- Ensure `FIREBASE_ADMIN_CLIENT_EMAIL` is the correct service account email

### "No AI provider configured"

- Set `AI_PROVIDER` to either `openai` or `gemini`
- Ensure the corresponding API key is set (`OPENAI_API_KEY` or `GEMINI_API_KEY`)

## Security Best Practices

1. ✅ Never commit `.env.local` to version control
2. ✅ Use Vercel's environment variables for production
3. ✅ Rotate API keys regularly
4. ✅ Use different keys for development and production
5. ✅ Limit access to environment variables in Vercel
6. ✅ Monitor for exposed keys in error logs

