/**
 * Global TypeScript type definitions for Jyoti.ai
 */

export interface User {
  uid: string
  name: string | null
  email: string | null
  photo: string | null
  dob: string | null
  tob: string | null
  pob: string | null
  lat?: number
  lng?: number
  timezone?: string
  rashi: string | null
  rashiPreferred?: 'moon' | 'sun' | 'ascendant'
  rashiMoon?: string
  rashiSun?: string
  ascendant?: string
  nakshatra: string | null
  subscription: 'free' | 'pro'
  subscriptionExpiry: Date | null
  onboarded: boolean
  createdAt: Date
  updatedAt: Date
}

export interface Subscription {
  status: 'active' | 'pending' | 'cancelled' | 'paused' | 'unpaid' | 'expired'
  plan: 'pro_monthly' | 'pro_yearly' | 'pro_lifetime'
  startDate: Date
  expiryDate: Date
  lastRenewal: Date | null
  razorpaySubscriptionId?: string
  razorpayPaymentId?: string
}

export interface Payment {
  id: string
  userId: string
  type: 'report' | 'subscription'
  amount: number
  currency: 'INR'
  status: 'success' | 'failed' | 'pending'
  razorpayOrderId?: string
  razorpayPaymentId?: string
  createdAt: Date
}

export interface Report {
  id: string
  userId: string
  type: string
  url: string
  createdAt: Date
  pages: number
  paid: boolean
}

