# Update FIREBASE_ADMIN_PRIVATE_KEY in Vercel

## Project Information
- **Project Name**: `jyoti-a-iapp`
- **Project ID**: `prj_Z9rAOfz407As5DhkVNpbjPIkvcOc`
- **Team ID**: `team_LQShsuS7Hui7xtiYungJvcom`
- **Team**: Jyoti AI's projects

## Step 1: Access Vercel Dashboard

1. Go to: https://vercel.com/jyoti-ais-projects/jyoti-a-iapp/settings/environment-variables
2. Or navigate: Vercel Dashboard → Jyoti AI's projects → jyoti-a-iapp → Settings → Environment Variables

## Step 2: Inspect Current Key Value

1. Find `FIREBASE_ADMIN_PRIVATE_KEY` in the environment variables list
2. Click on it to view the value
3. **Check if it contains literal `\n` sequences** (escaped newlines)

### Current Format (if escaped):
```
-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...\n-----END PRIVATE KEY-----\n
```

### Desired Format (multiline):
```
-----BEGIN PRIVATE KEY-----
MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...
(multiple lines of base64)
...
-----END PRIVATE KEY-----
```

## Step 3: Convert the Key (if needed)

If the key contains `\n` sequences, convert it:

### Option A: Use the Conversion Script
```bash
# Set the key temporarily
export FIREBASE_ADMIN_PRIVATE_KEY="your-current-key-value"

# Run conversion script
node scripts/convert-firebase-key.mjs
```

The script will output the properly formatted multiline key.

### Option B: Manual Conversion
1. Copy the current key value from Vercel
2. Replace all `\n` with actual line breaks
3. Ensure `-----BEGIN PRIVATE KEY-----` is on its own line
4. Ensure `-----END PRIVATE KEY-----` is on its own line

## Step 4: Update in Vercel Dashboard

1. Click **Edit** on `FIREBASE_ADMIN_PRIVATE_KEY`
2. **Delete the old value** (the one with `\n`)
3. **Paste the multiline format** from Step 3
4. Make sure:
   - BEGIN marker is on its own line
   - Key content is on separate lines
   - END marker is on its own line
   - No escaped `\n` sequences
5. Select environments: **Production**, **Preview**, **Development** (as needed)
6. Click **Save**

## Step 5: Verify the Update

1. After saving, click on the variable again
2. Verify it shows as multiline (not a single line with `\n`)
3. The Vercel UI should display it with line breaks

## Step 6: Trigger Redeploy

### Option A: Via Dashboard
1. Go to **Deployments** tab
2. Click **⋯** (three dots) on the latest deployment
3. Click **Redeploy**
4. Select the same environment (Production/Preview)
5. Click **Redeploy**

### Option B: Via CLI
```bash
# If you have Vercel CLI authenticated
npx vercel --prod
```

### Option C: Via Git Push
```bash
# Make a small change and push
git commit --allow-empty -m "chore: Trigger redeploy after Firebase key update"
git push origin main
```

## Step 7: Verify Deployment

1. Wait for deployment to complete
2. Check build logs for Firebase Admin initialization
3. Look for:
   - ✅ No errors about "Invalid key format"
   - ✅ Firebase Admin initializes successfully
   - ✅ No warnings about "Firebase Admin credentials not configured"

## Troubleshooting

### Issue: Key still shows as single line in Vercel
**Solution**: Vercel UI may display it as single line, but the actual stored value should be multiline. Check build logs to verify.

### Issue: Build fails with "Invalid key format"
**Solution**: 
1. Double-check the multiline format
2. Ensure no extra spaces or characters
3. Make sure BEGIN/END markers are on separate lines

### Issue: Key works locally but not in Vercel
**Solution**:
1. Verify you updated the correct environment (Production/Preview)
2. Ensure you saved the changes
3. Redeploy after updating

## Security Notes

⚠️ **Important**:
- Never commit private keys to git
- The key is stored securely in Vercel
- Only team members with access can view it
- Rotate keys if accidentally exposed

## Alternative: Using Vercel CLI

If you prefer CLI (requires authentication):

```bash
# 1. Login to Vercel
npx vercel login

# 2. Link project (if not already linked)
npx vercel link

# 3. Pull current env vars
npx vercel env pull .env.vercel

# 4. Check current key
cat .env.vercel | grep FIREBASE_ADMIN_PRIVATE_KEY

# 5. Convert the key
export FIREBASE_ADMIN_PRIVATE_KEY="$(cat .env.vercel | grep FIREBASE_ADMIN_PRIVATE_KEY | cut -d '=' -f2-)"
node scripts/convert-firebase-key.mjs

# 6. Update via CLI (interactive)
npx vercel env add FIREBASE_ADMIN_PRIVATE_KEY production
# Paste the multiline key when prompted

# 7. Redeploy
npx vercel --prod
```

## Quick Reference

- **Dashboard URL**: https://vercel.com/jyoti-ais-projects/jyoti-a-iapp/settings/environment-variables
- **Project ID**: `prj_Z9rAOfz407As5DhkVNpbjPIkvcOc`
- **Team**: Jyoti AI's projects
- **Conversion Script**: `scripts/convert-firebase-key.mjs`

