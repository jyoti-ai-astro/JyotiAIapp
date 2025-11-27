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
- **LLM**: OpenAI GPT-5.1 / Google Gemini
- **RAG**: Pinecone Vector Database
- **Vision**: OpenAI Vision / Gemini Vision
- **Astrology**: Swiss Ephemeris

### Payments
- **Provider**: Razorpay
- **Models**: One-time payments + Subscriptions

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

### 6. AI Guru
- RAG-powered responses
- Contextual memory
- Multi-source reasoning
- Spiritual guidance

## 💳 Payments

The app uses Razorpay for:
- One-time report purchases (₹99 - ₹899)
- Subscription plans (₹299/month, ₹2,499/year, ₹6,999/lifetime)

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

