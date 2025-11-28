# Vercel Firebase Private Key Setup Guide

## Problem

Firebase Admin SDK requires the private key in PEM format with real line breaks. When setting environment variables in Vercel, the key is often stored with escaped `\n` sequences instead of actual newlines.

## Solution

Use **multiline format** in Vercel environment variables. Vercel supports multiline values.

## Step-by-Step Instructions

### 1. Get Your Current Key

If you have the key with escaped `\n` sequences, use the conversion script:

```bash
# Set the key temporarily
export FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...\n-----END PRIVATE KEY-----"

# Run the conversion script
node scripts/convert-firebase-key.mjs
```

This will show you the properly formatted multiline key.

### 2. Update Vercel Environment Variable

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Find or create `FIREBASE_ADMIN_PRIVATE_KEY`
4. **Paste the multiline key** (exactly as shown by the conversion script)
5. Make sure:
   - `-----BEGIN PRIVATE KEY-----` is on its own line
   - The key content is on separate lines
   - `-----END PRIVATE KEY-----` is on its own line
   - No escaped `\n` sequences

### 3. Example Format

The key should look like this in Vercel:

```
-----BEGIN PRIVATE KEY-----
MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...
(multiple lines of base64 encoded key content)
...
-----END PRIVATE KEY-----
```

**NOT like this:**
```
-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...\n-----END PRIVATE KEY-----
```

### 4. Verify the Setup

After updating, redeploy your application and check the logs:

```bash
# Check build logs
vercel logs --follow

# Or check in Vercel dashboard
# Settings → Deployments → [Latest Deployment] → Build Logs
```

Look for:
- ✅ No errors about "Invalid key format"
- ✅ Firebase Admin initializes successfully
- ✅ No warnings about "Firebase Admin credentials not configured"

### 5. Testing Locally

To test with the multiline format locally, create `.env.local`:

```bash
# .env.local
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----
MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...
-----END PRIVATE KEY-----"
```

Or use the single-line escaped format (works but not recommended):

```bash
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...\n-----END PRIVATE KEY-----"
```

## Troubleshooting

### Issue: "Invalid key format" error

**Solution:** Ensure the key has real line breaks, not escaped `\n` sequences.

### Issue: Key works locally but not in Vercel

**Solution:** 
1. Check that you pasted the multiline format in Vercel
2. Ensure no extra spaces or characters were added
3. Redeploy after updating the environment variable

### Issue: Key appears truncated in Vercel UI

**Solution:** 
- Vercel UI may truncate long values in the display
- The actual value stored is complete
- Check build logs to verify the key is being read correctly

### Issue: Build fails with "Firebase Admin credentials not configured"

**Solution:**
1. Verify all three environment variables are set:
   - `FIREBASE_ADMIN_PROJECT_ID`
   - `FIREBASE_ADMIN_PRIVATE_KEY`
   - `FIREBASE_ADMIN_CLIENT_EMAIL`
2. Ensure `FIREBASE_ADMIN_PRIVATE_KEY` is in multiline format
3. Redeploy after updating environment variables

## Code Reference

The Firebase Admin initialization in `lib/firebase/admin.ts` handles both formats:

```typescript
const { projectId, privateKey, clientEmail } = envVars.firebaseAdmin

// Firebase Admin SDK automatically handles:
// - Multiline PEM keys (preferred)
// - Single-line keys with \n (works but not ideal)
```

## Security Notes

⚠️ **Important:**
- Never commit private keys to git
- Use Vercel environment variables for production
- Rotate keys if accidentally exposed
- Use different service accounts for different environments

## Related Files

- `lib/firebase/admin.ts` - Firebase Admin initialization
- `lib/env/env.mjs` - Environment variable validation
- `scripts/convert-firebase-key.mjs` - Key format conversion tool

