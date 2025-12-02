/**
 * Ticket Access Hook
 * 
 * Pricing & Payments v3 - Phase H
 * 
 * Reusable hook for feature modules to check ticket access
 */

import { useUserStore } from '@/store/user-store'
import { useState, useEffect } from 'react'
import { getFeatureAccess, type FeatureKey } from '@/lib/payments/feature-access'

interface TicketAccessResult {
  hasAccess: boolean
  hasSubscription: boolean
  subscriptionPlanId?: string | null
  tickets: {
    aiGuruTickets: number
    kundaliTickets: number
    lifetimePredictions: number
  }
  loading: boolean
  error: string | null
  config: ReturnType<typeof getFeatureAccess>
}

/**
 * Hook to check ticket access for a feature
 */
export function useTicketAccess(feature: FeatureKey): TicketAccessResult {
  const { user } = useUserStore()
  const featureConfig = getFeatureAccess(feature)
  const [accessInfo, setAccessInfo] = useState<TicketAccessResult>({
    hasAccess: false,
    hasSubscription: false,
    subscriptionPlanId: null,
    tickets: {
      aiGuruTickets: 0,
      kundaliTickets: 0,
      lifetimePredictions: 0,
    },
    loading: true,
    error: null,
    config: featureConfig,
  })

  useEffect(() => {
    if (!user?.uid) {
      setAccessInfo({
        hasAccess: false,
        hasSubscription: false,
        subscriptionPlanId: null,
        tickets: { aiGuruTickets: 0, kundaliTickets: 0, lifetimePredictions: 0 },
        loading: false,
        error: 'Not authenticated',
        config: featureConfig,
      })
      return
    }

    const checkAccess = async () => {
      try {
        // Call API endpoint instead of direct Firestore access (client-side)
        const response = await fetch('/api/user/tickets', {
          credentials: 'include',
        })
        if (!response.ok) {
          throw new Error('Failed to fetch ticket info')
        }
        const data = await response.json()
        const info = data
        
        // Phase Q: Use config-based access check
        let hasAccess = false
        if (info.hasSubscription) {
          hasAccess = true
        } else {
          // Check specific ticket field from config
          const ticketCount = info.tickets[featureConfig.ticketField] || 0
          hasAccess = ticketCount >= featureConfig.costPerUse
        }

        setAccessInfo({
          hasAccess,
          hasSubscription: info.hasSubscription,
          subscriptionPlanId: info.subscriptionPlan || null,
          tickets: info.tickets,
          loading: false,
          error: null,
          config: featureConfig,
        })
      } catch (error: any) {
        setAccessInfo({
          hasAccess: false,
          hasSubscription: false,
          subscriptionPlanId: null,
          tickets: { aiGuruTickets: 0, kundaliTickets: 0, lifetimePredictions: 0 },
          loading: false,
          error: error.message || 'Failed to check access',
          config: featureConfig,
        })
      }
    }

    checkAccess()
  }, [user?.uid, feature, featureConfig])

  return accessInfo
}

