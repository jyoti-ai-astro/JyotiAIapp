# Jyoti.ai Developer Handbook

## Table of Contents
1. [Project Overview](#project-overview)
2. [Architecture](#architecture)
3. [Development Setup](#development-setup)
4. [Code Structure](#code-structure)
5. [API Reference](#api-reference)
6. [Database Schema](#database-schema)
7. [Testing](#testing)
8. [Deployment](#deployment)
9. [Troubleshooting](#troubleshooting)

## Project Overview

Jyoti.ai is a comprehensive spiritual operating system that combines Vedic astrology, numerology, palmistry, aura reading, and AI-powered guidance.

### Tech Stack
- **Frontend**: Next.js 14 (App Router), React, TypeScript, TailwindCSS, ShadCN UI
- **Backend**: Next.js API Routes, Firebase Admin SDK
- **Database**: Firestore
- **Storage**: Firebase Storage
- **AI**: OpenAI/Gemini, Pinecone (RAG)
- **Payments**: Razorpay
- **Email**: ZeptoMail
- **Monitoring**: Sentry
- **Analytics**: Mixpanel/Clarity

## Architecture

### Frontend Architecture
- **Pages**: `/app` directory (App Router)
- **Components**: `/components` (reusable UI components)
- **State Management**: Zustand
- **Styling**: TailwindCSS with custom theme

### Backend Architecture
- **API Routes**: `/app/api` (Next.js API routes)
- **Engines**: `/lib/engines` (business logic)
- **Services**: `/lib/services` (external integrations)
- **Middleware**: `/lib/middleware` (auth, rate limiting)

### Database Architecture
- **Firestore Collections**:
  - `users/{uid}` - User profiles
  - `kundali/{uid}` - Kundali data
  - `reports/{uid}` - Generated reports
  - `notifications/{uid}` - User notifications
  - `guruChat/{uid}` - AI Guru chat history
  - `scans/{uid}` - Palmistry/aura scans

## Development Setup

### Prerequisites
- Node.js 18+
- npm or yarn
- Firebase CLI
- Git

### Installation
```bash
# Clone repository
git clone <repository-url>
cd JyotiAIapp

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your credentials

# Run development server
npm run dev
```

### Environment Variables
```env
# Firebase
FIREBASE_PROJECT_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY=

# AI Providers
OPENAI_API_KEY=
GEMINI_API_KEY=
AI_PROVIDER=openai|gemini

# Pinecone
PINECONE_API_KEY=
PINECONE_ENVIRONMENT=
PINECONE_INDEX_NAME=

# Razorpay
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=

# ZeptoMail
ZEPTOMAIL_API_KEY=
ZEPTOMAIL_BOUNCE_ADDRESS=

# Sentry
SENTRY_DSN=
NEXT_PUBLIC_SENTRY_DSN=

# Analytics
NEXT_PUBLIC_MIXPANEL_TOKEN=

# Beta Mode
BETA_MODE=false
```

## Code Structure

```
JyotiAIapp/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   ├── dashboard/         # Dashboard pages
│   ├── kundali/           # Kundali pages
│   └── ...
├── components/            # React components
├── lib/
│   ├── engines/          # Business logic engines
│   ├── services/         # External services
│   ├── middleware/       # Middleware
│   └── utils/            # Utilities
├── tests/                # Test files
├── scripts/              # Utility scripts
└── docs/                 # Documentation
```

## API Reference

### Authentication
- `POST /api/auth/magic-link` - Generate magic link
- `GET /api/auth/verify-magic-link` - Verify magic link

### Kundali
- `POST /api/kundali/generate-full` - Generate full kundali
- `GET /api/kundali/get` - Get kundali data

### AI Guru
- `POST /api/guru/chat` - Chat with AI Guru
- `GET /api/guru/history` - Get chat history

### Reports
- `POST /api/reports/generate` - Generate report
- `GET /api/reports/list` - List user reports

### Notifications
- `GET /api/notifications/list` - List notifications
- `POST /api/notifications/mark-read` - Mark as read

## Database Schema

### Users Collection
```typescript
users/{uid} {
  name: string
  email: string
  photo?: string
  rashi?: string
  nakshatra?: string
  lagna?: string
  numerology?: {
    lifePathNumber: number
    destinyNumber: number
  }
  onboardingComplete: boolean
  createdAt: Timestamp
  updatedAt: Timestamp
}
```

### Kundali Collection
```typescript
kundali/{uid} {
  meta: {
    birthDate: Timestamp
    birthTime: string
    birthPlace: string
    coordinates: { lat, lng }
    timezone: string
  }
  D1: {
    grahas: Record<string, GrahaData>
    bhavas: Record<string, BhavaData>
    lagna: LagnaData
  }
  dasha: {
    currentMahadasha: DashaPeriod
    currentAntardasha: DashaPeriod
  }
}
```

## Testing

### Run Tests
```bash
# E2E tests
npm run test:e2e

# Performance tests
npm run test:performance

# Unit tests
npm run test
```

## Deployment

### Production Build
```bash
npm run build
npm start
```

### Environment Setup
1. Set up Firebase project
2. Configure environment variables
3. Deploy to Vercel/Cloudflare
4. Set up cron jobs for background workers

## Troubleshooting

### Common Issues

1. **Firestore Connection Error**
   - Check Firebase credentials in `.env.local`
   - Verify Firebase project ID

2. **AI API Errors**
   - Verify API keys are set
   - Check rate limits

3. **Rate Limiting**
   - Check rate limit configuration
   - Verify user identification

### Getting Help
- Check logs in Firestore `logs` collection
- Review Sentry for error tracking
- Contact development team

