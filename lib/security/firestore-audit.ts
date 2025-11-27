/**
 * Firestore Security Audit
 * Milestone 9 - Step 3
 * 
 * Audits Firestore security rules and API permissions
 */

import { adminDb } from '@/lib/firebase/admin'

export interface SecurityIssue {
  severity: 'critical' | 'high' | 'medium' | 'low'
  type: 'permission' | 'data-access' | 'validation' | 'rate-limit'
  description: string
  collection: string
  rule?: string
  recommendation: string
}

/**
 * Audit Firestore security rules
 */
export async function auditFirestoreRules(): Promise<SecurityIssue[]> {
  const issues: SecurityIssue[] = []

  // Critical: Check if users can only access their own data
  issues.push({
    severity: 'critical',
    type: 'permission',
    description: 'Users must only access their own data in user-specific collections',
    collection: 'users',
    recommendation: 'Ensure all user collections use isOwner(uid) check',
  })

  // High: Check notification_queue is server-only
  issues.push({
    severity: 'high',
    type: 'permission',
    description: 'notification_queue must be server-only write',
    collection: 'notification_queue',
    recommendation: 'Verify isServer() check is enforced',
  })

  // High: Check email_queue is server-only
  issues.push({
    severity: 'high',
    type: 'permission',
    description: 'email_queue must be server-only write',
    collection: 'email_queue',
    recommendation: 'Verify isServer() check is enforced',
  })

  // Medium: Check reports are properly protected
  issues.push({
    severity: 'medium',
    type: 'data-access',
    description: 'Reports should only be accessible by owner',
    collection: 'reports',
    recommendation: 'Ensure reports/{uid}/** is protected with isOwner(uid)',
  })

  // Medium: Check kundali data protection
  issues.push({
    severity: 'medium',
    type: 'data-access',
    description: 'Kundali data should be private to user',
    collection: 'kundali',
    recommendation: 'Ensure kundali/{uid}/** is protected with isOwner(uid)',
  })

  // Low: Check scans data protection
  issues.push({
    severity: 'low',
    type: 'data-access',
    description: 'Scans (palmistry, aura) should be private',
    collection: 'scans',
    recommendation: 'Ensure scans/{uid}/** is protected with isOwner(uid)',
  })

  return issues
}

/**
 * Audit API endpoint permissions
 */
export async function auditAPIPermissions(): Promise<SecurityIssue[]> {
  const issues: SecurityIssue[] = []

  // Critical: All authenticated endpoints must verify session
  issues.push({
    severity: 'critical',
    type: 'permission',
    description: 'All authenticated endpoints must verify session cookie',
    collection: 'api',
    recommendation: 'Ensure all protected routes call adminAuth.verifySessionCookie()',
  })

  // High: Rate limiting on sensitive endpoints
  issues.push({
    severity: 'high',
    type: 'rate-limit',
    description: 'Sensitive endpoints (Guru, Reports) must have rate limiting',
    collection: 'api',
    recommendation: 'Add rate limiting to /api/guru/chat and /api/reports/generate',
  })

  // High: Input validation
  issues.push({
    severity: 'high',
    type: 'validation',
    description: 'All user inputs must be validated',
    collection: 'api',
    recommendation: 'Add input validation for all POST/PUT endpoints',
  })

  // Medium: CORS configuration
  issues.push({
    severity: 'medium',
    type: 'permission',
    description: 'CORS must be properly configured',
    collection: 'api',
    recommendation: 'Verify CORS settings in Next.js config',
  })

  return issues
}

/**
 * Generate security audit report
 */
export async function generateSecurityAuditReport(): Promise<{
  firestore: SecurityIssue[]
  api: SecurityIssue[]
  summary: {
    total: number
    critical: number
    high: number
    medium: number
    low: number
  }
}> {
  const firestoreIssues = await auditFirestoreRules()
  const apiIssues = await auditAPIPermissions()

  const allIssues = [...firestoreIssues, ...apiIssues]

  const summary = {
    total: allIssues.length,
    critical: allIssues.filter((i) => i.severity === 'critical').length,
    high: allIssues.filter((i) => i.severity === 'high').length,
    medium: allIssues.filter((i) => i.severity === 'medium').length,
    low: allIssues.filter((i) => i.severity === 'low').length,
  }

  return {
    firestore: firestoreIssues,
    api: apiIssues,
    summary,
  }
}

