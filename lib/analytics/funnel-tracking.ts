/**
 * Heatmaps + Funnels Tracking
 * Milestone 9 - Step 8
 * 
 * Tracks user journey through onboarding → dashboard → report generation
 */

import { trackEvent, trackFunnelStep } from './analytics-setup'

/**
 * Funnel steps
 */
export enum FunnelStep {
  LANDING = 'landing',
  AUTHENTICATION = 'authentication',
  ONBOARDING_START = 'onboarding_start',
  BIRTH_DETAILS = 'birth_details',
  IMAGE_UPLOAD = 'image_upload',
  ONBOARDING_COMPLETE = 'onboarding_complete',
  DASHBOARD_VIEW = 'dashboard_view',
  KUNDALI_VIEW = 'kundali_view',
  GURU_CHAT = 'guru_chat',
  REPORT_GENERATION_START = 'report_generation_start',
  REPORT_GENERATION_COMPLETE = 'report_generation_complete',
  PAYMENT_START = 'payment_start',
  PAYMENT_COMPLETE = 'payment_complete',
}

/**
 * Track funnel progression
 */
export function trackFunnelProgression(step: FunnelStep, userId?: string, metadata?: Record<string, any>): void {
  const stepNumbers: Record<FunnelStep, number> = {
    [FunnelStep.LANDING]: 1,
    [FunnelStep.AUTHENTICATION]: 2,
    [FunnelStep.ONBOARDING_START]: 3,
    [FunnelStep.BIRTH_DETAILS]: 4,
    [FunnelStep.IMAGE_UPLOAD]: 5,
    [FunnelStep.ONBOARDING_COMPLETE]: 6,
    [FunnelStep.DASHBOARD_VIEW]: 7,
    [FunnelStep.KUNDALI_VIEW]: 8,
    [FunnelStep.GURU_CHAT]: 9,
    [FunnelStep.REPORT_GENERATION_START]: 10,
    [FunnelStep.REPORT_GENERATION_COMPLETE]: 11,
    [FunnelStep.PAYMENT_START]: 12,
    [FunnelStep.PAYMENT_COMPLETE]: 13,
  }

  trackFunnelStep(step, stepNumbers[step], {
    userId,
    ...metadata,
  })
}

/**
 * Track onboarding completion
 */
export function trackOnboardingComplete(userId: string, duration: number): void {
  trackFunnelProgression(FunnelStep.ONBOARDING_COMPLETE, userId, {
    duration,
    timestamp: new Date().toISOString(),
  })

  trackEvent('Onboarding Complete', {
    userId,
    duration,
  })
}

/**
 * Track report generation
 */
export function trackReportGeneration(userId: string, reportType: string, success: boolean): void {
  if (success) {
    trackFunnelProgression(FunnelStep.REPORT_GENERATION_COMPLETE, userId, {
      reportType,
    })
  }

  trackEvent('Report Generated', {
    userId,
    reportType,
    success,
  })
}

/**
 * Track payment
 */
export function trackPayment(userId: string, amount: number, currency: string, success: boolean): void {
  if (success) {
    trackFunnelProgression(FunnelStep.PAYMENT_COMPLETE, userId, {
      amount,
      currency,
    })
  }

  trackEvent('Payment', {
    userId,
    amount,
    currency,
    success,
  })
}

/**
 * Track heatmap events (clicks, scrolls, etc.)
 */
export function trackHeatmapEvent(
  eventType: 'click' | 'scroll' | 'hover' | 'focus',
  element: string,
  metadata?: Record<string, any>
): void {
  trackEvent('Heatmap Event', {
    eventType,
    element,
    ...metadata,
  })
}

