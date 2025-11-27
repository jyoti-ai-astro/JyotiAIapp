# Firebase Admin Setup Guide

## How to Get Firebase Admin Credentials

### Step 1: Go to Firebase Console
1. Visit [Firebase Console](https://console.firebase.google.com/)
2. Select your project (or create a new one)

### Step 2: Generate Service Account Key
1. Click on the **⚙️ Settings** icon (top left)
2. Select **Project Settings**
3. Go to the **Service Accounts** tab
4. Click **Generate New Private Key**
5. A JSON file will be downloaded (e.g., `your-project-firebase-adminsdk-xxxxx.json`)

### Step 3: Extract the Required Values

Open the downloaded JSON file. You'll see something like:

```json
{
  "type": "service_account",
  "project_id": "your-project-id",
  "private_key_id": "...",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com",
  ...
}
```

### Step 4: Set Environment Variables in Vercel

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add the following three variables:

#### `FIREBASE_ADMIN_PROJECT_ID`
- **Value**: Copy the `project_id` from the JSON file
- **Example**: `your-project-id`

#### `FIREBASE_ADMIN_CLIENT_EMAIL`
- **Value**: Copy the `client_email` from the JSON file
- **Example**: `firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com`

#### `FIREBASE_ADMIN_PRIVATE_KEY`
- **Value**: Copy the entire `private_key` value from the JSON file
- **Important**: 
  - Include the `-----BEGIN PRIVATE KEY-----` and `-----END PRIVATE KEY-----` lines
  - Keep the `\n` characters (they represent newlines)
  - The value should look like: `-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...\n-----END PRIVATE KEY-----\n`

### Step 5: Redeploy

After adding the environment variables:
1. Go to **Deployments** tab in Vercel
2. Click **Redeploy** on the latest deployment
3. Or push a new commit to trigger a new deployment

## Important Notes

⚠️ **Security**: Never commit the service account JSON file to your repository!

⚠️ **Private Key Format**: When pasting the private key in Vercel, make sure to:
- Keep all the `\n` characters (they will be converted to actual newlines)
- Include the BEGIN and END lines
- Don't add extra spaces or line breaks

## Verification

After setting up, you should see:
- ✅ No more "Firebase Admin credentials not configured" warnings
- ✅ Admin features working (user management, reports, etc.)

## Troubleshooting

If you still see errors:
1. **Check the private key format**: Make sure `\n` characters are preserved
2. **Verify the project ID**: Should match your Firebase project ID
3. **Check the client email**: Should end with `@your-project.iam.gserviceaccount.com`
4. **Redeploy**: Environment variables only take effect after redeployment

