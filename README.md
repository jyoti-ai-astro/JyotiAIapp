# Jyoti.ai - Spiritual Operating System

A comprehensive AI-powered spiritual guidance platform combining ancient Indian sciences with modern technology.

## 🎯 Overview

Jyoti.ai is not just an astrology app—it's a complete Spiritual Operating System that merges:
- Vedic Astrology (Kundali Engine)
- Palmistry (AI Vision)
- Face Reading (AI Vision)
- Aura Analysis
- Numerology
- Vastu Shastra
- Chakra Analysis
- Dream Interpretation
- Business & Career Guidance
- Compatibility Matching
- Pregnancy & Baby Predictions
- AI Guru (RAG-powered spiritual assistant)

## 🏗️ Architecture

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + ShadCN UI
- **State Management**: Zustand
- **Animations**: Framer Motion

### Backend
- **API**: Next.js API Routes
- **Database**: Firebase Firestore
- **Storage**: Firebase Storage
- **Authentication**: Firebase Auth
- **Background Jobs**: Cloudflare Workers

### AI & ML
- **LLM**: OpenAI GPT-4 / Google Gemini
- **RAG**: Pinecone Vector Database (Super Phase C - Production-grade Global RAG Engine)
  - Mode-aware knowledge retrieval
  - Graceful degradation
  - Ingestion script for knowledge documents
- **Vision**: OpenAI Vision / Gemini Vision
- **Astrology**: Swiss Ephemeris

### Payments
- **Provider**: Razorpay
- **Models**: One-time payments + Subscriptions
- **One-Time Products**: ₹99 (Quick Readings), ₹199 (Deep Insights)
- **Ticket System**: AI questions, Kundali basic reports

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Firebase account
- OpenAI/Gemini API keys
- Razorpay account (for payments)
- Pinecone account (for RAG)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd JyotiAIapp
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.local.example .env.local
```

Fill in all required environment variables in `.env.local`.

4. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🎨 Design System

### Cosmic Gold Theme

Jyoti.ai uses a "Cosmic Gold" design system with consistent utility classes:

#### Base Classes
- **`.cosmic-page`** — Base page background with radial gradient overlays (purple, cyan, gold)
- **`.cosmic-section`** — Consistent section spacing (`py-16 md:py-24`)
- **`.cosmic-section-inner`** — Inner container with responsive padding

#### Components
- **`.glass-card`** — Glassmorphism card with backdrop blur, border, and shadow
- **`.gold-btn`** — Premium gold button with gradient background and hover lift effect
- **`.gold-btn-outline`** — Outline variant for secondary actions

#### Typography
- **`.cosmic-heading`** — Main headings (`text-3xl md:text-4xl lg:text-5xl`)
- **`.cosmic-subheading`** — Section labels with gold accent and uppercase tracking

#### Utilities
- **`.custom-scrollbar`** — Gradient scrollbar styling (gold to purple)

### Usage Example

```tsx
<div className="cosmic-page">
  <div className="cosmic-section">
    <div className="cosmic-section-inner">
      <p className="cosmic-subheading">Modules</p>
      <h1 className="cosmic-heading">Kundali Engine</h1>
      <div className="glass-card p-6">
        {/* Content */}
      </div>
      <button className="gold-btn">Download Report</button>
    </div>
  </div>
</div>
```

## 📁 Project Structure

```
/
├── app/                    # Next.js app router pages
│   ├── api/               # API routes
│   ├── (auth)/            # Auth pages
│   ├── dashboard/         # Main dashboard
│   ├── onboarding/        # User onboarding flow
│   └── ...
├── components/            # React components
│   ├── ui/               # ShadCN UI components
│   ├── charts/           # Chart components
│   ├── cards/            # Card components
│   └── ...
├── lib/                  # Utility libraries
│   ├── firebase/         # Firebase config
│   ├── ai/               # AI integration
│   ├── engines/          # Spiritual engines
│   ├── rag/              # RAG system
│   └── swiss/            # Swiss Ephemeris
├── store/                # Zustand stores
├── types/                # TypeScript types
└── config/               # Configuration files
```

## 🔐 Authentication

The app supports three login methods:
1. **Google OAuth** (Primary)
2. **Facebook OAuth** (Secondary)
3. **Email Magic Link** (Tertiary)

All authentication flows through Firebase Auth with secure session cookies.

## 📚 Core Modules

### 1. Kundali Engine
- Swiss Ephemeris integration
- Birth chart generation
- Dasha calculations
- Transit predictions
- Yogas identification

### 2. Palmistry Engine
- AI Vision analysis
- Line extraction (Life, Head, Heart, Fate)
- Mount analysis
- Trait scoring

### 3. Face Reading Engine
- Feature detection
- Symmetry analysis
- Personality indicators
- Fortune markers

### 4. Aura Reading Engine
- Color analysis
- Chakra mapping
- Energy scoring

### 5. Numerology Engine
- Life Path Number
- Expression Number
- Destiny Number
- Name analysis

### 6. AI Guru (Super Phase C - Enhanced)
- **Stability**: Comprehensive error handling, timeouts, graceful degradation
- **RAG Engine**: Production-grade Pinecone integration with mode-aware retrieval
- **Error Handling**: Clear error states (UNAUTHENTICATED, GURU_TIMEOUT, RAG_UNAVAILABLE, etc.)
- **RAG Indicators**: Knowledge Vault badges and sources panel in UI
- **Ingestion**: Script for ingesting knowledge documents (`scripts/guru-rag-ingest.ts`)

### 7. Prediction Engine V2 (Mega Build 2)
- **12-Month Predictions**: Structured predictions for career, love, money, health, spiritual
- **Astro Signals**: Planetary influence indicators with strength ratings
- **RAG Integration**: Light mode RAG support for knowledge enrichment
- **Safety Guidelines**: Prohibits exact death/medical/financial predictions
- **API**: `/api/predictions` endpoint with authentication and timeouts
- **UI**: Structured sections with opportunities, cautions, recommended actions

### 8. Timeline Engine V2 (Mega Build 2)
- **12-Month Timeline**: Month-by-month events with themes, intensity, focus areas
- **Astro Signals**: Per-month planetary influences
- **RAG Integration**: Light mode RAG support for timeline enrichment
- **Safety Guidelines**: Same safety guardrails as Prediction Engine
- **API**: `/api/timeline` endpoint with authentication and timeouts
- **UI**: Vertical timeline with "Ask Guru" CTAs per month

### 9. Report Engine + PDF Generator (Mega Build 3)
- **PDF Generation**: React-PDF based system with cosmic dark theme
- **Three Report Types**:
  - Full Kundali Report (birth chart analysis)
  - 12-Month Predictions Report (structured forecasts)
  - 12-Month Timeline Report (month-by-month journey)
- **API**: `/api/report/generate` with authentication and email support
- **Email Delivery**: Optional ZeptoMail integration for PDF attachments
- **Frontend**: Download buttons on `/kundali`, `/predictions`, `/timeline`, and `/reports` dashboard
- **Integration**: Uses AstroContext, PredictionEngineV2, TimelineEngineV2
- Contextual memory
- Multi-source reasoning
- Spiritual guidance

## 💳 Payments

The app uses Razorpay for:
- **One-time purchases**: ₹99 (Quick Readings), ₹199 (Deep Insights)
- **Subscription plans**: ₹499/month (Starter), ₹999/month (Advanced), ₹1,999/month (Supreme)

### One-Time Payment System

#### Products:
- **₹99 — Quick Readings**: 
  - Daily Horoscope (7 days)
  - Name Correction / Name Numerology
  - One AI Guru Question
  - Lucky Number & Color

- **₹199 — Deep Insights**:
  - Kundali Report (Basic)
  - Relationship Compatibility (Lite)
  - Career Reading (Lite)
  - 3 AI Guru Questions

#### Ticket System:
- `ai_questions`: Number of AI Guru questions available
- `kundali_basic`: Number of basic Kundali reports available

#### API Endpoints:
- `POST /api/pay/create-one-time-order` - Creates Razorpay order
- `POST /api/pay/success-one-time` - Verifies payment and grants tickets

#### Access Control:
Users can access features if they have:
- Active subscription, OR
- Valid tickets (tickets are decremented after use)

## 🔔 Notifications

14 notification types including:
- Daily horoscope
- Transit alerts
- Festival reminders
- Chakra balance
- Career opportunities
- Business periods

## 🧪 Testing

Run tests:
```bash
npm run test
```

## 📦 Deployment

The app is configured for deployment on:
- **Frontend**: Vercel
- **Background Jobs**: Cloudflare Workers
- **Database**: Firebase Firestore
- **Storage**: Firebase Storage

## 📖 Documentation

Full documentation is available in the Build Bible:
- Part A: Vision, Design, Architecture
- Part B: Development Setup, Implementation

## 🤝 Contributing

This is a private project. For contributions, please contact the maintainers.

## 📄 License

Proprietary - All rights reserved

## 🙏 Acknowledgments

Built with respect for ancient Indian spiritual sciences and modern AI technology.

