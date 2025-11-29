/**
 * Feature Access Checker
 * 
 * Utility to check if user has access to a feature before allowing actions
 */

import { canAccessFeature } from './ticket-access'
import { decrementTicket } from './ticket-access'
import type { User } from '@/store/user-store'

interface AccessCheckResult {
  allowed: boolean
  reason?: string
  redirect?: string
  redirectTo?: string // Alias for redirect
  decrementTicket?: boolean
}

/**
 * Check if user can access a specific feature
 */
export async function checkFeatureAccess(
  user: User | null,
  feature: 'kundali' | 'predictions' | 'palmistry' | 'career' | 'business' | 'aura' | 'face' | 'numerology' | 'compatibility' | 'ai_question' | 'kundali_basic'
): Promise<AccessCheckResult> {
  if (!user) {
    return {
      allowed: false,
      reason: 'Please login to access this feature',
      redirect: '/login',
      redirectTo: '/login',
    }
  }

  // Map feature names to ticket-access feature names
  const featureMap: Record<string, 'ai_question' | 'kundali_basic' | 'compatibility' | 'career' | 'palmistry' | 'aura'> = {
    kundali: 'kundali_basic',
    predictions: 'ai_question',
    palmistry: 'palmistry',
    career: 'career',
    business: 'career',
    aura: 'aura',
    face: 'aura',
    numerology: 'kundali_basic',
    compatibility: 'compatibility',
    ai_question: 'ai_question',
    kundali_basic: 'kundali_basic',
  }

  const mappedFeature = featureMap[feature] || 'kundali_basic'

  const hasSubscription =
    (user.subscription === 'pro' || user.subscription === 'advanced' || user.subscription === 'supreme') &&
    user.subscriptionExpiry &&
    new Date(user.subscriptionExpiry) > new Date()

  const hasAccess = canAccessFeature(
    {
      hasSubscription: !!hasSubscription,
      tickets: user.tickets,
      legacyTickets: user.legacyTickets,
    },
    mappedFeature
  )

  if (!hasAccess) {
    // Determine which product to redirect to
    let productId = '199' // Default to Deep Insights
    if (feature === 'ai_question' || feature === 'predictions') {
      productId = '99' // Quick Readings for AI questions
    }

    return {
      allowed: false,
      reason: 'You need to purchase access to use this feature',
      redirect: `/pay/${productId}`,
      redirectTo: `/pay/${productId}`,
      decrementTicket: false,
    }
  }

  return {
    allowed: true,
    decrementTicket: !hasSubscription, // Only decrement if no subscription
  }
}

/**
 * Hook version for React components
 */
export function useFeatureAccess(feature: Parameters<typeof checkFeatureAccess>[0]) {
  const { user } = useUserStore()

  const hasSubscription =
    user?.subscription === 'pro' &&
    user?.subscriptionExpiry &&
    new Date(user.subscriptionExpiry) > new Date()

  const hasAccess = canAccessFeature(
    {
      hasSubscription: !!hasSubscription,
      tickets: user?.tickets,
    },
    feature
  )

  return {
    hasAccess,
    canAccess: hasAccess,
    redirectTo: hasAccess ? undefined : `/pay/${feature === 'ai_question' ? '99' : '199'}`,
  }
}

