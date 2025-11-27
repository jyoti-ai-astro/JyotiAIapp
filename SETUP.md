# Jyoti.ai Setup Guide

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Variables

Copy `.env.local.example` to `.env.local` and fill in all required values:

```bash
cp .env.local.example .env.local
```

**Required Environment Variables:**

#### Firebase
- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`
- `FIREBASE_ADMIN_PROJECT_ID`
- `FIREBASE_ADMIN_PRIVATE_KEY`
- `FIREBASE_ADMIN_CLIENT_EMAIL`

#### AI Providers
- `OPENAI_API_KEY` (for GPT-5.1)
- `GEMINI_API_KEY` (for Gemini)

#### Razorpay
- `RAZORPAY_KEY_ID`
- `RAZORPAY_KEY_SECRET`
- `RAZORPAY_WEBHOOK_SECRET`

#### Pinecone (RAG)
- `PINECONE_API_KEY`
- `PINECONE_INDEX_NAME`
- `PINECONE_ENVIRONMENT`

#### Cloudflare (Optional)
- `CLOUDFLARE_ACCOUNT_ID`
- `CLOUDFLARE_API_TOKEN`

### 3. Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project: `jyoti-ai`
3. Enable Authentication:
   - Google Sign-in
   - Facebook Sign-in
   - Email Link (Passwordless)
4. Create Firestore Database
5. Create Storage Bucket
6. Get your Firebase config and add to `.env.local`

### 4. Firebase Admin Setup

1. In Firebase Console → Project Settings → Service Accounts
2. Generate new private key
3. Download JSON file
4. Extract values to `.env.local`:
   - `FIREBASE_ADMIN_PROJECT_ID`
   - `FIREBASE_ADMIN_PRIVATE_KEY` (from `private_key` field)
   - `FIREBASE_ADMIN_CLIENT_EMAIL` (from `client_email` field)

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
/
├── app/                    # Next.js App Router
│   ├── api/               # API Routes
│   │   ├── auth/          # Authentication
│   │   ├── kundali/       # Kundali Engine
│   │   ├── palmistry/     # Palmistry Engine
│   │   ├── numerology/    # Numerology Engine
│   │   └── guru/          # AI Guru
│   ├── login/             # Login page
│   ├── dashboard/         # Main dashboard
│   └── onboarding/        # Onboarding flow
├── components/            # React Components
│   └── ui/               # ShadCN UI components
├── lib/                  # Libraries
│   ├── firebase/         # Firebase config
│   ├── engines/          # Spiritual engines
│   │   ├── kundali/      # Kundali generator
│   │   ├── palmistry/    # Palmistry analyzer
│   │   └── numerology/   # Numerology calculator
│   └── ai/               # AI integration
│       └── guru/         # AI Guru engine
├── store/                # Zustand stores
├── types/                # TypeScript types
└── config/              # Configuration
```

## 🔧 Next Steps

### Phase 1: Core Setup ✅
- [x] Project initialization
- [x] Folder structure
- [x] Basic authentication
- [x] Engine structures

### Phase 2: Integration
- [ ] Swiss Ephemeris integration
- [ ] OpenAI/Gemini API integration
- [ ] Pinecone RAG setup
- [ ] Firebase Firestore rules
- [ ] Image upload to Firebase Storage

### Phase 3: Features
- [ ] Onboarding flow
- [ ] Dashboard
- [ ] Palm/Face/Aura scanning
- [ ] AI Guru chat
- [ ] Reports generation
- [ ] Payment integration

### Phase 4: Polish
- [ ] Notifications
- [ ] Admin panel
- [ ] Testing
- [ ] Deployment

## 🐛 Troubleshooting

### Firebase Admin Not Working
- Ensure `FIREBASE_ADMIN_PRIVATE_KEY` has `\n` properly escaped
- Check that service account has proper permissions

### API Routes Not Found
- Ensure you're using Next.js 14+ with App Router
- Check that route files are in `app/api/` directory

### TypeScript Errors
- Run `npm run type-check` to see all errors
- Ensure all dependencies are installed

## 📚 Documentation

See `README.md` for full documentation and Build Bible for detailed specifications.

