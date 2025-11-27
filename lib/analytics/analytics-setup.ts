/**
 * Analytics Setup (Mixpanel or Clarity)
 * Milestone 9 - Step 7
 * 
 * User analytics and behavior tracking
 */

/**
 * Initialize Mixpanel
 */
export async function initMixpanel(): Promise<void> {
  if (typeof window === 'undefined') {
    return
  }

  // Phase 31 - F46: Use validated environment variables
  const { envVars } = await import('@/lib/env/env.mjs')
  
  try {
    const mixpanelToken = envVars.analytics.mixpanelToken
    if (!mixpanelToken) {
      console.warn('Mixpanel token not configured')
      return
    }

    // Mixpanel will be loaded via script tag in layout
    // This is a wrapper for tracking
    if (window.mixpanel) {
      window.mixpanel.init(mixpanelToken, {
        debug: envVars.isDevelopment,
        track_pageview: true,
        persistence: 'localStorage',
      })
    }
  } catch (error) {
    console.error('Failed to initialize Mixpanel:', error)
  }
}

/**
 * Track event
 */
export function trackEvent(eventName: string, properties?: Record<string, any>): void {
  if (typeof window === 'undefined') {
    return
  }

  try {
    // Mixpanel
    if (window.mixpanel) {
      window.mixpanel.track(eventName, properties)
    }

    // Microsoft Clarity
    if (window.clarity) {
      window.clarity('event', eventName)
    }

    // Google Analytics (if configured)
    if (window.gtag) {
      window.gtag('event', eventName, properties)
    }
  } catch (error) {
    console.error('Failed to track event:', error)
  }
}

/**
 * Identify user
 */
export function identifyUser(userId: string, traits?: Record<string, any>): void {
  if (typeof window === 'undefined') {
    return
  }

  try {
    if (window.mixpanel) {
      window.mixpanel.identify(userId)
      if (traits) {
        window.mixpanel.people.set(traits)
      }
    }
  } catch (error) {
    console.error('Failed to identify user:', error)
  }
}

/**
 * Track page view
 */
export function trackPageView(path: string, title?: string): void {
  if (typeof window === 'undefined') {
    return
  }

  trackEvent('Page View', {
    path,
    title,
  })
}

/**
 * Track conversion
 */
export function trackConversion(eventName: string, value?: number, properties?: Record<string, any>): void {
  trackEvent(eventName, {
    ...properties,
    value,
    conversion: true,
  })
}

/**
 * Track funnel step
 */
export function trackFunnelStep(step: string, stepNumber: number, properties?: Record<string, any>): void {
  trackEvent('Funnel Step', {
    step,
    stepNumber,
    ...properties,
  })
}

// Type declarations
declare global {
  interface Window {
    mixpanel?: {
      init: (token: string, config?: any) => void
      track: (eventName: string, properties?: Record<string, any>) => void
      identify: (userId: string) => void
      people: {
        set: (traits: Record<string, any>) => void
      }
    }
    clarity?: (action: string, eventName?: string) => void
    gtag?: (command: string, eventName: string, properties?: Record<string, any>) => void
  }
}

