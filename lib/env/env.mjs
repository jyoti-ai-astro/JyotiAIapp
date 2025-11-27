/**
 * Environment Variables Validation (Phase 31 - F46)
 * 
 * Strong Zod validation for all environment variables with:
 * - Development-mode fallback warnings
 * - Production-mode strict validation
 * - Type-safe environment variable access
 */

import { z } from 'zod';

// Determine environment
const isDevelopment = process.env.NODE_ENV === 'development';
const isProduction = process.env.NODE_ENV === 'production';
const isVercel = !!process.env.VERCEL;

/**
 * Environment variable schema with validation
 */
const envSchema = z.object({
  // Node Environment
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  
  // Firebase (Client - Public)
  NEXT_PUBLIC_FIREBASE_API_KEY: z.string().min(1, 'Firebase API key is required'),
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: z.string().min(1, 'Firebase auth domain is required'),
  NEXT_PUBLIC_FIREBASE_PROJECT_ID: z.string().min(1, 'Firebase project ID is required'),
  NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: z.string().min(1, 'Firebase storage bucket is required'),
  NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: z.string().min(1, 'Firebase messaging sender ID is required'),
  NEXT_PUBLIC_FIREBASE_APP_ID: z.string().min(1, 'Firebase app ID is required'),
  
  // Firebase Admin (Server-only)
  FIREBASE_ADMIN_PROJECT_ID: z.string().min(1, 'Firebase admin project ID is required'),
  FIREBASE_ADMIN_PRIVATE_KEY: z.string().min(1, 'Firebase admin private key is required'),
  FIREBASE_ADMIN_CLIENT_EMAIL: z.string().email('Firebase admin client email must be valid email'),
  
  // AI Providers
  AI_PROVIDER: z.enum(['openai', 'gemini']).default('openai'),
  EMBEDDING_PROVIDER: z.enum(['openai', 'gemini']).default('openai'),
  OPENAI_API_KEY: z.string().optional(),
  GEMINI_API_KEY: z.string().optional(),
  
  // Razorpay
  RAZORPAY_KEY_ID: z.string().optional(),
  RAZORPAY_KEY_SECRET: z.string().optional(),
  RAZORPAY_WEBHOOK_SECRET: z.string().optional(),
  
  // Pinecone
  PINECONE_API_KEY: z.string().optional(),
  PINECONE_ENVIRONMENT: z.string().default('us-east-1'),
  PINECONE_INDEX_NAME: z.string().default('jyotiai-index'),
  
  // ZeptoMail
  ZEPTO_API_KEY: z.string().optional(),
  ZEPTO_DOMAIN: z.string().default('jyoti.app'),
  ZEPTO_FROM: z.string().email().default('order@jyoti.app'),
  
  // Geocoding (Optional)
  GOOGLE_GEOCODING_API_KEY: z.string().optional(),
  TIMEZONEDB_API_KEY: z.string().optional(),
  
  // Error Tracking (Optional)
  SENTRY_DSN: z.string().url().optional(),
  NEXT_PUBLIC_SENTRY_DSN: z.string().url().optional(),
  
  // Analytics (Optional)
  NEXT_PUBLIC_MIXPANEL_TOKEN: z.string().optional(),
  
  // Application Config
  NEXT_PUBLIC_BASE_URL: z.string().url().default('http://localhost:3000'),
  BETA_MODE: z.string().transform((val) => val === 'true').default('false'),
  NEXT_PUBLIC_BETA_MODE: z.string().transform((val) => val === 'true').default('false'),
  
  // Worker API (Optional)
  WORKER_API_KEY: z.string().optional(),
  
  // Cloudflare (Optional)
  CLOUDFLARE_ACCOUNT_ID: z.string().optional(),
  CLOUDFLARE_API_TOKEN: z.string().optional(),
  
  // Vercel (Auto-set)
  VERCEL: z.string().optional(),
  VERCEL_ENV: z.enum(['development', 'preview', 'production']).optional(),
});

/**
 * Validate environment variables
 */
function validateEnv() {
  const parsed = envSchema.safeParse(process.env);
  
  if (!parsed.success) {
    const errors = parsed.error.errors;
    
    // Phase 31 - F46: Development mode - warnings only
    if (isDevelopment) {
      console.warn('⚠️  Environment variable validation warnings:');
      errors.forEach((error) => {
        console.warn(`  - ${error.path.join('.')}: ${error.message}`);
      });
      console.warn('⚠️  Some features may not work correctly. Please check your .env.local file.');
      return parsed.data || {};
    }
    
    // Phase 31 - F46: Production mode - strict validation
    if (isProduction || isVercel) {
      console.error('❌ Environment variable validation failed:');
      errors.forEach((error) => {
        console.error(`  - ${error.path.join('.')}: ${error.message}`);
      });
      throw new Error(
        `Invalid environment variables: ${errors.map(e => e.path.join('.')).join(', ')}`
      );
    }
  }
  
  return parsed.data;
}

/**
 * Get validated environment variables
 */
const env = validateEnv();

/**
 * Helper to get environment variable with fallback
 */
function getEnv(key: keyof typeof env, fallback?: string): string {
  const value = env[key];
  
  if (!value && fallback) {
    if (isDevelopment) {
      console.warn(`⚠️  ${key} not set, using fallback: ${fallback}`);
    }
    return fallback;
  }
  
  if (!value && isProduction) {
    throw new Error(`Required environment variable ${key} is missing in production`);
  }
  
  return value as string;
}

/**
 * Check if required variables are set
 */
function validateRequiredVars() {
  const required = [
    'NEXT_PUBLIC_FIREBASE_API_KEY',
    'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
    'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
    'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
    'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
    'NEXT_PUBLIC_FIREBASE_APP_ID',
    'FIREBASE_ADMIN_PROJECT_ID',
    'FIREBASE_ADMIN_PRIVATE_KEY',
    'FIREBASE_ADMIN_CLIENT_EMAIL',
  ];
  
  const missing: string[] = [];
  
  required.forEach((key) => {
    if (!env[key as keyof typeof env]) {
      missing.push(key);
    }
  });
  
  // Phase 31 - F46: Check AI provider
  if (env.AI_PROVIDER === 'openai' && !env.OPENAI_API_KEY) {
    missing.push('OPENAI_API_KEY (required when AI_PROVIDER=openai)');
  }
  
  if (env.AI_PROVIDER === 'gemini' && !env.GEMINI_API_KEY) {
    missing.push('GEMINI_API_KEY (required when AI_PROVIDER=gemini)');
  }
  
  if (missing.length > 0) {
    if (isDevelopment) {
      console.warn('⚠️  Missing required environment variables:');
      missing.forEach((key) => console.warn(`  - ${key}`));
      console.warn('⚠️  Some features may not work. Please check your .env.local file.');
    } else {
      throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
    }
  }
}

// Validate on module load
validateRequiredVars();

/**
 * Type-safe environment variable exports
 */
export const envVars = {
  // Node Environment
  nodeEnv: env.NODE_ENV,
  isDevelopment,
  isProduction,
  isVercel,
  
  // Firebase (Client)
  firebase: {
    apiKey: env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: env.NEXT_PUBLIC_FIREBASE_APP_ID,
  },
  
  // Firebase Admin
  firebaseAdmin: {
    projectId: env.FIREBASE_ADMIN_PROJECT_ID,
    privateKey: env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    clientEmail: env.FIREBASE_ADMIN_CLIENT_EMAIL,
  },
  
  // AI Providers
  ai: {
    provider: env.AI_PROVIDER,
    embeddingProvider: env.EMBEDDING_PROVIDER,
    openaiApiKey: env.OPENAI_API_KEY,
    geminiApiKey: env.GEMINI_API_KEY,
  },
  
  // Razorpay
  razorpay: {
    keyId: env.RAZORPAY_KEY_ID,
    keySecret: env.RAZORPAY_KEY_SECRET,
    webhookSecret: env.RAZORPAY_WEBHOOK_SECRET,
  },
  
  // Pinecone
  pinecone: {
    apiKey: env.PINECONE_API_KEY,
    environment: env.PINECONE_ENVIRONMENT,
    indexName: env.PINECONE_INDEX_NAME,
  },
  
  // ZeptoMail
  zepto: {
    apiKey: env.ZEPTO_API_KEY,
    domain: env.ZEPTO_DOMAIN,
    from: env.ZEPTO_FROM,
  },
  
  // Geocoding
  geocoding: {
    googleApiKey: env.GOOGLE_GEOCODING_API_KEY,
    timezoneDbKey: env.TIMEZONEDB_API_KEY,
  },
  
  // Error Tracking
  sentry: {
    dsn: env.SENTRY_DSN,
    publicDsn: env.NEXT_PUBLIC_SENTRY_DSN,
  },
  
  // Analytics
  analytics: {
    mixpanelToken: env.NEXT_PUBLIC_MIXPANEL_TOKEN,
  },
  
  // Application Config
  app: {
    baseUrl: env.NEXT_PUBLIC_BASE_URL,
    betaMode: env.BETA_MODE,
    publicBetaMode: env.NEXT_PUBLIC_BETA_MODE,
  },
  
  // Worker API
  worker: {
    apiKey: env.WORKER_API_KEY,
  },
  
  // Cloudflare
  cloudflare: {
    accountId: env.CLOUDFLARE_ACCOUNT_ID,
    apiToken: env.CLOUDFLARE_API_TOKEN,
  },
} as const;

// Export default for convenience
export default envVars;

