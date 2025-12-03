# Vercel Environment Variables Setup Guide

## 🔴 CRITICAL: Missing Firebase Environment Variables

The production site (https://www.jyoti.app) is currently missing Firebase environment variables, which prevents authentication from working.

## Required Environment Variables for Vercel

### Firebase Client Configuration (Required for Authentication)

Add these to your Vercel project settings → Environment Variables:

1. **NEXT_PUBLIC_FIREBASE_API_KEY**
   - Get from: Firebase Console → Project Settings → General → Your apps → Web app config
   - Example: `AIzaSyCmbL0t3IJaR1QqeSw7Z9pLWyIiSy6Zxys`

2. **NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN**
   - Get from: Firebase Console → Project Settings → General
   - Example: `jyoti-app.firebaseapp.com`

3. **NEXT_PUBLIC_FIREBASE_PROJECT_ID**
   - Get from: Firebase Console → Project Settings → General
   - Example: `jyoti-app`

4. **NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET**
   - Get from: Firebase Console → Project Settings → General
   - Example: `jyoti-app.appspot.com`

5. **NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID**
   - Get from: Firebase Console → Project Settings → Cloud Messaging
   - Example: `123456789012`

6. **NEXT_PUBLIC_FIREBASE_APP_ID**
   - Get from: Firebase Console → Project Settings → General → Your apps → Web app config
   - Example: `1:123456789012:web:abcdef123456`

### Firebase Admin Configuration (Required for Backend)

7. **FIREBASE_ADMIN_PROJECT_ID**
   - Same as NEXT_PUBLIC_FIREBASE_PROJECT_ID
   - Example: `jyoti-app`

8. **FIREBASE_ADMIN_PRIVATE_KEY**
   - Get from: Firebase Console → Project Settings → Service Accounts → Generate New Private Key
   - Format: Full JSON key (with newlines as `\n`)

9. **FIREBASE_ADMIN_CLIENT_EMAIL**
   - Get from: Firebase Console → Project Settings → Service Accounts
   - Example: `firebase-adminsdk-xxxxx@jyoti-app.iam.gserviceaccount.com`

## How to Add to Vercel

1. Go to https://vercel.com/dashboard
2. Select your project: `JyotiAIapp`
3. Go to **Settings** → **Environment Variables**
4. For each variable above:
   - Click **Add New**
   - Enter the variable name
   - Enter the value
   - Select **Production**, **Preview**, and **Development** (or just Production)
   - Click **Save**
5. **Redeploy** your application after adding all variables

## After Adding Variables

1. The app will automatically detect the new variables
2. Authentication will start working
3. No code changes needed - the app is already configured to use these variables

## Current Status

✅ **Code Fixed**: App no longer crashes when Firebase vars are missing
⚠️ **Action Required**: Add Firebase environment variables to Vercel
✅ **Images Fixed**: Removed missing hero images (404 errors resolved)

## Verification

After adding variables and redeploying:
- Visit https://www.jyoti.app/login
- Should see no console errors about Firebase
- Authentication buttons should work

---

**Note**: The app is now configured to gracefully handle missing Firebase vars (shows warnings instead of crashing), but authentication will not work until these variables are added to Vercel.

