/**
 * Pricing Plans - Single Source of Truth
 * 
 * Pricing & Payments v2 - Subscriptions + One-Time Offers
 * 
 * All pricing plans and one-time products
 */

// ============================================
// TYPES
// ============================================

export type SubscriptionPlanId = 'starter' | 'advanced' | 'supreme'
export type OneTimeProductId = 'quick_99' | 'deep_199' | 'supreme_299'
export type ProductId = '99' | '199' | '299'

export interface SubscriptionPlan {
  id: SubscriptionPlanId
  name: string
  badge: string
  priceInINR: number
  priceLabel: string
  period: string
  description: string
  features: string[]
  ctaLabel: string
  ctaHref: string
  highlight: boolean
  subscriptionProductId: 'sub_499' | 'sub_999' | 'sub_1999'
  razorpayPlanEnvKey?: string
}

export interface OneTimeProduct {
  id: OneTimeProductId
  productId: ProductId
  amountInINR: number
  name: string
  label: string
  description: string
  bullets: string[]
  tickets: {
    aiQuestions?: number
    kundaliBasic?: number
    predictions?: number
  }
  mostPopular: boolean
}

// ============================================
// MONTHLY SUBSCRIPTION PLANS
// ============================================

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 'starter',
    name: 'Starter',
    badge: 'Best for trying JyotiAI',
    priceInINR: 499,
    priceLabel: '₹499',
    period: '/month',
    description: 'Perfect for exploring core Jyoti features',
    features: [
      'Basic Kundali Chart',
      'Daily Horoscope',
      'Basic Numerology',
      'AI Guru – up to 5 questions/day',
    ],
    ctaLabel: 'Get Started',
    ctaHref: '/login',
    highlight: false,
    subscriptionProductId: 'sub_499',
    razorpayPlanEnvKey: 'RAZORPAY_PLAN_STARTER_ID',
  },
  {
    id: 'advanced',
    name: 'Advanced',
    badge: 'Most Popular',
    priceInINR: 999,
    priceLabel: '₹999',
    period: '/month',
    description: 'For serious spiritual seekers',
    features: [
      'Everything in Starter',
      'Full Kundali Analysis',
      'Palmistry & Face Reading',
      'Aura Scan',
      '12-Month Predictions',
      'More AI Guru usage',
    ],
    ctaLabel: 'Upgrade to Advanced',
    ctaHref: '/login',
    highlight: true,
    subscriptionProductId: 'sub_999',
    razorpayPlanEnvKey: 'RAZORPAY_PLAN_ADVANCED_ID',
  },
  {
    id: 'supreme',
    name: 'Supreme',
    badge: 'Complete OS',
    priceInINR: 1999,
    priceLabel: '₹1,999',
    period: '/month',
    description: 'Complete spiritual operating system',
    features: [
      'Everything in Advanced',
      'Career & Business Engine',
      'Pregnancy Insights',
      'Compatibility Analysis',
      'Advanced Reports (PDF)',
      'Priority Support',
    ],
    ctaLabel: 'Go Supreme',
    ctaHref: '/login',
    highlight: false,
    subscriptionProductId: 'sub_1999',
    razorpayPlanEnvKey: 'RAZORPAY_PLAN_SUPREME_ID',
  },
]

// ============================================
// ONE-TIME PRODUCTS
// ============================================

export const ONE_TIME_PRODUCTS: Record<ProductId, OneTimeProduct> = {
  '99': {
    id: 'quick_99',
    productId: '99',
    amountInINR: 99,
    name: 'Quick Reading',
    label: 'Quick Reading – ₹99',
    description: '1 AI Guru question / daily horoscope / small correction',
    bullets: [
      '1 AI Guru question',
      'Great for a single doubt or daily guidance',
    ],
    tickets: {
      aiQuestions: 1,
    },
    mostPopular: false,
  },
  '199': {
    id: 'deep_199',
    productId: '199',
    amountInINR: 199,
    name: 'Deep Insight',
    label: 'Deep Insight – ₹199',
    description: '3 AI Guru questions plus basic Kundali-based insight',
    bullets: [
      '3 AI Guru questions',
      'Ideal for deeper follow-ups or a mini spread',
    ],
    tickets: {
      aiQuestions: 3,
      kundaliBasic: 1,
    },
    mostPopular: true,
  },
  '299': {
    id: 'supreme_299',
    productId: '299',
    amountInINR: 299,
    name: 'Supreme Reading',
    label: 'Supreme Reading – ₹299',
    description: 'Extended personalised session (can refine later)',
    bullets: [
      '5 AI Guru questions',
      'Extended personalised insight session',
    ],
    tickets: {
      aiQuestions: 5,
    },
    mostPopular: false,
  },
}

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Get subscription plan by ID
 */
export function getSubscriptionPlan(planId: SubscriptionPlanId | string): SubscriptionPlan | null {
  const normalizedId = planId.toLowerCase() as SubscriptionPlanId
  return SUBSCRIPTION_PLANS.find((p) => p.id === normalizedId) || null
}

/**
 * Get one-time product by productId (99, 199, 299)
 */
export function getOneTimeProduct(productId: ProductId | string | number): OneTimeProduct | null {
  const normalizedId = String(productId) as ProductId
  return ONE_TIME_PRODUCTS[normalizedId] || null
}

/**
 * Get all subscription plans
 */
export function getAllSubscriptionPlans(): SubscriptionPlan[] {
  return SUBSCRIPTION_PLANS
}

/**
 * Get all one-time products
 */
export function getAllOneTimeProducts(): OneTimeProduct[] {
  return Object.values(ONE_TIME_PRODUCTS)
}

/**
 * Check if productId is a valid one-time product
 */
export function isValidOneTimeProduct(productId: string | number): boolean {
  return getOneTimeProduct(productId) !== null
}

/**
 * Get product by amount (for backward compatibility)
 */
export function getProductByAmount(amount: number): OneTimeProduct | null {
  return getOneTimeProduct(String(amount))
}

/**
 * Get subscription plan by ID (alias for getSubscriptionPlan)
 */
export function getSubscriptionPlanById(id: string): SubscriptionPlan | null {
  return getSubscriptionPlan(id)
}

/**
 * Get subscription plan by product ID
 */
export function getSubscriptionPlanByProductId(productId: string): SubscriptionPlan | null {
  return SUBSCRIPTION_PLANS.find((plan) => plan.subscriptionProductId === productId) ?? null
}

/**
 * Get Razorpay plan ID for a subscription plan from environment variables
 */
export function getRazorpayPlanIdForSubscription(plan: SubscriptionPlan): string | null {
  if (!plan.razorpayPlanEnvKey) return null
  return process.env[plan.razorpayPlanEnvKey] ?? null
}
