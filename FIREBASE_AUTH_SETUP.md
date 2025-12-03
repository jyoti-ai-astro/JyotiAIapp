# Firebase Authentication Setup Guide

## ⚠️ Current Issue
Google, Facebook, and Magic Link authentication are not working because Firebase environment variables are missing in production.

## ✅ Required Steps

### 1. Add Firebase Client Environment Variables to Vercel

Go to **Vercel Dashboard → Your Project → Settings → Environment Variables** and add:

```
NEXT_PUBLIC_FIREBASE_API_KEY=YOUR_FIREBASE_API_KEY_HERE
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
```

### 2. Add Firebase Admin Environment Variables to Vercel

You need to get these from Firebase Console:

1. Go to **Firebase Console → Project Settings → Service Accounts**
2. Click **Generate New Private Key**
3. Download the JSON file
4. Extract these values:
   - `project_id` → `FIREBASE_ADMIN_PROJECT_ID`
   - `private_key` → `FIREBASE_ADMIN_PRIVATE_KEY` (keep the `\n` characters)
   - `client_email` → `FIREBASE_ADMIN_CLIENT_EMAIL`

Add to Vercel:
```
FIREBASE_ADMIN_PROJECT_ID=jyotai-v2-prod
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_ADMIN_CLIENT_EMAIL=firebase-adminsdk-xxxxx@jyotai-v2-prod.iam.gserviceaccount.com
```

### 3. Configure Authorized Domains in Firebase

1. Go to **Firebase Console → Authentication → Settings → Authorized domains**
2. Add your production domain:
   - `jyoti.app`
   - `www.jyoti.app`
   - `*.vercel.app` (for preview deployments)

### 4. Configure OAuth Redirect URIs

#### For Google:
1. Go to **Firebase Console → Authentication → Sign-in method → Google**
2. Ensure **Web SDK configuration** shows your domain
3. In **Google Cloud Console** (if using custom OAuth):
   - Add authorized redirect URIs:
     - `https://jyoti.app`
     - `https://www.jyoti.app`
     - `https://jyoti.app/__/auth/handler`

#### For Facebook:
1. Go to **Firebase Console → Authentication → Sign-in method → Facebook**
2. Ensure **App ID** and **App Secret** are configured
3. In **Facebook Developer Console**:
   - Add **Valid OAuth Redirect URIs**:
     - `https://jyoti.app/__/auth/handler`
     - `https://www.jyoti.app/__/auth/handler`

### 5. Configure Email Action URLs (for Magic Link)

1. Go to **Firebase Console → Authentication → Templates**
2. Click **Email address verification** or **Password reset**
3. Set **Action URL** to: `https://jyoti.app/auth/callback`
4. Ensure **Email link (passwordless sign-in)** is enabled

### 6. Redeploy After Adding Variables

After adding all environment variables:
1. Go to **Vercel Dashboard → Your Project → Deployments**
2. Click **Redeploy** on the latest deployment
3. Or push a new commit to trigger automatic deployment

## 🔍 Troubleshooting

### Google/Facebook Login Not Working

**Error: "Popup was blocked"**
- Allow popups for your domain in browser settings
- Try again

**Error: "Unauthorized domain"**
- Check Firebase Console → Authentication → Settings → Authorized domains
- Ensure your domain is listed

**Error: "Operation not allowed"**
- Check Firebase Console → Authentication → Sign-in method
- Ensure Google/Facebook is **Enabled**

### Magic Link Not Working

**Error: "Failed to send email"**
- Check if `ZEPTO_API_KEY` is set in Vercel
- Check if `ZEPTO_DOMAIN` is set correctly
- Check Firebase Admin credentials are correct

**Error: "Firebase Admin not initialized"**
- Ensure `FIREBASE_ADMIN_PROJECT_ID`, `FIREBASE_ADMIN_PRIVATE_KEY`, and `FIREBASE_ADMIN_CLIENT_EMAIL` are set in Vercel
- Check the private key format (must include `\n` characters)

## ✅ Verification

After setup, test:
1. **Google Login**: Click "Continue with Google" → Should open popup → Should redirect to dashboard
2. **Facebook Login**: Click "Continue with Facebook" → Should open popup → Should redirect to dashboard
3. **Magic Link**: Enter email → Click "Send Magic Link" → Check email → Click link → Should redirect to dashboard

---

**Status**: Code fixed ✅ | Action required: Configure Firebase in Vercel ⚠️

