/**
 * Feature Access Checker
 * 
 * Utility to check if user has access to a feature before allowing actions
 */

import { useUserStore } from '@/store/user-store'
import { canAccessFeature } from './ticket-access'

interface AccessCheckResult {
  allowed: boolean
  reason?: string
  redirectTo?: string
}

/**
 * Check if user can access a specific feature
 */
export async function checkFeatureAccess(
  feature: 'ai_question' | 'kundali_basic' | 'compatibility' | 'career' | 'palmistry' | 'aura'
): Promise<AccessCheckResult> {
  const user = useUserStore.getState().user

  if (!user) {
    return {
      allowed: false,
      reason: 'Please login to access this feature',
      redirectTo: '/login',
    }
  }

  const hasSubscription =
    user.subscription === 'pro' &&
    user.subscriptionExpiry &&
    new Date(user.subscriptionExpiry) > new Date()

  const hasAccess = canAccessFeature(
    {
      hasSubscription: !!hasSubscription,
      tickets: user.tickets,
    },
    feature
  )

  if (!hasAccess) {
    // Determine which product to redirect to
    let productId = '199' // Default to Deep Insights
    if (feature === 'ai_question') {
      productId = '99' // Quick Readings for AI questions
    }

    return {
      allowed: false,
      reason: 'You need to purchase access to use this feature',
      redirectTo: `/pay/${productId}`,
    }
  }

  return {
    allowed: true,
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

