/**
 * API Endpoints Configuration
 * 
 * Phase 5 - API Health Check Tool
 * 
 * Central list of all API endpoints for health checking
 */

import type { FeatureKey } from '@/lib/payments/feature-access'

export interface ApiEndpoint {
  key: string
  method: 'GET' | 'POST' | 'PUT' | 'DELETE'
  path: string
  label: string
  category: 'auth' | 'guru' | 'kundali' | 'reports' | 'payments' | 'admin' | 'upload' | 'misc' | 'career' | 'business' | 'compatibility' | 'face' | 'palmistry' | 'aura' | 'calendar' | 'rituals' | 'planets' | 'pregnancy' | 'houses' | 'dasha' | 'charts' | 'predictions' | 'timeline'
  requiresAuth?: boolean
  sampleBody?: Record<string, any>
  expectedStatus?: number
  ticketGuarded?: boolean
  featureKey?: FeatureKey
}

/**
 * Core API Endpoints
 * Representative endpoints from each category for health checking
 */
export const API_ENDPOINTS: ApiEndpoint[] = [
  // Auth endpoints
  {
    key: 'auth-login',
    method: 'POST',
    path: '/api/auth/login',
    label: 'User Login',
    category: 'auth',
    requiresAuth: false,
    sampleBody: { idToken: 'test-token' },
    expectedStatus: 401, // Expected to fail without real token
  },
  {
    key: 'auth-verify',
    method: 'POST',
    path: '/api/auth/verify',
    label: 'Verify Session',
    category: 'auth',
    requiresAuth: false,
    sampleBody: { idToken: 'test-token' },
    expectedStatus: 401,
  },
  {
    key: 'auth-logout',
    method: 'POST',
    path: '/api/auth/logout',
    label: 'User Logout',
    category: 'auth',
    requiresAuth: false,
    expectedStatus: 200,
  },
  {
    key: 'auth-magic-link',
    method: 'POST',
    path: '/api/auth/magic-link',
    label: 'Magic Link',
    category: 'auth',
    requiresAuth: false,
    sampleBody: { email: 'test@example.com' },
    expectedStatus: 500, // Will fail if Firebase Admin not configured
  },
  
  // Guru endpoints
  {
    key: 'guru-main',
    method: 'POST',
    path: '/api/guru',
    label: 'Guru Chat (Main)',
    category: 'guru',
    requiresAuth: true,
    ticketGuarded: true,
    featureKey: 'ai_question', // Special case for Guru
    sampleBody: {
      messages: [{ role: 'user', content: 'Test question' }],
    },
    expectedStatus: 401, // Will fail without auth
  },
  {
    key: 'guru-chat-legacy',
    method: 'POST',
    path: '/api/guru-chat',
    label: 'Guru Chat (Legacy)',
    category: 'guru',
    requiresAuth: true,
    sampleBody: {
      message: 'Test',
    },
    expectedStatus: 401,
  },
  {
    key: 'rag-ingest',
    method: 'POST',
    path: '/api/rag/ingest',
    label: 'RAG Knowledge Ingestion',
    category: 'guru',
    requiresAuth: true,
    sampleBody: {
      title: 'Test',
      content: 'Test content',
      category: 'general',
    },
    expectedStatus: 401,
  },
  
  // Kundali endpoints
  {
    key: 'kundali-generate-full',
    method: 'POST',
    path: '/api/kundali/generate-full',
    label: 'Kundali — Full Generation',
    category: 'kundali',
    requiresAuth: true,
    ticketGuarded: true,
    featureKey: 'kundali',
    sampleBody: {},
    expectedStatus: 401,
  },
  {
    key: 'kundali-generate',
    method: 'POST',
    path: '/api/kundali/generate',
    label: 'Generate Kundali',
    category: 'kundali',
    requiresAuth: true,
    sampleBody: {
      dob: '1990-01-01',
      tob: '12:00',
      pob: 'Mumbai',
    },
    expectedStatus: 401,
  },
  {
    key: 'kundali-get',
    method: 'GET',
    path: '/api/kundali/get',
    label: 'Get Kundali',
    category: 'kundali',
    requiresAuth: true,
    expectedStatus: 401,
  },
  
  // Reports & Predictions
  {
    key: 'predictions',
    method: 'POST',
    path: '/api/predictions',
    label: 'Generate Predictions',
    category: 'reports',
    requiresAuth: true,
    ticketGuarded: true,
    featureKey: 'predictions',
    sampleBody: {},
    expectedStatus: 401,
  },
  {
    key: 'timeline',
    method: 'POST',
    path: '/api/timeline/generate',
    label: 'Generate Timeline',
    category: 'reports',
    requiresAuth: true,
    ticketGuarded: true,
    featureKey: 'timeline',
    sampleBody: {},
    expectedStatus: 401,
  },
  {
    key: 'reports-generate',
    method: 'POST',
    path: '/api/report/generate',
    label: 'Generate Report',
    category: 'reports',
    requiresAuth: true,
    sampleBody: {
      type: 'kundali',
      sendEmail: false,
    },
    expectedStatus: 401,
  },
  
  // Business endpoints
  {
    key: 'business-compatibility',
    method: 'POST',
    path: '/api/business/compatibility',
    label: 'Business — Compatibility',
    category: 'business',
    requiresAuth: true,
    ticketGuarded: true,
    featureKey: 'business',
    sampleBody: { businessName: 'Test Business', businessType: 'tech' },
    expectedStatus: 401,
  },
  
  // Compatibility endpoints
  {
    key: 'compatibility-analyze',
    method: 'POST',
    path: '/api/compatibility/analyze',
    label: 'Compatibility — Analyze',
    category: 'compatibility',
    requiresAuth: true,
    ticketGuarded: true,
    featureKey: 'compatibility',
    sampleBody: { person2Kundali: {} },
    expectedStatus: 401,
  },
  
  // Career endpoints
  {
    key: 'career-analyze',
    method: 'GET',
    path: '/api/career/analyze',
    label: 'Career — Analyze',
    category: 'career',
    requiresAuth: true,
    ticketGuarded: true,
    featureKey: 'career',
    expectedStatus: 401,
  },
  
  // Payment endpoints
  {
    key: 'pay-create-order',
    method: 'POST',
    path: '/api/pay/create-one-time-order',
    label: 'Create One-Time Order',
    category: 'payments',
    requiresAuth: true,
    sampleBody: { productId: '99' },
    expectedStatus: 401,
  },
  {
    key: 'payments-order',
    method: 'POST',
    path: '/api/payments/order',
    label: 'Create Subscription Order',
    category: 'payments',
    requiresAuth: true,
    sampleBody: { amount: 299, planName: 'premium' },
    expectedStatus: 401,
  },
  {
    key: 'payments-verify',
    method: 'POST',
    path: '/api/payments/verify',
    label: 'Verify Payment',
    category: 'payments',
    requiresAuth: true,
    sampleBody: {
      razorpay_order_id: 'test',
      razorpay_payment_id: 'test',
      razorpay_signature: 'test',
    },
    expectedStatus: 401,
  },
  {
    key: 'pay-success',
    method: 'POST',
    path: '/api/pay/success-one-time',
    label: 'One-Time Payment Success',
    category: 'payments',
    requiresAuth: true,
    sampleBody: {
      order_id: 'test',
      payment_id: 'test',
      signature: 'test',
      productId: '99',
    },
    expectedStatus: 401,
  },
  
  // Upload endpoints
  {
    key: 'upload-image',
    method: 'POST',
    path: '/api/upload/image',
    label: 'Upload Image',
    category: 'upload',
    requiresAuth: true,
    sampleBody: {},
    expectedStatus: 401,
  },
  {
    key: 'palmistry-upload',
    method: 'POST',
    path: '/api/palmistry/upload',
    label: 'Palmistry Upload',
    category: 'upload',
    requiresAuth: true,
    sampleBody: {},
    expectedStatus: 401,
  },
  {
    key: 'aura-upload',
    method: 'POST',
    path: '/api/aura/upload',
    label: 'Aura Upload',
    category: 'upload',
    requiresAuth: true,
    sampleBody: {},
    expectedStatus: 401,
  },
  
  // Admin endpoints
  {
    key: 'admin-login',
    method: 'POST',
    path: '/api/admin/login',
    label: 'Admin Login',
    category: 'admin',
    requiresAuth: false,
    sampleBody: { email: 'test@test.com', password: 'test' },
    expectedStatus: 401,
  },
  {
    key: 'admin-me',
    method: 'GET',
    path: '/api/admin/me',
    label: 'Get Admin User',
    category: 'admin',
    requiresAuth: true,
    expectedStatus: 401,
  },
  {
    key: 'admin-overview',
    method: 'GET',
    path: '/api/admin/overview',
    label: 'Admin Overview',
    category: 'admin',
    requiresAuth: true,
    expectedStatus: 401,
  },
  
  // Misc endpoints
  {
    key: 'astro-context',
    method: 'GET',
    path: '/api/astro/context',
    label: 'Astro Context',
    category: 'misc',
    requiresAuth: true,
    expectedStatus: 401,
  },
  {
    key: 'horoscope-today',
    method: 'GET',
    path: '/api/horoscope/today',
    label: 'Today Horoscope',
    category: 'misc',
    requiresAuth: true,
    expectedStatus: 401,
  },
]

/**
 * Get endpoints by category
 */
export function getEndpointsByCategory(category: ApiEndpoint['category']): ApiEndpoint[] {
  return API_ENDPOINTS.filter((ep) => ep.category === category)
}

/**
 * Get all categories
 */
export function getAllCategories(): ApiEndpoint['category'][] {
  return Array.from(new Set(API_ENDPOINTS.map((ep) => ep.category)))
}

