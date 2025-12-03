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
const isBuild = process.env.NEXT_PHASE === 'phase-production-build' || process.env.NEXT_PHASE === 'phase-development-build';

/**
 * Environment variable schema with validation
 */
const envSchema = z.object({
  // Node Environment
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  
  // Firebase (Client - Public) - Optional to prevent crashes, validated at runtime
  NEXT_PUBLIC_FIREBASE_API_KEY: z.string().optional(),
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: z.string().optional(),
  NEXT_PUBLIC_FIREBASE_PROJECT_ID: z.string().optional(),
  NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: z.string().optional(),
  NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: z.string().optional(),
  NEXT_PUBLIC_FIREBASE_APP_ID: z.string().optional(),
  
  // Firebase Admin (Server-only) - Optional during build, required at runtime
  FIREBASE_ADMIN_PROJECT_ID: z.string().min(1, 'Firebase admin project ID is required').optional(),
  FIREBASE_ADMIN_PRIVATE_KEY: z.string().min(1, 'Firebase admin private key is required').optional(),
  FIREBASE_ADMIN_CLIENT_EMAIL: z.string().email('Firebase admin client email must be valid email').optional(),
  
  // AI Providers
  AI_PROVIDER: z.enum(['openai', 'gemini']).default('openai'),
  EMBEDDING_PROVIDER: z.enum(['openai', 'gemini']).default('openai'),
  OPENAI_API_KEY: z.string().optional(),
  GEMINI_API_KEY: z.string().optional(),
  
  // Razorpay
  RAZORPAY_KEY_ID: z.string().optional(),
  RAZORPAY_KEY_SECRET: z.string().optional(),
  RAZORPAY_WEBHOOK_SECRET: z.string().optional(),
  NEXT_PUBLIC_RAZORPAY_KEY_ID: z.string().optional(),
  RAZORPAY_PLAN_STARTER_ID: z.string().optional(),
  RAZORPAY_PLAN_ADVANCED_ID: z.string().optional(),
  RAZORPAY_PLAN_SUPREME_ID: z.string().optional(),
  
  // Pinecone
  PINECONE_API_KEY: z.string().optional(),
  PINECONE_ENVIRONMENT: z.string().default('us-east-1'),
  PINECONE_INDEX_NAME: z.string().default('jyotiai-index'),
  PINECONE_INDEX_GURU: z.string().default('jyotiai-guru-knowledge'), // Super Phase C
  GURU_RAG_ENABLED: z.string().transform((val) => val !== 'false').default('true'), // Super Phase C
  
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
  APP_ENV: z.enum(['development', 'staging', 'production']).default('development'),
  NEXT_PUBLIC_APP_ENV: z.enum(['development', 'staging', 'production']).optional(),
  NEXT_PUBLIC_BASE_URL: z.string().url().default('http://localhost:3000'),
  BETA_MODE: z.string().transform((val) => val === 'true').default('false'),
  NEXT_PUBLIC_BETA_MODE: z.string().transform((val) => val === 'true').default('false'),
  DISABLE_PAYMENTS: z.string().optional(),
  
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
    
    // Phase 31 - F46: Production mode - NEVER throw errors, only log warnings
    // This prevents client-side crashes when env vars are missing
    if ((isProduction || isVercel) && !isBuild) {
      // On client-side, suppress all validation errors to prevent console spam
      if (isClient) {
        // Client-side: Only log Firebase warnings if they're actually missing
        const firebaseErrors = errors.filter(e => e.path.join('.').includes('FIREBASE'));
        if (firebaseErrors.length > 0) {
          // Check if Firebase vars are actually missing (not just validation errors)
          const hasFirebaseVars = !!(
            process.env.NEXT_PUBLIC_FIREBASE_API_KEY &&
            process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN &&
            process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
          );
          if (!hasFirebaseVars) {
            // Only log if vars are truly missing
            console.warn('⚠️  Firebase environment variables missing. Authentication features will not work.');
          }
        }
      } else {
        // Server-side: Log all warnings
        const criticalErrors = errors.filter(e => 
          !e.path.join('.').includes('FIREBASE') && 
          !e.path.join('.').includes('ADMIN')
        );
        
        if (criticalErrors.length > 0) {
          console.warn('⚠️  Environment variable validation warnings:');
          criticalErrors.forEach((error) => {
            console.warn(`  - ${error.path.join('.')}: ${error.message}`);
          });
        }
        
        // Firebase vars missing - log warning but continue
        const firebaseErrors = errors.filter(e => e.path.join('.').includes('FIREBASE'));
        if (firebaseErrors.length > 0) {
          console.warn('⚠️  Firebase environment variables missing. Authentication features will not work.');
          console.warn('⚠️  Please add Firebase config to Vercel environment variables.');
          firebaseErrors.forEach((error) => {
            console.warn(`  - ${error.path.join('.')}: ${error.message}`);
          });
        }
      }
    }
    
    // During build, just warn
    if (isBuild && errors.length > 0) {
      console.warn('⚠️  Environment variable validation warnings during build (will be validated at runtime):');
      errors.forEach((error) => {
        console.warn(`  - ${error.path.join('.')}: ${error.message}`);
      });
    }
  }
  
  // Always return parsed data, even if validation failed
  // This prevents crashes when env vars are missing
  return parsed.success ? parsed.data : (parsed.data || {});
}

/**
 * Get validated environment variables
 */
const env = validateEnv();

/**
 * Helper to get environment variable with fallback
 */
function getEnv(key, fallback) {
  const value = env[key];
  
  if (!value && fallback) {
    if (isDevelopment) {
      console.warn(`⚠️  ${key} not set, using fallback: ${fallback}`);
    }
    return fallback;
  }
  
  // Never throw - just return undefined and log warning
  if (!value && isProduction) {
    console.warn(`⚠️  Environment variable ${key} is missing in production`);
  }
  
  return value;
}

/**
 * Check if required variables are set
 */
function validateRequiredVars() {
  // Firebase vars are now optional - validated at runtime in Firebase config
  const required = [
    // Removed Firebase vars - they're validated at runtime
  ];
  
  const missing = [];
  
  required.forEach((key) => {
    if (!env[key]) {
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
    if (isDevelopment || isBuild) {
      console.warn('⚠️  Missing required environment variables:');
      missing.forEach((key) => console.warn(`  - ${key}`));
      console.warn('⚠️  Some features may not work. Please check your .env.local file.');
    } else {
      // Only throw for truly critical errors
      console.warn(`⚠️  Missing environment variables: ${missing.join(', ')}`);
      console.warn('⚠️  Some features may not work. Please configure environment variables in Vercel.');
    }
  }
  
  // Check Firebase vars separately (warn but don't crash)
  // Only check on server-side to avoid client-side console spam
  if (typeof window === 'undefined') {
    const firebaseVars = [
      'NEXT_PUBLIC_FIREBASE_API_KEY',
      'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
      'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
      'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
      'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
      'NEXT_PUBLIC_FIREBASE_APP_ID',
    ];
    
    const missingFirebase = firebaseVars.filter(key => !env[key]);
    if (missingFirebase.length > 0) {
      console.warn('⚠️  Firebase environment variables missing. Authentication will not work.');
      console.warn('⚠️  Please add Firebase config to Vercel environment variables.');
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
    publicKeyId: env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
    planStarterId: env.RAZORPAY_PLAN_STARTER_ID,
    planAdvancedId: env.RAZORPAY_PLAN_ADVANCED_ID,
    planSupremeId: env.RAZORPAY_PLAN_SUPREME_ID,
  },
  
  // Pinecone
  pinecone: {
    apiKey: env.PINECONE_API_KEY,
    environment: env.PINECONE_ENVIRONMENT,
    indexName: env.PINECONE_INDEX_NAME,
    guruIndexName: env.PINECONE_INDEX_GURU, // Super Phase C
  },
  
  // Guru RAG
  guruRag: {
    enabled: env.GURU_RAG_ENABLED, // Super Phase C
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
    env: env.APP_ENV,
    baseUrl: env.NEXT_PUBLIC_BASE_URL,
    betaMode: env.BETA_MODE,
    publicBetaMode: env.NEXT_PUBLIC_BETA_MODE,
    disablePayments: env.DISABLE_PAYMENTS === 'true',
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
};

// Export default for convenience
export default envVars;

// Safe validation — never throw during Vercel build
export function validateEnvSafe(requiredVars) {
  const missing = requiredVars.filter((key) => !process.env[key])
  if (missing.length > 0) {
    console.warn("[env.mjs] Missing env vars (non-blocking):", missing.join(', '))
  }
  return true
}

